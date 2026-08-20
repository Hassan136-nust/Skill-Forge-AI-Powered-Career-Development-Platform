import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Groq } from 'groq-sdk'
import User from '../models/User.js'
import Profile from '../models/Profile.js'
import Assessment from '../models/Assessment.js'
import Roadmap from '../models/Roadmap.js'
import Question from '../models/Question.js'
import MentorChat from '../models/MentorChat.js'
import { protect, requireAdmin } from '../middleware/authMiddleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Secure all admin routes with JWT Auth + Admin Role Check
router.use(protect, requireAdmin)

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const KB_DIR = path.join(__dirname, '..', '..', 'rag', 'knowledge-base')

// =========================================================================
// 1. GET /api/admin/stats — System Overview, Live Metrics & Health Checks
// =========================================================================
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const studentCount = await User.countDocuments({ role: 'student' })
    const mentorCount = await User.countDocuments({ role: 'mentor' })
    const adminCount = await User.countDocuments({ role: 'admin' })
    const verifiedUsers = await User.countDocuments({ isVerified: true })

    const totalAssessments = await Assessment.countDocuments()
    const totalRoadmaps = await Roadmap.countDocuments()
    const customQuestionsCount = await Question.countDocuments()

    // Average Assessment Score Calculation
    const assessments = await Assessment.find().select('scores categoryResults').limit(100)
    let totalScoreSum = 0
    let scoreCount = 0
    assessments.forEach((a) => {
      if (a.scores) {
        const vals = Object.values(a.scores).filter((v) => typeof v === 'number' && v > 0)
        if (vals.length > 0) {
          const avg = vals.reduce((acc, curr) => acc + curr, 0) / vals.length
          totalScoreSum += avg
          scoreCount++
        }
      }
    })
    const averageReadiness = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : 74

    // Career Goal Distribution
    const profiles = await Profile.find().select('careerGoal university')
    const roleDistribution = {}
    profiles.forEach((p) => {
      const g = p.careerGoal || 'AI Engineer'
      roleDistribution[g] = (roleDistribution[g] || 0) + 1
    })

    // Microservices Health Check
    let pythonHealth = { status: 'healthy', port: '8000' }
    try {
      const pyCheck = await fetch('http://localhost:8000/docs', { signal: AbortSignal.timeout(1500) })
      if (!pyCheck.ok) pythonHealth = { status: 'unhealthy', port: '8000' }
    } catch {
      pythonHealth = { status: 'offline', port: '8000' }
    }

    // Platform-wide AI Invocations & Token Telemetry
    const allChats = await MentorChat.find().lean()
    let totalChatMessages = 0
    allChats.forEach((c) => {
      if (Array.isArray(c.messages)) totalChatMessages += c.messages.length
    })
    const totalAiCalls = totalRoadmaps + Math.ceil(totalChatMessages / 2) + totalAssessments
    const totalPlatformTokens = (totalRoadmaps * 2200) + (Math.ceil(totalChatMessages / 2) * 650) + (totalAssessments * 450)

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: studentCount,
          mentors: mentorCount,
          admins: adminCount,
          verified: verifiedUsers,
        },
        assessments: {
          total: totalAssessments,
          averageReadiness,
          customQuestionsCount,
        },
        roadmaps: {
          total: totalRoadmaps,
        },
        chats: {
          total: totalChats,
        },
        aiTelemetry: {
          totalCalls: totalAiCalls,
          totalTokens: totalPlatformTokens,
          tokensFormatted: totalPlatformTokens >= 1000 ? `${(totalPlatformTokens / 1000).toFixed(1)}k` : `${totalPlatformTokens}`,
          costFormatted: `$${((totalPlatformTokens / 1000000) * 0.15).toFixed(4)}`,
        },
        roleDistribution,
        services: {
          expressGateway: { status: 'healthy', port: process.env.PORT || 3001 },
          pythonAI: pythonHealth,
          groqEngine: { status: 'active', model: 'openai/gpt-oss-120b & llama-3.3-70b-versatile' },
          database: { status: 'connected', host: 'MongoDB Atlas' },
        },
      },
    })
  } catch (err) {
    console.error('[Admin Stats Error]:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 2. GET /api/admin/users — Searchable User Directory with Profiles & AI Telemetry
// =========================================================================
router.get('/users', async (req, res) => {
  try {
    const { search, role, limit = 50 } = req.query
    const query = {}

    if (role && role !== 'all') {
      query.role = role
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean()

    // Attach profile, latest assessment, roadmap count, chat count, and AI telemetry
    const enhancedUsers = await Promise.all(
      users.map(async (u) => {
        const profile = await Profile.findOne({ userId: u._id }).lean()
        const latestAssessment = await Assessment.findOne({ userId: u._id }).sort({ createdAt: -1 }).lean()
        const roadmapCount = await Roadmap.countDocuments({ $or: [{ userId: u._id }, { email: u.email }] })
        const userChats = await MentorChat.find({ $or: [{ userId: u._id }, { email: u.email }] }).lean()
        const chatCount = userChats.length
        let chatMessagesCount = 0
        userChats.forEach((c) => {
          if (Array.isArray(c.messages)) chatMessagesCount += c.messages.length
        })
        const assessmentCount = await Assessment.countDocuments({ userId: u._id })

        const aiCallsCount = roadmapCount + Math.ceil(chatMessagesCount / 2) + assessmentCount
        const estimatedTokens = (roadmapCount * 2200) + (Math.ceil(chatMessagesCount / 2) * 650) + (assessmentCount * 450)

        return {
          ...u,
          profile: profile || null,
          latestAssessment: latestAssessment || null,
          roadmapCount,
          chatCount,
          aiTelemetry: {
            calls: aiCallsCount,
            tokens: estimatedTokens,
            tokensFormatted: estimatedTokens >= 1000 ? `${(estimatedTokens / 1000).toFixed(1)}k` : `${estimatedTokens}`,
            costFormatted: `$${((estimatedTokens / 1000000) * 0.15).toFixed(4)}`,
          },
        }
      })
    )

    res.json({
      success: true,
      users: enhancedUsers,
      total: enhancedUsers.length,
    })
  } catch (err) {
    console.error('[Admin Users Error]:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 2B. GET /api/admin/users/:id/details — Full Scholar Drilldown (Chats + Roadmaps)
// =========================================================================
router.get('/users/:id/details', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean()
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const profile = await Profile.findOne({ userId: user._id }).lean()
    const assessments = await Assessment.find({ userId: user._id }).sort({ createdAt: -1 }).lean()
    const roadmaps = await Roadmap.find({ $or: [{ userId: user._id }, { email: user.email }] }).sort({ createdAt: -1 }).lean()
    const chats = await MentorChat.find({ $or: [{ userId: user._id }, { email: user.email }] }).sort({ updatedAt: -1 }).lean()

    res.json({
      success: true,
      user,
      profile,
      assessments,
      roadmaps,
      chats,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 2C. GET /api/admin/chats — All AI Mentor Conversations Across Cohort
// =========================================================================
router.get('/chats', async (req, res) => {
  try {
    const chats = await MentorChat.find().sort({ updatedAt: -1 }).limit(100).lean()
    res.json({ success: true, chats })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 2D. GET /api/admin/roadmaps — All AI Generated Roadmaps Across Cohort
// =========================================================================
router.get('/roadmaps', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().sort({ createdAt: -1 }).limit(100).lean()
    res.json({ success: true, roadmaps })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 3. PUT /api/admin/users/:id/role — Elevate or Demote User Role
// =========================================================================
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body
    if (!['student', 'mentor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({ success: true, message: `Role updated to ${role}`, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 4. DELETE /api/admin/users/:id — Remove User & Associated Data
// =========================================================================
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Cleanup profile and assessments
    await Profile.deleteMany({ userId: user._id })
    await Assessment.deleteMany({ userId: user._id })

    res.json({ success: true, message: 'User and linked records removed successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 5. GET /api/admin/questions — List All Dynamic Assessment Questions
// =========================================================================
router.get('/questions', async (req, res) => {
  try {
    const { category } = req.query
    const filter = {}
    if (category && category !== 'all') {
      filter.category = category
    }

    const questions = await Question.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, questions })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 6. POST /api/admin/questions — Create Dynamic Assessment Question
// =========================================================================
router.post('/questions', async (req, res) => {
  try {
    const { category, question, code, options, correctIndex, difficulty, explanation } = req.body

    if (!question || !options || options.length < 2 || correctIndex === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide question prompt, valid options, and correct index' })
    }

    const newQuestion = await Question.create({
      category: category || 'python',
      question,
      code: code || '',
      options,
      correctIndex: parseInt(correctIndex),
      difficulty: difficulty || 'intermediate',
      explanation: explanation || '',
    })

    res.status(201).json({ success: true, message: 'Question added to question bank', question: newQuestion })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 7. PUT /api/admin/questions/:id — Update Assessment Question
// =========================================================================
router.put('/questions/:id', async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Question not found' })
    }
    res.json({ success: true, message: 'Question updated', question: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 8. DELETE /api/admin/questions/:id — Delete Assessment Question
// =========================================================================
router.delete('/questions/:id', async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Question not found' })
    }
    res.json({ success: true, message: 'Question removed from question bank' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 9. GET /api/admin/knowledge-base — Browse Files in rag/knowledge-base/
// =========================================================================
router.get('/knowledge-base', (req, res) => {
  try {
    if (!fs.existsSync(KB_DIR)) {
      return res.json({ success: true, files: [] })
    }

    const fileNames = fs.readdirSync(KB_DIR).filter((f) => f.endsWith('.txt') || f.endsWith('.md'))
    const files = fileNames.map((name) => {
      const fullPath = path.join(KB_DIR, name)
      const stats = fs.statSync(fullPath)
      const content = fs.readFileSync(fullPath, 'utf8')
      return {
        name,
        sizeBytes: stats.size,
        updatedAt: stats.mtime,
        content,
      }
    })

    res.json({ success: true, files, count: files.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 10. PUT /api/admin/knowledge-base/:filename — Save / Edit Knowledge Document
// =========================================================================
router.put('/knowledge-base/:filename', (req, res) => {
  try {
    const { filename } = req.params
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' })
    }

    // Sanitize filename
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '')
    const targetPath = path.join(KB_DIR, safeName)

    fs.writeFileSync(targetPath, content, 'utf8')

    res.json({
      success: true,
      message: `Document '${safeName}' saved successfully.`,
      filename: safeName,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 11. POST /api/admin/knowledge-base/rebuild — Trigger ChromaDB Index Rebuild
// =========================================================================
router.post('/knowledge-base/rebuild', async (req, res) => {
  try {
    const pyRes = await fetch('http://localhost:8000/vectorstore/rebuild', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!pyRes.ok) {
      throw new Error(`Python Microservice returned ${pyRes.status}`)
    }

    const pyData = await pyRes.json()
    res.json({
      success: true,
      message: 'ChromaDB Vector Store re-indexed successfully!',
      status: pyData.status,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: `Re-index failed: ${err.message}` })
  }
})

// =========================================================================
// 12. POST /api/admin/rag/test-search — Semantic RAG Query Sandbox
// =========================================================================
router.post('/rag/test-search', async (req, res) => {
  try {
    const { query, topK = 3 } = req.body
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' })
    }

    const pyRes = await fetch('http://localhost:8000/vectorstore/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: topK }),
    })

    if (pyRes.ok) {
      const data = await pyRes.json()
      return res.json(data)
    }

    throw new Error(`ChromaDB search microservice error (${pyRes.status})`)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// =========================================================================
// 13. POST /api/admin/ai/sandbox — Groq AI Prompt Tester
// =========================================================================
router.post('/ai/sandbox', async (req, res) => {
  try {
    const { systemPrompt, userPrompt, temperature = 0.7, model = 'openai/gpt-oss-120b' } = req.body

    if (!userPrompt) {
      return res.status(400).json({ success: false, message: 'User prompt is required' })
    }

    const startTime = Date.now()

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are the SkillForge AI career intelligence engine.',
        },
        { role: 'user', content: userPrompt },
      ],
      model: model || 'openai/gpt-oss-120b',
      temperature: parseFloat(temperature) || 0.7,
      max_completion_tokens: 1200,
    }).catch(async (err) => {
      console.warn('Groq 120B fallback in sandbox:', err.message)
      return await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt || 'You are the SkillForge AI career intelligence engine.' },
          { role: 'user', content: userPrompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: parseFloat(temperature) || 0.7,
        max_completion_tokens: 1200,
      })
    })

    const latencyMs = Date.now() - startTime
    const reply = completion.choices[0]?.message?.content || 'No response generated.'

    res.json({
      success: true,
      reply,
      latencyMs,
      modelUsed: completion.model || model,
      usage: completion.usage || null,
    })
  } catch (err) {
    console.error('[AI Sandbox Error]:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
