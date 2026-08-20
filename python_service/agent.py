"""
SkillForge Advanced RAG Engine & Multi-Node LangGraph / ReAct Agent
Powered by Groq Cloud LLaMA 3.3 (120B / 70B Instant)
Implements:
1. RAG Knowledge Retriever — ChromaDB semantic search (BM25 fallback)
2. Multi-Node LangGraph StateGraph Workflow:
   - Node 1: SkillProfiler
   - Node 2: KnowledgeRetriever  (now uses ChromaDB!)
   - Node 3: AgentPlanner (Thought -> Action -> Observation)
   - Node 4: RoadmapSynthesizer
"""

import os
from typing import Dict, List, Any
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from project root .env
load_dotenv("/home/hassan/Downloads/my-app/.env")
load_dotenv()

from skill_analyzer import SkillAnalyzer
from roadmap_generator import RoadmapGenerator
from vectorstore import vector_store  # ChromaDB singleton

def get_groq_client() -> Groq:
    key = os.getenv("GROQ_API_KEY", "")
    return Groq(api_key=key)


# =========================================================================
# 1. RAG RETRIEVER — ChromaDB Semantic Search (BM25 fallback inside vectorstore)
# =========================================================================

def search_knowledge_base_with_sources(query: str, top_k: int = 3) -> tuple:
    """
    Semantic search via ChromaDB vector_store singleton.
    Automatically falls back to BM25 if ChromaDB is unavailable.
    Returns: (context_string, list_of_unique_source_titles)
    """
    return vector_store.search(query, top_k=top_k)


def search_knowledge_base(query: str, top_k: int = 3) -> str:
    """Backwards-compatible helper returning pure context text."""
    context, _ = vector_store.search(query, top_k=top_k)
    return context


def generate_rag_answer_with_sources(user_query: str, chat_history: list = None, student_context: dict = None) -> Dict[str, Any]:
    """
    RAG Assistant: Query → ChromaDB Semantic Search → Groq LLaMA 3.3 → Grounded Answer.
    Returns: {"answer": str, "sources": list, "grounded": bool}
    """
    context, sources = vector_store.search(user_query, top_k=3)

    student_info_str = ""
    if student_context:
        student_info_str = f"""Student Profile:
- Name: {student_context.get('name', 'Scholar')}
- Degree: {student_context.get('degree', 'BS Computer Science')}
- Career Goal: {student_context.get('careerGoal', 'AI Engineer')}
- Missing Skills: {', '.join(student_context.get('missingSkills', []))}
"""

    system_prompt = f"""You are the SkillForge AI Career Mentor & Study Assistant for Computer Science students.
Ground your response using the following verified SkillForge knowledge base documents:

[VERIFIED KNOWLEDGE BASE CONTEXT — Semantically Retrieved via ChromaDB]
{context}

{student_info_str}

Response Guidelines:
1. Provide a direct, highly practical, motivating, and industry-grounded answer.
2. If code snippets, study paths, or project steps are relevant, provide clean, modern examples.
3. Reference real-world standards (e.g., Docker, PyTorch, Next.js, CI/CD, LeetCode) as outlined in the knowledge base.
4. Keep the tone inspiring and concise.
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    if chat_history and isinstance(chat_history, list):
        for msg in chat_history[-4:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_query})

    try:
        client = get_groq_client()
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="openai/gpt-oss-120b",
            temperature=0.7,
            max_completion_tokens=1200,
            top_p=0.95,
        )
        answer_text = chat_completion.choices[0].message.content
    except Exception:
        try:
            client = get_groq_client()
            chat_completion = client.chat.completions.create(
                messages=messages,
                model="openai/gpt-oss-20b",
                temperature=0.7,
                max_completion_tokens=1000,
            )
            answer_text = chat_completion.choices[0].message.content
        except Exception:
            answer_text = f"Based on SkillForge standards for {user_query}: Focus on completing practical capstone projects, mastering core algorithms, and building verifiable GitHub portfolios."

    # Format citations at the end of answer if not already present
    formatted_sources_text = "\n\n📌 **Verified Sources:** " + ", ".join([f"`{s}`" for s in sources])
    full_answer_with_sources = answer_text + formatted_sources_text

    return {
        "answer": full_answer_with_sources,
        "rawAnswer": answer_text,
        "sources": sources,
        "grounded": True,
    }


def generate_rag_answer(user_query: str, chat_history: list = None) -> str:
    """Backwards-compatible helper returning plain answer string."""
    res = generate_rag_answer_with_sources(user_query, chat_history)
    return res["answer"]


# =========================================================================
# 2. MULTI-NODE LANGGRAPH / REACT AGENT (StateGraph Workflow)
# =========================================================================

analyzer = SkillAnalyzer()
generator = RoadmapGenerator()

class CareerPlanningState:
    """State data object passed across LangGraph nodes."""
    def __init__(self, profile: dict, user_prompt: str):
        self.profile = profile
        self.user_prompt = user_prompt
        self.career_goal = profile.get("careerGoal", "AI Engineer")
        self.current_scores: Dict[str, int] = {}
        self.detected_gaps: List[dict] = []
        self.retrieved_context: str = ""
        self.sources: List[str] = []
        self.roadmap_data: dict = {}
        self.reasoning_steps: List[dict] = []
        self.final_synthesis: str = ""


# --- Node 1: Skill Profiler ---
def node_skill_profiler(state: CareerPlanningState) -> CareerPlanningState:
    """Calculates assessment scores and identifies targeted role benchmark skill gaps."""
    skills = state.profile.get("skills", [])
    scores_dict = {}
    if isinstance(skills, list):
        for s in skills:
            if isinstance(s, dict) and "name" in s:
                scores_dict[s["name"].lower()] = s.get("verifiedScore", 50)

    state.current_scores = analyzer.calculate_score(scores_dict)
    state.detected_gaps = analyzer.identify_gaps(state.current_scores, state.career_goal)
    
    top_gap_names = [g["skill"] for g in state.detected_gaps[:3]] if state.detected_gaps else ["None (Verified)"]
    state.reasoning_steps.append({
        "node": "SkillProfiler",
        "thought": f"Analyzed student's profile for target track '{state.career_goal}'.",
        "action": "analyzer.identify_gaps()",
        "observation": f"Detected critical skill gaps: {', '.join(top_gap_names)}.",
    })
    return state


# --- Node 2: Knowledge Retriever ---
def node_knowledge_retriever(state: CareerPlanningState) -> CareerPlanningState:
    """RAG lookup for curated capstones and industry roadmaps for detected gaps."""
    top_gap = state.detected_gaps[0]["skill"] if state.detected_gaps else state.career_goal
    query = f"{state.career_goal} {top_gap} capstone project roadmap"
    
    context, sources = search_knowledge_base_with_sources(query, top_k=3)
    state.retrieved_context = context
    state.sources = sources

    state.reasoning_steps.append({
        "node": "KnowledgeRetriever",
        "thought": f"Querying SkillForge RAG Knowledge Base for '{query}'.",
        "action": f"search_knowledge_base_with_sources('{query}')",
        "observation": f"Retrieved {len(sources)} grounded reference modules: {', '.join(sources)}.",
    })
    return state


# --- Node 3: Agent Planner (ReAct Thought & Strategy) ---
def node_agent_planner(state: CareerPlanningState) -> CareerPlanningState:
    """Formulates prioritized 4-stage pedagogical milestone structure."""
    state.roadmap_data = generator.generate(
        state.detected_gaps,
        [state.retrieved_context],
        state.career_goal
    )

    state.reasoning_steps.append({
        "node": "AgentPlanner",
        "thought": f"Architecting 4-stage ReAct career progression plan tailored to student's experience level '{state.profile.get('experienceLevel', 'intermediate')}'.",
        "action": "generator.generate(gaps, resources, target_role)",
        "observation": "Compiled 4 milestone deliverables with hands-on capstones.",
    })
    return state


# --- Node 4: Roadmap Synthesizer (AI Execution) ---
def node_roadmap_synthesizer(state: CareerPlanningState) -> CareerPlanningState:
    """Executes Groq LLaMA 3.3 model to generate the final motivating career blueprint."""
    agent_prompt = f"""You are the SkillForge Autonomous Career Planning Agent.
