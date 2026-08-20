import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Compass,
  Sparkles,
  Zap,
  Bot,
  History,
  Check,
  CheckCircle2,
  Lock,
  Search,
  Download,
  BookOpen,
  Filter,
  Layers,
  ArrowRight,
  Target,
  Trophy,
  Star
} from 'lucide-react'
import './StudentDashboard.css'

// Default Fallback Track Data
const TRACK_ROADMAPS_FALLBACK = {
  'AI Engineer': [
    { step: '01', title: 'PYTHON & VECTOR ALGORITHMS', desc: 'Master Python OOP, async generators, vector math with NumPy and algorithmic foundation.', capstone: 'Neural Base Engine & Vector Math Library', tech: 'python', topics: 'Python OOP, NumPy Vectorization, Time Complexity, AsyncIO' },
    { step: '02', title: 'PYTORCH & DEEP LEARNING', desc: 'Deep neural networks, backprop optimization, CNNs, and Transformer self-attention mechanisms.', capstone: 'End-to-End Deep Learning Classification Pipeline', tech: 'pytorch', topics: 'PyTorch Tensors, Autograd, Loss Functions, Vision Transformers' },
    { step: '03', title: 'FASTAPI & CHROMADB VECTOR RAG', desc: 'High-throughput async APIs, semantic chunking, ChromaDB vector indexing and hybrid retrieval.', capstone: 'Enterprise Semantic RAG Retrieval Service', tech: 'fastapi', topics: 'FastAPI Dependency Injection, ChromaDB Collections, Cosine Similarity, Pydantic' },
    { step: '04', title: 'LANGGRAPH AUTONOMOUS AGENTS', desc: 'Multi-node ReAct agent loops, dynamic tool calling, stategraphs, and production Docker deployment.', capstone: 'Autonomous AI Career Planning Agent with Groq LLaMA 3.3', tech: 'docker', topics: 'LangGraph StateGraph, Tool Calling, Docker Multi-Stage, Production SLAs' }
  ]
}

