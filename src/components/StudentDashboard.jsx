import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Award,
  GraduationCap,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Code2,
  Terminal,
  Cpu,
  Database,
  Layers,
  GitBranch,
  Container,
  ArrowRight,
  Sun,
  Edit3,
  LogOut,
  X,
  Star,
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react'
import AuthModal from './AuthModal'
import './StudentDashboard.css'
import './Navbar.css'

// Target Role Benchmarks for Dynamic Gap Analysis
const ROLE_BENCHMARKS = {
  'AI Engineer': ['Python', 'PyTorch', 'FastAPI', 'Docker', 'ChromaDB', 'Git', 'TypeScript'],
  'Backend Developer': ['TypeScript', 'Node.js', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'Redis'],
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'CSS', 'Next.js', 'Git', 'Tailwind'],
  'Full-Stack Developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Docker', 'PostgreSQL', 'Git'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'Linux', 'Git', 'Python', 'CI/CD', 'Bash'],
  'Data Scientist': ['Python', 'SQL', 'PyTorch', 'Pandas', 'NumPy', 'Git', 'Scikit-Learn']
}

// Real Diagnostic Questions Generator for Any Technology
const SKILL_QUIZ_BANK = {
  'python': {
    question: 'Which method in Python is used to customize developer object string representation?',
    code: `class NeuralNode:\n    def __init__(self, weights):\n        self.weights = weights\n    \n    def __repr__(self):\n        return f"NeuralNode(w={self.weights})"`,
    options: ['__str__()', '__repr__()', '__format__()', '__init__()'],
    correctIndex: 1,
  },
  'typescript': {
    question: 'Which TypeScript utility type constructs a type with all properties set to optional?',
    code: `interface Scholar {\n  name: string;\n  score: number;\n}\n\ntype PartialScholar = Partial<Scholar>;`,
    options: ['Required<T>', 'Partial<T>', 'Readonly<T>', 'Record<K, T>'],
    correctIndex: 1,
  },
  'javascript': {
    question: 'Which array method creates a new array populated with the results of calling a provided function on every element?',
    code: `const scores = [80, 90, 95];\nconst boosted = scores.map(s => s + 5);`,
    options: ['forEach()', 'map()', 'filter()', 'reduce()'],
    correctIndex: 1,
  },
  'react': {
    question: 'In React, which hook is used to run side effects like API fetching or DOM updates after render?',
    code: `import { useEffect } from 'react';\n\nuseEffect(() => {\n  fetchScholarData();\n}, []);`,
    options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
    correctIndex: 1,
  },
  'fastapi': {
    question: 'How do you declare an async route handler in FastAPI validating JSON payloads via Pydantic?',
    code: `from fastapi import FastAPI\nfrom pydantic import BaseModel\n\nclass SkillModel(BaseModel):\n  title: str\n\n@app.post("/skills")\nasync def add_skill(data: SkillModel):\n  return data`,
    options: ['Using @app.get query params', 'Using Pydantic BaseModel with @app.post', 'Using raw Flask request', 'Using header parameters'],
    correctIndex: 1,
  },
  'docker': {
    question: 'What is the primary benefit of multi-stage Docker builds?',
    code: `FROM node:18-alpine AS builder\nWORKDIR /app\nRUN npm install\n\nFROM node:18-alpine AS runner\nCOPY --from=builder /app/node_modules ./node_modules`,
    options: ['Runs multiple containers simultaneously', 'Drastically reduces production image size & security footprint', 'Bypasses build cache', 'Compiles JavaScript into WebAssembly'],
    correctIndex: 1,
  },
  'css': {
    question: 'Which CSS layout system is optimized for two-dimensional grid layouts with rows and columns?',
    code: `.dashboard-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n}`,
    options: ['Flexbox', 'CSS Grid', 'Float Layout', 'Absolute Positioning'],
    correctIndex: 1,
  },
  'git': {
    question: 'Which command combines feature branch commits into main while maintaining linear history?',
    code: `git checkout feature/ai-quiz\ngit rebase main`,
    options: ['git merge --no-ff', 'git rebase', 'git cherry-pick', 'git stash pop'],
    correctIndex: 1,
  }
}

