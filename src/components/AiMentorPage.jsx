import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Search,
  ArrowLeft,
  Bot,
  User as UserIcon,
  Compass,
  Code2,
  GitBranch,
  Target,
  Flame,
  Award,
  Layers,
  ChevronRight,
  Copy,
  Check,
  MessageSquare,
  Terminal,
  Cpu,
  BrainCircuit,
  Zap,
  Activity,
  GraduationCap,
  CheckCircle2
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import './AiMentorPage.css'
import './Navbar.css'

export default function AiMentorPage({ onBackToDashboard, currentUser }) {
  // 1. Core Profile & Context State
  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      const goal = localStorage.getItem('skillforge_career_goal') || stored.careerGoal || 'AI Engineer'
      return {
        name: stored.name || 'Scholar Student',
        email: stored.email || currentUser?.email || 'student@nust.edu.pk',
        careerGoal: goal,
        university: stored.university || 'NUST / Computer Science Institute',
      }
    } catch {
      return {
        name: 'Scholar Student',
        email: currentUser?.email || 'student@nust.edu.pk',
        careerGoal: 'AI Engineer',
        university: 'NUST / Computer Science Institute',
      }
    }
  })

  const [studentContext, setStudentContext] = useState(null)
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // 2. Fetch Consolidated Student Context & Chat Sessions
  const loadContextAndSessions = async () => {
    const email = studentProfile.email
    if (!email) return

    try {
      // Fetch live context (GitHub repos, quiz radar, active milestones)
      const ctxRes = await fetch(`http://localhost:3001/api/mentor/context/${encodeURIComponent(email)}`)
      if (ctxRes.ok) {
        const ctxData = await ctxRes.json()
        if (ctxData.success && ctxData.context) {
          setStudentContext(ctxData.context)
        }
      }

      // Fetch user's previous chat sessions
      const sessRes = await fetch(`http://localhost:3001/api/mentor/sessions/${encodeURIComponent(email)}`)
      if (sessRes.ok) {
        const sessData = await sessRes.json()
        if (sessData.success && Array.isArray(sessData.sessions)) {
          setSessions(sessData.sessions)
          // If sessions exist, auto-open the most recent one
          if (sessData.sessions.length > 0 && !activeSessionId) {
            loadSessionMessages(sessData.sessions[0]._id)
          } else if (sessData.sessions.length === 0 && !activeSessionId) {
            // Create a brand new initial session
            handleCreateNewSession()
          }
        }
      }
    } catch (err) {
      console.warn('[AI Mentor Load Error]:', err.message)
    }
  }

  useEffect(() => {
    loadContextAndSessions()
  }, [])

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  // 3. Load specific session
  const loadSessionMessages = async (sessionId) => {
    if (!sessionId) return
    try {
      setActiveSessionId(sessionId)
      const res = await fetch(`http://localhost:3001/api/mentor/session/${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.session) {
          setMessages(data.session.messages || [])
        }
      }
    } catch (err) {
      console.warn('[Load Session Messages Error]:', err.message)
    }
  }

  // 4. Create New Session
  // 4. Create New Session
  const handleCreateNewSession = async () => {
    try {
      const email = studentProfile.email
      const activeMilestonesList = getActiveMilestones()
      const res = await fetch('http://localhost:3001/api/mentor/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          careerGoal: studentProfile.careerGoal,
          initialTitle: `Mentorship • ${studentProfile.careerGoal}`,
          currentMilestones: activeMilestonesList,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.session) {
          setSessions((prev) => [
            {
              _id: data.session._id,
              title: data.session.title,
              careerGoal: data.session.careerGoal,
              messageCount: data.session.messages.length,
              lastMessage: 'Session Initialized',
              updatedAt: new Date(),
            },
            ...prev,
          ])
          setActiveSessionId(data.session._id)
          setMessages(data.session.messages || [])
        }
      }
    } catch (err) {
      console.warn('[Create New Session Error]:', err.message)
    }
  }

  // 5. Delete a session
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation()
    try {
      const res = await fetch(`http://localhost:3001/api/mentor/session/${sessionId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        const updated = sessions.filter((s) => s._id !== sessionId)
        setSessions(updated)
        if (activeSessionId === sessionId) {
          if (updated.length > 0) {
            loadSessionMessages(updated[0]._id)
          } else {
            handleCreateNewSession()
          }
        }
      }
    } catch (err) {
      console.warn('[Delete Session Error]:', err.message)
    }
  }

  // 6. Send Message with Full Context
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim()
    if (!query || isSending) return

    const tempUserMsg = {
      role: 'user',
      content: query,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, tempUserMsg])
    setInputValue('')
    setIsSending(true)

    // Read cached active milestones from localStorage or backend
    const activeMilestonesToSend = getActiveMilestones()

    try {
      const res = await fetch('http://localhost:3001/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: studentProfile.email,
          sessionId: activeSessionId,
          message: query,
          currentMilestones: activeMilestonesToSend,
          careerGoal: studentProfile.careerGoal,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setMessages(data.session.messages || [])
          // Update sidebar session title & last message
          setSessions((prev) =>
            prev.map((s) => {
              if (s._id === data.sessionId) {
                return {
                  ...s,
                  title: data.title || s.title,
                  messageCount: (data.session.messages || []).length,
                  lastMessage: query.substring(0, 45) + '...',
                  updatedAt: new Date(),
                }
              }
              return s
            })
          )
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '⚠️ Cosmic transmission interruption. Please check your backend connection and try again.',
            timestamp: new Date(),
          },
        ])
      }
    } catch (err) {
      console.error('[Send Message Error]:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Failed to connect to AI Mentor Service. Please ensure server is running.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  // Helper: Copy message to clipboard
  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Clean, Vector-Icon Powered Suggestion Prompts
  const dynamicSuggestions = [
    {
      icon: <GitBranch size={16} color="#FFD166" />,
      title: 'Review My GitHub Stack',
      prompt: `Review my synced GitHub repositories and tell me how well they align with the requirements of a top-tier ${studentProfile.careerGoal}. What projects are missing?`,
    },
    {
      icon: <Target size={16} color="#FFD166" />,
      title: 'Fix My Quiz Radar Gaps',
      prompt: `Based on my skill assessment radar scores, explain my weakest technical areas and give me a 7-day study drill to score 90%+ in them.`,
    },
    {
      icon: <Compass size={16} color="#FFD166" />,
      title: 'Roadmap Capstone Architecture',
      prompt: `Look at my active career roadmap for ${studentProfile.careerGoal}. How should I architect and structure my next capstone deliverable? Give me a production file structure and core technical requirements.`,
    },
    {
      icon: <Zap size={16} color="#FFD166" />,
      title: 'Mock Technical Interview Question',
      prompt: `Give me a hard technical interview coding challenge specifically asked for ${studentProfile.careerGoal} roles, with starter code and evaluation criteria.`,
    },
  ]

  // Helper: Get active roadmap milestones from local cache or backend
  const getActiveMilestones = () => {
    try {
      const cached = JSON.parse(localStorage.getItem('skillforge_current_milestones') || '[]')
      if (Array.isArray(cached) && cached.length > 0) return cached
      const roleKey = (studentProfile.careerGoal || 'ai_engineer').toLowerCase().replace(/\s+/g, '_')
      const roleCached = JSON.parse(localStorage.getItem(`skillforge_roadmap_${roleKey}`) || '[]')
      if (Array.isArray(roleCached) && roleCached.length > 0) return roleCached
    } catch {}
    return studentContext?.roadmap?.milestones || []
  }

  const activeMilestones = getActiveMilestones()
  const milestoneCount = activeMilestones.length > 0 ? activeMilestones.length : (studentContext?.roadmap?.milestones?.length || 4)
  const githubProjectsCount = studentContext?.profile?.projects?.length || 0

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) =>
    (s.title || '').toLowerCase().includes(searchFilter.toLowerCase())
  )

  const activeSession = sessions.find((s) => s._id === activeSessionId)

  return (
    <div className="mentor-root-container">
      {/* 🌌 Space Video Background (login.webm) — Bright & Clear */}
      <div className="mentor-bg-video-container">
        <video src="/login.webm" className="mentor-bg-video" autoPlay loop muted playsInline />
        <div className="mentor-video-overlay" />
      </div>

      {/* =========================================================================
          TOP NAVBAR — EXACT SAME AS ROADMAP & DASHBOARD (NO BLUE EFFECTS)
          ========================================================================= */}
      <header className="navbar-container" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="navbar-brand" onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-planet">🪐</div>
          <div className="brand-logo-text">
            <span className="brand-text-top bungee-regular">SKILL</span>
            <span className="brand-text-bottom bungee-regular">FORGE</span>
          </div>
        </div>

        <nav className="navbar-menu">
          <button className="navbar-item-btn" onClick={onBackToDashboard}>
            ← Back to Dashboard
          </button>
          <span
            style={{
              color: '#FFD166',
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(255, 209, 102, 0.08)',
              border: '1px solid rgba(255, 209, 102, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Bot size={15} color="#FFD166" />
            <span>AI Career Mentor Cockpit ({studentProfile.careerGoal})</span>
          </span>
        </nav>

        <div className="navbar-right-actions">
          <button
            className="navbar-item-btn"
            style={{
              color: '#FFD166',
              border: '1px solid rgba(255, 209, 102, 0.4)',
              backgroundColor: 'rgba(255, 209, 102, 0.08)',
              borderRadius: '20px',
              padding: '0.45rem 1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
            onClick={handleCreateNewSession}
            title="Start a fresh chat session"
          >
            <Plus size={14} />
            <span>NEW CHAT</span>
          </button>

          <button
            className="get-started-btn bungee-regular"
            style={{
              padding: '0.5rem 1.2rem',
              fontSize: '0.8rem',
              backgroundColor: '#FFD166',
              borderColor: '#FFD166',
              color: '#05060A',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 209, 102, 0.3)',
            }}
            onClick={onBackToDashboard}
            title="Return to Student Cockpit Dashboard"
          >
            <ArrowLeft size={14} color="#05060A" strokeWidth={3} />
            <span>DASHBOARD</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN TWO-COLUMN COCKPIT (SIDEBAR + MENTORSHIP ARENA)
          ========================================================================= */}
      <main className="mentor-cockpit-layout">
        {/* Left Sidebar: Session List & Student Dossier */}
        <aside className="mentor-sidebar-panel">
          <button className="mentor-new-chat-btn" onClick={handleCreateNewSession}>
            <Plus size={15} color="#05060A" strokeWidth={3} />
            <span>+ NEW MENTOR CHAT</span>
          </button>

          <div className="mentor-search-box">
            <Search size={13} color="#64748B" />
            <input
              type="text"
              placeholder="Search previous chats..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="mentor-search-input"
            />
          </div>

          <div className="mentor-sessions-list" data-lenis-prevent="true">
            {filteredSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B', fontSize: '0.78rem' }}>
                No conversations found. Start a new chat!
              </div>
            ) : (
              filteredSessions.map((s) => (
                <div
                  key={s._id}
                  className={`mentor-session-item ${s._id === activeSessionId ? 'active' : ''}`}
                  onClick={() => loadSessionMessages(s._id)}
                >
                  <div className="mentor-session-info">
                    <span className="mentor-session-title">
                      {s.title || 'Mentorship Discussion'}
                    </span>
                    <span className="mentor-session-meta">
                      <MessageSquare size={10} color="#FFD166" />
                      <span>{s.messageCount || 0} msgs • {new Date(s.updatedAt || s.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </span>
                  </div>
                  <button
                    className="mentor-session-delete"
                    onClick={(e) => handleDeleteSession(e, s._id)}
                    title="Delete Chat Session"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Student Dossier Badge at bottom of sidebar */}
          <div className="mentor-student-dossier">
            <div className="mentor-student-initial-badge" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="/hard.png" alt="Student" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="mentor-student-meta">
              <span className="mentor-student-name">{studentProfile.name}</span>
              <span className="mentor-student-tag">
                <Target size={11} color="#FFD166" />
                <span>{studentProfile.careerGoal}</span>
              </span>
            </div>
          </div>
        </aside>

        {/* Right Main Arena: Active Mentorship Stream */}
        <section className="mentor-arena-panel">
          {/* Header */}
          <div className="mentor-arena-header">
            <div className="mentor-arena-title-wrap">
              <div className="mentor-avatar-badge">
                <img src="/hard.png" alt="AI Mentor" className="mentor-avatar-img" />
              </div>
              <div>
                <h3 className="mentor-arena-headline">
                  {activeSession?.title || `SkillForge AI Mentor • ${studentProfile.careerGoal}`}
                </h3>
                <div className="mentor-context-indicator">
                  <div className="mentor-context-dot" />
                  <span>
                    Synced: {githubProjectsCount} GitHub Repos • {milestoneCount} Milestones • LLaMA 3.3 Turbo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="mentor-chat-stream" data-lenis-prevent="true">
            {messages.length === 0 ? (
              <div className="mentor-welcome-hero">
                {/* Clean Vector Holographic Core Icon */}
                <div className="mentor-hero-core-badge">
                  <Sparkles size={28} color="#FFD166" />
                </div>
                
                <h2 className="mentor-hero-title">HOW CAN I ACCELERATE YOUR MISSION?</h2>
                
                <div className="mentor-hero-dossier-pill">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Target size={13} color="#FFD166" /> <b>Target</b>: {studentProfile.careerGoal}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><GitBranch size={13} color="#FFD166" /> <b>GitHub</b>: {githubProjectsCount} Projects Synced</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Activity size={13} color="#FFD166" /> <b>Assessment</b>: Verified</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Compass size={13} color="#FFD166" /> <b>Roadmap</b>: {milestoneCount} Milestones Active</span>
                </div>

                <p style={{ color: '#94A3B8', fontSize: '0.84rem', maxWidth: '560px', lineHeight: 1.5, margin: '0 auto 0.8rem' }}>
                  I have full memory of your academic journey, verified technical strengths, GitHub projects, and current blockers. Select a tactical prompt or ask anything:
                </p>

                <div className="mentor-suggestions-grid">
                  {dynamicSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="mentor-suggestion-card"
                      onClick={() => handleSendMessage(item.prompt)}
                    >
                      <div className="mentor-suggestion-icon-wrap">
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ color: '#FFD166', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.15rem' }}>
                          {item.title}
                        </div>
                        <div className="mentor-suggestion-text">
                          {item.prompt.length > 70 ? item.prompt.substring(0, 68) + '...' : item.prompt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mentor-bubble-row ${msg.role === 'user' ? 'user' : 'assistant'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mentor-chat-avatar">
                      <img src="/hard.png" alt="AI Mentor" className="mentor-chat-avatar-img" />
                    </div>
                  )}
                  
                  <div className="mentor-bubble-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="press-start-2p-regular" style={{ fontSize: '0.55rem', color: msg.role === 'user' ? '#05060A' : '#FFD166' }}>
                        {msg.role === 'user' ? 'YOU' : 'SKILLFORGE AI MENTOR'}
                      </span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(msg.content, idx)}
                          style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem' }}
                          title="Copy Answer"
                        >
                          {copiedIndex === idx ? <Check size={11} color="#27C93F" /> : <Copy size={11} />}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        li: ({ node, children, ...props }) => {
                          const getText = (c) => {
                            if (!c) return ''
                            if (typeof c === 'string') return c
                            if (Array.isArray(c)) return c.map(getText).join('')
                            if (c.props && c.props.children) return getText(c.props.children)
                            return ''
                          }
                          const rawString = getText(children)
                          const lower = rawString.toLowerCase()

                          let icon = <span className="mentor-bullet-dot" />
                          let isTelemetry = false

                          if (lower.includes('target') || lower.includes('career track') || lower.includes('goal')) {
                            icon = <Target size={13} color="#FFD166" />
                            isTelemetry = true
                          } else if (lower.includes('academic') || lower.includes('university') || lower.includes('degree')) {
                            icon = <GraduationCap size={13} color="#FFD166" />
                            isTelemetry = true
                          } else if (lower.includes('github') || lower.includes('repo') || lower.includes('project')) {
                            icon = <GitBranch size={13} color="#FFD166" />
                            isTelemetry = true
                          } else if (lower.includes('radar') || lower.includes('score') || lower.includes('assessment')) {
                            icon = <Activity size={13} color="#FFD166" />
                            isTelemetry = true
                          } else if (lower.includes('roadmap') || lower.includes('milestone') || lower.includes('step')) {
                            icon = <Compass size={13} color="#FFD166" />
                            isTelemetry = true
                          }

                          return (
                            <li className={`mentor-styled-li ${isTelemetry ? 'telemetry-item' : ''}`} {...props}>
                              <span className="mentor-li-icon">{icon}</span>
                              <div className="mentor-li-text">{children}</div>
                            </li>
                          )
                        },
                        ul: ({ node, children, ...props }) => (
                          <ul className="mentor-styled-ul" {...props}>
                            {children}
                          </ul>
                        )
                      }}
                    >
                      {(msg.content || '')
                        .replace(/[🎯🎓🐙📊🗺️🚀💡🔥⚡✨🤖🧑‍💻🛸🪐🌌]/gu, '')
                        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')}
                    </ReactMarkdown>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mentor-bubble-sources">
                        <span>✦ Verified Context Sources:</span>
                        {msg.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              background: 'rgba(255, 209, 102, 0.08)',
                              border: '1px solid rgba(255, 209, 102, 0.25)',
                              borderRadius: '4px',
                              padding: '0.08rem 0.35rem',
                            }}
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #FFD166 0%, #FFB703 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#05060A',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      {studentProfile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mentor-bubble-row assistant"
              >
                <div className="mentor-chat-avatar">
                  <img src="/hard.png" alt="AI Mentor" className="mentor-chat-avatar-img" />
                </div>
                <div className="mentor-bubble-content" style={{ background: 'rgba(14, 18, 34, 0.65)' }}>
                  <div className="mentor-typing-bar">
                    <Sparkles size={13} color="#FFD166" />
                    <span>AI Mentor is analyzing your telemetry & synthesizing response...</span>
                    <div className="mentor-typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Dock */}
          <div className="mentor-input-dock">
            {/* Quick action prompts bar above input */}
            <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.2rem' }} data-lenis-prevent="true">
              {dynamicSuggestions.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  style={{
                    background: 'rgba(255, 209, 102, 0.06)',
                    border: '1px solid rgba(255, 209, 102, 0.2)',
                    borderRadius: '16px',
                    padding: '0.25rem 0.65rem',
                    color: '#FFD166',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 209, 102, 0.12)'
                    e.currentTarget.style.borderColor = '#FFD166'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 209, 102, 0.06)'
                    e.currentTarget.style.borderColor = 'rgba(255, 209, 102, 0.2)'
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </button>
              ))}
            </div>

            <div className="mentor-input-row">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={`Ask AI Mentor anything about ${studentProfile.careerGoal}, GitHub code, or roadmap milestones... (Press Enter to send)`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="mentor-textarea"
              />
              <button
                className="mentor-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isSending}
                title="Send Message"
              >
                <Send size={15} color="#05060A" strokeWidth={2.5} />
              </button>
            </div>

            <div className="mentor-input-footer-hint">
              SkillForge AI Mentor is powered by Groq LLaMA 3.3 Turbo & continuous student memory.
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
