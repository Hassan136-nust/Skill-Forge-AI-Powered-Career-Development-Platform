"""
Agentic AI & RAG Engine — Powered by Groq Cloud (Free LLaMA 3.3 70B & 8B Instant)
Implements PRD Section 4.2 (RAG Study Assistant) & 4.3 (ReAct Career Planning Agent with 4 Tools)
"""

import os
import glob
from groq import Groq
from skill_analyzer import SkillAnalyzer
from roadmap_generator import RoadmapGenerator

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")

def get_groq_client():
    return Groq(api_key=GROQ_API_KEY)

# =========================================================================
# 1. RAG KNOWLEDGE BASE RETRIEVER (PRD Section 4.2)
# =========================================================================
def search_knowledge_base(query: str, top_k: int = 3) -> str:
    """
    Searches local rag/knowledge-base/ files for relevant context chunks.
    """
    base_dir = os.path.join(os.path.dirname(__file__), "..", "rag", "knowledge-base")
    kb_files = glob.glob(os.path.join(base_dir, "*.txt"))
    
    scored_chunks = []
    q_words = set(query.lower().split())

    for fpath in kb_files:
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
                # Split content by double newline into conceptual paragraphs
                paragraphs = [p.strip() for p in content.split("\n\n") if len(p.strip()) > 30]
                for p in paragraphs:
                    p_words = set(p.lower().split())
                    match_score = len(q_words.intersection(p_words))
                    if match_score > 0:
                        scored_chunks.append((match_score, p))
        except Exception:
            continue

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_chunks = [c[1] for c in scored_chunks[:top_k]]
    
    if not top_chunks:
        return "SkillForge Knowledge Base: Student technical development standards for AI, Backend, Frontend, Full-Stack, and DevOps engineering."
    
    return "\n\n---\n\n".join(top_chunks)


def generate_rag_answer(user_query: str, chat_history: list = None) -> str:
    """
    RAG Assistant: Ingests user query -> Retrieves Top-k Context -> Generates grounded answer using Groq LLaMA 3.3.
    """
    context = search_knowledge_base(user_query, top_k=3)
    
    system_prompt = f"""You are the SkillForge AI Study Assistant & Career Mentor for CS students.
You are grounded by the following curated SkillForge knowledge base:

[KNOWLEDGE BASE CONTEXT]
{context}

Guidelines:
1. Answer the student's question accurately, concisely, and encouragingly.
2. Ground your advice in the technical roadmaps, capstones, and industry expectations provided.
3. Keep code and technical suggestions practical and industry-ready.
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
            max_completion_tokens=1024,
            top_p=0.95,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        # Fallback to 20B model if 120B is busy
        try:
            client = get_groq_client()
            chat_completion = client.chat.completions.create(
                messages=messages,
                model="openai/gpt-oss-20b",
                temperature=0.7,
                max_completion_tokens=1024,
            )
            return chat_completion.choices[0].message.content
        except Exception as e2:
            return f"SkillForge AI Advisory: Based on your query regarding '{user_query}', we recommend focusing on core foundations in {context[:200]}..."


# =========================================================================
# 2. AGENTIC AI — 4 CUSTOM TOOLS (PRD Section 4.3)
# =========================================================================
analyzer = SkillAnalyzer()
generator = RoadmapGenerator()

def tool_analyze_student_skills(profile_data: dict) -> dict:
    """Tool 1: Calculates normalized skill scores from profile assessment results"""
    skills = profile_data.get("skills", [])
    scores_dict = {}
    if isinstance(skills, list):
        for s in skills:
            if isinstance(s, dict) and "name" in s:
                scores_dict[s["name"].lower()] = s.get("verifiedScore", 50)
    return analyzer.calculate_score(scores_dict)

def tool_search_learning_resources(topic: str, level: str = "intermediate") -> str:
    """Tool 2: Searches RAG knowledge base for learning resources & capstones"""
    return search_knowledge_base(f"{topic} {level} project course", top_k=2)

def tool_generate_skill_gap(current_scores: dict, target_role: str) -> list:
    """Tool 3: Calls Python SkillAnalyzer service to identify gaps"""
    return analyzer.identify_gaps(current_scores, target_role)

def tool_create_roadmap(gaps: list, resources: list, target_role: str) -> dict:
    """Tool 4: Compiles final personalized roadmap"""
    return generator.generate(gaps, resources, target_role)


def run_career_agent_react(profile: dict, user_prompt: str) -> dict:
    """
    Executes LangGraph / ReAct Agent Loop:
    Thought -> Act (Tools) -> Observe -> Final Career Plan
    """
    career_goal = profile.get("careerGoal", "AI Engineer")
    
    # Step 1: Tool 1 & 3 Execution
    current_scores = tool_analyze_student_skills(profile)
    gaps = tool_generate_skill_gap(current_scores, career_goal)
    
    # Step 2: Tool 2 Execution
    top_gap_skill = gaps[0]["skill"] if gaps else "Core Engineering"
    resources_context = tool_search_learning_resources(top_gap_skill, profile.get("experienceLevel", "intermediate"))
    
    # Step 3: Tool 4 Execution
    roadmap_data = tool_create_roadmap(gaps, [resources_context], career_goal)

    # Step 4: AI Synthesis using Groq LLaMA 3.3
    agent_prompt = f"""You are the SkillForge Autonomous Career Planning Agent.
The student asked: "{user_prompt}"

Student Profile:
- Name: {profile.get('name', 'Scholar')}
- Degree: {profile.get('degree', 'BS Computer Science')} ({profile.get('yearOfStudy', 3)}rd Year)
- Experience Level: {profile.get('experienceLevel', 'intermediate')}
- Target Career Role: {career_goal}
- Identified Missing Skills (Gaps): {', '.join([g['skill'] for g in gaps[:3]]) if gaps else 'None (Fully verified)'}

Knowledge Base Grounding:
{resources_context}

Execute your Reasoning (ReAct) and formulate a clear, structured, motivational career roadmap advice with 4 prioritized steps.
"""

    try:
        client = get_groq_client()
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are the SkillForge Autonomous Career Planning Agent."},
                {"role": "user", "content": agent_prompt}
            ],
            model="openai/gpt-oss-120b",
            temperature=0.7,
            max_completion_tokens=1500,
        )
        ai_synthesis = completion.choices[0].message.content
    except Exception:
        ai_synthesis = f"SkillForge Agent Analysis for {career_goal}: Your top priority is mastering {top_gap_skill}. Complete the 4 roadmap capstone milestones below to achieve job-readiness."

    return {
        "success": True,
        "careerGoal": career_goal,
        "gaps": gaps,
        "roadmap": roadmap_data,
        "agentAnalysis": ai_synthesis,
    }
