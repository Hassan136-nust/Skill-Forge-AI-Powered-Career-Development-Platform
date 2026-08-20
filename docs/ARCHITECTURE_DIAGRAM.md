# 🪐 SkillForge — Comprehensive System Architecture Document

## 1. Executive Summary
SkillForge is an autonomous AI-grounded career acceleration and competency intelligence platform designed for the **LoopLearn Hackathon 2026 (PS-03)** and aligned with **UN SDGs 4 & 8**. It implements a decoupled microservices architecture featuring:
- **Client Tier**: React 19 + Vite Single Page Application (SPA) deployed on Vercel Global Edge CDN.
- **API Gateway Tier**: Node.js / Express.js REST API deployed on Render Cloud (Port 3001) managing JWT sessions, schema validation, and routing.
- **AI Microservice Tier**: Python 3.10+ FastAPI service (Port 8000) orchestrating ChromaDB vector embeddings and LangGraph 4-node ReAct workflows.
- **LLM & Inference Tier**: Groq Cloud LPUs executing `openai/gpt-oss-120b` and `llama-3.3-70b-versatile` at ~300 tokens/sec.
- **Persistence Tier**: MongoDB Atlas Cloud multi-node replica set cluster.

---

## 2. End-to-End System Architecture Diagram

```mermaid
flowchart TB
    subgraph ClientTier ["📱 1. Client Presentation Tier (Vercel Edge)"]
        Browser["User Browser / Mobile Device"]
        ViteApp["React 19 + Vite Single Page App"]
        AuthLayer["Auth Client (JWT Storage + Google GSI)"]
        DashboardView["Student & Admin Dashboards"]
        RoadmapViewer["Interactive Full-Page Roadmap Reader"]
        ChatInterface["ChromaDB AI Mentor Assistant"]

        Browser --> ViteApp
        ViteApp --> AuthLayer
        ViteApp --> DashboardView
        ViteApp --> RoadmapViewer
        ViteApp --> ChatInterface
    end

    subgraph GatewayTier ["🟢 2. API Gateway & Application Server (Render Port 3001)"]
        Express["Express.js HTTP Gateway"]
        AuthMiddleware["JWT Verification & Role Guard (Admin/Student)"]
        RouterAuth["/api/auth (Login, Register, OTP Bypass)"]
        RouterProfile["/api/profile (Skills, GitHub Repos, Strengths)"]
        RouterAssessment["/api/assessment (Adaptive 5-Q Diagnostic Quizzes)"]
        RouterAI["/api/ai (Roadmaps & LangGraph Agents)"]
        RouterMentor["/api/mentor (Chat Sessions & RAG Queries)"]
        RouterAdmin["/api/admin (Platform KPIs, CRM, Chat Logs)"]
        GroqSDKDirect["Direct Groq Cloud SDK Client (High-Resiliency Fallback)"]

        Express --> AuthMiddleware
        AuthMiddleware --> RouterAuth
        AuthMiddleware --> RouterProfile
        AuthMiddleware --> RouterAssessment
        AuthMiddleware --> RouterAI
        AuthMiddleware --> RouterMentor
        AuthMiddleware --> RouterAdmin
        RouterAI -.-> GroqSDKDirect
        RouterMentor -.-> GroqSDKDirect
    end

    subgraph PersistenceTier ["🍃 3. Cloud Database Tier (MongoDB Atlas)"]
        ColUsers[("Users Collection\nCredentials, Roles, Status")]
        ColProfiles[("Profiles Collection\nSkills, GitHub, Diagnostics")]
        ColRoadmaps[("Roadmaps Collection\nMilestones, Sprints, Capstones")]
        ColChats[("MentorChats Collection\nConversations, Citations")]
        ColAssessments[("Assessments Collection\nQuiz Scores, Logs")]
    end

    subgraph AITier ["🐍 4. Python AI & RAG Microservice (Render Port 8000)"]
        FastAPI["FastAPI App + Uvicorn ASGI"]
        Lifespan["Lifespan Auto-Indexer on Startup"]
        SkillAnalyzer["SkillAnalyzer Engine (Gap Calculator)"]
        LangGraph["LangGraph 4-Node ReAct Planning Agent"]
        ChromaStore[("ChromaDB Vector Database\nall-MiniLM-L6-v2 Embeddings")]
        KBFiles["Curated Knowledge Base (rag/knowledge-base/*.txt)"]

        FastAPI --> Lifespan
        Lifespan --> ChromaStore
        KBFiles --> Lifespan
        FastAPI --> SkillAnalyzer
        FastAPI --> LangGraph
        LangGraph --> ChromaStore
    end

    subgraph InferenceTier ["⚡ 5. Ultra-Low Latency LLM Engine (Groq Cloud)"]
        Groq120B["openai/gpt-oss-120b (Flagship Reasoning Engine)"]
        GroqFallback["llama-3.3-70b-versatile (High-Throughput Fallback)"]
    end

    %% Connections
    ViteApp -->|HTTPS / REST API / Bearer Token| Express
    RouterAuth --> ColUsers
    RouterProfile --> ColProfiles
    RouterAssessment --> ColAssessments
    RouterAI --> ColRoadmaps
    RouterMentor --> ColChats
    RouterAdmin --> ColUsers
    RouterAdmin --> ColRoadmaps
    RouterAdmin --> ColChats

    RouterAI -->|Internal HTTP Proxy| FastAPI
    RouterMentor -->|Internal HTTP Proxy| FastAPI
    RouterAdmin -->|Vector Rebuild Proxy| FastAPI

    LangGraph -->|Groq API Calls| Groq120B
    GroqSDKDirect -->|Direct Inference| Groq120B
    Groq120B -.->|Failover| GroqFallback
```