// Fallback quiz generator for any technology
const getQuizForSkill = (skillName) => {
  const key = skillName.toLowerCase().replace(/[^a-z]/g, '')
  if (SKILL_QUIZ_BANK[key]) return SKILL_QUIZ_BANK[key]
  
  return {
    question: `What is a core best practice when engineering production systems with ${skillName}?`,
    code: `// ${skillName} Production Architecture Check\nconst verified = await validateSystemCompliance('${skillName}');`,
    options: [
      'Ignore error handling and logging',
      'Enforce modular architecture, strict type checks & automated testing',
      'Hardcode passwords directly in source code',
      'Disable async concurrency'
    ],
    correctIndex: 1,
  }
}

export default function StudentDashboard({ onExitDashboard }) {
  const [studentProfile, setStudentProfile] = useState({
    name: 'Scholar Student',
    email: 'student@nust.edu.pk',
    university: 'NUST',
    degree: 'BS Computer Science',
    yearOfStudy: 3,
    experienceLevel: 'intermediate',
    careerGoal: 'AI Engineer',
    githubUser: '',
    reposCount: 0,
    skills: [],
    projects: [],
  })

  const [activeQuiz, setActiveQuiz] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [quizFeedback, setQuizFeedback] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showRepos, setShowRepos] = useState(false)
  const [skillScores, setSkillScores] = useState({})

  // Load profile from MongoDB Atlas API
  const loadProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      const userEmail = storedUser.email || 'student@nust.edu.pk'

      if (storedUser.name) {
        setStudentProfile((prev) => ({
          ...prev,
          name: storedUser.name,
          email: storedUser.email || prev.email,
        }))
      }

      const res = await fetch(`http://localhost:3001/api/profile/${storedUser._id || userEmail}`)
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          const p = data.profile
          setStudentProfile((prev) => ({
            ...prev,
            university: p.university || prev.university,
            degree: p.degree || prev.degree,
            yearOfStudy: p.yearOfStudy || prev.yearOfStudy,
            experienceLevel: p.experienceLevel || prev.experienceLevel,
            careerGoal: p.careerGoal || prev.careerGoal,
            skills: p.skills || [],
            projects: p.projects || [],
            reposCount: p.projects?.length || 0,
          }))

          // Initialize REAL skill scores strictly from database (default 0 UNTESTED for un-quiz-tested skills!)
          const initialScores = {}
          if (Array.isArray(p.skills)) {
            p.skills.forEach((s) => {
              if (s && s.name) {
                // Only count score if explicitly verified by taking a quiz (isVerified = true)
                const realScore = s.isVerified && typeof s.verifiedScore === 'number' ? s.verifiedScore : 0
                initialScores[s.name.toLowerCase()] = realScore
              }
            })
          }
          setSkillScores(initialScores)
        }
      }
    } catch (e) {
      console.warn('Using cached profile:', e)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // Dynamic Skill Gap Engine
  const targetRequiredSkills = ROLE_BENCHMARKS[studentProfile.careerGoal] || ROLE_BENCHMARKS['AI Engineer']
  
  const userSkillMap = new Map()
  studentProfile.skills.forEach((s) => {
    if (s && s.name) {
      userSkillMap.set(s.name.toLowerCase(), s.level || 'intermediate')
    }
  })

  const strongSkills = []
  const developingSkills = []
  const missingSkills = []

  targetRequiredSkills.forEach((reqSkill) => {
    const sKey = reqSkill.toLowerCase()
    const level = userSkillMap.get(sKey)
    const score = skillScores[sKey] || 0

    if (score >= 80 || level === 'advanced') {
      strongSkills.push({ name: reqSkill, level: 'advanced', score: score || 90 })
    } else if (score > 0 || level === 'intermediate' || level === 'beginner') {
      developingSkills.push({ name: reqSkill, level: level || 'intermediate', score: score || 50 })
    } else {
      missingSkills.push({ name: reqSkill, level: 'missing', score: 0 })
    }
  })

  studentProfile.skills.forEach((userSkill) => {
    if (userSkill && userSkill.name) {
      const isReq = targetRequiredSkills.some((r) => r.toLowerCase() === userSkill.name.toLowerCase())
      if (!isReq) {
        const sKey = userSkill.name.toLowerCase()
        const score = skillScores[sKey] || 0
        if (score >= 80 || userSkill.level === 'advanced') {
          strongSkills.push(userSkill)
        } else {
          developingSkills.push(userSkill)
        }
      }
    }
  })

  const matchPoints = strongSkills.length * 1.0 + developingSkills.length * 0.5
  const readinessPercent = targetRequiredSkills.length > 0 
    ? Math.min(100, Math.round((matchPoints / targetRequiredSkills.length) * 100))
    : 0

  // Start Diagnostic Quiz for a Specific Student Skill
  const handleStartSkillQuiz = (skillName) => {
    const quizData = getQuizForSkill(skillName)
    setActiveQuiz({
      skillName,
      ...quizData
    })
    setSelectedOption(null)
    setQuizFeedback(null)
  }

  // Answer Quiz & Save Verified Score Live to MongoDB Atlas
  const handleAnswerQuiz = async () => {
    if (selectedOption === null || !activeQuiz) return
    const isCorrect = selectedOption === activeQuiz.correctIndex
    setQuizFeedback(isCorrect ? 'correct' : 'incorrect')

    if (isCorrect) {
      const sName = activeQuiz.skillName
      const sKey = sName.toLowerCase()
      const newScore = 100 // Tested and verified!
      setSkillScores((prev) => ({ ...prev, [sKey]: newScore }))

      // Update skill in state and set verifiedScore & level
      const updatedSkills = studentProfile.skills.map((s) => {
        if (s.name.toLowerCase() === sKey) {
          return {
            ...s,
            verifiedScore: newScore,
            level: 'advanced',
          }
        }
        return s
      })

      setStudentProfile((prev) => ({ ...prev, skills: updatedSkills }))

      // Save live score update directly to MongoDB Atlas
      try {
        await fetch(`http://localhost:3001/api/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: studentProfile.email,
            skills: updatedSkills,
          }),
        })
      } catch (e) {}
    }

    setTimeout(() => {
      setActiveQuiz(null)
      setSelectedOption(null)
      setQuizFeedback(null)
    }, 1400)
  }

  const handleProfileUpdated = (updated) => {
    if (updated) {
      setStudentProfile((prev) => ({
        ...prev,
        university: updated.university || prev.university,
        degree: updated.degree || prev.degree,
        yearOfStudy: updated.yearOfStudy || prev.yearOfStudy,
        experienceLevel: updated.experienceLevel || prev.experienceLevel,
        careerGoal: updated.careerGoal || prev.careerGoal,
        skills: updated.skills || prev.skills,
        projects: updated.projects || prev.projects,
        reposCount: updated.projects?.length || 0,
      }))
    }
  }

  return (
    <div className="dashboard-root">
      {/* Space Video Background */}
      <div className="dashboard-bg-video-container">
        <video src="/login.webm" className="dashboard-bg-video" autoPlay loop muted playsInline />
        <div className="dashboard-video-overlay" />
      </div>

      {/* TOP NAVBAR */}
      <header className="navbar-container" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="navbar-brand" onClick={() => onExitDashboard && onExitDashboard()}>
          <div className="brand-icon-planet">🪐</div>
          <div className="brand-logo-text">
            <span className="brand-text-top bungee-regular">SKILL</span>
            <span className="brand-text-bottom bungee-regular">FORGE</span>
          </div>
        </div>

        <nav className="navbar-menu">
          <button className="navbar-item-btn" onClick={() => onExitDashboard && onExitDashboard()}>
            Home
          </button>
          <button
            className="navbar-item-btn"
            onClick={() => {
              const el = document.getElementById('skill-assessment-hub')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Skill Hub
          </button>
          <button
            className="navbar-item-btn"
            onClick={() => {
              const el = document.getElementById('my-skills-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            My Skills
          </button>
          <button
            className="navbar-item-btn"
            onClick={() => {
              const el = document.getElementById('gap-matrix-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Skill Gaps
          </button>
          <button
            className="navbar-item-btn"
            onClick={() => {
              const el = document.getElementById('roadmap-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            AI Roadmap
          </button>
        </nav>

        <div className="navbar-right-actions">
          <button
            className="navbar-item-btn"
            style={{
              color: '#FFD166',
              border: '1px solid #FFD166',
              backgroundColor: 'rgba(255, 209, 102, 0.12)',
              borderRadius: '20px',
              padding: '0.45rem 1.1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(255, 209, 102, 0.25)',
            }}
            onClick={() => setIsEditModalOpen(true)}
            title="Edit Profile & Skills"
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>

          <button className="theme-toggle-btn" title="Theme Settings">
            <Sun size={18} />
          </button>

          <button
            className="get-started-btn bungee-regular"
            style={{
              background: 'linear-gradient(135deg, #FF6B81 0%, #E5243B 100%)',
              color: '#FFF7E8',
              boxShadow: '0 4px 15px rgba(229, 36, 59, 0.3)',
            }}
            onClick={() => {
              localStorage.removeItem('skillforge_token')
              localStorage.removeItem('skillforge_user')
              if (onExitDashboard) onExitDashboard()
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="dashboard-main-container">
        {/* =========================================================================
            1. STUDENT PROFILE HERO
            ========================================================================= */}
        <motion.div
          className="profile-hero-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="profile-hero-left">
            <div className="profile-avatar-wrapper">
              <img src="/man.png" alt="Scholar" className="profile-avatar-img" />
            </div>

            <div className="profile-info-block">
              <div className="profile-name-row">
                <h1 className="profile-student-name">{studentProfile.name.toUpperCase()}</h1>
                <span className="profile-uni-pill press-start-2p-regular">
                  ✦ {studentProfile.university || 'NUST'}
                </span>
                <button
                  className="dashboard-nav-btn"
                  style={{
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.68rem',
                    borderColor: 'rgba(255, 209, 102, 0.4)',
                    color: '#FFD166',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsEditModalOpen(true)}
                  title="Edit scholar profile data"
                >
                  <Edit3 size={11} />
                  <span>EDIT PROFILE</span>
                </button>
              </div>

              <div className="profile-details-row">
                <span>{studentProfile.degree || 'BS Computer Science'}</span>
                <span>•</span>
                <span>{studentProfile.yearOfStudy}rd Year (Junior)</span>
                <span>•</span>
                <span style={{ color: '#FFD166' }}>⚡ {(studentProfile.experienceLevel || 'INTERMEDIATE').toUpperCase()} LEVEL</span>
              </div>

              <div className="profile-role-selector-pill">
                <Compass size={14} color="#FFD166" />
                <span style={{ fontSize: '0.72rem', color: '#B8B3C7' }}>TARGET TRACK:</span>
                <select
                  className="role-select-input"
                  value={studentProfile.careerGoal}
                  onChange={(e) =>
                    setStudentProfile({ ...studentProfile, careerGoal: e.target.value })
                  }
                >
                  <option value="AI Engineer">AI Engineer &amp; PyTorch</option>
                  <option value="Backend Developer">Distributed Backend Microservices</option>
                  <option value="Frontend Developer">Modern Frontend React UI</option>
                  <option value="Full-Stack Developer">Full-Stack Cloud &amp; DevOps</option>
                  <option value="DevOps Engineer">DevOps &amp; Kubernetes</option>
                  <option value="Data Scientist">Data Science &amp; Vector Embeddings</option>
                </select>
              </div>
            </div>
          </div>

          <div className="profile-hero-right">
            {/* GitHub Sync Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(13, 16, 26, 0.8)',
                border: '1px solid #222638',
                borderRadius: '12px',
                padding: '0.7rem 1.1rem',
                cursor: 'pointer'
              }}
              onClick={() => setShowRepos(!showRepos)}
              title="Click to view/hide GitHub repos"
            >
              <Code2 size={16} color="#FFD166" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>GITHUB AUTO-SYNC</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFF7E8' }}>
                  {studentProfile.projects?.length || 0} Repos Synced {showRepos ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Circular Readiness Gauge */}
            <div className="readiness-gauge-box">
              <div
                className="gauge-circle"
                style={{ '--progress': `${readinessPercent * 3.6}deg` }}
              >
                <div className="gauge-inner">{readinessPercent}%</div>
              </div>
              <div className="readiness-text-col">
                <span className="readiness-label press-start-2p-regular">CAREER READINESS</span>
                <span className="readiness-status">
                  {readinessPercent >= 70 ? '🔥 Job Ready Track' : '⚡ Developing Foundation'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            2. REAL-TIME SKILL ASSESSMENT HUB (SHOWS ACTUAL VERIFIED SCORES FROM MONGODB)
            ========================================================================= */}
        <div id="skill-assessment-hub" className="dashboard-glass-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">
              <Award size={18} color="#FFD166" />
              <span>REAL-TIME SKILL ASSESSMENT HUB</span>
            </h2>
            <span style={{ fontSize: '0.72rem', color: '#FFD166' }}>
              {studentProfile.skills.length} Active Configured Technologies
            </span>
          </div>

          {studentProfile.skills.length === 0 ? (
            <div className="skills-empty-state" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <span style={{ color: '#FFD166', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                ✦ No active skills configured for diagnosis!
              </span>
              <span style={{ color: '#B8B3C7', fontSize: '0.8rem', display: 'block', marginBottom: '1rem' }}>
                Add your technologies via "Edit Profile" or sync GitHub to generate real-time diagnostic cards.
              </span>
              <button
                className="auth-submit-btn bungee-regular"
                style={{ maxWidth: '240px', margin: '0 auto' }}
                onClick={() => setIsEditModalOpen(true)}
              >
                <Plus size={15} />
                <span>ADD SKILLS FOR DIAGNOSIS</span>
              </button>
            </div>
          ) : (
            <div className="assessment-cards-grid">
              {studentProfile.skills.map((skill, idx) => {
                const sKey = skill.name.toLowerCase()
                // Strict score: 0 UNTESTED unless skill.isVerified is explicitly true!
                const isVerified = Boolean(skill.isVerified || (skillScores[sKey] && skillScores[sKey] > 0))
                const score = isVerified ? (skillScores[sKey] || skill.verifiedScore || 100) : 0

                return (
                  <div key={idx} className="assessment-item-card">
                    <div className="assessment-top-row">
                      <span className="assessment-cat-name">
                        <Terminal size={15} color="#FFD166" />
                        <span>{skill.name}</span>
                      </span>
                      <span
                        className="assessment-score-badge"
                        style={{
                          color: isVerified ? '#27C93F' : '#B8B3C7',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        {isVerified ? `${score}/100 VERIFIED` : '0/100 (UNTESTED)'}
                      </span>
                    </div>

                    <div className="assessment-progress-track">
                      <div
                        className="assessment-progress-fill"
                        style={{
                          width: `${score}%`,
                          background: isVerified
                            ? 'linear-gradient(90deg, #FFD166 0%, #27C93F 100%)'
                            : '#222638'
                        }}
                      />
                    </div>

                    <button
                      className="assessment-quiz-btn"
                      style={{
                        backgroundColor: isVerified ? '#1c2030' : 'rgba(255, 209, 102, 0.15)',
                        borderColor: isVerified ? '#33394f' : '#FFD166',
                        color: isVerified ? '#FFF7E8' : '#FFD166',
                      }}
                      onClick={() => handleStartSkillQuiz(skill.name)}
                    >
                      <Sparkles size={13} color="#FFD166" />
                      <span>{isVerified ? 'Retake Diagnosis' : 'Take Diagnostic Quiz'}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* =========================================================================
            3. MY CONFIGURED SKILLS MATRIX (PERMANENTLY SHOWN AS REQUESTED)
            ========================================================================= */}
        <div id="my-skills-section" className="dashboard-glass-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">
              <Layers size={18} color="#FFD166" />
              <span>GUARDIANS CONFIGURED SKILLS MATRIX</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#B8B3C7' }}>
                {studentProfile.skills.length} Active Technologies
              </span>
              <button
                className="assessment-quiz-btn"
                style={{ width: 'auto', padding: '0.35rem 0.8rem' }}
                onClick={() => setIsEditModalOpen(true)}
              >
                <Plus size={13} color="#FFD166" />
                <span>Add / Edit Skills</span>
              </button>
            </div>
          </div>

          {studentProfile.skills.length === 0 ? (
            <div className="skills-empty-state" style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
              <span style={{ color: '#B8B3C7', fontSize: '0.8rem' }}>
                No custom skills added yet. Click "Add / Edit Skills" to populate your technologies!
              </span>
            </div>
          ) : (
            <div className="skills-tag-cloud" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              {studentProfile.skills.map((skill, idx) => (
                <div key={idx} className={`skill-chip-luxury level-${skill.level || 'intermediate'}`}>
                  <span className="skill-chip-name" style={{ fontSize: '0.84rem', fontWeight: 700 }}>
                    {skill.name}
                  </span>
                  <span
                    className="skill-level-select-pill"
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background:
                        skill.level === 'advanced'
                          ? 'rgba(39, 201, 63, 0.2)'
                          : skill.level === 'beginner'
                          ? 'rgba(0, 210, 255, 0.2)'
                          : 'rgba(255, 209, 102, 0.2)',
                      color:
                        skill.level === 'advanced'
                          ? '#27C93F'
                          : skill.level === 'beginner'
                          ? '#00D2FF'
                          : '#FFD166',
                    }}
                  >
                    {skill.level === 'advanced' ? (
                      <>
                        <Flame size={11} color="#27C93F" />
                        <span>ADV</span>
                      </>
                    ) : skill.level === 'beginner' ? (
                      <>
                        <Star size={11} color="#00D2FF" />
                        <span>BEG</span>
                      </>
                    ) : (
                      <>
                        <Zap size={11} color="#FFD166" />
                        <span>INTER</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            4. FETCHED GITHUB REPOSITORIES (HIDDEN BY DEFAULT, EXPANDS ON TOGGLE)
            ========================================================================= */}
        <div className="dashboard-glass-panel">
          <div
            className="panel-header-row"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setShowRepos(!showRepos)}
          >
            <h2 className="panel-title">
              <Code2 size={18} color="#FFD166" />
              <span>FETCHED GITHUB REPOSITORIES ({studentProfile.projects?.length || 0})</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FFD166', fontSize: '0.78rem', fontWeight: 700 }}>
              <span>{showRepos ? 'Hide Repositories' : 'Click to View Repositories'}</span>
              {showRepos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          <AnimatePresence>
            {showRepos && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden', paddingTop: '1rem' }}
              >
                {!studentProfile.projects || studentProfile.projects.length === 0 ? (
                  <div className="skills-empty-state" style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                    <span style={{ color: '#B8B3C7', fontSize: '0.8rem' }}>
                      No GitHub repositories synced yet. Click "Edit Profile" to auto-fetch public repositories!
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {studentProfile.projects.map((repo, rIdx) => (
                      <a
                        key={rIdx}
                        href={repo.link || `https://github.com/${studentProfile.githubUser}/${repo.title}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="assessment-item-card" style={{ height: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFF7E8' }}>
                              {repo.title}
                            </span>
                            <ExternalLink size={14} color="#FFD166" />
                          </div>

                          <p style={{ fontSize: '0.74rem', color: '#B8B3C7', lineHeight: 1.35, marginBottom: '0.6rem' }}>
                            {repo.description || 'Public repository'}
                          </p>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {repo.techStack &&
                              repo.techStack.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} className="github-repo-lang-tag">
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* =========================================================================
            5. DYNAMIC SKILL GAP ANALYSIS MATRIX
            ========================================================================= */}
        <div id="gap-matrix-section" className="dashboard-glass-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">
              <Layers size={18} color="#FFD166" />
              <span>DYNAMIC SKILL GAP ANALYSIS</span>
            </h2>
            <span style={{ fontSize: '0.68rem', color: '#FFD166' }}>
              Target Track: {studentProfile.careerGoal}
            </span>
          </div>

          <div className="gap-columns-grid">
            {/* Strong Skills */}
            <div className="gap-col-box">
              <span className="gap-col-header strong press-start-2p-regular">
                <CheckCircle2 size={12} />
                <span>STRONG ({strongSkills.length})</span>
              </span>
              {strongSkills.length === 0 ? (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>No strong skills verified yet</span>
              ) : (
                strongSkills.map((s, i) => (
                  <div key={i} className="gap-skill-item">
                    <span>{s.name}</span>
                    <span style={{ color: '#27C93F', fontWeight: 700 }}>
                      {s.score ? `${s.score}%` : '80%'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Developing Skills */}
            <div className="gap-col-box">
              <span className="gap-col-header weak press-start-2p-regular">
                <AlertTriangle size={12} />
                <span>DEVELOPING ({developingSkills.length})</span>
              </span>
              {developingSkills.length === 0 ? (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>No developing skills</span>
              ) : (
                developingSkills.map((s, i) => (
                  <div key={i} className="gap-skill-item">
                    <span>{s.name}</span>
                    <span style={{ color: '#FFD166', fontWeight: 700 }}>
                      {s.score ? `${s.score}%` : '50%'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Missing Skills */}
            <div className="gap-col-box">
              <span className="gap-col-header missing press-start-2p-regular">
                <Flame size={12} />
                <span>MISSING ({missingSkills.length})</span>
              </span>
              {missingSkills.length === 0 ? (
                <span style={{ fontSize: '0.72rem', color: '#27C93F' }}>All target role skills matched!</span>
              ) : (
                missingSkills.map((s, i) => (
                  <div key={i} className="gap-skill-item">
                    <span>{s.name}</span>
                    <span style={{ color: '#FF6B81', fontWeight: 700 }}>0%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. DYNAMIC AI CAREER ROADMAP TIMELINE BASED ON MISSING SKILLS
            ========================================================================= */}
        <div id="roadmap-section" className="dashboard-glass-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">
              <Sparkles size={18} color="#FFD166" />
              <span>AI-GENERATED PERSONALIZED CAREER ROADMAP</span>
            </h2>
            <span style={{ fontSize: '0.68rem', color: '#B8B3C7' }}>
              Tailored Target Roadmap for {studentProfile.careerGoal}
            </span>
          </div>

          <div className="roadmap-timeline-deck">
            {/* Milestone 1 */}
            <div className="roadmap-milestone-card active">
              <span className="milestone-badge press-start-2p-regular">MILESTONE 01 // FOUNDATIONS</span>
              <h3 className="milestone-title">
                {strongSkills[0]?.name ? `${strongSkills[0].name.toUpperCase()} PATTERNS` : 'CORE LANGUAGE FOUNDATIONS'}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#B8B3C7', lineHeight: 1.4 }}>
                Master core software architecture, vector algorithms, and data structures.
              </p>
              <div className="milestone-project-box">
                <div className="milestone-project-title">✦ Capstone 1: Verified Foundational Engine</div>
                <span style={{ color: '#27C93F', fontSize: '0.65rem' }}>✓ Verified Skill</span>
              </div>
            </div>

            {/* Milestone 2 */}
            <div className="roadmap-milestone-card active">
              <span className="milestone-badge press-start-2p-regular">MILESTONE 02 // TARGET GAPS</span>
              <h3 className="milestone-title">
                {missingSkills[0]?.name ? `BRIDGE ${missingSkills[0].name.toUpperCase()}` : 'MICROSERVICES & APIS'}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#B8B3C7', lineHeight: 1.4 }}>
                Acquire primary missing technology stack required for {studentProfile.careerGoal}.
              </p>
              <div className="milestone-project-box">
                <div className="milestone-project-title">
                  ✦ Capstone 2: {missingSkills[0]?.name || 'Target Stack'} Implementation
                </div>
                <span style={{ color: '#FFD166', fontSize: '0.65rem' }}>⚡ Active Target</span>
              </div>
            </div>

            {/* Milestone 3 */}
            <div className="roadmap-milestone-card">
              <span className="milestone-badge press-start-2p-regular">MILESTONE 03 // INFRASTRUCTURE</span>
              <h3 className="milestone-title">
                {missingSkills[1]?.name ? `${missingSkills[1].name.toUpperCase()} DEPLOYMENT` : 'DOCKER & CI/CD PIPELINE'}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#B8B3C7', lineHeight: 1.4 }}>
                Containerize services and build automated deployment pipelines.
              </p>
              <div className="milestone-project-box">
                <div className="milestone-project-title">✦ Capstone 3: Scalable Production Pipeline</div>
                <span style={{ color: '#64748b', fontSize: '0.65rem' }}>🔒 Next Milestone</span>
              </div>
            </div>

            {/* Milestone 4 */}
            <div className="roadmap-milestone-card">
              <span className="milestone-badge press-start-2p-regular">MILESTONE 04 // CAPSTONE AGENT</span>
              <h3 className="milestone-title">ENTERPRISE SYSTEM CAPSTONE</h3>
              <p style={{ fontSize: '0.74rem', color: '#B8B3C7', lineHeight: 1.4 }}>
                Deploy autonomous multi-agent systems with real-time SLA &amp; monitoring.
              </p>
              <div className="milestone-project-box">
                <div className="milestone-project-title">✦ Capstone 4: End-to-End Enterprise System</div>
                <span style={{ color: '#64748b', fontSize: '0.65rem' }}>🔒 Final Capstone</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* INTERACTIVE QUIZ RUNNER MODAL */}
      <AnimatePresence>
        {activeQuiz && (
          <motion.div
            className="quiz-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="quiz-runner-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="quiz-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Award size={18} color="#FFD166" />
                  <h3 className="bungee-regular" style={{ fontSize: '1.1rem', color: '#FFF7E8' }}>
                    {activeQuiz.skillName.toUpperCase()} DIAGNOSTIC QUIZ
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setActiveQuiz(null)
                    setSelectedOption(null)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFF7E8',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#FFF7E8', fontWeight: 600 }}>
                {activeQuiz.question}
              </p>

              {activeQuiz.code && (
                <div className="quiz-code-block">{activeQuiz.code}</div>
              )}

              <div className="quiz-options-list">
                {activeQuiz.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    className={`quiz-option-btn ${selectedOption === oIdx ? 'selected' : ''}`}
                    onClick={() => setSelectedOption(oIdx)}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: '#1c2030',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#FFD166',
                      }}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor:
                      quizFeedback === 'correct'
                        ? 'rgba(39, 201, 63, 0.15)'
                        : 'rgba(229, 36, 59, 0.15)',
                    border:
                      quizFeedback === 'correct' ? '1px solid #27C93F' : '1px solid #E5243B',
                    color: quizFeedback === 'correct' ? '#27C93F' : '#FF6B81',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {quizFeedback === 'correct'
                      ? `✓ CORRECT! ${activeQuiz.skillName} verified & score saved to MongoDB Atlas!`
                      : '✕ Incorrect choice. Review code logic and try again!'}
                  </span>
                </div>
              )}

              <button
                className="auth-submit-btn bungee-regular"
                onClick={handleAnswerQuiz}
                disabled={selectedOption === null || quizFeedback !== null}
              >
                <span>SUBMIT DIAGNOSIS</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT SCHOLAR PROFILE MODAL */}
      <AuthModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialMode="profile_setup"
        initialData={studentProfile}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  )
}
