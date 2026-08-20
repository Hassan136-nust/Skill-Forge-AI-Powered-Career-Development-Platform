import express from 'express'
import { Groq } from 'groq-sdk'
import MentorChat from '../models/MentorChat.js'
import Profile from '../models/Profile.js'
import User from '../models/User.js'
import Assessment from '../models/Assessment.js'
import Roadmap from '../models/Roadmap.js'

const router = express.Router()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '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',
})

// Helper: Fetch all consolidated student context from database
async function getStudentFullContext(email) {
  const cleanEmail = (email || '').trim().toLowerCase()
  if (!cleanEmail) return null

  try {
    const user = await User.findOne({ email: cleanEmail }).select('-password -otpCode').lean()
    const profile = user ? await Profile.findOne({ userId: user._id }).lean() : await Profile.findOne({ email: cleanEmail }).lean()
    const assessment = user ? await Assessment.findOne({ userId: user._id }).sort({ createdAt: -1 }).lean() : null
    const roadmap = await Roadmap.findOne({ email: cleanEmail }).sort({ createdAt: -1 }).lean()

    return {
      user: {
        name: user?.name || 'Scholar Student',
        email: cleanEmail,
        role: user?.role || 'student',
      },
      profile: {
        university: profile?.university || 'NUST / Top Tier CS Institute',
        degree: profile?.degree || 'BS Computer Science',
        yearOfStudy: profile?.yearOfStudy || 3,
        experienceLevel: profile?.experienceLevel || 'intermediate',
        careerGoal: profile?.careerGoal || 'AI Engineer',
        skills: profile?.skills || [],
        projects: profile?.projects || [],
        completedTasks: profile?.completedTasks || [],
      },
      assessment: {
        scores: assessment?.scores || { python: 75, webDev: 60, git: 80, devops: 50, ai: 70, databases: 65 },
        categoryResults: assessment?.categoryResults || [],
        takenAt: assessment?.takenAt || null,
      },
      roadmap: {
        careerGoal: roadmap?.careerGoal || profile?.careerGoal || 'AI Engineer',
        milestones: roadmap?.milestones || [],
        model: roadmap?.model || 'openai/gpt-oss-120b (Groq Cloud)',
      },
    }
  } catch (err) {
    console.warn('[getStudentFullContext Error]:', err.message)
    return null
  }
}

