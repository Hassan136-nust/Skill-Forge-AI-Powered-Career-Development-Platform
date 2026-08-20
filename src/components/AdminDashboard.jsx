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
  Zap,
  Sliders,
  Cpu,
  Server,
  FileText,
  BarChart3,
  Eye,
  Check,
  X,
  Compass,
  GraduationCap,
  Bot
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import './AdminDashboard.css'
import './Navbar.css'
import './StudentDashboard.css'

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
      return { name: 'Hassan Jamal', email: 'hjamal.bscs24seecs@seecs.edu.pk', role: 'admin' }
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
  const [studentDetails, setStudentDetails] = useState(null)
  const [drilldownTab, setDrilldownTab] = useState('scores') // 'scores' | 'roadmaps' | 'chats'
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // AI Roadmaps Hub
  const [allRoadmapsList, setAllRoadmapsList] = useState([])
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(false)
  const [roadmapSearch, setRoadmapSearch] = useState('')
  const [selectedRoadmap, setSelectedRoadmap] = useState(null)

  // AI Mentor Chats Hub
  const [allChatsList, setAllChatsList] = useState([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [chatSearch, setChatSearch] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)

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

  // Auth Header Helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('skillforge_token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  // 1. Fetch Stats & System Health
  const fetchStats = async () => {
    setIsLoadingStats(true)
    try {
      const res = await fetch('http://localhost:3001/api/admin/stats', {
        headers: getAuthHeaders(),
      })
      if (res.status === 401 || res.status === 403) {
        showToast('Admin unauthorized: Access denied', 'error')
        if (onExitAdmin) onExitAdmin()
        return
      }
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

      const res = await fetch(`http://localhost:3001/api/admin/users?${query.toString()}`, {
        headers: getAuthHeaders(),
      })
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
      const res = await fetch('http://localhost:3001/api/admin/knowledge-base', {
        headers: getAuthHeaders(),
      })
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

  // 5. Fetch Roadmaps
  const fetchRoadmaps = async () => {
    setIsLoadingRoadmaps(true)
    try {
      const res = await fetch('http://localhost:3001/api/admin/roadmaps', {
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setAllRoadmapsList(data.roadmaps || [])
        }
      }
    } catch (err) {
      console.warn('Roadmaps fetch error:', err)
    } finally {
      setIsLoadingRoadmaps(false)
    }
  }

  // 6. Fetch AI Mentor Chats
  const fetchChats = async () => {
    setIsLoadingChats(true)
    try {
      const res = await fetch('http://localhost:3001/api/admin/chats', {
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setAllChatsList(data.chats || [])
        }
      }
    } catch (err) {
      console.warn('Chats fetch error:', err)
    } finally {
      setIsLoadingChats(false)
    }
  }

  // 7. Fetch Single Student Drilldown Details
  const handleOpenStudentDrilldown = async (student) => {
    setSelectedStudent(student)
    setStudentDetails(null)
    setDrilldownTab('scores')
    setIsLoadingDetails(true)
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${student._id || student.id}/details`, {
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setStudentDetails(data)
        }
      }
    } catch (err) {
      console.warn('Student details fetch error:', err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchUsers()
    fetchQuestions()
    fetchKbFiles()
    fetchRoadmaps()
    fetchChats()
  }, [])

  // Update Role
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        showToast(`Role changed to ${newRole.toUpperCase()}`)
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
    if (!window.confirm(`Delete user "${userName}"?`)) return
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        body: JSON.stringify(questionFormData),
      })

      if (res.ok) {
        showToast(editingQuestion ? 'Question updated!' : 'Question added to bank!')
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
    if (!window.confirm('Delete this question from bank?')) return
    try {
      const res = await fetch(`http://localhost:3001/api/admin/questions/${qId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: kbContent }),
      })
      if (res.ok) {
        showToast(`Saved ${selectedKbFile.name}`)
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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

  // Helper for mousewheel horizontal scroll
  const handleWheelScroll = (e) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY
    }
  }

  const filteredQuestions = (Array.isArray(questionsList) ? questionsList : []).filter((q) => {
    if (!q) return false
    if (selectedCategory === 'all') return true
    return q.category === selectedCategory
  })

  return (
    <div className="dashboard-root">
      {/* Background Video — EXACT same login.webm as Student Dashboard */}
      <div className="dashboard-bg-video-container">
        <video src="/login.webm" className="dashboard-bg-video" autoPlay loop muted playsInline />
        <div className="dashboard-video-overlay" />
      </div>

      {/* TOP NAVBAR — EXACT same navbar as Student Dashboard */}
      <header className="navbar-container" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="navbar-brand" onClick={() => onExitAdmin && onExitAdmin()}>
          <div className="brand-icon-planet">🪐</div>
          <div className="brand-logo-text">
            <span className="brand-text-top bungee-regular">SKILL</span>
            <span className="brand-text-bottom bungee-regular">FORGE</span>
          </div>
        </div>

        <nav className="navbar-menu admin-navbar-menu" onWheel={handleWheelScroll}>
          <button className="navbar-item-btn" onClick={() => onExitAdmin && onExitAdmin()}>
            Home
          </button>
          <button
            className={`navbar-item-btn admin-nav-btn ${activeTab === 'overview' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`navbar-item-btn admin-nav-btn ${activeTab === 'students' ? 'admin-tab-active' : ''}`}
            onClick={() => {
              setActiveTab('students')
              fetchUsers()
            }}
          >
            Scholars ({usersList.length})
          </button>
          <button
            className={`navbar-item-btn admin-nav-btn ${activeTab === 'roadmaps' ? 'admin-tab-active' : ''}`}
            onClick={() => {
              setActiveTab('roadmaps')
              fetchRoadmaps()
            }}
          >
            AI Roadmaps ({allRoadmapsList.length})
          </button>
          <button
            className={`navbar-item-btn admin-nav-btn ${activeTab === 'chats' ? 'admin-tab-active' : ''}`}
            onClick={() => {
              setActiveTab('chats')
              fetchChats()
            }}
          >
            AI Chats ({allChatsList.length})
          </button>
          <button
            className={`navbar-item-btn admin-nav-btn ${activeTab === 'questions' ? 'admin-tab-active' : ''}`}
            onClick={() => {
              setActiveTab('questions')
              fetchQuestions()
            }}
          >
            Quiz Bank ({questionsList.length})
          </button>
          <button
            className={`navbar-item-btn admin-nav-btn ${activeTab === 'knowledge' ? 'admin-tab-active' : ''}`}
            onClick={() => {
              setActiveTab('knowledge')
              fetchKbFiles()
            }}
          >
            RAG ChromaDB
          </button>
          <button
            className={`navbar-item-btn admin-nav-btn ${activeTab === 'aiSandbox' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('aiSandbox')}
          >
            Groq AI Engine
          </button>
          <button
            className={`navbar-item-btn admin-nav-btn ${activeTab === 'benchmarks' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('benchmarks')}
          >
            Benchmarks
          </button>
          <button
            className={`navbar-item-btn admin-nav-btn ${activeTab === 'reports' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </nav>

        <div className="navbar-right-actions">
          <button
            className="navbar-item-btn"
            style={{
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderRadius: '20px',
              padding: '0.45rem 1.1rem',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)'
              e.currentTarget.style.borderColor = '#EF4444'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onClick={() => {
              try {
                localStorage.removeItem('skillforge_token')
                localStorage.removeItem('skillforge_user')
              } catch {}
              if (onExitAdmin) onExitAdmin()
            }}
            title="Sign Out of Session"
          >
            <LogOut size={14} color="#F87171" strokeWidth={2.2} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

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

      {/* Main Container — Exact same padding and layout as StudentDashboard */}
      <main className="dashboard-main-container">
        {/* 1. ADMIN PROFILE & SYSTEM HEALTH HERO CARD */}
        <section className="profile-hero-card">
          <div className="profile-hero-left">
            <div className="profile-avatar-wrapper">
              <img
                src={adminUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt="Admin Avatar"
                className="profile-avatar-img"
              />
            </div>
            <div className="profile-info-block">
              <div className="profile-name-row">
                <h1 className="admin-hero-title">{adminUser.name ? adminUser.name.toUpperCase() : 'HASSAN JAMAL'}</h1>
                <span className="profile-uni-pill">
                  👑 LEAD ADMINISTRATOR
                </span>
              </div>
              <div className="profile-details-row">
                <span>⚡ NUST SEECS Campus</span>
                <span>&bull;</span>
                <span style={{ color: '#FFD166', fontFamily: 'monospace' }}>{adminUser.email}</span>
                <span>&bull;</span>
                <span style={{ color: '#00FF66', fontWeight: 700 }}>● Core Online</span>
              </div>
              <div className="profile-role-selector-pill" style={{ marginTop: '0.4rem', width: 'fit-content' }}>
                <span style={{ fontSize: '0.75rem', color: '#FFD166' }}>Engine:</span>
                <span style={{ fontWeight: 800, color: '#FFF7E8', fontSize: '0.8rem' }}>Groq LLaMA 3.3 + ChromaDB RAG</span>
              </div>
            </div>
          </div>

          <div className="profile-hero-right">
            {/* System Health Matrix 2x2 Grid */}
            <div className="admin-health-matrix-box">
              <div className="health-node-cell">
                <div className="node-icon-wrap">
                  <Server size={14} color="#FFD166" />
                </div>
                <div className="node-details">
                  <div className="node-label">API Gateway</div>
                  <div className="node-status green">Port 3001 OK</div>
                </div>
              </div>

              <div className="health-node-cell">
                <div className="node-icon-wrap">
                  <BrainCircuit size={14} color="#FFD166" />
                </div>
                <div className="node-details">
                  <div className="node-label">Python AI</div>
                  <div className={`node-status ${stats?.services?.pythonAI?.status === 'healthy' ? 'green' : 'gold'}`}>
                    {stats?.services?.pythonAI?.status === 'healthy' ? 'Port 8000 OK' : 'Standby'}
                  </div>
                </div>
              </div>

              <div className="health-node-cell">
                <div className="node-icon-wrap">
                  <Database size={14} color="#FFD166" />
                </div>
                <div className="node-details">
                  <div className="node-label">ChromaDB</div>
                  <div className="node-status green">8 Chunks Sync</div>
                </div>
              </div>

              <div className="health-node-cell">
                <div className="node-icon-wrap">
                  <Zap size={14} color="#FFD166" />
                </div>
                <div className="node-details">
                  <div className="node-label">Groq Cloud</div>
                  <div className="node-status green">Active LLaMA</div>
                </div>
              </div>
            </div>

            <div className="readiness-gauge-box">
              <div
                className="gauge-circle"
                style={{
                  background: `conic-gradient(#FFD166 ${stats?.assessments?.averageReadiness ?? 74}%, #1c2030 0deg)`,
                }}
              >
                <span className="gauge-value">{stats?.assessments?.averageReadiness ?? 74}%</span>
              </div>
              <div className="gauge-text-block">
                <div className="gauge-title">COHORT READINESS</div>
                <div className="gauge-sub">Average diagnostic benchmark</div>
              </div>
            </div>
          </div>
        </section>

        {/* TAB 1: OVERVIEW & PLATFORM METRICS */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="admin-tab-wrapper">
            {/* 4 Stats Cards — Exact same style as Student Dashboard stat widgets */}
            <div className="admin-stat-widgets-grid">
              <div className="admin-stat-widget">
                <div className="widget-header">
                  <span className="widget-title">REGISTERED SCHOLARS</span>
                  <Users size={18} color="#FFD166" />
                </div>
                <div className="widget-number">{stats?.users?.total ?? usersList.length}</div>
                <div className="widget-sub">{stats?.users?.verified ?? 0} Verified &bull; {stats?.users?.admins ?? 1} Admins</div>
              </div>

              <div className="admin-stat-widget">
                <div className="widget-header">
                  <span className="widget-title">AVG READINESS SCORE</span>
                  <Award size={18} color="#FFD166" />
                </div>
                <div className="widget-number">{stats?.assessments?.averageReadiness ?? 74}%</div>
                <div className="widget-sub">Grounded on NUST/HEC Syllabus</div>
              </div>

              <div className="admin-stat-widget">
                <div className="widget-header">
                  <span className="widget-title">ROADMAPS & CHATS</span>
                  <Sparkles size={18} color="#FFD166" />
                </div>
                <div className="widget-number">{stats?.roadmaps?.total ?? allRoadmapsList.length} Maps</div>
                <div className="widget-sub">{stats?.chats?.total ?? allChatsList.length} Active AI Mentor Sessions</div>
              </div>

              <div className="admin-stat-widget">
                <div className="widget-header">
                  <span className="widget-title">AI INVOCATIONS & TOKENS</span>
                  <Zap size={18} color="#00FF66" />
                </div>
                <div className="widget-number" style={{ color: '#00FF66' }}>
                  {stats?.aiTelemetry?.totalCalls ?? 33} Calls
                </div>
                <div className="widget-sub">
                  ~{stats?.aiTelemetry?.tokensFormatted ?? '55k'} Tokens &bull; Est. {stats?.aiTelemetry?.costFormatted ?? '$0.008'}
                </div>
              </div>
            </div>

            {/* Split Row: Career Demand & Quick Actions */}
            <div className="admin-two-col-grid">
              {/* Career Goal Distribution */}
              <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
                <div className="radar-card-header" style={{ marginBottom: '1.2rem' }}>
                  <div className="radar-title-group">
                    <Layers size={20} color="#FFD166" />
                    <h2 className="radar-title" style={{ fontSize: '1.2rem' }}>CAREER TRACK DEMAND</h2>
                  </div>
                  <span className="radar-role-badge">LIVE COHORT</span>
                </div>

                <div className="admin-tracks-list">
                  {Object.entries(stats?.roleDistribution || { 'AI Engineer': 6, 'Backend Developer': 3, 'Full-Stack Developer': 2, 'DevOps Engineer': 1 }).map(([role, count]) => {
                    const total = stats?.users?.total || 10
                    const percent = Math.min(100, Math.round((count / Math.max(total, 1)) * 100))
                    return (
                      <div key={role} className="admin-track-bar-row">
                        <div className="track-labels">
                          <span className="track-title">{role}</span>
                          <span className="track-val">{count} Scholars ({percent}%)</span>
                        </div>
                        <div className="track-bar-track">
                          <div className="track-bar-fill-gold" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* System Infrastructure Matrix */}
              <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
                <div className="radar-card-header" style={{ marginBottom: '1.2rem' }}>
                  <div className="radar-title-group">
                    <Cpu size={20} color="#FFD166" />
                    <h2 className="radar-title" style={{ fontSize: '1.2rem' }}>MICROSERVICES ENGINE</h2>
                  </div>
                  <span className="radar-role-badge" style={{ color: '#00FF66', borderColor: 'rgba(0,255,102,0.4)', background: 'rgba(0,255,102,0.1)' }}>ALL SYSTEMS GO</span>
                </div>

                <div className="admin-infra-list">
                  <div className="admin-infra-item">
                    <div className="infra-left-box">
                      <Server size={18} color="#FFD166" />
                      <div>
                        <div className="infra-name">Express API Gateway</div>
                        <div className="infra-desc">Port 3001 &bull; MongoDB Atlas Connection</div>
                      </div>
                    </div>
                    <span className="admin-tag-green">ONLINE</span>
                  </div>

                  <div className="admin-infra-item">
                    <div className="infra-left-box">
                      <BrainCircuit size={18} color="#FFD166" />
                      <div>
                        <div className="infra-name">Python FastAPI AI Service</div>
                        <div className="infra-desc">Port 8000 &bull; SkillAnalyzer & LangGraph Agent</div>
                      </div>
                    </div>
                    <span className={`admin-tag-${stats?.services?.pythonAI?.status === 'healthy' ? 'green' : 'gold'}`}>
                      {stats?.services?.pythonAI?.status === 'healthy' ? 'HEALTHY' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="admin-infra-item">
                    <div className="infra-left-box">
                      <Database size={18} color="#FFD166" />
                      <div>
                        <div className="infra-name">ChromaDB Vector Store</div>
                        <div className="infra-desc">Local Persistent Collection &bull; Sentence-Transformers</div>
                      </div>
                    </div>
                    <span className="admin-tag-green">INDEXED</span>
                  </div>

                  <div className="admin-infra-item">
                    <div className="infra-left-box">
                      <Zap size={18} color="#FFD166" />
                      <div>
                        <div className="infra-name">Groq Cloud AI Engine</div>
                        <div className="infra-desc">openai/gpt-oss-120b & llama-3.3-70b-versatile</div>
                      </div>
                    </div>
                    <span className="admin-tag-green">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
              <div className="radar-card-header">
                <div className="radar-title-group">
                  <Users size={20} color="#FFD166" />
                  <h2 className="radar-title" style={{ fontSize: '1.2rem' }}>RECENT SCHOLAR REGISTRATIONS</h2>
                </div>
                <button
                  className="navbar-item-btn"
                  style={{
                    color: '#FFD166',
                    border: '1px solid rgba(255, 209, 102, 0.4)',
                    backgroundColor: 'rgba(255, 209, 102, 0.08)',
                    borderRadius: '20px',
                    padding: '0.35rem 0.9rem',
                    fontWeight: 700,
                  }}
                  onClick={() => setActiveTab('students')}
                >
                  View All Scholars &rarr;
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-custom-table">
                  <thead>
                    <tr>
                      <th>Scholar</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Target Career Goal</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentUsers || usersList.slice(0, 5)).map((u) => (
                      <tr key={u._id || u.id}>
                        <td>
                          <div className="table-user-flex">
                            <img src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} alt="" className="table-user-avatar" />
                            <span style={{ fontWeight: 700, color: '#FFF7E8' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: '#FFD166', fontFamily: 'monospace' }}>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>{u.role}</span>
                        </td>
                        <td>{u.profile?.careerGoal || 'AI Engineer'}</td>
                        <td>
                          <span className={`status-badge ${u.isVerified ? 'verified' : 'pending'}`}>
                            {u.isVerified ? 'Verified' : 'Pending OTP'}
                          </span>
                        </td>
                        <td style={{ color: '#B8B3C7' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
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
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="admin-tab-wrapper">
            <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
              {/* Controls */}
              <div className="admin-search-filter-bar">
                <div className="admin-search-box">
                  <Search size={16} color="#FFD166" className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by student name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  />
                  {userSearch && (
                    <button className="clear-search-btn" onClick={() => { setUserSearch(''); fetchUsers(); }}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="admin-filter-group">
                  <span>Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value)
                      setTimeout(fetchUsers, 50)
                    }}
                    className="admin-gold-select"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="mentor">Mentors</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                <button
                  className="navbar-item-btn"
                  style={{
                    color: '#05060A',
                    backgroundColor: '#FFD166',
                    border: '1px solid #FFD166',
                    borderRadius: '20px',
                    padding: '0.5rem 1.2rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                  onClick={handleExportCsv}
                >
                  <Download size={15} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Table */}
              <div className="admin-table-container">
                <table className="admin-custom-table">
                  <thead>
                    <tr>
                      <th>Scholar</th>
                      <th>Email</th>
                      <th>Target Career Goal</th>
                      <th>Readiness</th>
                      <th>Role</th>
                      <th>AI Usage & Tokens</th>
                      <th>Roadmaps</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                          <RefreshCw size={24} className="animate-spin" color="#FFD166" style={{ margin: '0 auto' }} />
                          <div style={{ marginTop: '0.5rem', color: '#B8B3C7' }}>Loading scholars cohort...</div>
                        </td>
                      </tr>
                    ) : usersList.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#B8B3C7' }}>
                          No student records found.
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
                              <div className="table-user-flex">
                                <img src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} alt="" className="table-user-avatar" />
                                <div>
                                  <div style={{ fontWeight: 700, color: '#FFF7E8' }}>{u.name}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#B8B3C7' }}>{u.profile?.university || 'NUST SEECS'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: '#FFD166', fontFamily: 'monospace' }}>{u.email}</td>
                            <td>
                              <span className="admin-gold-tag">{u.profile?.careerGoal || 'AI Engineer'}</span>
                            </td>
                            <td>
                              <span className={`admin-score-badge ${avgScore !== 'N/A' && parseInt(avgScore) >= 70 ? 'high' : 'medium'}`}>
                                {avgScore}
                              </span>
                            </td>
                            <td>
                              <select
                                value={u.role || 'student'}
                                onChange={(e) => handleUpdateRole(u._id || u.id, e.target.value)}
                                className={`admin-role-select ${u.role}`}
                              >
                                <option value="student">student</option>
                                <option value="mentor">mentor</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#00FF66' }}>
                                  ⚡ {u.aiTelemetry?.calls ?? (u.roadmapCount ? u.roadmapCount * 2 : 1)} Calls
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#FFD166', fontFamily: 'monospace' }}>
                                  ~{u.aiTelemetry?.tokensFormatted ?? '2.4k'} Tok ({u.aiTelemetry?.costFormatted ?? '$0.0003'})
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{u.roadmapCount ?? 1}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <button
                                  className="admin-icon-btn"
                                  onClick={() => handleOpenStudentDrilldown(u)}
                                  title="View Full Profile, Roadmaps & Chats"
                                >
                                  <Eye size={15} color="#FFD166" />
                                </button>
                                <button
                                  className="admin-icon-btn delete"
                                  onClick={() => handleDeleteUser(u._id || u.id, u.name)}
                                  title="Delete User"
                                >
                                  <Trash2 size={15} color="#F87171" />
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

        {/* TAB 2B: AI GENERATED ROADMAPS EXPLORER */}
        {activeTab === 'roadmaps' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="admin-tab-wrapper">
            <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
              <div className="radar-card-header" style={{ marginBottom: '1.5rem' }}>
                <div className="radar-title-group">
                  <Compass size={20} color="#FFD166" />
                  <h2 className="radar-title" style={{ fontSize: '1.2rem' }}>AI-GENERATED CAREER ROADMAPS ({allRoadmapsList.length})</h2>
                </div>
                <button
                  className="navbar-item-btn"
                  style={{
                    color: '#05060A',
                    backgroundColor: '#FFD166',
                    border: '1px solid #FFD166',
                    borderRadius: '20px',
                    padding: '0.45rem 1.1rem',
                    fontWeight: 800,
                  }}
                  onClick={fetchRoadmaps}
                >
                  <RefreshCw size={14} className={isLoadingRoadmaps ? 'animate-spin' : ''} />
                  <span>Refresh Roadmaps</span>
                </button>
              </div>

              {isLoadingRoadmaps ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <RefreshCw size={24} className="animate-spin" color="#FFD166" style={{ margin: '0 auto' }} />
                </div>
              ) : allRoadmapsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#B8B3C7' }}>
                  No AI-generated roadmaps recorded yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.4rem' }}>
                  {allRoadmapsList.map((rm) => (
                    <div
                      key={rm._id}
                      className="admin-roadmap-card"
                      onClick={() => setSelectedRoadmap(rm)}
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                          <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFD166' }}>{rm.careerGoal}</div>
                            <div style={{ fontSize: '0.8rem', color: '#FFF7E8', marginTop: '0.2rem', fontFamily: 'monospace' }}>👤 {rm.email}</div>
                          </div>
                          <span className="diff-pill easy">{rm.model?.includes('Groq') ? 'Groq AI' : 'AI Gen'}</span>
                        </div>

                        {rm.gaps && rm.gaps.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.6rem 0' }}>
                            {rm.gaps.map((g, gIdx) => (
                              <span key={gIdx} className="admin-weak-tag" style={{ fontSize: '0.72rem' }}>
                                {g.skill}: {g.currentScore}% → {g.requiredScore}%
                              </span>
                            ))}
                          </div>
                        )}

                        <div style={{ fontSize: '0.72rem', color: '#B8B3C7', fontFamily: 'monospace', marginBottom: '0.8rem' }}>
                          Generated: {new Date(rm.createdAt || rm.generatedAt).toLocaleString()}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="navbar-item-btn"
                        style={{
                          width: '100%',
                          color: '#05060A',
                          backgroundColor: '#FFD166',
                          border: '1px solid #FFD166',
                          borderRadius: '12px',
                          padding: '0.6rem 1rem',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRoadmap(rm)
                        }}
                      >
                        <Compass size={16} color="#05060A" />
                        <span>Inspect Full Blueprint</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2C: AI MENTOR CHAT SESSIONS INSPECTOR (BEAUTIFIED & INDEPENDENTLY SCROLLABLE) */}
        {activeTab === 'chats' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="admin-tab-wrapper">
            <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
              <div className="radar-card-header" style={{ marginBottom: '1.5rem' }}>
                <div className="radar-title-group">
                  <Bot size={22} color="#FFD166" />
                  <div>
                    <h2 className="radar-title" style={{ fontSize: '1.25rem', margin: 0 }}>STUDENT AI MENTOR CONVERSATIONS ({allChatsList.length})</h2>
                    <div style={{ fontSize: '0.75rem', color: '#B8B3C7', marginTop: '0.2rem' }}>Live telemetry of AI questions, explanations, and RAG knowledge citations</div>
                  </div>
                </div>
                <button
                  className="navbar-item-btn"
                  style={{
                    color: '#05060A',
                    backgroundColor: '#FFD166',
                    border: '1px solid #FFD166',
                    borderRadius: '20px',
                    padding: '0.45rem 1.2rem',
                    fontWeight: 800,
                  }}
                  onClick={fetchChats}
                >
                  <RefreshCw size={14} className={isLoadingChats ? 'animate-spin' : ''} />
                  <span>Refresh Chats</span>
                </button>
              </div>

              {isLoadingChats ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <RefreshCw size={26} className="animate-spin" color="#FFD166" style={{ margin: '0 auto' }} />
                </div>
              ) : allChatsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#B8B3C7' }}>
                  No student AI mentor conversations recorded yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '1.4rem', alignItems: 'start' }}>
                  {/* Left Column: Chat Session List (Independently Scrollable) */}
                  <div
                    data-lenis-prevent="true"
                    onWheel={(e) => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      maxHeight: '620px',
                      overflowY: 'auto',
                      paddingRight: '0.5rem',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#FFD166 rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {allChatsList.map((chat) => {
                      const isSelected = (selectedChat?._id || allChatsList[0]?._id) === chat._id
                      const userMsgCount = chat.messages?.filter((m) => m.role === 'user').length || 0

                      return (
                        <div
                          key={chat._id}
                          onClick={() => setSelectedChat(chat)}
                          style={{
                            background: isSelected ? 'linear-gradient(135deg, rgba(255, 209, 102, 0.2), rgba(13, 16, 26, 0.95))' : 'rgba(13, 16, 26, 0.75)',
                            border: `1.5px solid ${isSelected ? '#FFD166' : 'rgba(255, 209, 102, 0.2)'}`,
                            borderRadius: '16px',
                            padding: '1.1rem 1.25rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: isSelected ? '0 0 20px rgba(255, 209, 102, 0.2)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 800, color: isSelected ? '#FFD166' : '#FFF7E8', fontSize: '0.92rem', lineHeight: '1.4' }}>
                              {chat.title || 'Mentorship Discussion'}
                            </span>
                            <span className="diff-pill intermediate" style={{ whiteSpace: 'nowrap', fontSize: '0.68rem' }}>
                              {chat.careerGoal || 'AI Engineer'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: '#FFF7E8', fontFamily: 'monospace', marginTop: '0.5rem' }}>
                            <span>👤</span>
                            <span style={{ color: '#FFD166' }}>{chat.email}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#B8B3C7', marginTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#00FF66', fontWeight: 700 }}>
                              💬 {chat.messages?.length || 0} msgs ({userMsgCount} queries)
                            </span>
                            <span style={{ fontFamily: 'monospace' }}>
                              {new Date(chat.updatedAt || chat.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Right Column: Active Chat Conversation Viewer (Independently Scrollable with Markdown) */}
                  <div
                    data-lenis-prevent="true"
                    onWheel={(e) => e.stopPropagation()}
                    style={{
                      background: 'rgba(5, 7, 13, 0.95)',
                      border: '1.5px solid rgba(255, 209, 102, 0.3)',
                      borderRadius: '20px',
                      padding: '1.6rem',
                      minHeight: '620px',
                      maxHeight: '620px',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {selectedChat || allChatsList[0] ? (
                      (() => {
                        const currentChat = selectedChat || allChatsList[0]
                        return (
                          <>
                            {/* Chat Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 209, 102, 0.25)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                              <div>
                                <h3 style={{ margin: 0, color: '#FFD166', fontSize: '1.1rem', fontWeight: 800 }}>{currentChat.title}</h3>
                                <div style={{ fontSize: '0.78rem', color: '#B8B3C7', marginTop: '0.25rem' }}>
                                  Scholar: <span style={{ color: '#FFF7E8', fontFamily: 'monospace' }}>{currentChat.email}</span> &bull; Target: <span style={{ color: '#FFD166', fontWeight: 700 }}>{currentChat.careerGoal}</span>
                                </div>
                              </div>
                              <span className="diff-pill easy" style={{ fontSize: '0.72rem' }}>
                                {currentChat.messages?.length || 0} Total Messages
                              </span>
                            </div>

                            {/* Chat Stream with Markdown Parsing */}
                            <div
                              data-lenis-prevent="true"
                              onWheel={(e) => e.stopPropagation()}
                              className="admin-chat-stream"
                              style={{
                                flex: 1,
                                overflowY: 'auto',
                                paddingRight: '0.6rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.2rem',
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#FFD166 rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              {currentChat.messages?.map((msg, mIdx) => (
                                <div
                                  key={mIdx}
                                  className={msg.role === 'user' ? 'admin-chat-bubble-user' : 'admin-chat-bubble-ai'}
                                  style={{
                                    maxWidth: msg.role === 'user' ? '82%' : '92%',
                                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    padding: '1rem 1.3rem',
                                  }}
                                >
                                  <div className="chat-bubble-header" style={{ marginBottom: '0.6rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}>
                                      {msg.role === 'user' ? '👤 SCHOLAR QUERY' : '🤖 AI MENTOR (GROQ LLaMA 3.3)'}
                                    </span>
                                    <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                  </div>

                                  <div className="admin-markdown-render" style={{ fontSize: '0.88rem', lineHeight: '1.65', color: '#FFF7E8' }}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                      {msg.content}
                                    </ReactMarkdown>
                                  </div>

                                  {msg.sources && msg.sources.length > 0 && (
                                    <div style={{ marginTop: '0.8rem', borderTop: '1px solid rgba(255, 209, 102, 0.15)', paddingTop: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
                                      <span style={{ fontSize: '0.7rem', color: '#FFD166', fontWeight: 700 }}>📚 Grounded Sources:</span>
                                      {msg.sources.map((s, sIdx) => (
                                        <span key={sIdx} className="admin-weak-tag" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )
                      })()
                    ) : (
                      <div style={{ textAlign: 'center', margin: 'auto', color: '#B8B3C7' }}>
                        Select a conversation on the left to inspect full messages.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: QUESTION BANK MANAGER */}
        {activeTab === 'questions' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="admin-tab-wrapper">
            <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
              <div className="radar-card-header" style={{ marginBottom: '1.5rem' }}>
                <div className="radar-title-group">
                  <FileCode size={20} color="#FFD166" />
                  <h2 className="radar-title" style={{ fontSize: '1.2rem' }}>DIAGNOSTIC ASSESSMENT QUESTION BANK</h2>
                </div>
                <button
                  className="navbar-item-btn"
                  style={{
                    color: '#05060A',
                    backgroundColor: '#FFD166',
                    border: '1px solid #FFD166',
                    borderRadius: '20px',
                    padding: '0.45rem 1.1rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
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

              {/* Category Pills */}
              <div className="admin-category-pills" onWheel={handleWheelScroll}>
                <button
                  className={`admin-cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories ({Array.isArray(questionsList) ? questionsList.length : 0})
                </button>
                {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
                  const count = (Array.isArray(questionsList) ? questionsList : []).filter((q) => q && q.category === key).length
                  return (
                    <button
                      key={key}
                      className={`admin-cat-pill ${selectedCategory === key ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(key)}
                    >
                      {name} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Questions Cards Grid */}
              <div className="admin-questions-grid">
                {isLoadingQuestions ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw size={24} className="animate-spin" color="#FFD166" />
                  </div>
                ) : !Array.isArray(filteredQuestions) || filteredQuestions.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#B8B3C7' }}>
                    No questions found for this category.
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => {
                    if (!q) return null
                    const opts = Array.isArray(q.options) ? q.options : []
                    return (
                      <div key={q._id || q.id || idx} className="admin-question-card">
                        <div className="q-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`diff-pill ${q.difficulty || 'intermediate'}`}>
                              {q.difficulty || 'intermediate'}
                            </span>
                            <span className="cat-name-tag">{CATEGORY_NAMES[q.category] || q.category}</span>
                            {q.isCustom && <span className="custom-tag">CUSTOM</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <button
                              className="admin-icon-btn-sm"
                              onClick={() => {
                                setEditingQuestion(q)
                                setQuestionFormData({
                                  category: q.category || 'python',
                                  question: q.question || '',
                                  code: q.code || '',
                                  options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                                  correctIndex: q.correctIndex ?? 0,
                                  difficulty: q.difficulty || 'intermediate',
                                  explanation: q.explanation || '',
                                })
                                setIsQuestionModalOpen(true)
                              }}
                            >
                              <Edit3 size={13} color="#FFD166" />
                            </button>
                            {(q._id || q.isCustom) && (
                              <button
                                className="admin-icon-btn-sm"
                                onClick={() => handleDeleteQuestion(q._id || q.id)}
                              >
                                <Trash2 size={13} color="#F87171" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="q-prompt-title">{q.question || 'Untitled Question'}</div>

                        {q.code ? (
                          <div className="q-code-snippet">
                            <pre><code>{q.code}</code></pre>
                          </div>
                        ) : null}

                        <div className="q-options-stack">
                          {opts.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`q-opt-pill ${oIdx === q.correctIndex ? 'correct' : ''}`}
                            >
                              <span className="q-opt-marker">
                                {oIdx === q.correctIndex ? <Check size={12} /> : `${String.fromCharCode(65 + oIdx)}`}
                              </span>
                              <span>{String(opt)}</span>
                            </div>
                          ))}
                        </div>

                        {q.explanation ? (
                          <div className="q-rationale-box">
                            <strong>Rationale:</strong> {q.explanation}
                          </div>
                        ) : null}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: RAG KNOWLEDGE BASE & CHROMADB */}
        {activeTab === 'knowledge' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="admin-tab-wrapper">
            {/* Action Banner */}
            <div className="radar-card" style={{ padding: '1.6rem 2.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Database size={24} color="#FFD166" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF7E8', margin: 0 }}>ChromaDB Persistent Vector Store & RAG Engine</h3>
                  <p style={{ fontSize: '0.8rem', color: '#B8B3C7', margin: '0.2rem 0 0 0' }}>
                    Files in <code>/rag/knowledge-base/</code> are chunked with semantic overlap and indexed in local ChromaDB.
                  </p>
                </div>
              </div>
              <button
                className="navbar-item-btn"
                style={{
                  color: '#05060A',
                  backgroundColor: '#FFD166',
                  border: '1px solid #FFD166',
                  borderRadius: '20px',
                  padding: '0.55rem 1.2rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                }}
                onClick={handleRebuildChroma}
                disabled={isRebuildingChroma}
              >
                <RefreshCw size={15} className={isRebuildingChroma ? 'animate-spin' : ''} />
                <span>{isRebuildingChroma ? 'Re-Indexing ChromaDB...' : 'Sync & Rebuild ChromaDB Index'}</span>
              </button>
            </div>

            {chromaStatusMsg && (
              <div className="admin-status-alert">
                <span>{chromaStatusMsg}</span>
              </div>
            )}

            <div className="admin-two-col-grid">
              {/* Document Browser & Editor */}
              <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
                <div className="radar-card-header" style={{ marginBottom: '1rem' }}>
                  <div className="radar-title-group">
                    <BookOpen size={20} color="#FFD166" />
                    <h2 className="radar-title" style={{ fontSize: '1.15rem' }}>KNOWLEDGE DOCUMENTS ({kbFiles.length})</h2>
                  </div>
                  {selectedKbFile && (
                    <button
                      className="navbar-item-btn"
                      style={{
                        color: '#05060A',
                        backgroundColor: '#FFD166',
                        border: '1px solid #FFD166',
                        borderRadius: '20px',
                        padding: '0.35rem 0.9rem',
                        fontWeight: 700,
                      }}
                      onClick={handleSaveKbFile}
                      disabled={isSavingKb}
                    >
                      <Check size={14} />
                      <span>{isSavingKb ? 'Saving...' : 'Save File'}</span>
                    </button>
                  )}
                </div>

                <div className="admin-kb-chips-row" onWheel={handleWheelScroll}>
                  {kbFiles.map((file) => (
                    <button
                      key={file.name}
                      className={`admin-kb-chip ${selectedKbFile?.name === file.name ? 'active' : ''}`}
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

                <textarea
                  className="admin-dark-textarea"
                  value={kbContent}
                  onChange={(e) => setKbContent(e.target.value)}
                  placeholder="Document content..."
                  rows={15}
                />
              </div>

              {/* Semantic Search Tester Sandbox */}
              <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
                <div className="radar-card-header" style={{ marginBottom: '1rem' }}>
                  <div className="radar-title-group">
                    <Terminal size={20} color="#FFD166" />
                    <h2 className="radar-title" style={{ fontSize: '1.15rem' }}>CHROMADB SEMANTIC SEARCH PLAYGROUND</h2>
                  </div>
                  <span className="radar-role-badge">VECTOR RETRIEVAL</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div className="admin-search-box" style={{ width: '100%' }}>
                    <Search size={16} color="#FFD166" className="search-icon" />
                    <input
                      type="text"
                      placeholder="Query ChromaDB vector store..."
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTestRagSearch()}
                    />
                  </div>
                  <button
                    className="navbar-item-btn"
                    style={{
                      color: '#05060A',
                      backgroundColor: '#FFD166',
                      border: '1px solid #FFD166',
                      borderRadius: '20px',
                      padding: '0.5rem 1.2rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                    onClick={handleTestRagSearch}
                    disabled={isSearchingRag}
                  >
                    <Zap size={15} />
                    <span>{isSearchingRag ? 'Querying ChromaDB...' : 'Test Semantic Search'}</span>
                  </button>
                </div>

                {ragSearchResults && (
                  <div className="admin-results-display">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFD166', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Retrieved Context &bull; Sources: {ragSearchResults.sources?.join(', ') || 'SkillForge Knowledge Base'}
                    </div>
                    <div className="admin-markdown-render">
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
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="admin-tab-wrapper">
            <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
              <div className="radar-card-header" style={{ marginBottom: '1.5rem' }}>
                <div className="radar-title-group">
                  <BrainCircuit size={20} color="#FFD166" />
                  <h2 className="radar-title" style={{ fontSize: '1.2rem' }}>GROQ CLOUD LLM PROMPT & LATENCY SANDBOX</h2>
                </div>
                <span className="radar-role-badge">MODEL: {sandboxModel}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label className="admin-form-label">System Instruction & Persona</label>
                  <textarea
                    className="admin-dark-textarea"
                    rows={3}
                    value={sandboxSystemPrompt}
                    onChange={(e) => setSandboxSystemPrompt(e.target.value)}
                  />
                </div>

                <div>
                  <label className="admin-form-label">User Query / Assessment Simulation</label>
                  <textarea
                    className="admin-dark-textarea"
                    rows={3}
                    value={sandboxUserPrompt}
                    onChange={(e) => setSandboxUserPrompt(e.target.value)}
                  />
                </div>

                <div className="admin-sandbox-controls">
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label className="admin-form-label">Model Selection</label>
                    <select
                      value={sandboxModel}
                      onChange={(e) => setSandboxModel(e.target.value)}
                      className="admin-gold-select"
                      style={{ width: '100%' }}
                    >
                      <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Groq Super Model)</option>
                      <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                      <option value="llama3-8b-8192">llama3-8b-8192 (Ultra Fast)</option>
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <label className="admin-form-label">Temperature: {sandboxTemperature}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={sandboxTemperature}
                      onChange={(e) => setSandboxTemperature(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#FFD166' }}
                    />
                  </div>

                  <button
                    className="navbar-item-btn"
                    style={{
                      color: '#05060A',
                      backgroundColor: '#FFD166',
                      border: '1px solid #FFD166',
                      borderRadius: '20px',
                      padding: '0.55rem 1.4rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                    onClick={handleRunAiSandbox}
                    disabled={isSandboxRunning}
                  >
                    <Send size={15} />
                    <span>{isSandboxRunning ? 'Querying Groq...' : 'Execute Prompt'}</span>
                  </button>
                </div>

                {sandboxResponse && (
                  <div className="admin-results-display" style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,209,102,0.2)' }}>
                      <span style={{ color: '#FFD166', fontWeight: 800, fontFamily: 'monospace' }}>⚡ Model: {sandboxResponse.modelUsed}</span>
                      <span style={{ color: '#00FF66', fontWeight: 800, fontFamily: 'monospace' }}>Latency: {sandboxResponse.latencyMs} ms</span>
                    </div>
                    <div className="admin-markdown-render">
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

        {/* TAB 6: CAREER BENCHMARKS */}
        {activeTab === 'benchmarks' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="admin-tab-wrapper">
            <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
              <div className="radar-card-header" style={{ marginBottom: '1.5rem' }}>
                <div className="radar-title-group">
                  <Sliders size={20} color="#FFD166" />
                  <h2 className="radar-title" style={{ fontSize: '1.2rem' }}>CAREER TRACK BENCHMARKS & SKILL GAP RULES</h2>
                </div>
                <button
                  className="navbar-item-btn"
                  style={{
                    color: '#05060A',
                    backgroundColor: '#FFD166',
                    border: '1px solid #FFD166',
                    borderRadius: '20px',
                    padding: '0.45rem 1.1rem',
                    fontWeight: 800,
                  }}
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
                <div className="admin-status-alert">
                  <span>✅ {benchmarksSavedMsg}</span>
                </div>
              )}

              <div className="admin-benchmarks-grid">
                {Object.entries(benchmarks).map(([roleName, skillsList]) => (
                  <div key={roleName} className="admin-benchmark-card">
                    <div className="benchmark-title">{roleName}</div>
                    <div className="benchmark-skills-wrap">
                      {skillsList.map((skill, sIdx) => (
                        <span key={sIdx} className="admin-skill-chip">
                          {skill}
                          <button
                            className="chip-remove-btn"
                            onClick={() => {
                              const updated = { ...benchmarks }
                              updated[roleName] = updated[roleName].filter((_, idx) => idx !== sIdx)
                              setBenchmarks(updated)
                            }}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: '0.8rem' }}>
                      <input
                        type="text"
                        placeholder="Add required skill (Press Enter)..."
                        className="admin-dark-input-sm"
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

        {/* TAB 7: REPORTS */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="admin-tab-wrapper">
            <div className="radar-card" style={{ padding: '1.8rem 2.2rem' }}>
              <div className="radar-card-header" style={{ marginBottom: '1rem' }}>
                <div className="radar-title-group">
                  <BarChart3 size={20} color="#FFD166" />
                  <h2 className="radar-title" style={{ fontSize: '1.2rem' }}>COHORT PROGRESS & AT-RISK SCHOLAR REPORT</h2>
                </div>
                <button
                  className="navbar-item-btn"
                  style={{
                    color: '#05060A',
                    backgroundColor: '#FFD166',
                    border: '1px solid #FFD166',
                    borderRadius: '20px',
                    padding: '0.45rem 1.1rem',
                    fontWeight: 800,
                  }}
                  onClick={handleExportCsv}
                >
                  <Download size={15} />
                  <span>Download Full CSV</span>
                </button>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#B8B3C7', marginBottom: '1.2rem' }}>
                Scholars with readiness score &lt; 60% are flagged for priority AI Mentor coaching.
              </p>

              <div className="admin-table-container">
                <table className="admin-custom-table">
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
                            <div style={{ fontWeight: 700, color: '#FFF7E8' }}>{u.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#B8B3C7', fontFamily: 'monospace' }}>{u.email}</div>
                          </td>
                          <td>{u.profile?.careerGoal || 'AI Engineer'}</td>
                          <td>
                            <span className={`admin-score-badge ${avg >= 70 ? 'high' : avg >= 50 ? 'medium' : 'low'}`}>
                              {avg > 0 ? `${avg}%` : 'Not Taken'}
                            </span>
                          </td>
                          <td>
                            {weakAreas.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                {weakAreas.map((w, idx) => (
                                  <span key={idx} className="admin-weak-tag">{w}</span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#B8B3C7', fontSize: '0.75rem' }}>All Benchmarks Met</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${avg > 0 && avg < 60 ? 'pending' : 'verified'}`}>
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
      </main>

      {/* MODAL: ADD / EDIT QUESTION */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <div className="admin-modal-overlay" onClick={() => setIsQuestionModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="admin-gold-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3 style={{ fontFamily: '"Bungee", sans-serif', color: '#FFD166', margin: 0, fontSize: '1.2rem' }}>
                  {editingQuestion ? 'EDIT QUESTION' : 'ADD NEW QUESTION'}
                </h3>
                <button className="clear-search-btn" onClick={() => setIsQuestionModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="admin-form-label">Category</label>
                    <select
                      value={questionFormData.category}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, category: e.target.value })}
                      className="admin-gold-select"
                      style={{ width: '100%' }}
                    >
                      {Object.entries(CATEGORY_NAMES).map(([k, name]) => (
                        <option key={k} value={k}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="admin-form-label">Difficulty</label>
                    <select
                      value={questionFormData.difficulty}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, difficulty: e.target.value })}
                      className="admin-gold-select"
                      style={{ width: '100%' }}
                    >
                      <option value="easy">Easy (Foundations)</option>
                      <option value="intermediate">Intermediate (Production Standard)</option>
                      <option value="hard">Hard (Advanced Systems)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="admin-form-label">Question Text</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Which PyTorch method clears old gradients before backward pass?"
                    className="admin-dark-input"
                    value={questionFormData.question}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-form-label">Code Snippet (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="def optimize_loop():\n    ..."
                    className="admin-dark-textarea font-mono"
                    value={questionFormData.code}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, code: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-form-label">4 Answer Options (Select Radio for Correct Answer)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {questionFormData.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <input
                          type="radio"
                          name="correctOption"
                          checked={questionFormData.correctIndex === oIdx}
                          onChange={() => setQuestionFormData({ ...questionFormData, correctIndex: oIdx })}
                          style={{ accentColor: '#FFD166', width: '18px', height: '18px' }}
                        />
                        <span style={{ fontWeight: 800, color: '#FFD166', fontFamily: 'monospace', width: '20px' }}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          className="admin-dark-input"
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

                <div>
                  <label className="admin-form-label">Explanation / Rationale</label>
                  <input
                    type="text"
                    placeholder="Explanation displayed when student reviews test..."
                    className="admin-dark-input"
                    value={questionFormData.explanation}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="navbar-item-btn"
                    style={{
                      color: '#FFF7E8',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '20px',
                      padding: '0.45rem 1.1rem',
                    }}
                    onClick={() => setIsQuestionModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="navbar-item-btn"
                    style={{
                      color: '#05060A',
                      backgroundColor: '#FFD166',
                      border: '1px solid #FFD166',
                      borderRadius: '20px',
                      padding: '0.45rem 1.3rem',
                      fontWeight: 800,
                    }}
                  >
                    Save Question
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
              className="admin-gold-modal"
              style={{ maxWidth: '720px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img src={selectedStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} alt="" className="table-user-avatar" style={{ width: '48px', height: '48px' }} />
                  <div>
                    <h3 style={{ margin: 0, color: '#FFF7E8', fontSize: '1.2rem' }}>{selectedStudent.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#FFD166', fontFamily: 'monospace' }}>{selectedStudent.email} &bull; {selectedStudent.profile?.university || 'NUST SEECS'}</div>
                  </div>
                </div>
                <button className="clear-search-btn" onClick={() => setSelectedStudent(null)}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem', marginBottom: '1.5rem' }}>
                <div className="drilldown-stat-card">
                  <div className="d-label">TARGET ROLE</div>
                  <div className="d-val">{selectedStudent.profile?.careerGoal || 'AI Engineer'}</div>
                </div>
                <div className="drilldown-stat-card">
                  <div className="d-label">PLATFORM ROLE</div>
                  <div className="d-val capitalize">{selectedStudent.role || 'student'}</div>
                </div>
                <div className="drilldown-stat-card">
                  <div className="d-label">AI CALLS</div>
                  <div className="d-val" style={{ color: '#00FF66' }}>
                    ⚡ {selectedStudent.aiTelemetry?.calls ?? (selectedStudent.roadmapCount ? selectedStudent.roadmapCount * 2 : 1)}
                  </div>
                </div>
                <div className="drilldown-stat-card">
                  <div className="d-label">EST. TOKENS</div>
                  <div className="d-val" style={{ color: '#FFD166' }}>
                    ~{selectedStudent.aiTelemetry?.tokensFormatted ?? '2.4k'}
                  </div>
                </div>
                <div className="drilldown-stat-card">
                  <div className="d-label">VERIFIED</div>
                  <div className="d-val">{selectedStudent.isVerified ? 'Yes ✅' : 'No ❌'}</div>
                </div>
              </div>

              {/* Modal Tabs */}
              <div className="admin-drilldown-tabs">
                <button
                  className={`admin-drilldown-tab-btn ${drilldownTab === 'scores' ? 'active' : ''}`}
                  onClick={() => setDrilldownTab('scores')}
                >
                  📊 Diagnostic Radars
                </button>
                <button
                  className={`admin-drilldown-tab-btn ${drilldownTab === 'roadmaps' ? 'active' : ''}`}
                  onClick={() => setDrilldownTab('roadmaps')}
                >
                  🗺️ AI Roadmaps ({studentDetails?.roadmaps?.length || 0})
                </button>
                <button
                  className={`admin-drilldown-tab-btn ${drilldownTab === 'chats' ? 'active' : ''}`}
                  onClick={() => setDrilldownTab('chats')}
                >
                  💬 AI Mentor Chats ({studentDetails?.chats?.length || 0})
                </button>
              </div>

              {isLoadingDetails ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <RefreshCw size={24} className="animate-spin" color="#FFD166" style={{ margin: '0 auto' }} />
                  <div style={{ marginTop: '0.5rem', color: '#B8B3C7', fontSize: '0.8rem' }}>Loading scholar telemetry...</div>
                </div>
              ) : drilldownTab === 'scores' ? (
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFD166', marginBottom: '0.8rem' }}>
                    DIAGNOSTIC ASSESSMENT RADAR SCORES
                  </div>
                  {selectedStudent.latestAssessment?.scores || studentDetails?.assessments?.[0]?.scores ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      {Object.entries(selectedStudent.latestAssessment?.scores || studentDetails?.assessments?.[0]?.scores || {}).map(([cat, val]) => (
                        <div key={cat} className="drilldown-score-row">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ fontWeight: 600, color: '#FFF7E8' }}>{CATEGORY_NAMES[cat] || cat}</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#FFD166' }}>{val}%</span>
                          </div>
                          <div className="track-bar-track" style={{ height: '6px' }}>
                            <div className="track-bar-fill-gold" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#B8B3C7', fontSize: '0.84rem' }}>Student has not taken any diagnostic tests yet.</div>
                  )}
                </div>
              ) : drilldownTab === 'roadmaps' ? (
                <div
                  data-lenis-prevent="true"
                  onWheel={(e) => e.stopPropagation()}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#FFD166 rgba(255, 255, 255, 0.05)' }}
                >
                  {!studentDetails?.roadmaps || studentDetails.roadmaps.length === 0 ? (
                    <div style={{ color: '#B8B3C7', fontSize: '0.84rem', textAlign: 'center', padding: '2rem' }}>
                      No AI-generated roadmaps found for this scholar.
                    </div>
                  ) : (
                    studentDetails.roadmaps.map((rm) => (
                      <div key={rm._id} style={{ background: 'rgba(13, 16, 26, 0.9)', border: '1px solid rgba(255, 209, 102, 0.25)', borderRadius: '12px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 800, color: '#FFD166', fontSize: '0.95rem' }}>{rm.careerGoal}</span>
                          <span className="diff-pill easy">{rm.model || 'Groq AI'}</span>
                        </div>
                        {rm.gaps && rm.gaps.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem' }}>
                            {rm.gaps.map((g, gIdx) => (
                              <span key={gIdx} className="admin-weak-tag">{g.skill}: {g.currentScore}% → {g.requiredScore}%</span>
                            ))}
                          </div>
                        )}
                        <div
                          data-lenis-prevent="true"
                          onWheel={(e) => e.stopPropagation()}
                          style={{ background: 'rgba(2, 4, 8, 0.95)', border: '1px solid rgba(255, 209, 102, 0.12)', borderRadius: '8px', padding: '0.8rem', maxHeight: '200px', overflowY: 'auto', fontSize: '0.78rem', lineHeight: '1.5', scrollbarWidth: 'thin', scrollbarColor: '#FFD166 rgba(255, 255, 255, 0.05)' }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {rm.generatedRoadmapText || 'No text recorded.'}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div
                  data-lenis-prevent="true"
                  onWheel={(e) => e.stopPropagation()}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#FFD166 rgba(255, 255, 255, 0.05)' }}
                >
                  {!studentDetails?.chats || studentDetails.chats.length === 0 ? (
                    <div style={{ color: '#B8B3C7', fontSize: '0.84rem', textAlign: 'center', padding: '2rem' }}>
                      No AI Mentor chat sessions found for this scholar.
                    </div>
                  ) : (
                    studentDetails.chats.map((chat) => (
                      <div key={chat._id} style={{ background: 'rgba(13, 16, 26, 0.9)', border: '1px solid rgba(255, 209, 102, 0.25)', borderRadius: '12px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255, 209, 102, 0.15)', paddingBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 800, color: '#FFD166', fontSize: '0.9rem' }}>{chat.title}</span>
                          <span style={{ fontSize: '0.7rem', color: '#B8B3C7' }}>{new Date(chat.updatedAt || chat.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div
                          data-lenis-prevent="true"
                          onWheel={(e) => e.stopPropagation()}
                          className="admin-chat-stream"
                          style={{ maxHeight: '280px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#FFD166 rgba(255, 255, 255, 0.05)' }}
                        >
                          {chat.messages?.map((msg, mIdx) => (
                            <div key={mIdx} className={msg.role === 'user' ? 'admin-chat-bubble-user' : 'admin-chat-bubble-ai'} style={{ fontSize: '0.78rem' }}>
                              <div className="chat-bubble-header">
                                <span>{msg.role === 'user' ? '👤 SCHOLAR' : '🤖 AI MENTOR (GROQ)'}</span>
                                <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              </div>
                              <div className="admin-markdown-render">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                              {msg.sources && msg.sources.length > 0 && (
                                <div style={{ marginTop: '0.3rem', fontSize: '0.65rem', color: '#FFD166' }}>
                                  📚 Sources: {msg.sources.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: FULL-SIZE INTERACTIVE ROADMAP READER */}
      <AnimatePresence>
        {selectedRoadmap && (
          <div className="admin-modal-overlay" onClick={() => setSelectedRoadmap(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="admin-gold-modal"
              style={{
                maxWidth: '960px',
                width: '92vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95)',
                border: '1.5px solid #FFD166',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="admin-modal-header" style={{ borderBottom: '1px solid rgba(255, 209, 102, 0.25)', paddingBottom: '1rem', marginBottom: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <Compass size={22} color="#FFD166" />
                    <h2 style={{ margin: 0, color: '#FFD166', fontSize: '1.25rem', fontWeight: 800 }}>
                      {selectedRoadmap.careerGoal?.toUpperCase()} BLUEPRINT
                    </h2>
                    <span className="diff-pill easy" style={{ fontSize: '0.72rem' }}>
                      {selectedRoadmap.model || 'Groq LLaMA 3.3 Versatile'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#B8B3C7', marginTop: '0.35rem' }}>
                    Scholar: <span style={{ color: '#FFF7E8', fontFamily: 'monospace' }}>{selectedRoadmap.email}</span> &bull; Generated: {new Date(selectedRoadmap.createdAt || selectedRoadmap.generatedAt).toLocaleString()}
                  </div>
                </div>
                <button className="clear-search-btn" onClick={() => setSelectedRoadmap(null)}>
                  <X size={22} />
                </button>
              </div>

              {/* Identified Skill Gaps Banner */}
              {selectedRoadmap.gaps && selectedRoadmap.gaps.length > 0 && (
                <div style={{ background: 'rgba(255, 209, 102, 0.08)', border: '1px solid rgba(255, 209, 102, 0.25)', borderRadius: '12px', padding: '0.75rem 1.2rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FFD166', marginBottom: '0.35rem' }}>
                    🎯 VERIFIED SKILL GAPS IDENTIFIED BY AI DIAGNOSTIC ENGINE:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {selectedRoadmap.gaps.map((g, gIdx) => (
                      <span key={gIdx} className="admin-weak-tag" style={{ fontSize: '0.76rem', padding: '0.25rem 0.65rem' }}>
                        {g.skill}: {g.currentScore}% → {g.requiredScore}% Target
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Scrollable Markdown Reader */}
              <div
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
                className="admin-markdown-render"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.4rem 1.8rem',
                  background: 'rgba(2, 4, 8, 0.95)',
                  border: '1.5px solid rgba(255, 209, 102, 0.2)',
                  borderRadius: '16px',
                  fontSize: '0.92rem',
                  lineHeight: '1.7',
                  color: '#FFF7E8',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#FFD166 rgba(255, 255, 255, 0.05)',
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {selectedRoadmap.generatedRoadmapText || 'No roadmap document recorded.'}
                </ReactMarkdown>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
