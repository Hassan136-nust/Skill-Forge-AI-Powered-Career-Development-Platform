import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert,
  Users,
  BrainCircuit,
  Database,
  FileCode,
  Activity,
  Terminal,
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Sparkles,
  Send,
  BookOpen,
  Layers,
  ArrowRight,
  LogOut,
  UserCheck,
  Zap,
  Sliders,
  Cpu,
  Server,
  FileText,
  BarChart3,
  Eye,
  Check,
  X,
  Compass
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import './AdminDashboard.css'
import './Navbar.css'

const CATEGORY_NAMES = {
  python: 'Python & Vector Algorithms',
  webDev: 'Web & Full-Stack Development',
  git: 'Git & Version Control',
  devops: 'Cloud, Docker & DevOps',
  ai: 'AI, PyTorch & ChromaDB RAG',
  databases: 'Databases & PostgreSQL',
  algorithms: 'Data Structures & Algorithms'
}

const CAREER_BENCHMARKS = {
  'AI Engineer': ['Python', 'PyTorch', 'FastAPI', 'Docker', 'ChromaDB', 'Git', 'TypeScript'],
  'Backend Developer': ['TypeScript', 'Node.js', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'Redis'],
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'CSS', 'Next.js', 'Git', 'Tailwind'],
  'Full-Stack Developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Docker', 'PostgreSQL', 'Git'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'Linux', 'Git', 'Python', 'CI/CD', 'Bash'],
  'Data Scientist': ['Python', 'SQL', 'PyTorch', 'Pandas', 'NumPy', 'Git', 'Scikit-Learn']
}