---

## 3. ChromaDB Semantic RAG Retrieval Architecture

```mermaid
flowchart LR
    subgraph Ingestion ["📥 Ingestion Pipeline"]
        Docs["Curated .txt Curricula"] --> Chunking["Paragraph Chunker (400 chars)"]
        Chunking --> Embed["Sentence Embedder"]
        Embed --> ChromaDB[("ChromaDB Collection")]
    end

    subgraph Retrieval ["⚡ Retrieval Pipeline"]
        Query["Student Query"] --> QEmbed["Query Vectorization"]
        QEmbed --> CosineMatch["Cosine Similarity Search"]
        ChromaDB -.-> CosineMatch
        CosineMatch --> TopK["Top-3 Relevant Chunks & Citations"]
        TopK --> Augment["Context Injection"]
        Augment --> LLM["Groq LLaMA 3.3 / GPT-OSS-120B"]
        LLM --> Response["Grounded Answer with Source Badges"]
    end
```

---

## 4. LangGraph 4-Node Multi-Agent StateGraph

```mermaid
stateDiagram-v2
    [*] --> Node1_SkillProfiler: Diagnostic Assessment Results
    
    state Node1_SkillProfiler {
        [*] --> IngestQuizResults
        IngestQuizResults --> CalibrateSkillMatrix
        CalibrateSkillMatrix --> IdentifyGapList
        IdentifyGapList --> [*]
    }

    Node1_SkillProfiler --> Node2_KnowledgeRetriever: State { gaps, targetGoal, currentScores }

    state Node2_KnowledgeRetriever {
        [*] --> QueryChromaDB
        QueryChromaDB --> ExtractSyllabus
        ExtractSyllabus --> FormatSourceCitations
        FormatSourceCitations --> [*]
    }

    Node2_KnowledgeRetriever --> Node3_AgentPlanner: State { gaps, retrievedContext, sources }

    state Node3_AgentPlanner {
        [*] --> ReAct_Thought
        ReAct_Thought --> ReAct_Action
        ReAct_Action --> ReAct_Observation
        ReAct_Observation --> SequenceMilestones
        SequenceMilestones --> [*]
    }

    Node3_AgentPlanner --> Node4_RoadmapSynthesizer: State { structuredPlan, capstones }

    state Node4_RoadmapSynthesizer {
        [*] --> GenerateMilestoneTable
        GenerateMilestoneTable --> Construct16WeekSprints
        Construct16WeekSprints --> FormulateCapstoneDeliverables
        FormulateCapstoneDeliverables --> [*]
    }

    Node4_RoadmapSynthesizer --> [*]: Final Roadmap Stored in MongoDB & Rendered in SPA
```
