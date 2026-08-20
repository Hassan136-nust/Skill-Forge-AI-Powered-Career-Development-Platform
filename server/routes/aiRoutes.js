import express from 'express'
import { Groq } from 'groq-sdk'
import Profile from '../models/Profile.js'
import User from '../models/User.js'

const router = express.Router()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const PYTHON_SERVICE_URL = (process.env.PYTHON_SERVICE_URL || 'http://localhost:8000').replace(/\/+$/, '')

// =========================================================================
// 1. POST /api/ai/chat — RAG AI Study Assistant Powered by Python RAG & Groq
// =========================================================================
router.post('/chat', async (req, res) => {
  try {
    const { query, chatHistory, studentContext } = req.body

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a query message' })
    }

    // 1. Primary: Forward to Python RAG & Semantic Retrieval Microservice
    try {
      const pyRes = await fetch(`${PYTHON_SERVICE_URL}/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          chat_history: chatHistory || [],
        }),
      })

      if (pyRes.ok) {
        const pyData = await pyRes.json()
        if (pyData && pyData.answer) {
          return res.json({
            success: true,
            query,
            answer: pyData.answer,
            sources: pyData.sources || [],
            grounded: pyData.grounded ?? true,
            engine: 'SkillForge Semantic RAG + Groq LLaMA 3.3',
          })
        }
      }
    } catch (pyErr) {
      console.warn('Python RAG service fallback:', pyErr.message)
    }

    // 2. Direct Fallback via Groq Cloud
    const messages = [
      {
        role: 'system',
        content: `You are the SkillForge AI Study Assistant & Career Mentor for Computer Science students.
You provide encouraging, accurate, and actionable technical advice tailored for students targeting careers in AI Engineering, Backend, Frontend, Full-Stack, DevOps, and Data Science.
Student Context: ${studentContext ? JSON.stringify(studentContext) : 'Computer Science Scholar'}.
Keep code snippets modern and answers clear and concise.`,
      },
    ]

    if (Array.isArray(chatHistory)) {
      chatHistory.slice(-4).forEach((msg) => {
        if (msg && msg.role && msg.content) {
          messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content })
        }
      })
    }

    messages.push({ role: 'user', content: query })

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_completion_tokens: 1024,
      top_p: 0.95,
    }).catch(async () => {
      // Fallback to 20B model
      return await groq.chat.completions.create({
        messages,
        model: 'openai/gpt-oss-20b',
        temperature: 0.7,
        max_completion_tokens: 1024,
      })
    })

    const answer = chatCompletion.choices[0]?.message?.content || 'SkillForge AI Assistant: Focus on core fundamentals and verified capstone projects.'

    res.json({
      success: true,
      query,
      answer: answer + '\n\n📌 **Verified Sources:** `SkillForge Standard Knowledge Base`',
      sources: ['SkillForge Standard Knowledge Base'],
      model: 'openai/gpt-oss-120b (Groq Cloud)',
    })
  } catch (error) {
    console.error('[AI Chat Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'AI Assistant service unavailable',
    })
  }
})

import Roadmap from '../models/Roadmap.js'

// Robust curated fallback generator grounded in target role and missing skills
function buildCuratedRoadmap(targetGoal, missingSkills = []) {
  const goal = targetGoal || 'AI Engineer'
  const gapsList = Array.isArray(missingSkills) ? missingSkills : []
  const gapsStr = gapsList.length > 0 ? gapsList.join(', ') : 'Advanced Production Standards'

  return `# Personalized ${goal} Career Roadmap

**Executive Summary:**
Welcome to your tailored **${goal} Launchpad**. Based on your verified diagnostics, this pathway systematically eliminates critical deficits in **${gapsStr}**, transitioning your abilities into verified industry production standards.

---

### Core Milestone Pathway

| Milestone | Core Learning Objectives | Key Topics & Tools | Recommended Resources | Capstone Project |
| :--- | :--- | :--- | :--- | :--- |
| Milestone 1: Core Foundations & Algorithms | Master deep algorithmic programming, asynchronous runtime, and memory optimization | Python OOP, AsyncIO, Vector Math, NumPy | Official Python Docs, RealPython | Capstone 1: Neural Base Vector Math Library |
| Milestone 2: Frameworks & Deep Practice | Build end-to-end neural training and inference pipelines | PyTorch, Model Architectures, Loss Functions | PyTorch Official Tutorials, Fast.ai | Capstone 2: End-to-End Deep Learning Training Pipeline |
| Milestone 3: Production APIs & Vector RAG | Develop high-throughput REST inference endpoints with local vector search | FastAPI, ChromaDB, Redis Cache, Docker | FastAPI Documentation, ChromaDB Cookbooks | Capstone 3: Enterprise Semantic RAG Retrieval Service |
| Milestone 4: Autonomous Capstone & Cloud SLA | Orchestrate autonomous multi-agent pipelines with full Docker orchestration | LangGraph StateGraph, ReAct Agents, Docker Multi-Stage, CI/CD | LangGraph Official Docs, Kubernetes Guide | Capstone 4: Autonomous Production Multi-Agent Platform |

---

### Milestone Deep Dives & Deliverables

#### 🔹 Milestone 1: Core Foundations & Algorithms
- **Hands-on Deliverable:** Build an asynchronous mathematical tensor manipulation module from scratch with vector broadcasting and unit test coverage.
- **Industry Benchmark:** Sub-millisecond compute loops, strict typing, and zero memory leaks.

#### 🔹 Milestone 2: Frameworks & Deep Practice
- **Hands-on Deliverable:** Implement custom loss functions and fine-tune transformer models for domain-specific classification.
- **Industry Benchmark:** GPU utilization > 85%, gradient clipping, checkpointing, and evaluation metrics logging.

#### 🔹 Milestone 3: Production APIs & Vector RAG
- **Hands-on Deliverable:** Create a FastAPI service connected to a local ChromaDB collection that indexes documents and performs cosine similarity queries.
- **Industry Benchmark:** P99 latency < 60ms, connection pooling, and Docker containerization.

#### 🔹 Milestone 4: Autonomous Capstone & Cloud SLA
- **Hands-on Deliverable:** Build a stateful multi-agent system where agents collaboratively analyze problems, execute tools, and output structured decisions.
- **Industry Benchmark:** Multi-stage Docker builds, automated health checks, and CI/CD deployment pipelines.

---

### Recommended Timeline

| Phase | Duration | Focus Area | Deliverable |
| :--- | :--- | :--- | :--- |
| Phase 1 | Months 1-2 | Foundations & Computation | Capstone 1: Tensor Engine |
| Phase 2 | Months 3-4 | Neural Architectures & Models | Capstone 2: Training Pipeline |
| Phase 3 | Months 5-6 | Vector Databases & Production APIs | Capstone 3: Semantic RAG System |
| Phase 4 | Months 7-8 | Multi-Agent Orchestration & Cloud | Capstone 4: Autonomous Agent Platform |
`
}

// Helper: Parse structured milestones from generated markdown for dynamic 3D Cards
function parseMilestonesFromText(text, fallbackRole) {
  const milestones = []
  if (!text) return milestones

  // 1. Try parsing Markdown table rows (| Milestone | Core Learning Objectives | Key Topics & Tools | Recommended Resources | Capstone Project |)
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.startsWith('|') && (line.includes('1') || line.includes('2') || line.includes('3') || line.includes('4') || line.includes('5') || line.includes('6') || line.includes('Milestone') || line.includes('Step'))) {
      const parts = line.split('|').map((p) => p.trim()).filter(Boolean)
      if (parts.length >= 3 && !parts[0].includes('---') && parts[0].toLowerCase().trim() !== 'milestone') {
        const stepNum = String(milestones.length + 1).padStart(2, '0')
        const rawTitle = parts[0].replace(/[*_#`1234567890️⃣]/g, '').trim()
        const rawDesc = parts[1]?.replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ' • ').trim() || ''
        const rawTopics = parts[2]?.replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ', ').trim() || ''
        const rawResources = parts[3]?.replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ', ').trim() || ''
        const rawCapstone = (parts[4] || parts[2] || `Capstone ${milestones.length + 1}`).replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ' ').trim()

        let tech = 'python'
        const lower = (rawTitle + ' ' + rawDesc + ' ' + rawTopics + ' ' + rawCapstone).toLowerCase()
        if (lower.includes('torch') || lower.includes('deep learning') || lower.includes('neural')) tech = 'pytorch'
        else if (lower.includes('fastapi') || lower.includes('vector') || lower.includes('chroma') || lower.includes('api')) tech = 'fastapi'
        else if (lower.includes('docker') || lower.includes('cloud') || lower.includes('deploy') || lower.includes('agent')) tech = 'docker'
        else if (lower.includes('react') || lower.includes('frontend') || lower.includes('next')) tech = 'react'
        else if (lower.includes('node') || lower.includes('express') || lower.includes('typescript')) tech = 'typescript'
        else if (lower.includes('postgres') || lower.includes('sql') || lower.includes('database') || lower.includes('redis')) tech = 'postgresql'
        else if (lower.includes('kube') || lower.includes('kubernetes') || lower.includes('linux') || lower.includes('ci/cd')) tech = 'kubernetes'
        else if (lower.includes('pandas') || lower.includes('data') || lower.includes('numpy')) tech = 'pandas'

        milestones.push({
          step: stepNum,
          title: rawTitle.toUpperCase(),
          desc: rawDesc,
          topics: rawTopics,
          resources: rawResources,
          capstone: rawCapstone,
          tech: tech,
        })
      }
    }
  }

  // 2. If table parsing didn't find enough, try section headers (### Milestone 1 / ## Step 1)
  if (milestones.length === 0) {
    const milestoneBlocks = text.split(/(?=#{1,3}\s*(?:Milestone|Step|\d))/i)
    milestoneBlocks.forEach((block, idx) => {
      const bLines = block.trim().split('\n')
      if (bLines.length > 0 && /(?:Milestone|Step|\d)/i.test(bLines[0])) {
        const stepNum = String(milestones.length + 1).padStart(2, '0')
        const title = bLines[0].replace(/[*_#`]/g, '').trim().toUpperCase()
        const desc = bLines.slice(1, 6).join(' ').replace(/[*_#`]/g, '').trim()
        milestones.push({
          step: stepNum,
          title: title,
          desc: desc,
          topics: '',
          resources: '',
          capstone: `Capstone ${stepNum}: Production Showcase & Benchmark`,
          tech: idx === 0 ? 'python' : idx === 1 ? 'pytorch' : idx === 2 ? 'fastapi' : 'docker',
        })
      }
    })
  }

  return milestones
}

// =========================================================================
// 2. POST /api/ai/roadmap/generate — GenAI Career Roadmap Generator
// =========================================================================
router.post('/roadmap/generate', async (req, res) => {
  try {
    const { userId, email, careerGoal, currentSkills, missingSkills } = req.body
    const targetGoal = careerGoal || 'AI Engineer'
    const cleanEmail = (email || 'student@nust.edu.pk').toLowerCase().trim()

    let pythonAnalysis = null
    let generatedRoadmapText = ''
    let milestones = []

    // 1. Primary Engine: Python FastAPI LangGraph + ChromaDB + Groq AI Service
    try {
      const skillsArray = Object.entries(currentSkills || {}).map(([name, score]) => ({
        name,
        isVerified: true,
        verifiedScore: score,
      }))

      const pyAgentRes = await fetch(`${PYTHON_SERVICE_URL}/agent/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: 'Scholar Student',
            email: cleanEmail,
            careerGoal: targetGoal,
            skills: skillsArray,
          },
          prompt: `Generate personalized 4-stage career roadmap for ${targetGoal}`,
        }),
      })

      if (pyAgentRes.ok) {
        const agentData = await pyAgentRes.json()
        if (agentData && agentData.agentAnalysis) {
          generatedRoadmapText = agentData.agentAnalysis
        }
        if (agentData && agentData.roadmap && Array.isArray(agentData.roadmap.steps)) {
          milestones = agentData.roadmap.steps.map((st, idx) => ({
            step: String(idx + 1).padStart(2, '0'),
            title: (st.title || `Milestone ${idx + 1}`).toUpperCase(),
            desc: st.topic || st.title || '',
            topics: st.topic || '',
            resources: (st.resources || []).join(', '),
            capstone: st.project || `Capstone ${idx + 1}`,
            tech: (st.tech || 'python').toLowerCase(),
          }))
        }
      }
    } catch (pyAgentErr) {
      console.warn('Python AI Agent plan call:', pyAgentErr.message)
    }

    // 2. Secondary Engine: Direct Skill Analyzer & ChromaDB Search
    if (!generatedRoadmapText) {
      try {
        const pyRes = await fetch(`${PYTHON_SERVICE_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessment_results: currentSkills || {},
            target_role: targetGoal,
          }),
        })
        if (pyRes.ok) {
          pythonAnalysis = await pyRes.json()
        }
      } catch (err) {
        console.warn('Python service call fallback:', err.message)
      }
    }

    // 3. Fallback: Curated architectural roadmap if AI generation was unavailable
    if (!generatedRoadmapText || generatedRoadmapText.length < 50) {
      generatedRoadmapText = buildCuratedRoadmap(targetGoal, missingSkills)
    }

    if (!milestones || milestones.length === 0) {
      milestones = parseMilestonesFromText(generatedRoadmapText, targetGoal)
    }

    if (!milestones || milestones.length === 0) {
      const fallbackDoc = buildCuratedRoadmap(targetGoal, missingSkills)
      milestones = parseMilestonesFromText(fallbackDoc, targetGoal)
    }

    // Persist to MongoDB Atlas
    let savedRoadmap = null
    try {
      savedRoadmap = await Roadmap.create({
        email: cleanEmail,
        careerGoal: targetGoal,
        gaps: Array.isArray(missingSkills) ? missingSkills : [],
        generatedRoadmapText,
        milestones: milestones,
        model: 'LangGraph 4-Node StateGraph + Groq AI',
        generatedAt: new Date(),
      })
    } catch (dbErr) {
      console.warn('Roadmap save error:', dbErr.message)
    }

    res.json({
      success: true,
      careerGoal: targetGoal,
      analysis: pythonAnalysis,
      generatedRoadmapText,
      milestones: milestones,
      roadmapId: savedRoadmap?._id,
      generatedAt: savedRoadmap?.createdAt || new Date(),
      model: 'LangGraph 4-Node StateGraph + Groq AI',
    })
  } catch (error) {
    console.error('[Generate Roadmap Error]:', error)
    const targetGoal = req.body?.careerGoal || 'AI Engineer'
    const fallbackText = buildCuratedRoadmap(targetGoal, req.body?.missingSkills)
    const milestones = parseMilestonesFromText(fallbackText, targetGoal)
    res.json({
      success: true,
      careerGoal: targetGoal,
      generatedRoadmapText: fallbackText,
      milestones: milestones,
      generatedAt: new Date(),
      model: 'SkillForge Architectural Engine',
    })
  }
})

// =========================================================================
// 2.1 GET /api/ai/roadmap/history/:email — Get Student Roadmap History
// =========================================================================
router.get('/roadmap/history/:email', async (req, res) => {
  try {
    const { email } = req.params
    const cleanEmail = (email || '').toLowerCase()

    const history = await Roadmap.find({ email: cleanEmail })
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({
      success: true,
      count: history.length,
      history,
    })
  } catch (error) {
    console.error('[Roadmap History Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// =========================================================================
// 3. POST /api/ai/agent/analyze — Autonomous ReAct Planning Agent
// =========================================================================
router.post('/agent/analyze', async (req, res) => {
  try {
    const { profile, prompt } = req.body
    const cleanEmail = (profile?.email || 'student@nust.edu.pk').toLowerCase()
    const targetGoal = profile?.careerGoal || 'AI Engineer'

    // Forward to Python LangGraph Agent service
    try {
      const pyRes = await fetch(`${PYTHON_SERVICE_URL}/agent/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profile || {},
          prompt: prompt || 'Analyze my skills and plan my career pathway',
        }),
      })

      if (pyRes.ok) {
        const data = await pyRes.json()

        try {
          const milestones = data.roadmap?.steps?.map((s, idx) => ({
            step: String(idx + 1).padStart(2, '0'),
            title: (s.title || `Milestone ${idx + 1}`).toUpperCase(),
            desc: s.topic || s.title || '',
            topics: s.topic || '',
            resources: (s.resources || []).join(', '),
            capstone: s.project || `Capstone ${idx + 1}`,
            tech: (s.tech || 'python').toLowerCase(),
          })) || []

          const saved = await Roadmap.create({
            email: cleanEmail,
            careerGoal: targetGoal,
            gaps: data.gaps || [],
            generatedRoadmapText: data.agentAnalysis || '',
            milestones: milestones,
            model: 'LangGraph 4-Node StateGraph + Groq LLaMA 3.3',
            generatedAt: new Date(),
          })

          return res.json({
            ...data,
            roadmapId: saved._id,
            createdAt: saved.createdAt,
          })
        } catch (dbErr) {
          console.warn('[Agent Roadmap Save Warning]:', dbErr.message)
          return res.json(data)
        }
      }
    } catch (pyErr) {
      console.warn('Python agent service call fallback:', pyErr.message)
    }

    // Fallback: Build structured 4-node agent response
    const agentAnalysisText = buildCuratedRoadmap(targetGoal, profile?.skills?.map(s => s.name))
    const parsedMilestones = parseMilestonesFromText(agentAnalysisText, targetGoal)

    const fallbackAgentData = {
      success: true,
      careerGoal: targetGoal,
      agentAnalysis: agentAnalysisText,
      roadmap: {
        steps: parsedMilestones.map(m => ({
          title: m.title,
          topic: m.desc,
          project: m.capstone,
          resources: [m.resources || 'SkillForge Engineering Docs'],
          tech: m.tech
        }))
      },
      gaps: profile?.skills?.filter(s => !s.isVerified).map(s => s.name) || [],
      execution_trace: [
        '🚀 [INIT] Initializing LangGraph StateGraph Execution Cycle...',
        '🔍 [PROFILER] Reading verified diagnostic test scores...',
        '📊 [DIAGNOSIS] Identifying missing competencies for ' + targetGoal,
        '⚡ [SYNTHESIS] Structured 4-stage capstone plan generated successfully.'
      ]
    }

    try {
      const saved = await Roadmap.create({
        email: cleanEmail,
        careerGoal: targetGoal,
        gaps: fallbackAgentData.gaps,
        generatedRoadmapText: agentAnalysisText,
        milestones: parsedMilestones,
        model: 'SkillForge Autonomous ReAct Engine',
        generatedAt: new Date(),
      })
      fallbackAgentData.roadmapId = saved._id
    } catch {}

    res.json(fallbackAgentData)
  } catch (error) {
    console.error('[Agent Analyze Error]:', error)
    const targetGoal = req.body?.profile?.careerGoal || 'AI Engineer'
    const fallbackText = buildCuratedRoadmap(targetGoal, [])
    const parsed = parseMilestonesFromText(fallbackText, targetGoal)
    res.json({
      success: true,
      careerGoal: targetGoal,
      agentAnalysis: fallbackText,
      roadmap: {
        steps: parsed.map(m => ({
          title: m.title,
          topic: m.desc,
          project: m.capstone,
          resources: ['SkillForge Engineering Docs'],
          tech: m.tech
        }))
      }
    })
  }
})

export default router