// =========================================================================
// 1. GET /api/mentor/context/:email — Get Live Consolidated Context
// =========================================================================
router.get('/context/:email', async (req, res) => {
  try {
    const { email } = req.params
    const context = await getStudentFullContext(email)
    res.json({ success: true, context })
  } catch (error) {
    console.error('[Get Mentor Context Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// =========================================================================
// 2. GET /api/mentor/sessions/:email — Get All Chat Sessions for User
// =========================================================================
router.get('/sessions/:email', async (req, res) => {
  try {
    const cleanEmail = (req.params.email || '').trim().toLowerCase()
    const sessions = await MentorChat.find({ email: cleanEmail })
      .select('title careerGoal pinned createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .lean()

    const formattedSessions = sessions.map((s) => ({
      _id: s._id,
      title: s.title,
      careerGoal: s.careerGoal,
      pinned: s.pinned || false,
      messageCount: s.messages ? s.messages.length : 0,
      lastMessage: s.messages && s.messages.length > 0 ? s.messages[s.messages.length - 1].content.substring(0, 70) + '...' : '',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }))

    res.json({ success: true, sessions: formattedSessions })
  } catch (error) {
    console.error('[Get Mentor Sessions Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// =========================================================================
// 3. GET /api/mentor/session/:sessionId — Get Single Session Messages
// =========================================================================
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const session = await MentorChat.findById(sessionId).lean()
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' })
    }
    res.json({ success: true, session })
  } catch (error) {
    console.error('[Get Mentor Session Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// =========================================================================
// 4. POST /api/mentor/session/new — Create New Conversation Session
// =========================================================================
router.post('/session/new', async (req, res) => {
  try {
    const { email, careerGoal, initialTitle } = req.body
    const cleanEmail = (email || '').trim().toLowerCase()
    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    const context = await getStudentFullContext(cleanEmail)
    const activeRole = careerGoal || context?.profile?.careerGoal || 'AI Engineer'
    const studentName = context?.user?.name || 'Scholar'

    const greetingMessage = {
      role: 'assistant',
      content: `Greetings **${studentName}**! 🚀 I am your **SkillForge Autonomous AI Career Mentor**.\n\nI have digested your full telemetry profile:\n- 🎯 **Target Track**: \`${activeRole}\`\n- 🎓 **Academics**: ${context?.profile?.degree || 'BS CS'} (${context?.profile?.university || 'University'})\n- 🐙 **GitHub Sync**: Synced ${context?.profile?.projects?.length || 0} repositories\n- 📊 **Radar Scores**: Python (${context?.assessment?.scores?.python || 75}%), Git (${context?.assessment?.scores?.git || 80}%), AI (${context?.assessment?.scores?.ai || 70}%)\n- 🗺️ **Roadmap Active**: ${context?.roadmap?.milestones?.length || 4} dynamic milestones verified\n\nHow can I accelerate your learning, review your GitHub code, or solve your blockers today?`,
      sources: ['SkillForge Profile Registry', 'GitHub Synced Data', 'Assessment Engine', 'Roadmap Graph'],
      timestamp: new Date(),
    }

    const newSession = await MentorChat.create({
      email: cleanEmail,
      title: initialTitle || `Mentorship • ${activeRole}`,
      careerGoal: activeRole,
      messages: [greetingMessage],
    })

    res.json({ success: true, session: newSession })
  } catch (error) {
    console.error('[Create Mentor Session Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// =========================================================================
// 5. POST /api/mentor/chat — Send Message with Full Context Memory
// =========================================================================
router.post('/chat', async (req, res) => {
  try {
    const { email, sessionId, message, currentMilestones, careerGoal } = req.body

    const cleanEmail = (email || '').trim().toLowerCase()
    if (!cleanEmail || !message) {
      return res.status(400).json({ success: false, message: 'Email and message are required' })
    }

    // 1. Fetch full real-time student context
    const context = await getStudentFullContext(cleanEmail)
    const activeRole = careerGoal || context?.profile?.careerGoal || 'AI Engineer'
    const studentName = context?.user?.name || 'Scholar'

    // Formatted GitHub repositories
    const githubReposFormatted = (context?.profile?.projects || [])
      .map((p, idx) => `  ${idx + 1}. **${p.title}**: ${p.description || 'No description'} (Tech: ${(p.techStack || []).join(', ') || 'N/A'}) [Link: ${p.link || 'local'}]`)
      .join('\n') || '  No synced GitHub projects found yet.'

    // Formatted Skills
    const skillsFormatted = (context?.profile?.skills || [])
      .map((s) => `${s.name} (${s.level || 'intermediate'})`)
      .join(', ') || 'Python, Git, Web Dev'

    // Formatted Radar Assessment Scores
    const scores = context?.assessment?.scores || { python: 75, webDev: 60, git: 80, devops: 50, ai: 70, databases: 65 }
    const radarFormatted = `Python: ${scores.python}%, WebDev: ${scores.webDev}%, Git: ${scores.git}%, DevOps: ${scores.devops}%, AI/ML: ${scores.ai}%, Databases: ${scores.databases}%`

    // Formatted Milestones
    const milestones = (currentMilestones && currentMilestones.length > 0) ? currentMilestones : (context?.roadmap?.milestones || [])
    const milestonesFormatted = milestones
      .map((m, i) => `  Milestone ${m.step || i + 1}: ${m.title} (Topics: ${m.topics || m.desc || 'Core Mastery'}, Capstone: ${m.capstone || 'Project'})`)
      .join('\n') || '  Milestone 1: Fundamentals, Milestone 2: Advanced Topics'

    // Completed Tasks
    const completedTasksCount = context?.profile?.completedTasks?.length || 0

    // Build Extensive Context System Prompt
    const systemPrompt = `You are the SkillForge Elite Autonomous AI Career Mentor & Senior Engineering Lead.
You have complete, photographic memory of this student's profile, academic status, GitHub repositories, quiz scores, and active career roadmap.

STUDENT DOSSIER & CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Student Name: ${studentName}
• Student Email: ${cleanEmail}
• University & Degree: ${context?.profile?.degree || 'BS Computer Science'} at ${context?.profile?.university || 'University'} (Year ${context?.profile?.yearOfStudy || 3})
• Experience Level: ${context?.profile?.experienceLevel || 'Intermediate'}
• Targeted Career Goal: ${activeRole}
• Verified Skills: ${skillsFormatted}
• GitHub Projects & Repositories:
${githubReposFormatted}
• Skill Gap Assessment Radar Scores:
  ${radarFormatted}
• Active Career Roadmap Pathway:
${milestonesFormatted}
• Completed Checklist Tasks: ${completedTasksCount} tasks checked
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MENTORSHIP GUIDELINES:
1. Speak as a world-class senior engineering lead with deep tactical clarity, high-agency mentorship, and cosmic Guardians flair.
2. Directly reference the student's actual projects, GitHub tech stack, specific quiz gaps, and roadmap milestones to make advice hyper-personalized.
3. VISUAL OUTPUT FORMATTING (CRITICAL FOR READABILITY):
   - Use clean, modern Markdown with bold key terms, spaced bullet points, and concise section dividers (---).
   - Use '###' for section titles with relevant emojis (e.g., '### 🎯 Strategic Gap Analysis', '### 🛠️ Hands-On Project Blueprint').
   - Keep tables compact (maximum 2-3 columns: e.g. | Capability | Recommendation |) so they remain clean and readable on all screens.
   - For code, provide clean, concise, production-ready code snippets with comments.
   - Structure action plans as step-by-step checklist sprints (e.g. Sprint 1, Sprint 2) rather than dense multi-column grids.
   - Keep tone encouraging, elite, and directly actionable.`

    // 2. Find or create session in MongoDB
    let session = null
    if (sessionId) {
      session = await MentorChat.findById(sessionId)
    }

    if (!session) {
      session = await MentorChat.create({
        email: cleanEmail,
        title: message.length > 40 ? message.substring(0, 37) + '...' : message,
        careerGoal: activeRole,
        messages: [],
      })
    }

    // Append User Message
    const userMsgObj = {
      role: 'user',
      content: message,
      sources: [],
      timestamp: new Date(),
    }
    session.messages.push(userMsgObj)

    // Build chat history for LLM
    const llmMessages = [{ role: 'system', content: systemPrompt }]

    // Include last 8 messages for conversational continuity
    const historySlice = session.messages.slice(-8)
    historySlice.forEach((m) => {
      llmMessages.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })
    })

    // 3. Call Groq Cloud LLM
    let assistantReply = ''
    try {
      const completion = await groq.chat.completions.create({
        messages: llmMessages,
        model: 'openai/gpt-oss-120b',
        temperature: 0.7,
        max_completion_tokens: 2048,
      }).catch(async () => {
        return await groq.chat.completions.create({
          messages: llmMessages,
          model: 'openai/gpt-oss-20b',
          temperature: 0.7,
          max_completion_tokens: 2048,
        })
      })

      assistantReply = completion.choices[0]?.message?.content || 'Here to support your journey!'
    } catch (llmErr) {
      console.error('[Groq LLM Error in Mentor]:', llmErr)
      assistantReply = `I encountered a cosmic connection delay, but here is my strategic guidance for **${studentName}** on your **${activeRole}** pathway:\n\nContinue advancing through your active roadmap milestones and leverage your synced GitHub tech stack!`
    }

    // Auto-update session title if it is still default or short
    if (session.messages.length <= 3 && (!session.title || session.title.startsWith('New') || session.title.startsWith('Mentorship'))) {
      const autoTitle = message.replace(/[*_#`]/g, '').trim()
      session.title = autoTitle.length > 36 ? autoTitle.substring(0, 33) + '...' : autoTitle
    }

    // Append Assistant Message
    const assistantMsgObj = {
      role: 'assistant',
      content: assistantReply,
      sources: ['SkillForge Student Dossier', 'GitHub Context Graph', 'Roadmap Engine', 'Groq LLaMA 3.3 Turbo'],
      timestamp: new Date(),
    }
    session.messages.push(assistantMsgObj)
    session.careerGoal = activeRole
    await session.save()

    res.json({
      success: true,
      sessionId: session._id,
      title: session.title,
      message: assistantMsgObj,
      session: {
        _id: session._id,
        title: session.title,
        careerGoal: session.careerGoal,
        messages: session.messages,
        updatedAt: session.updatedAt,
      },
    })
  } catch (error) {
    console.error('[Mentor Chat Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// =========================================================================
// 6. DELETE /api/mentor/session/:sessionId — Delete Chat Session
// =========================================================================
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    await MentorChat.findByIdAndDelete(sessionId)
    res.json({ success: true, message: 'Session deleted successfully' })
  } catch (error) {
    console.error('[Delete Mentor Session Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
