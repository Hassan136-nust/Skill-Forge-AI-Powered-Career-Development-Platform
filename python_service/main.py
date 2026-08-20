"""
FastAPI Python Microservice for SkillForge (Port 8000)
Implements PRD Section 5.3 (API Endpoints)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from skill_analyzer import SkillAnalyzer
from roadmap_generator import RoadmapGenerator
from agent import generate_rag_answer, run_career_agent_react

app = FastAPI(
    title="SkillForge Python AI & SkillAnalyzer Service",
    version="1.0.0",
    description="Python microservice providing OOP SkillAnalyzer, RoadmapGenerator, RAG Chatbot & LangGraph ReAct Agent.",
)

# Enable CORS for React frontend & Express API Gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = SkillAnalyzer()
generator = RoadmapGenerator()

# =========================================================================
# Request / Response Schemas
# =========================================================================
class AnalyzeRequest(BaseModel):
    assessment_results: Dict[str, Any]
    target_role: Optional[str] = "AI Engineer"

class RoadmapRequest(BaseModel):
    gaps: Optional[List[Any]] = []
    resources: Optional[List[Any]] = []
    goal: Optional[str] = "AI Engineer"

class ChatRequest(BaseModel):
    query: str
    chat_history: Optional[List[Dict[str, str]]] = []

class AgentRequest(BaseModel):
    profile: Dict[str, Any]
    prompt: Optional[str] = "Analyze my skills and tell me what to learn next."


# =========================================================================
# Endpoints (PRD Section 5.3)
# =========================================================================
@app.get("/health")
def health_check():
    """GET /health — Service health check"""
    return {
        "status": "healthy",
        "service": "SkillForge Python AI Microservice",
        "port": 8000,
        "ai_engine": "Groq LLaMA 3.3 70B & 8B Instant"
    }

@app.post("/analyze")
def analyze_skills(req: AnalyzeRequest):
    """POST /analyze — run SkillAnalyzer on assessment results"""
    try:
        normalized_scores = analyzer.calculate_score(req.assessment_results)
        gaps = analyzer.identify_gaps(normalized_scores, req.target_role)
        recommendations = analyzer.recommend_topics(gaps)
        return {
            "success": True,
            "targetRole": req.target_role,
            "normalizedScores": normalized_scores,
            "gaps": gaps,
            "recommendations": recommendations,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/roadmap")
def generate_roadmap(req: RoadmapRequest):
    """POST /roadmap — generate roadmap from gaps + goal"""
    try:
        roadmap_result = generator.generate(req.gaps, req.resources, req.goal)
        return {
            "success": True,
            "roadmap": roadmap_result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/chat")
def rag_chat(req: ChatRequest):
    """POST /rag/chat — RAG AI Study Assistant with Groq LLaMA 3.3"""
    try:
        answer = generate_rag_answer(req.query, req.chat_history)
        return {
            "success": True,
            "query": req.query,
            "answer": answer,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agent/plan")
def agent_plan(req: AgentRequest):
    """POST /agent/plan — ReAct Autonomous Career Agent with 4 Tools"""
    try:
        result = run_career_agent_react(req.profile, req.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
