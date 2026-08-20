"""
FastAPI Python Microservice for SkillForge (Port 8000)
Implements PRD Section 5.3 (API Endpoints)
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
load_dotenv()

from skill_analyzer import SkillAnalyzer
from roadmap_generator import RoadmapGenerator
from agent import generate_rag_answer, run_career_agent_react
from vectorstore import vector_store


# ── Startup: build ChromaDB index once when service starts ──────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Build the ChromaDB vector index at startup — runs once, skipped if already indexed."""
    print("⚡ SkillForge: Building ChromaDB knowledge base index...")
    try:
        vector_store.build_index()
        status = vector_store.status()
        print(f"✅ ChromaDB ready | mode={status['mode']} | chunks={status['indexed_chunks']}")
    except Exception as e:
        print(f"⚠️  ChromaDB index build warning: {e} — BM25 fallback active.")
    yield
    # Cleanup on shutdown (nothing needed for ChromaDB persistent)


app = FastAPI(
    title="SkillForge Python AI & SkillAnalyzer Service",
    version="2.0.0",
    description="Python microservice — SkillAnalyzer, RoadmapGenerator, ChromaDB RAG Chatbot & LangGraph ReAct Agent.",
    lifespan=lifespan,
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
    """GET /health — Service health check with ChromaDB status"""
    vs_status = vector_store.status()
    return {
        "status": "healthy",
        "service": "SkillForge Python AI Microservice",
        "version": "2.0.0",
        "port": 8000,
        "ai_engine": "Groq LLaMA 3.3 70B & 8B Instant",
        "vector_store": vs_status,
    }

@app.post("/vectorstore/rebuild")
def rebuild_index():
    """POST /vectorstore/rebuild — Force re-index all knowledge base files into ChromaDB"""
    try:
        vector_store.build_index(force_rebuild=True)
        return {"success": True, "status": vector_store.status()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

@app.post("/vectorstore/search")
def search_vectorstore(req: SearchRequest):
    """POST /vectorstore/search — Query ChromaDB semantic search directly"""
    try:
        context, sources = vector_store.search(req.query, top_k=req.top_k or 3)
        return {
            "success": True,
            "query": req.query,
            "context": context,
            "sources": sources,
            "mode": vector_store.status()["mode"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    """POST /rag/chat — ChromaDB Semantic RAG + Groq LLaMA 3.3 Study Assistant"""
    try:
        answer = generate_rag_answer(req.query, req.chat_history)
        return {
            "success": True,
            "query": req.query,
            "answer": answer,
            "retrieval_mode": vector_store.status()["mode"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agent/plan")
def agent_plan(req: AgentRequest):
    """POST /agent/plan — ReAct Autonomous Career Agent with 4 Tools + ChromaDB RAG"""
    try:
        result = run_career_agent_react(req.profile, req.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
