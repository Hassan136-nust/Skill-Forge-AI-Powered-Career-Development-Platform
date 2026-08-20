# 🚀 SkillForge — Complete REST API Documentation

## 1. Base URLs
- **Production Express API Gateway**: `https://skill-forge-ai-powered-career-9qhf.onrender.com`
- **Production Python AI Microservice**: `https://skill-forge-ai-powered-career.onrender.com`
- **Local Dev Gateway**: `http://localhost:3001`
- **Local Python Service**: `http://localhost:8000`

---

## 2. Authentication & Authorization Headers
Protected routes require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

---

## 3. Endpoints Breakdown

### 3.1 🔐 Authentication Routes (`/api/auth`)

#### `POST /api/auth/register`
Initializes scholar registration and generates 6-digit verification code.
- **Request Body**:
  ```json
  {
    "name": "Hassan Jamal",
    "email": "student@nust.edu.pk",
    "password": "Password123",
    "targetRole": "AI Engineer"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration initialized. 6-digit verification code sent.",
    "email": "student@nust.edu.pk",
    "requireOtp": true,
    "fallbackOtp": "123456"
  }
  ```

#### `POST /api/auth/verify-otp`
Verifies OTP code and activates account. Accepts user OTP, real email OTP, or universal demo code `123456`.
- **Request Body**:
  ```json
  {
    "email": "student@nust.edu.pk",
    "otp": "123456"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "67b78...",
      "name": "Hassan Jamal",
      "email": "student@nust.edu.pk",
      "role": "student"
    }
  }
  ```

#### `POST /api/auth/login`
Authenticates existing scholar or administrator.
- **Request Body**:
  ```json
  {
    "email": "student@nust.edu.pk",
    "password": "Password123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": "67b7...", "name": "Hassan Jamal", "email": "...", "role": "student" },
    "profile": { "careerGoal": "AI Engineer", "skills": [...] }
  }
  ```

---

### 3.2 👤 Scholar Profile Routes (`/api/profile`)

#### `GET /api/profile/:userId` *(Protected)*
Fetches full scholar profile, skills cloud, and GitHub repositories.

#### `PUT /api/profile/:userId` *(Protected)*
Updates degree, target career role, skills list, and synced GitHub repositories.

---

### 3.3 📊 Diagnostic Assessment Routes (`/api/assessment`)

#### `GET /api/assessment/questions/:skillCategory`
Fetches 5 curated adaptive questions for skill gap evaluation.

#### `POST /api/assessment/submit` *(Protected)*
Submits quiz answers, calculates percentage score, and updates verified skill level in profile.

---

### 3.4 🤖 AI Roadmap & LangGraph Agent Routes (`/api/ai`)

#### `POST /api/ai/roadmap/generate` *(Protected)*
Generates a 4-stage personalized career roadmap using **`openai/gpt-oss-120b`**.
- **Request Body**:
  ```json
  {
    "email": "student@nust.edu.pk",
    "careerGoal": "AI Engineer",
    "missingSkills": ["Vector Embeddings", "FastAPI", "PyTorch"],
    "currentSkills": { "Python": 85, "Git": 90 }
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "careerGoal": "AI Engineer",
    "generatedRoadmapText": "# 🪐 AI ENGINEER ROADMAP...",
    "milestones": [
      {
        "step": "01",
        "title": "NEURAL FOUNDATIONS & PYTORCH",
        "desc": "Deep Learning fundamentals",
        "capstone": "MNIST Classifier",
        "tech": "python"
      }
    ],
    "model": "openai/gpt-oss-120b"
  }
  ```

#### `POST /api/ai/agent/analyze` *(Protected)*
Executes the LangGraph 4-Node ReAct Planning Cycle (`SkillProfiler` ➔ `KnowledgeRetriever` ➔ `AgentPlanner` ➔ `RoadmapSynthesizer`).

---

### 3.5 💬 ChromaDB Semantic AI Mentor Routes (`/api/mentor`)

#### `POST /api/mentor/chat` *(Protected)*
Sends student query to ChromaDB RAG Vector Store and returns grounded AI response with verified citations.
- **Request Body**:
  ```json
  {
    "query": "What prerequisites do I need for RAG architecture?",
    "chatHistory": [],
    "studentContext": { "careerGoal": "AI Engineer", "name": "Hassan" }
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "reply": "To master Retrieval-Augmented Generation (RAG)...",
    "sources": ["Ai Engineer Roadmap", "Fastapi Microservices"]
  }
  ```

---

### 3.6 👑 Admin Command Center Routes (`/api/admin`) *(Admin Protected)*

#### `GET /api/admin/overview`
Returns platform KPIs (Total Scholars, Roadmaps Generated, Vector Embeddings, Verified Quizzes).

#### `GET /api/admin/scholars`
Returns full student CRM list with search and filtering.

#### `GET /api/admin/roadmaps`
Returns all AI-generated roadmaps for admin inspection.

#### `GET /api/admin/chats`
Returns student chat conversations and queries for platform analytics.

---

### 3.7 ⏱️ Health Check Endpoints (Uptime Monitoring)

- **`GET /health`** (Express Gateway): Returns `{ "status": "healthy", "service": "Express Gateway", "uptime": "1420s" }`
- **`GET /health`** (Python Microservice): Returns `{ "status": "healthy", "service": "Python AI", "vector_store": { "ready": true } }`