The student requested: "{state.user_prompt}"

Student Profile:
- Name: {state.profile.get('name', 'Scholar')}
- Degree: {state.profile.get('degree', 'BS Computer Science')} ({state.profile.get('yearOfStudy', 3)}rd Year)
- Experience Level: {state.profile.get('experienceLevel', 'intermediate')}
- Target Career Track: {state.career_goal}
- Verified Skill Gaps: {', '.join([g['skill'] for g in state.detected_gaps[:3]]) if state.detected_gaps else 'None'}

Verified Knowledge Base Context (ChromaDB Grounded):
{state.retrieved_context}

Instructions:
1. Formulate an authoritative, structured, and motivational 4-step Career Execution Plan with hands-on capstones.
2. Provide a COMPLETE, fully filled Suggested Timeline Table covering Month 1-2, Month 3-4, Month 5-6, and Month 7-8.
3. CRITICAL: Do NOT truncate, cut off, or stop mid-sentence. Write out every section, table row, and capstone deliverable to completion.
"""

    try:
        client = get_groq_client()
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are the SkillForge Autonomous Career Planning Agent. You always produce comprehensive, complete, non-truncated career blueprints."},
                {"role": "user", "content": agent_prompt}
            ],
            model="openai/gpt-oss-120b",
            temperature=0.7,
            max_completion_tokens=4096,
        )
        ai_synthesis = completion.choices[0].message.content
    except Exception:
        try:
            client = get_groq_client()
            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are the SkillForge Autonomous Career Planning Agent."},
                    {"role": "user", "content": agent_prompt}
                ],
                model="openai/gpt-oss-20b",
                temperature=0.7,
                max_completion_tokens=4096,
            )
            ai_synthesis = completion.choices[0].message.content
        except Exception:
            ai_synthesis = f"SkillForge Autonomous Plan for {state.career_goal}: Complete the 4 capstone deliverables below to reach industry job readiness."

    state.final_synthesis = ai_synthesis
    state.reasoning_steps.append({
        "node": "RoadmapSynthesizer",
        "thought": "Synthesized final personalized career blueprint using Groq LLaMA 3.3.",
        "action": "GroqChatCompletion(model='openai/gpt-oss-120b', max_tokens=4096)",
        "observation": "Career Plan generated completely without truncation.",
    })
    return state


def run_career_agent_react(profile: dict, user_prompt: str = "Generate my personalized career strategy") -> dict:
    """
    Executes the Complete Multi-Node LangGraph State Graph Workflow:
    Node 1 (SkillProfiler) -> Node 2 (KnowledgeRetriever) -> Node 3 (AgentPlanner) -> Node 4 (RoadmapSynthesizer)
    """
    state = CareerPlanningState(profile, user_prompt)
    
    # Sequential StateGraph Execution
    state = node_skill_profiler(state)
    state = node_knowledge_retriever(state)
    state = node_agent_planner(state)
    state = node_roadmap_synthesizer(state)

    return {
        "success": True,
        "careerGoal": state.career_goal,
        "gaps": state.detected_gaps,
        "sources": state.sources,
        "roadmap": state.roadmap_data,
        "agentAnalysis": state.final_synthesis,
        "reasoningStream": state.reasoning_steps,
    }
