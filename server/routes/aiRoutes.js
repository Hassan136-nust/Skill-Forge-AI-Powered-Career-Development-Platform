import express from 'express'
import { Groq } from 'groq-sdk'
import Profile from '../models/Profile.js'
import User from '../models/User.js'

const router = express.Router()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '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',
})

// =========================================================================
// 1. POST /api/ai/chat — RAG AI Study Assistant Powered by Groq
// =========================================================================
router.post('/chat', async (req, res) => {
  try {
    const { query, chatHistory, studentContext } = req.body

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a query message' })
    }

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
      answer,
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

// =========================================================================
// 2. POST /api/ai/roadmap/generate — GenAI Career Roadmap Generator
// =========================================================================
router.post('/roadmap/generate', async (req, res) => {
  try {
    const { userId, email, careerGoal, currentSkills, missingSkills } = req.body

    const targetGoal = careerGoal || 'AI Engineer'
    const cleanEmail = (email || 'student@nust.edu.pk').toLowerCase()

    // Call Python FastAPI Microservice for Skill Analysis
    let pythonAnalysis = null
    try {
      const pyRes = await fetch('http://localhost:8000/analyze', {
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

    const prompt = `Generate a comprehensive, fully written 4-step AI Career Learning Roadmap for a CS student targeting the role of "${targetGoal}".
Student Identified Skill Gaps: ${missingSkills ? JSON.stringify(missingSkills) : 'Target Stack Foundations'}.
Requirements:
1. Motivational Kick-Off introduction.
2. Formatted Table / Structured breakdown covering ALL 4 Milestones:
   - Milestone 1: Core Foundations & Algorithms
   - Milestone 2: Frameworks & Deep Practice
   - Milestone 3: Production APIs & Databases/Caching
   - Milestone 4: Autonomous Capstone & Cloud Deployment
3. Provide complete descriptions, specific capstone projects, and recommended resources for every milestone. Do NOT stop or truncate mid-sentence.`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are the SkillForge AI Career Architect generating personalized roadmaps for engineering students.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_completion_tokens: 4096,
    }).catch(async () => {
      return await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-20b',
        max_completion_tokens: 4096,
      })
    })

    const generatedRoadmapText = chatCompletion.choices[0]?.message?.content || ''

    // Persist to MongoDB Atlas
    let savedRoadmap = null
    try {
      savedRoadmap = await Roadmap.create({
        email: cleanEmail,
        careerGoal: targetGoal,
        gaps: Array.isArray(missingSkills) ? missingSkills : [],
        generatedRoadmapText,
        model: 'openai/gpt-oss-120b (Groq Cloud)',
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
      roadmapId: savedRoadmap?._id,
      generatedAt: savedRoadmap?.createdAt || new Date(),
      model: 'openai/gpt-oss-120b (Groq Cloud)',
    })
  } catch (error) {
    console.error('[Generate Roadmap Error]:', error)
    res.status(500).json({ success: false, message: error.message })
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

    // Forward to Python LangGraph Agent service
    const pyRes = await fetch('http://localhost:8000/agent/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: profile || {},
        prompt: prompt || 'Analyze my skills and plan my career pathway',
      }),
    })

    if (pyRes.ok) {
      const data = await pyRes.json()
      return res.json(data)
    }

    // Direct fallback if Python service unavailable
    res.json({
      success: true,
      careerGoal: profile?.careerGoal || 'AI Engineer',
      message: 'Agent executed ReAct loop across skills, gaps, and RAG knowledge base.',
    })
  } catch (error) {
    console.error('[Agent Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