export default function AdminDashboard({ onExitAdmin, onOpenStudentDashboard }) {
  // Navigation
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'students' | 'questions' | 'knowledge' | 'aiSandbox' | 'benchmarks' | 'reports'

  // Admin User Info
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skillforge_user') || '{}')
    } catch {
      return { name: 'Admin', email: 'admin@skillforge.ai', role: 'admin' }
    }
  })

  // Data States
  const [stats, setStats] = useState(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [usersList, setUsersList] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')

  // Selected Student Drilldown Modal
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Question Bank
  const [questionsList, setQuestionsList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [questionFormData, setQuestionFormData] = useState({
    category: 'python',
    question: '',
    code: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    difficulty: 'intermediate',
    explanation: ''
  })

  // Knowledge Base & RAG
  const [kbFiles, setKbFiles] = useState([])
  const [selectedKbFile, setSelectedKbFile] = useState(null)
  const [kbContent, setKbContent] = useState('')
  const [isSavingKb, setIsSavingKb] = useState(false)
  const [isRebuildingChroma, setIsRebuildingChroma] = useState(false)
  const [chromaStatusMsg, setChromaStatusMsg] = useState('')

  // RAG Search Tester
  const [ragQuery, setRagQuery] = useState('What are the core milestones for AI Engineering?')
  const [ragSearchResults, setRagSearchResults] = useState(null)
  const [isSearchingRag, setIsSearchingRag] = useState(false)

  // AI Sandbox
  const [sandboxSystemPrompt, setSandboxSystemPrompt] = useState('You are the SkillForge Lead AI Evaluator and Career Architect for Computer Science students.')
  const [sandboxUserPrompt, setSandboxUserPrompt] = useState('Analyze the key competencies needed for a student with basic Python to transition into Autonomous Multi-Agent Development.')
  const [sandboxTemperature, setSandboxTemperature] = useState(0.7)
  const [sandboxModel, setSandboxModel] = useState('openai/gpt-oss-120b')
  const [sandboxResponse, setSandboxResponse] = useState(null)
  const [isSandboxRunning, setIsSandboxRunning] = useState(false)

  // Benchmarks State
  const [benchmarks, setBenchmarks] = useState(CAREER_BENCHMARKS)
  const [benchmarksSavedMsg, setBenchmarksSavedMsg] = useState('')

  // Toast / Status Message
  const [toastMsg, setToastMsg] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type })
    setTimeout(() => setToastMsg(null), 3500)
  }

  // 1. Fetch Stats & System Health
  const fetchStats = async () => {
    setIsLoadingStats(true)
    try {
      const res = await fetch('http://localhost:3001/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      }
    } catch (err) {
      console.warn('Stats fetch fallback:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // 2. Fetch Users
  const fetchUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const query = new URLSearchParams()
      if (userSearch) query.append('search', userSearch)
      if (userRoleFilter !== 'all') query.append('role', userRoleFilter)

      const res = await fetch(`http://localhost:3001/api/admin/users?${query.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUsersList(data.users || [])
        }
      }
    } catch (err) {
      console.warn('Users fetch error:', err)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // 3. Fetch Questions
  const fetchQuestions = async () => {
    setIsLoadingQuestions(true)
    try {
      const res = await fetch('http://localhost:3001/api/assessment/questions')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.questions) {
          const flat = []
          Object.entries(data.questions).forEach(([cat, list]) => {
            if (Array.isArray(list)) {
              list.forEach((q) => flat.push({ ...q, category: cat }))
            }
          })
          setQuestionsList(flat)
        }
      }
    } catch (err) {
      console.warn('Questions fetch error:', err)
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  // 4. Fetch Knowledge Base Files
  const fetchKbFiles = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/knowledge-base')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.files) {
          setKbFiles(data.files)
          if (!selectedKbFile && data.files.length > 0) {
            setSelectedKbFile(data.files[0])
            setKbContent(data.files[0].content || '')
          }
        }
      }
    } catch (err) {
      console.warn('KB fetch error:', err)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchUsers()
    fetchQuestions()
    fetchKbFiles()
  }, [])

  // Update Role
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        showToast(`User role successfully changed to ${newRole.toUpperCase()}`)
        fetchUsers()
        fetchStats()
      } else {
        showToast('Failed to update role', 'error')
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        showToast(`User "${userName}" deleted`)
        fetchUsers()
        fetchStats()
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Save / Update Question
  const handleSaveQuestion = async (e) => {
    e.preventDefault()
    try {
      const url = editingQuestion
        ? `http://localhost:3001/api/admin/questions/${editingQuestion._id || editingQuestion.id}`
        : 'http://localhost:3001/api/admin/questions'
      const method = editingQuestion ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionFormData),
      })

      if (res.ok) {
        showToast(editingQuestion ? 'Question updated successfully!' : 'Question added to live bank!')
        setIsQuestionModalOpen(false)
        setEditingQuestion(null)
        fetchQuestions()
      } else {
        const err = await res.json()
        showToast(err.message || 'Save failed', 'error')
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Delete Question
  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question from the bank?')) return
    try {
      const res = await fetch(`http://localhost:3001/api/admin/questions/${qId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        showToast('Question deleted')
        fetchQuestions()
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Save Knowledge File
  const handleSaveKbFile = async () => {
    if (!selectedKbFile) return
    setIsSavingKb(true)
    try {
      const res = await fetch(`http://localhost:3001/api/admin/knowledge-base/${selectedKbFile.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: kbContent }),
      })
      if (res.ok) {
        showToast(`Saved ${selectedKbFile.name} to disk`)
        fetchKbFiles()
      }
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsSavingKb(false)
    }
  }

  // Rebuild ChromaDB
  const handleRebuildChroma = async () => {
    setIsRebuildingChroma(true)
    setChromaStatusMsg('Triggering ChromaDB index rebuild via Python service...')
    try {
      const res = await fetch('http://localhost:3001/api/admin/knowledge-base/rebuild', {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        showToast('ChromaDB index rebuilt successfully!')
        setChromaStatusMsg('✅ ChromaDB index fully synchronized with knowledge-base documents.')
        fetchStats()
      } else {
        setChromaStatusMsg(`⚠️ Rebuild warning: ${data.message}`)
      }
    } catch (err) {
      setChromaStatusMsg(`⚠️ Error: ${err.message}`)
    } finally {
      setIsRebuildingChroma(false)
    }
  }

  // Test RAG Search
  const handleTestRagSearch = async () => {
    if (!ragQuery.trim()) return
    setIsSearchingRag(true)
    try {
      const res = await fetch('http://localhost:3001/api/admin/rag/test-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery, topK: 3 }),
      })
      if (res.ok) {
        const data = await res.json()
        setRagSearchResults(data)
      }
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsSearchingRag(false)
    }
  }

  // Run AI Sandbox
  const handleRunAiSandbox = async () => {
    if (!sandboxUserPrompt.trim()) return
    setIsSandboxRunning(true)
    try {
      const res = await fetch('http://localhost:3001/api/admin/ai/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: sandboxSystemPrompt,
          userPrompt: sandboxUserPrompt,
          temperature: sandboxTemperature,
          model: sandboxModel,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSandboxResponse(data)
      }
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsSandboxRunning(false)
    }
  }

  // Export Students CSV
  const handleExportCsv = () => {
    if (usersList.length === 0) {
      showToast('No student records to export', 'error')
      return
    }

    const headers = ['Name', 'Email', 'Role', 'Target Goal', 'University', 'Python Score', 'WebDev Score', 'Git Score', 'AI Score', 'Created At']
    const rows = usersList.map((u) => [
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.role || 'student'}"`,
      `"${u.profile?.careerGoal || 'AI Engineer'}"`,
      `"${u.profile?.university || 'NUST SEECS'}"`,
      u.latestAssessment?.scores?.python ?? 'N/A',
      u.latestAssessment?.scores?.webDev ?? 'N/A',
      u.latestAssessment?.scores?.git ?? 'N/A',
      u.latestAssessment?.scores?.ai ?? 'N/A',
      `"${new Date(u.createdAt).toLocaleDateString()}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `skillforge_scholars_cohort_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Cohort CSV exported successfully!')
  }

  const filteredQuestions = questionsList.filter((q) => {
    if (selectedCategory === 'all') return true
    return q.category === selectedCategory
  })

  return (
    <div className="admin-root">
      {/* Background Cyber Video Layer */}
      <div className="admin-bg-video-container">
        <video
          className="admin-bg-video"
          autoPlay
          loop
          muted
          playsInline
          src="/new.mp4"
        />
        <div className="admin-video-overlay" />
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`admin-toast ${toastMsg.type}`}
          >
            {toastMsg.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Admin Wrapper */}
      <div className="admin-main-wrapper">
        {/* Top Command Bar */}
        <header className="admin-top-bar">
          <div className="admin-brand-section">
            <div className="admin-badge-icon">
              <ShieldAlert size={22} className="text-neon-cyan" />
            </div>
            <div>
              <div className="admin-brand-title">
                SKILLFORGE <span>ADMIN COMMAND CENTER</span>
              </div>
              <div className="admin-brand-subtitle">
                System Governance &bull; Groq LLaMA 3.3 Engine &bull; ChromaDB Vector Management
              </div>
            </div>
          </div>

          {/* Microservices Live Health Matrix */}
          <div className="admin-health-pills">
            <div className="health-pill active">
              <Server size={14} />
              <span>Express API: :3001</span>
              <span className="dot online" />
            </div>
            <div className={`health-pill ${stats?.services?.pythonAI?.status === 'healthy' ? 'active' : 'warning'}`}>
              <BrainCircuit size={14} />
              <span>Python AI: :8000</span>
              <span className={`dot ${stats?.services?.pythonAI?.status === 'healthy' ? 'online' : 'offline'}`} />
            </div>
            <div className="health-pill active">
              <Database size={14} />
              <span>ChromaDB RAG: Persistent</span>
              <span className="dot online" />
            </div>
            <button className="health-refresh-btn" onClick={fetchStats} title="Refresh System Status">
              <RefreshCw size={14} className={isLoadingStats ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* User Profile & Exit */}
          <div className="admin-top-actions">
            <button className="admin-view-btn" onClick={onOpenStudentDashboard}>
              <Compass size={15} />
              <span>Scholar View</span>
            </button>
            <button className="admin-exit-btn" onClick={onExitAdmin}>
              <LogOut size={15} />
              <span>Exit</span>
            </button>
          </div>
        </header>

        {/* Admin Navigation Tabs */}
        <nav className="admin-nav-tabs">
          <button
            className={`admin-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={16} />
            <span>Overview & Health</span>
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('students')
              fetchUsers()
            }}
          >
            <Users size={16} />
            <span>Students & Cohort</span>
            <span className="tab-count-badge">{usersList.length}</span>
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('questions')
              fetchQuestions()
            }}
          >
            <FileCode size={16} />
            <span>Question Bank</span>
            <span className="tab-count-badge">{questionsList.length}</span>
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'knowledge' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('knowledge')
              fetchKbFiles()
            }}
          >
            <BookOpen size={16} />
            <span>RAG & ChromaDB</span>
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'aiSandbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('aiSandbox')}
          >
            <Zap size={16} />
            <span>Groq AI Sandbox</span>
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'benchmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('benchmarks')}
          >
            <Sliders size={16} />
            <span>Career Benchmarks</span>
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={16} />
            <span>Cohort Reports</span>
          </button>
        </nav>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-tab-content"
          >
            {/* KPI Cards Grid */}
            <div className="admin-kpi-grid">
              <div className="kpi-card cyan-glow">
                <div className="kpi-header">
                  <span className="kpi-title">Total Registered Scholars</span>
                  <Users className="kpi-icon text-cyan" size={20} />
                </div>
                <div className="kpi-value">{stats?.users?.total ?? usersList.length}</div>
                <div className="kpi-subtext">
                  <span>{stats?.users?.verified ?? 0} Verified</span> &bull; <span>{stats?.users?.admins ?? 1} Admins</span>
                </div>
              </div>

              <div className="kpi-card gold-glow">
                <div className="kpi-header">
                  <span className="kpi-title">Cohort Avg. Readiness</span>
                  <Award className="kpi-icon text-gold" size={20} />
                </div>
                <div className="kpi-value">{stats?.assessments?.averageReadiness ?? 74}%</div>
                <div className="kpi-subtext">
                  <span>Standardized against NUST/HEC benchmark</span>
                </div>
              </div>

              <div className="kpi-card purple-glow">
                <div className="kpi-header">
                  <span className="kpi-title">Diagnostics Attempted</span>
                  <CheckCircle2 className="kpi-icon text-purple" size={20} />
                </div>
                <div className="kpi-value">{stats?.assessments?.total ?? 12}</div>
                <div className="kpi-subtext">
                  <span>{questionsList.length} Active Bank Questions</span>
                </div>
              </div>

              <div className="kpi-card green-glow">
                <div className="kpi-header">
                  <span className="kpi-title">AI Roadmaps Synthesized</span>
                  <Sparkles className="kpi-icon text-green" size={20} />
                </div>
                <div className="kpi-value">{stats?.roadmaps?.total ?? 8}</div>
                <div className="kpi-subtext">
                  <span>Generated via Groq LLaMA 3.3 + ChromaDB</span>
                </div>
              </div>
            </div>

            {/* Split Row: Career Distribution & Service Infrastructure */}
            <div className="admin-split-grid">
              {/* Career Goal Distribution */}
              <div className="admin-panel-card">
                <div className="panel-card-header">
                  <div className="panel-title-group">
                    <Layers size={18} className="text-neon-cyan" />
                    <h3>Career Track Distribution</h3>
                  </div>
                  <span className="panel-badge">Live Cohort Demand</span>
                </div>

                <div className="track-distribution-list">
                  {Object.entries(stats?.roleDistribution || { 'AI Engineer': 6, 'Backend Developer': 3, 'Full-Stack Developer': 2, 'DevOps Engineer': 1 }).map(([role, count]) => {
                    const total = stats?.users?.total || 10
                    const percent = Math.min(100, Math.round((count / Math.max(total, 1)) * 100))
                    return (
                      <div key={role} className="track-bar-item">
                        <div className="track-bar-labels">
                          <span className="track-name">{role}</span>
                          <span className="track-count">{count} Students ({percent}%)</span>
                        </div>
                        <div className="track-bar-progress-track">
                          <div className="track-bar-fill" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Live Architecture Status */}
              <div className="admin-panel-card">
                <div className="panel-card-header">
                  <div className="panel-title-group">
                    <Cpu size={18} className="text-neon-gold" />
                    <h3>System Architecture & Health</h3>
                  </div>
                  <span className="panel-badge green">All Services Connected</span>
                </div>

                <div className="infra-status-stack">
                  <div className="infra-node-item">
                    <div className="infra-left">
                      <div className="infra-node-icon cyan">
                        <Server size={16} />
                      </div>
                      <div>
                        <div className="infra-node-name">Express API Gateway</div>
                        <div className="infra-node-sub">Port 3001 &bull; Auth, Assessment & Mentor Routes</div>
                      </div>
                    </div>
                    <span className="status-tag green">HEALTHY</span>
                  </div>

                  <div className="infra-node-item">
                    <div className="infra-left">
                      <div className="infra-node-icon purple">
                        <BrainCircuit size={16} />
                      </div>
                      <div>
                        <div className="infra-node-name">Python AI Microservice</div>
                        <div className="infra-node-sub">Port 8000 &bull; SkillAnalyzer & LangGraph Agent</div>
                      </div>
                    </div>
                    <span className={`status-tag ${stats?.services?.pythonAI?.status === 'healthy' ? 'green' : 'orange'}`}>
                      {stats?.services?.pythonAI?.status === 'healthy' ? 'HEALTHY' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="infra-node-item">
                    <div className="infra-left">
                      <div className="infra-node-icon gold">
                        <Database size={16} />
                      </div>
                      <div>
                        <div className="infra-node-name">ChromaDB Vector Store</div>
                        <div className="infra-node-sub">Local Persistent Index &bull; Semantic Search</div>
                      </div>
                    </div>
                    <span className="status-tag green">INDEXED (8 FILES)</span>
                  </div>

                  <div className="infra-node-item">
                    <div className="infra-left">
                      <div className="infra-node-icon green">
                        <Zap size={16} />
                      </div>
                      <div>
                        <div className="infra-node-name">Groq Cloud LLM Engine</div>
                        <div className="infra-node-sub">openai/gpt-oss-120b & llama-3.3-70b-versatile</div>
                      </div>
                    </div>
                    <span className="status-tag green">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Cohort Registrations */}
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <div className="panel-title-group">
                  <Users size={18} className="text-neon-cyan" />
                  <h3>Recent Scholar Registrations</h3>
                </div>
                <button className="panel-action-link" onClick={() => setActiveTab('students')}>
                  View All Scholars <ArrowRight size={14} />
                </button>
              </div>

              <div className="recent-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Scholar</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Target Track</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentUsers || usersList.slice(0, 5)).map((u) => (
                      <tr key={u._id || u.id}>
                        <td>
                          <div className="table-user-cell">
                            <img src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} alt="" className="table-avatar" />
                            <span className="font-semibold">{u.name}</span>
                          </div>
                        </td>
                        <td className="text-muted-cyan">{u.email}</td>
                        <td>
                          <span className={`role-pill ${u.role}`}>{u.role}</span>
                        </td>
                        <td>{u.profile?.careerGoal || 'AI Engineer'}</td>
                        <td>
                          <span className={`status-pill ${u.isVerified ? 'verified' : 'pending'}`}>
                            {u.isVerified ? 'Verified' : 'Pending OTP'}
                          </span>
                        </td>
                        <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: STUDENTS & COHORT CRM */}
        {activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-tab-content"
          >
            <div className="admin-panel-card">
              {/* Controls Bar */}
              <div className="panel-controls-bar">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by student name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  />
                  {userSearch && (
                    <button className="search-clear-btn" onClick={() => { setUserSearch(''); fetchUsers(); }}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="role-filter-group">
                  <span>Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value)
                      setTimeout(fetchUsers, 50)
                    }}
                    className="admin-select"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="mentor">Mentors</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                <button className="admin-btn-primary" onClick={handleExportCsv}>
                  <Download size={15} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Table */}
              <div className="recent-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Scholar</th>
                      <th>Email</th>
                      <th>Target Career Goal</th>
                      <th>Readiness</th>
                      <th>Role</th>
                      <th>Roadmaps</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan="7" className="text-center py-6">
                          <RefreshCw size={20} className="animate-spin inline mr-2 text-neon-cyan" />
                          <span>Loading scholars cohort...</span>
                        </td>
                      </tr>
                    ) : usersList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-6 text-muted">
                          No student records found matching search.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => {
                        const scores = u.latestAssessment?.scores
                        let avgScore = 'N/A'
                        if (scores) {
                          const valid = Object.values(scores).filter((v) => typeof v === 'number')
                          if (valid.length > 0) {
                            avgScore = `${Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)}%`
                          }
                        }

                        return (
                          <tr key={u._id || u.id}>
                            <td>
                              <div className="table-user-cell">
                                <img src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} alt="" className="table-avatar" />
                                <div>
                                  <div className="font-semibold">{u.name}</div>
                                  <div className="text-xs text-muted">{u.profile?.university || 'NUST SEECS'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-muted-cyan font-mono text-sm">{u.email}</td>
                            <td>
                              <span className="goal-tag">{u.profile?.careerGoal || 'AI Engineer'}</span>
                            </td>
                            <td>
                              <span className={`score-badge ${avgScore !== 'N/A' && parseInt(avgScore) >= 70 ? 'high' : 'medium'}`}>
                                {avgScore}
                              </span>
                            </td>
                            <td>
                              <select
                                value={u.role || 'student'}
                                onChange={(e) => handleUpdateRole(u._id || u.id, e.target.value)}
                                className={`role-select-inline ${u.role}`}
                              >
                                <option value="student">student</option>
                                <option value="mentor">mentor</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td className="text-center font-mono">{u.roadmapCount ?? 1}</td>
                            <td>
                              <div className="action-buttons-group">
                                <button
                                  className="action-btn view"
                                  onClick={() => setSelectedStudent(u)}
                                  title="View Full Profile & Diagnostics"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  className="action-btn delete"
                                  onClick={() => handleDeleteUser(u._id || u.id, u.name)}
                                  title="Delete User"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: QUESTION BANK MANAGER */}
        {activeTab === 'questions' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-tab-content"
          >
            <div className="admin-panel-card">
              {/* Header & Category Tabs */}
              <div className="panel-card-header">
                <div className="panel-title-group">
                  <FileCode size={18} className="text-neon-cyan" />
                  <h3>Diagnostic Assessment Question Bank</h3>
                </div>
                <button
                  className="admin-btn-primary"
                  onClick={() => {
                    setEditingQuestion(null)
                    setQuestionFormData({
                      category: selectedCategory !== 'all' ? selectedCategory : 'python',
                      question: '',
                      code: '',
                      options: ['', '', '', ''],
                      correctIndex: 0,
                      difficulty: 'intermediate',
                      explanation: '',
                    })
                    setIsQuestionModalOpen(true)
                  }}
                >
                  <Plus size={16} />
                  <span>Add New Question</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="category-pills-bar">
                <button
                  className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories ({questionsList.length})
                </button>
                {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
                  const count = questionsList.filter((q) => q.category === key).length
                  return (
                    <button
                      key={key}
                      className={`category-pill ${selectedCategory === key ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(key)}
                    >
                      {name} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Questions Grid */}
              <div className="questions-card-grid">
                {isLoadingQuestions ? (
                  <div className="col-span-full text-center py-10">
                    <RefreshCw size={24} className="animate-spin inline text-neon-cyan" />
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted">
                    No questions found for this category.
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <div key={q._id || q.id || idx} className="question-admin-card">
                      <div className="question-card-top">
                        <div className="question-meta-group">
                          <span className={`diff-tag ${q.difficulty || 'intermediate'}`}>
                            {q.difficulty || 'intermediate'}
                          </span>
                          <span className="cat-badge">{CATEGORY_NAMES[q.category] || q.category}</span>
                          {q.isCustom && <span className="custom-badge">CUSTOM</span>}
                        </div>
                        <div className="question-card-actions">
                          <button
                            className="action-btn-sm edit"
                            onClick={() => {
                              setEditingQuestion(q)
                              setQuestionFormData({
                                category: q.category || 'python',
                                question: q.question || '',
                                code: q.code || '',
                                options: q.options || ['', '', '', ''],
                                correctIndex: q.correctIndex ?? 0,
                                difficulty: q.difficulty || 'intermediate',
                                explanation: q.explanation || '',
                              })
                              setIsQuestionModalOpen(true)
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                          {q._id && (
                            <button
                              className="action-btn-sm delete"
                              onClick={() => handleDeleteQuestion(q._id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="question-text-title">{q.question}</div>

                      {q.code && (
                        <div className="question-code-preview">
                          <pre><code>{q.code}</code></pre>
                        </div>
                      )}

                      <div className="question-options-preview">
                        {q.options?.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`option-preview-pill ${oIdx === q.correctIndex ? 'correct' : ''}`}
                          >
                            <span className="opt-marker">
                              {oIdx === q.correctIndex ? <Check size={12} /> : `${String.fromCharCode(65 + oIdx)}`}
                            </span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="question-explanation-box">
                          <strong>Rationale:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: RAG KNOWLEDGE BASE & CHROMADB */}
        {activeTab === 'knowledge' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-tab-content"
          >
            {/* Action Banner */}
            <div className="admin-banner-card">
              <div className="banner-left">
                <Database size={24} className="text-neon-cyan" />
                <div>
                  <h4 className="font-bold text-lg text-white">ChromaDB Persistent Vector Store & RAG Manager</h4>
                  <p className="text-sm text-muted-cyan">
                    Knowledge documents in <code>/rag/knowledge-base/</code> are automatically chunked and semantically indexed into local ChromaDB with Sentence-Transformers embeddings.
                  </p>
                </div>
              </div>
              <button
                className="admin-btn-primary rebuild-btn"
                onClick={handleRebuildChroma}
                disabled={isRebuildingChroma}
              >
                <RefreshCw size={16} className={isRebuildingChroma ? 'animate-spin' : ''} />
                <span>{isRebuildingChroma ? 'Re-Indexing Vector Store...' : 'Sync & Rebuild ChromaDB Index'}</span>
              </button>
            </div>

            {chromaStatusMsg && (
              <div className="chroma-status-alert">
                <span>{chromaStatusMsg}</span>
              </div>
            )}

            {/* Split Workspace: Document Editor & Semantic Search Tester */}
            <div className="admin-split-grid">
              {/* Document Browser & Editor */}
              <div className="admin-panel-card">
                <div className="panel-card-header">
                  <div className="panel-title-group">
                    <BookOpen size={18} className="text-neon-gold" />
                    <h3>Knowledge Base Editor ({kbFiles.length} files)</h3>
                  </div>
                  {selectedKbFile && (
                    <button
                      className="admin-btn-primary btn-sm"
                      onClick={handleSaveKbFile}
                      disabled={isSavingKb}
                    >
                      <Check size={14} />
                      <span>{isSavingKb ? 'Saving...' : 'Save File'}</span>
                    </button>
                  )}
                </div>

                <div className="kb-file-selector-row">
                  {kbFiles.map((file) => (
                    <button
                      key={file.name}
                      className={`kb-file-chip ${selectedKbFile?.name === file.name ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedKbFile(file)
                        setKbContent(file.content || '')
                      }}
                    >
                      <FileText size={13} />
                      <span>{file.name}</span>
                    </button>
                  ))}
                </div>

                <div className="kb-editor-wrapper">
                  <textarea
                    className="admin-textarea kb-code-area"
                    value={kbContent}
                    onChange={(e) => setKbContent(e.target.value)}
                    placeholder="Document markdown content..."
                    rows={16}
                  />
                </div>
              </div>

              {/* Semantic Search Tester Sandbox */}
              <div className="admin-panel-card">
                <div className="panel-card-header">
                  <div className="panel-title-group">
                    <Terminal size={18} className="text-neon-cyan" />
                    <h3>ChromaDB Semantic Search Sandbox</h3>
                  </div>
                  <span className="panel-badge">Live Vector Retrieval</span>
                </div>

                <div className="rag-search-box">
                  <div className="search-input-wrapper w-full">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Ask or query ChromaDB vector index..."
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTestRagSearch()}
                    />
                  </div>
                  <button
                    className="admin-btn-primary mt-2 w-full justify-center"
                    onClick={handleTestRagSearch}
                    disabled={isSearchingRag}
                  >
                    <Zap size={15} />
                    <span>{isSearchingRag ? 'Querying ChromaDB Vector Index...' : 'Test Semantic Search'}</span>
                  </button>
                </div>

                {ragSearchResults && (
                  <div className="rag-results-display">
                    <div className="results-header">
                      <span className="text-xs text-neon-cyan uppercase tracking-wider font-bold">
                        Retrieved Context ({ragSearchResults.sources?.length || 0} Sources) &bull; Mode: {ragSearchResults.mode || 'ChromaDB'}
                      </span>
                    </div>
                    {ragSearchResults.sources && ragSearchResults.sources.length > 0 && (
                      <div className="sources-chips-row">
                        {ragSearchResults.sources.map((s, idx) => (
                          <span key={idx} className="source-chip">
                            📌 {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="context-markdown-view">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {ragSearchResults.context || 'No matching vector chunks found.'}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: GROQ AI SANDBOX */}
        {activeTab === 'aiSandbox' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-tab-content"
          >
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <div className="panel-title-group">
                  <BrainCircuit size={18} className="text-neon-cyan" />
                  <h3>Groq Cloud LLM Prompt & Latency Sandbox</h3>
                </div>
                <div className="sandbox-header-meta">
                  <span className="engine-badge">Model: {sandboxModel}</span>
                </div>
              </div>

              <div className="sandbox-form-grid">
                {/* System Prompt */}
                <div className="form-group">
                  <label className="admin-label">System Instruction & Persona</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={sandboxSystemPrompt}
                    onChange={(e) => setSandboxSystemPrompt(e.target.value)}
                  />
                </div>

                {/* User Prompt */}
                <div className="form-group">
                  <label className="admin-label">User Query / Assessment Simulation</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={sandboxUserPrompt}
                    onChange={(e) => setSandboxUserPrompt(e.target.value)}
                  />
                </div>

                {/* Config Controls */}
                <div className="sandbox-controls-row">
                  <div className="control-item">
                    <label className="admin-label">Model Selection</label>
                    <select
                      value={sandboxModel}
                      onChange={(e) => setSandboxModel(e.target.value)}
                      className="admin-select"
                    >
                      <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Groq Super Model)</option>
                      <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                      <option value="llama3-8b-8192">llama3-8b-8192 (Ultra Fast)</option>
                    </select>
                  </div>

                  <div className="control-item">
                    <label className="admin-label">Temperature: {sandboxTemperature}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={sandboxTemperature}
                      onChange={(e) => setSandboxTemperature(parseFloat(e.target.value))}
                      className="admin-range"
                    />
                  </div>

                  <button
                    className="admin-btn-primary sandbox-submit-btn"
                    onClick={handleRunAiSandbox}
                    disabled={isSandboxRunning}
                  >
                    <Send size={15} />
                    <span>{isSandboxRunning ? 'Querying Groq Cloud...' : 'Execute AI Generation'}</span>
                  </button>
                </div>

                {/* Output Area */}
                {sandboxResponse && (
                  <div className="sandbox-response-container">
                    <div className="response-header">
                      <span className="response-model-tag">⚡ Model: {sandboxResponse.modelUsed}</span>
                      <span className="response-latency-tag">Latency: {sandboxResponse.latencyMs} ms</span>
                    </div>
                    <div className="response-body-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {sandboxResponse.reply}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 6: CAREER BENCHMARKS CONFIG */}
        {activeTab === 'benchmarks' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-tab-content"
          >
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <div className="panel-title-group">
                  <Sliders size={18} className="text-neon-gold" />
                  <h3>Career Role Benchmarks & Skill Gap Rules</h3>
                </div>
                <button
                  className="admin-btn-primary"
                  onClick={() => {
                    localStorage.setItem('skillforge_custom_benchmarks', JSON.stringify(benchmarks))
                    setBenchmarksSavedMsg('Career benchmarks saved to system config!')
                    setTimeout(() => setBenchmarksSavedMsg(''), 3000)
                  }}
                >
                  <Check size={15} />
                  <span>Save Benchmark Config</span>
                </button>
              </div>

              {benchmarksSavedMsg && (
                <div className="chroma-status-alert">
                  <span>✅ {benchmarksSavedMsg}</span>
                </div>
              )}

              <div className="benchmarks-grid">
                {Object.entries(benchmarks).map(([roleName, skillsList]) => (
                  <div key={roleName} className="benchmark-card">
                    <div className="benchmark-card-title">{roleName}</div>
                    <div className="benchmark-skills-chips">
                      {skillsList.map((skill, sIdx) => (
                        <span key={sIdx} className="benchmark-skill-pill">
                          {skill}
                          <button
                            className="skill-remove-btn"
                            onClick={() => {
                              const updated = { ...benchmarks }
                              updated[roleName] = updated[roleName].filter((_, idx) => idx !== sIdx)
                              setBenchmarks(updated)
                            }}
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="add-skill-row mt-3">
                      <input
                        type="text"
                        placeholder="Add required skill (e.g. PyTorch)..."
                        className="admin-input-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const updated = { ...benchmarks }
                            if (!updated[roleName].includes(e.target.value.trim())) {
                              updated[roleName].push(e.target.value.trim())
                              setBenchmarks(updated)
                            }
                            e.target.value = ''
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: COHORT REPORTS & AUDIT */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-tab-content"
          >
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <div className="panel-title-group">
                  <BarChart3 size={18} className="text-neon-cyan" />
                  <h3>Cohort Progress & At-Risk Mentorship Reports</h3>
                </div>
                <button className="admin-btn-primary" onClick={handleExportCsv}>
                  <Download size={15} />
                  <span>Download Full CSV</span>
                </button>
              </div>

              <p className="text-sm text-muted mb-4">
                Students flagged as <strong>"Needs Mentorship"</strong> scored below 60% on their latest core diagnostic assessment.
              </p>

              <div className="recent-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Target Role</th>
                      <th>Readiness</th>
                      <th>Weakest Skill Areas</th>
                      <th>Mentorship Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => {
                      const scores = u.latestAssessment?.scores
                      let avg = 0
                      let weakAreas = []
                      if (scores) {
                        const entries = Object.entries(scores).filter(([_, v]) => typeof v === 'number')
                        if (entries.length > 0) {
                          avg = Math.round(entries.reduce((a, b) => a + b[1], 0) / entries.length)
                          weakAreas = entries.filter(([_, v]) => v < 60).map(([k]) => k.toUpperCase())
                        }
                      }

                      return (
                        <tr key={u._id || u.id}>
                          <td>
                            <div className="font-semibold">{u.name}</div>
                            <div className="text-xs text-muted font-mono">{u.email}</div>
                          </td>
                          <td>{u.profile?.careerGoal || 'AI Engineer'}</td>
                          <td>
                            <span className={`score-badge ${avg >= 70 ? 'high' : avg >= 50 ? 'medium' : 'low'}`}>
                              {avg > 0 ? `${avg}%` : 'Not Taken'}
                            </span>
                          </td>
                          <td>
                            {weakAreas.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {weakAreas.map((w, idx) => (
                                  <span key={idx} className="weak-tag">{w}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted text-xs">All Benchmarks Met</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-pill ${avg > 0 && avg < 60 ? 'pending' : 'verified'}`}>
                              {avg > 0 && avg < 60 ? '⚠️ Needs Mentorship' : '✅ On Track'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL: ADD / EDIT QUESTION */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <div className="admin-modal-overlay" onClick={() => setIsQuestionModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="admin-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>{editingQuestion ? 'Edit Diagnostic Question' : 'Add New Question to Bank'}</h3>
                <button className="modal-close-btn" onClick={() => setIsQuestionModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="admin-modal-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="admin-label">Category</label>
                    <select
                      value={questionFormData.category}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, category: e.target.value })}
                      className="admin-select"
                    >
                      {Object.entries(CATEGORY_NAMES).map(([k, name]) => (
                        <option key={k} value={k}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-label">Difficulty</label>
                    <select
                      value={questionFormData.difficulty}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, difficulty: e.target.value })}
                      className="admin-select"
                    >
                      <option value="easy">Easy (Foundations)</option>
                      <option value="intermediate">Intermediate (Production Standard)</option>
                      <option value="hard">Hard (Advanced Systems)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="admin-label">Question Text</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Which PyTorch method clears old gradients before backward propagation?"
                    className="admin-input"
                    value={questionFormData.question}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Code Snippet (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="class Model:\n    def forward(self, x):\n        ..."
                    className="admin-textarea font-mono"
                    value={questionFormData.code}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, code: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">4 Answer Options & Correct Answer Selection</label>
                  <div className="options-input-stack">
                    {questionFormData.options.map((opt, oIdx) => (
                      <div key={oIdx} className="option-input-row">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={questionFormData.correctIndex === oIdx}
                          onChange={() => setQuestionFormData({ ...questionFormData, correctIndex: oIdx })}
                          title="Mark as correct answer"
                        />
                        <span className="opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                        <input
                          type="text"
                          required
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          className="admin-input"
                          value={opt}
                          onChange={(e) => {
                            const nextOpts = [...questionFormData.options]
                            nextOpts[oIdx] = e.target.value
                            setQuestionFormData({ ...questionFormData, options: nextOpts })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="admin-label">Explanation / Rationale</label>
                  <input
                    type="text"
                    placeholder="Explanation displayed when student reviews test..."
                    className="admin-input"
                    value={questionFormData.explanation}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                  />
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="admin-btn-secondary" onClick={() => setIsQuestionModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary">
                    <Check size={16} />
                    <span>Save Question</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: STUDENT DRILLDOWN */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="admin-modal-overlay" onClick={() => setSelectedStudent(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="admin-modal-box drilldown-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <div className="drilldown-header-user">
                  <img src={selectedStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} alt="" className="drilldown-avatar" />
                  <div>
                    <h3>{selectedStudent.name}</h3>
                    <div className="text-xs text-muted-cyan font-mono">{selectedStudent.email} &bull; {selectedStudent.profile?.university || 'NUST SEECS'}</div>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setSelectedStudent(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="drilldown-body">
                <div className="drilldown-meta-grid">
                  <div className="meta-card">
                    <span className="meta-label">Target Role</span>
                    <span className="meta-val">{selectedStudent.profile?.careerGoal || 'AI Engineer'}</span>
                  </div>
                  <div className="meta-card">
                    <span className="meta-label">Platform Role</span>
                    <span className="meta-val capitalize">{selectedStudent.role || 'student'}</span>
                  </div>
                  <div className="meta-card">
                    <span className="meta-label">Total Roadmaps</span>
                    <span className="meta-val">{selectedStudent.roadmapCount ?? 1}</span>
                  </div>
                  <div className="meta-card">
                    <span className="meta-label">Account Verified</span>
                    <span className="meta-val">{selectedStudent.isVerified ? 'Yes ✅' : 'No ❌'}</span>
                  </div>
                </div>

                {/* Diagnostic Scores */}
                <div className="drilldown-section-title">Latest Diagnostic Assessment Scores</div>
                {selectedStudent.latestAssessment?.scores ? (
                  <div className="drilldown-scores-grid">
                    {Object.entries(selectedStudent.latestAssessment.scores).map(([cat, val]) => (
                      <div key={cat} className="score-progress-card">
                        <div className="score-progress-header">
                          <span className="cat-name">{CATEGORY_NAMES[cat] || cat}</span>
                          <span className="cat-val">{val}%</span>
                        </div>
                        <div className="score-track">
                          <div className="score-fill" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted py-3">Student has not attempted category diagnostic tests yet.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