export default function FullRoadmapPage({
  onBackToDashboard,
  studentProfile: initialProfile,
  aiGeneratedMilestones: initialMilestones,
  onTriggerFastGenAi,
  onTriggerAgent
}) {
  const [studentProfile, setStudentProfile] = useState(initialProfile || {
    name: 'Scholar Student',
    email: 'student@nust.edu.pk',
    careerGoal: 'AI Engineer',
    skills: []
  })

  const [milestones, setMilestones] = useState(() => {
    if (initialMilestones && initialMilestones.length > 0) return initialMilestones
    try {
      const cached = JSON.parse(localStorage.getItem('skillforge_current_milestones') || 'null')
      if (cached && cached.length > 0) return cached
    } catch {}
    return TRACK_ROADMAPS_FALLBACK['AI Engineer']
  })

  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skillforge_completed_tasks') || '[]')
    } catch {
      return []
    }
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all') // 'all' | 'completed' | 'active'
  const [activeDetailMilestone, setActiveDetailMilestone] = useState(null)

  // Sync profile & completedTasks from localStorage and backend
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      if (storedUser.name) {
        setStudentProfile(prev => ({
          ...prev,
          name: storedUser.name,
          email: storedUser.email || prev.email,
          careerGoal: storedUser.careerGoal || prev.careerGoal || 'AI Engineer'
        }))
      }

      const cachedTasks = JSON.parse(localStorage.getItem('skillforge_completed_tasks') || '[]')
      if (Array.isArray(cachedTasks)) {
        setCompletedTasks(cachedTasks)
      }

      const cachedMilestones = JSON.parse(localStorage.getItem('skillforge_current_milestones') || 'null')
      if (cachedMilestones && cachedMilestones.length > 0) {
        setMilestones(cachedMilestones)
      }
    } catch (e) {}
  }, [])

  // Listen for storage events (sync between tabs and pages)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const cachedTasks = JSON.parse(localStorage.getItem('skillforge_completed_tasks') || '[]')
        setCompletedTasks(cachedTasks)
        const cachedMilestones = JSON.parse(localStorage.getItem('skillforge_current_milestones') || 'null')
        if (cachedMilestones && cachedMilestones.length > 0) {
          setMilestones(cachedMilestones)
        }
      } catch (e) {}
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Generate subtasks for each milestone step
  const getTasksForStep = (stepItem, stepNum) => {
    const tasks = []
    const prefix = `step_${stepNum}_`

    let sourceText = stepItem.topics || stepItem.desc || ''
    if (sourceText) {
      const parts = sourceText
        .split(/[•\n,]/)
        .map(s => s.replace(/https?:\/\/\S+/g, '').replace(/[*_#`()]/g, '').trim())
        .filter(s => s.length >= 4 && !s.toLowerCase().startsWith('http'))

      const uniqueParts = Array.from(new Set(parts)).slice(0, 2)
      uniqueParts.forEach((p, idx) => {
        tasks.push({
          id: `${prefix}task_${idx}`,
          label: p.length > 55 ? p.substring(0, 52) + '...' : p
        })
      })
    }

    if (tasks.length === 0) {
      tasks.push({ id: `${prefix}task_0`, label: `Master core foundations of ${stepItem.title || 'this track'}` })
      tasks.push({ id: `${prefix}task_1`, label: `Complete hands-on implementation labs` })
    }

    const capstoneName = (stepItem.capstone || 'Milestone Capstone')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*_#`]/g, '')
      .split(/[•\n]/)[0]
      .trim()

    tasks.push({
      id: `${prefix}capstone`,
      label: `🚀 Deliverable: ${capstoneName.length > 46 ? capstoneName.substring(0, 43) + '...' : capstoneName}`,
      isCapstone: true
    })

    return tasks
  }

  // Toggle task completion and immediately sync to localStorage and MongoDB
  const handleToggleTask = async (taskId) => {
    const updated = completedTasks.includes(taskId)
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId]

    setCompletedTasks(updated)
    localStorage.setItem('skillforge_completed_tasks', JSON.stringify(updated))

    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      await fetch('http://localhost:3001/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUser._id,
          email: studentProfile.email,
          completedTasks: updated
        })
      })
    } catch (err) {
      console.warn('Could not sync completed task to MongoDB:', err)
    }
  }

  // Calculate overall metrics
  const allTasksCount = milestones.reduce((acc, step, idx) => acc + getTasksForStep(step, idx + 1).length, 0)
  const allDoneCount = milestones.reduce((acc, step, idx) => {
    const sTasks = getTasksForStep(step, idx + 1)
    return acc + sTasks.filter(t => completedTasks.includes(t.id)).length
  }, 0)
  const overallProgressPct = allTasksCount > 0 ? Math.round((allDoneCount / allTasksCount) * 100) : 0

  // Filter milestones by search query and status filter
  const filteredMilestones = milestones.filter((step, idx) => {
    const stepNum = idx + 1
    const sTasks = getTasksForStep(step, stepNum)
    const isCompleted = sTasks.every(t => completedTasks.includes(t.id))

    if (selectedFilter === 'completed' && !isCompleted) return false
    if (selectedFilter === 'active' && isCompleted) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = (step.title || '').toLowerCase().includes(q)
      const descMatch = (step.desc || '').toLowerCase().includes(q)
      const techMatch = (step.tech || '').toLowerCase().includes(q)
      const capstoneMatch = (step.capstone || '').toLowerCase().includes(q)
      return titleMatch || descMatch || techMatch || capstoneMatch
    }
    return true
  })

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      student: studentProfile.name,
      careerGoal: studentProfile.careerGoal,
      progress: `${overallProgressPct}%`,
      milestones: milestones,
      completedTasks: completedTasks,
      exportedAt: new Date().toISOString()
    }, null, 2))
    const dlAnchorElem = document.createElement('a')
    dlAnchorElem.setAttribute("href", dataStr)
    dlAnchorElem.setAttribute("download", `SkillForge_Roadmap_${studentProfile.careerGoal.replace(/\s+/g, '_')}.json`)
    dlAnchorElem.click()
  }

  return (
    <div className="dashboard-root" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* 🌌 Space Video Background (login.webm) */}
      <div className="dashboard-bg-video-container">
        <video src="/login.webm" className="dashboard-bg-video" autoPlay loop muted playsInline />
        <div className="dashboard-video-overlay" />
      </div>

      {/* =========================================================================
          TOP NAVBAR — EXACT SAME AS DASHBOARD (NO BLUE EFFECTS)
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
              fontSize: '0.88rem',
              fontWeight: 700,
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              background: 'rgba(255, 209, 102, 0.08)',
              border: '1px solid rgba(255, 209, 102, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Compass size={14} color="#FFD166" />
            <span>Complete Career Map ({milestones.length} Steps)</span>
          </span>
        </nav>

        <div className="navbar-right-actions">
          <button
            className="navbar-item-btn"
            style={{
              color: '#FFD166',
              border: '1px solid #FFD166',
              backgroundColor: 'rgba(255, 209, 102, 0.08)',
              borderRadius: '20px',
              padding: '0.45rem 1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
            onClick={handleExportJson}
            title="Export Roadmap JSON"
          >
            <Download size={13} />
            <span>EXPORT</span>
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
          MAIN CONTAINER WITH Z-INDEX 10 SO CARDS RENDER IN FRONT OF VIDEO
          ========================================================================= */}
      <main className="dashboard-main-container">
        
        {/* Top Control Panel Header */}
        <div className="dashboard-glass-panel">
          <div className="panel-header-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <h2 className="panel-title">
                <Compass size={20} color="#FFD166" style={{ animation: 'spin 12s linear infinite' }} />
                <span>3D AI CAREER ROADMAP PATHWAY</span>
              </h2>
              <span
                style={{
                  background: 'rgba(255, 209, 102, 0.15)',
                  border: '1px solid #FFD166',
                  borderRadius: '12px',
                  padding: '0.2rem 0.65rem',
                  color: '#FFD166',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Sparkles size={12} color="#FFD166" />
                <span>{studentProfile.careerGoal.toUpperCase()} ({milestones.length} TOTAL MILESTONES)</span>
              </span>
            </div>

            {/* Metrics Quick Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#B8B3C7' }}>
                <Target size={15} color="#FFD166" />
                <span>Tasks Completed: <strong style={{ color: '#FFD166' }}>{allDoneCount}/{allTasksCount}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#B8B3C7' }}>
                <Trophy size={15} color="#27C93F" />
                <span>Readiness: <strong style={{ color: overallProgressPct === 100 ? '#27C93F' : '#FFD166' }}>{overallProgressPct}%</strong></span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} color="#64748B" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search milestones, skills (PyTorch, Docker, FastAPI), or deliverables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(5, 7, 18, 0.85)',
                  border: '1px solid #23293d',
                  borderRadius: '10px',
                  padding: '0.65rem 2rem 0.65rem 2.4rem',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>✕</button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className={`filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('all')}
                style={{
                  background: selectedFilter === 'all' ? 'rgba(255, 209, 102, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedFilter === 'all' ? '#FFD166' : '#23293d'}`,
                  borderRadius: '8px',
                  color: selectedFilter === 'all' ? '#FFD166' : '#B8B3C7',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                All ({milestones.length})
              </button>
              <button
                className={`filter-pill ${selectedFilter === 'active' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('active')}
                style={{
                  background: selectedFilter === 'active' ? 'rgba(255, 209, 102, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedFilter === 'active' ? '#FFD166' : '#23293d'}`,
                  borderRadius: '8px',
                  color: selectedFilter === 'active' ? '#FFD166' : '#B8B3C7',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ⚡ In Progress
              </button>
              <button
                className={`filter-pill ${selectedFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('completed')}
                style={{
                  background: selectedFilter === 'completed' ? 'rgba(39, 201, 63, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedFilter === 'completed' ? '#27C93F' : '#23293d'}`,
                  borderRadius: '8px',
                  color: selectedFilter === 'completed' ? '#27C93F' : '#B8B3C7',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ✓ Completed
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3D CARDS GRID — VISIBLE AND STYLED EXACTLY LIKE DASHBOARD
            ========================================================================= */}
        {filteredMilestones.length === 0 ? (
          <div className="dashboard-glass-panel" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Compass size={40} color="#64748B" style={{ opacity: 0.5 }} />
            <h3 className="bungee-regular" style={{ color: '#E2E8F0', marginTop: '1rem' }}>NO WAYPOINTS FOUND</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Try searching for a different keyword or reset filters.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }} className="dashboard-nav-btn" style={{ marginTop: '1rem' }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredMilestones.map((stepItem, index) => {
              const stepNum = index + 1
              const stepTasks = getTasksForStep(stepItem, stepNum)
              const stepDoneCount = stepTasks.filter(t => completedTasks.includes(t.id)).length
              const stepPct = Math.round((stepDoneCount / stepTasks.length) * 100)
              const isVerified = stepPct === 100
              const isActiveFocus = !isVerified && index === 0

              let statusText = '🔒 LOCKED'
              let statusColor = '#64748b'

              if (isVerified) {
                statusText = '✓ VERIFIED'
                statusColor = '#27C93F'
              } else if (isActiveFocus) {
                statusText = '⚡ ACTIVE FOCUS'
                statusColor = '#FFD166'
              }

              return (
                <div
                  key={index}
                  className="zigzag-3d-card"
                  style={{
                    position: 'relative',
                    border: `1.5px solid ${isVerified ? '#27C93F' : isActiveFocus ? '#FFD166' : '#23293d'}`,
                    boxShadow: isActiveFocus ? '0 0 25px rgba(255, 209, 102, 0.2)' : isVerified ? '0 0 20px rgba(39, 201, 63, 0.15)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '380px',
                    background: 'linear-gradient(180deg, rgba(14, 18, 38, 0.95) 0%, rgba(7, 9, 18, 0.95) 100%)',
                  }}
                >
                  {/* Card Top Bar */}
                  <div className="step-card-header-bar">
                    <span className="step-card-num-badge">STEP {String(stepNum).padStart(2, '0')}</span>
                    <span className="step-card-status-badge" style={{ color: statusColor, borderColor: statusColor }}>
                      {statusText}
                    </span>
                  </div>

                  {/* Title & One-line Summary */}
                  <div>
                    <h3 className="step-card-title">{stepItem.title}</h3>
                    <p className="step-card-brief">
                      {stepItem.desc ? stepItem.desc.split(/[•\n]/)[0].trim() : 'Master technical foundations & pipelines.'}
                    </p>
                  </div>

                  {/* Interactive Sub-Tasks Checklist */}
                  <div className="step-checklist-container" onClick={(e) => e.stopPropagation()}>
                    <div className="checklist-meta-row">
                      <span className="checklist-title press-start-2p-regular">
                        ✦ TASKS ({stepDoneCount}/{stepTasks.length})
                      </span>
                      <span
                        className="checklist-pct-badge"
                        style={{ color: stepPct === 100 ? '#27C93F' : '#FFD166' }}
                      >
                        {stepPct}%
                      </span>
                    </div>

                    <div className="checklist-progress-bar">
                      <div
                        className="checklist-progress-fill"
                        style={{
                          width: `${stepPct}%`,
                          background:
                            stepPct === 100
                              ? '#27C93F'
                              : 'linear-gradient(90deg, #FFD166 0%, #FFB703 100%)',
                        }}
                      />
                    </div>

                    <div className="checklist-items-stack">
                      {stepTasks.map((t) => {
                        const isDone = completedTasks.includes(t.id)
                        return (
                          <div
                            key={t.id}
                            className={`checklist-row ${isDone ? 'checked' : ''} ${t.isCapstone ? 'capstone' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleTask(t.id)
                            }}
                            title="Click to toggle completion & sync to dashboard"
                          >
                            <div className={`cyber-check-circle ${isDone ? 'checked' : ''}`}>
                              {isDone && <Check size={10} color="#05060A" strokeWidth={3.5} />}
                            </div>
                            <span className="checklist-label-text">{t.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Detailed Syllabus Action */}
                  <div
                    className="step-card-footer-action"
                    onClick={() => setActiveDetailMilestone({ ...stepItem, stepNum, stepTasks })}
                    title="Open detailed AI syllabus & resources"
                  >
                    <span>📖 Full Syllabus &amp; Resources</span>
                    <ArrowRight size={11} color="#FFD166" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* =========================================================================
          DETAILED SYLLABUS / RESOURCES DRAWER MODAL
          ========================================================================= */}
      <AnimatePresence>
        {activeDetailMilestone && (
          <motion.div
            className="quiz-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveDetailMilestone(null)}
          >
            <motion.div
              className="quiz-card-cockpit"
              style={{ maxWidth: '640px', width: '90%', padding: '1.8rem' }}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c2030', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="step-card-num-badge">STEP {String(activeDetailMilestone.stepNum).padStart(2, '0')}</span>
                  <h3 className="bungee-regular" style={{ color: '#FFD166', fontSize: '1.1rem', margin: 0 }}>
                    {activeDetailMilestone.title}
                  </h3>
                </div>
                <button onClick={() => setActiveDetailMilestone(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                <div style={{ background: '#050712', border: '1px solid #1c2030', borderRadius: '12px', padding: '1rem' }}>
                  <span className="press-start-2p-regular" style={{ fontSize: '0.6rem', color: '#FFD166' }}>✦ OVERVIEW & PEDAGOGICAL GOAL</span>
                  <p style={{ color: '#CBD5E1', fontSize: '0.86rem', lineHeight: 1.5, margin: '0.5rem 0 0 0' }}>
                    {activeDetailMilestone.desc || 'Comprehensive mastery of foundations, practical coding labs, and production-ready architectures.'}
                  </p>
                </div>

                {activeDetailMilestone.topics && (
                  <div style={{ background: '#050712', border: '1px solid #1c2030', borderRadius: '12px', padding: '1rem' }}>
                    <span className="press-start-2p-regular" style={{ fontSize: '0.6rem', color: '#FFD166' }}>✦ KEY TOPICS & TOOLS</span>
                    <p style={{ color: '#FFD166', fontSize: '0.84rem', lineHeight: 1.5, margin: '0.5rem 0 0 0' }}>
                      {activeDetailMilestone.topics}
                    </p>
                  </div>
                )}

                {activeDetailMilestone.resources && (
                  <div style={{ background: '#050712', border: '1px solid #1c2030', borderRadius: '12px', padding: '1rem' }}>
                    <span className="press-start-2p-regular" style={{ fontSize: '0.6rem', color: '#A855F7' }}>✦ CURATED LEARNING RESOURCES</span>
                    <p style={{ color: '#C084FC', fontSize: '0.84rem', lineHeight: 1.5, margin: '0.5rem 0 0 0' }}>
                      {activeDetailMilestone.resources}
                    </p>
                  </div>
                )}

                {activeDetailMilestone.capstone && (
                  <div style={{ background: 'rgba(255, 209, 102, 0.06)', border: '1px solid rgba(255, 209, 102, 0.4)', borderRadius: '12px', padding: '1rem' }}>
                    <span className="press-start-2p-regular" style={{ fontSize: '0.6rem', color: '#FFD166' }}>🚀 HANDS-ON CAPSTONE DELIVERABLE</span>
                    <p style={{ color: '#FFF7E8', fontSize: '0.86rem', fontWeight: 600, margin: '0.5rem 0 0 0' }}>
                      {activeDetailMilestone.capstone}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid #1c2030' }}>
                <button
                  onClick={() => setActiveDetailMilestone(null)}
                  className="bungee-regular"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#FFD166',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#05060A',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  RETURN TO MISSION MAP
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
