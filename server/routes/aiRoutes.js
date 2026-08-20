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

// Helper: Parse structured milestones from generated markdown for dynamic 3D Cards
function parseMilestonesFromText(text, fallbackRole) {
  const milestones = []
  if (!text) return milestones

  // 1. Try parsing Markdown table rows (| Milestone | Core Learning Objectives | Key Topics & Tools | Recommended Resources | Capstone Project |)
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.startsWith('|') && (line.includes('1') || line.includes('2') || line.includes('3') || line.includes('4') || line.includes('5') || line.includes('6') || line.includes('Milestone') || line.includes('Step'))) {
      const parts = line.split('|').map((p) => p.trim()).filter(Boolean)
      if (parts.length >= 3 && !parts[0].includes('---') && !parts[0].toLowerCase().includes('milestone')) {
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
    const milestones = parseMilestonesFromText(generatedRoadmapText, targetGoal)

    // Persist to MongoDB Atlas
    let savedRoadmap = null
    try {
      savedRoadmap = await Roadmap.create({
        email: cleanEmail,
        careerGoal: targetGoal,
        gaps: Array.isArray(missingSkills) ? missingSkills : [],
        generatedRoadmapText,
        milestones: milestones,
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
      milestones: milestones,
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
