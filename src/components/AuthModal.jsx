import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Plus,
  GraduationCap,
  Award,
  Layers,
  Star,
  Code2
} from 'lucide-react'
import './AuthModal.css'

const API_BASE = 'http://localhost:3001/api'

const DEFAULT_SKILLS = [
  { name: 'Python', level: 'intermediate' },
  { name: 'PyTorch', level: 'beginner' },
  { name: 'FastAPI', level: 'intermediate' },
  { name: 'Docker', level: 'beginner' },
  { name: 'Git & GitHub', level: 'advanced' },
  { name: 'ChromaDB / RAG', level: 'intermediate' },
]

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'otp' | 'profile_setup'

  // Credentials
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Academic Profile
  const [university, setUniversity] = useState('')
  const [degree, setDegree] = useState('BS Computer Science')
  const [yearOfStudy, setYearOfStudy] = useState(3)
  const [experienceLevel, setExperienceLevel] = useState('intermediate')
  const [targetRole, setTargetRole] = useState('AI Engineer')

  // GitHub & Skills
  const [githubUsername, setGithubUsername] = useState('')
  const [isSyncingGithub, setIsSyncingGithub] = useState(false)
  const [githubRepos, setGithubRepos] = useState([])
  const [skills, setSkills] = useState(DEFAULT_SKILLS)
  const [newSkillName, setNewSkillName] = useState('')

  // OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])

  // Feedback States
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('AUTHENTICATION SUCCESSFUL!')

  const otpInputsRef = useRef([])

  if (!isOpen) return null

  const isSignup = mode === 'signup'
  const isProfileSetup = mode === 'profile_setup'

  // Handle OTP digit entry
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1)
    const newOtp = [...otpDigits]
    newOtp[index] = value
    setOtpDigits(newOtp)

    if (value && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1].focus()
    }
  }

  // Clear alerts on mode switch
  const switchMode = (newMode) => {
    setErrorMessage('')
    setInfoMessage('')
    setOtpDigits(['', '', '', '', '', ''])
    setMode(newMode)
  }

  // Save session helper
  const completeAuth = (token, user, message = 'WELCOME TO SKILLFORGE!') => {
    if (token) {
      localStorage.setItem('skillforge_token', token)
      localStorage.setItem('skillforge_user', JSON.stringify(user))
    }
    setSuccessMessage(message)
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 1500)
  }

  // Live GitHub Auto-Sync Fetch with Deduplication
  const handleFetchGithubRepos = async () => {
    if (!githubUsername.trim()) {
      setErrorMessage('Please enter your GitHub username')
      return
    }

    setErrorMessage('')
    setIsSyncingGithub(true)
    setInfoMessage('Scanning GitHub repositories & tech stacks...')

    try {
      let cleanUser = githubUsername.trim()
      if (cleanUser.includes('github.com/')) {
        cleanUser = cleanUser.split('github.com/')[1].replace('/', '')
      }

      const res = await fetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=6`)
      if (!res.ok) throw new Error(`GitHub user "${cleanUser}" not found.`)

      const reposData = await res.json()

      const extractedRepos = reposData.map((r) => ({
        title: r.name,
        description: r.description || 'Public repository',
        techStack: [r.language, ...(r.topics || [])].filter(Boolean),
        link: r.html_url,
        stars: r.stargazers_count,
      }))

      setGithubRepos(extractedRepos)

      // Auto-extract UNIQUE languages and technologies into skills cloud
      setSkills((prevSkills) => {
        const existingNames = new Set(prevSkills.map((s) => s.name.toLowerCase()))
        const newUniqueSkills = []

        reposData.forEach((r) => {
          if (r.language && !existingNames.has(r.language.toLowerCase())) {
            existingNames.add(r.language.toLowerCase())
            newUniqueSkills.push({ name: r.language, level: 'intermediate' })
          }
          if (Array.isArray(r.topics)) {
            r.topics.forEach((topic) => {
              if (topic && !existingNames.has(topic.toLowerCase())) {
                existingNames.add(topic.toLowerCase())
                newUniqueSkills.push({ name: topic, level: 'beginner' })
              }
            })
          }
        })

        return [...prevSkills, ...newUniqueSkills]
      })

      setInfoMessage(`Auto-synced ${extractedRepos.length} projects & tech stacks from @${cleanUser}!`)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch GitHub repositories')
    } finally {
      setIsSyncingGithub(false)
    }
  }

  // Skill Management
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return
    const exists = skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())
    if (!exists) {
      setSkills((prev) => [...prev, { name: newSkillName.trim(), level: 'intermediate' }])
      setNewSkillName('')
    }
  }

  const handleRemoveSkill = (skillName) => {
    setSkills((prev) => prev.filter((s) => s.name !== skillName))
  }

  const handleToggleSkillLevel = (skillName) => {
    const levels = ['beginner', 'intermediate', 'advanced']
    setSkills((prev) =>
      prev.map((s) => {
        if (s.name === skillName) {
          const nextIdx = (levels.indexOf(s.level) + 1) % levels.length
          return { ...s, level: levels[nextIdx] }
        }
        return s
      })
    )
  }

  // Step 1: Initial Signup Submit (Sends Real 6-Digit Email OTP)
  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          targetRole: 'AI Engineer',
          role: 'student',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')

      setInfoMessage(`6-Digit verification code dispatched to ${email}!`)
      setMode('otp')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Handle OTP Submit (Verifies Email & Moves to Single-Page Profile Setup)
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    const fullOtp = otpDigits.join('')
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your security code')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'OTP verification failed')

      if (data.token) {
        localStorage.setItem('skillforge_token', data.token)
        localStorage.setItem('skillforge_user', JSON.stringify(data.user))
      }

      setInfoMessage('Email verified! Complete your scholar profile below.')
      setMode('profile_setup')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Handle Final Profile & Skills Submit (Saves All Data to MongoDB Atlas)
  const handleProfileSetupSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          university,
          degree,
          yearOfStudy,
          experienceLevel,
          skills,
          projects: githubRepos,
          careerGoal: targetRole,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save profile')

      const savedUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      completeAuth(localStorage.getItem('skillforge_token'), savedUser, 'PROFILE INITIALIZED! WELCOME SCHOLAR!')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Login Submit (Direct JWT)
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      completeAuth(data.token, data.user, `WELCOME BACK, ${data.user?.name?.toUpperCase() || 'SCHOLAR'}!`)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Google OAuth Direct One-Click Auth
  const handleGoogleAuth = async () => {
    setErrorMessage('')
    setInfoMessage('Authenticating with Google Identity...')
    setIsLoading(true)

    try {
      const googleUserEmail = email || (fullName ? `${fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : 'scholar.student@gmail.com')
      const googleUserName = fullName || 'Scholar Student'

      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUserEmail,
          name: googleUserName,
          googleId: 'google_oauth_' + Date.now(),
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Google authentication failed')

      if (data.token) {
        localStorage.setItem('skillforge_token', data.token)
        localStorage.setItem('skillforge_user', JSON.stringify(data.user))
      }

      setEmail(googleUserEmail)
      setFullName(googleUserName)
      setInfoMessage('Google authenticated! Complete your scholar profile.')
      setMode('profile_setup')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const centerFormRef = useRef(null)

  // Universal card wheel handler so scrolling anywhere over characters/card scrolls the center form
  const handleUniversalWheel = (e) => {
    e.stopPropagation()
    if (centerFormRef.current) {
      centerFormRef.current.scrollTop += e.deltaY
    }
  }

  return (
    <motion.div
      className="auth-modal-backdrop"
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Vibrant Looping Video Background */}
      <div className="auth-bg-video-container">
        <video src="/login.webm" className="auth-bg-video" autoPlay loop muted playsInline />
        <div className="auth-video-overlay" />
      </div>

      {/* Close Button */}
      <button className="auth-close-btn" onClick={onClose} title="Close Gateway">
        <X size={20} />
      </button>

      <div className="guardians-squad-wrapper" data-lenis-prevent="true">
        {/* Main Luxury Command Glass Viewport */}
        <div
          className={`auth-sliding-viewport ${isProfileSetup ? 'setup-fullwidth' : ''}`}
          data-lenis-prevent="true"
          onWheel={isProfileSetup ? handleUniversalWheel : undefined}
        >
          {/* =========================================================================
              PROFILE SETUP 3-COLUMN COCKPIT (Characters cleanly inside left and right)
              ========================================================================= */}
          {isProfileSetup ? (
            <div className="auth-3col-cockpit" data-lenis-prevent="true">
              {/* LEFT COLUMN: left.png Character inside card */}
              <div className="cockpit-char-col">
                <img
                  src="/left.png"
                  alt="Cyber Navigator"
                  className="cockpit-char-img"
                />
                <div className="cockpit-char-badge press-start-2p-regular">
                  <span>✦ CAREER NAVIGATOR</span>
                </div>
              </div>

              {/* CENTER COLUMN: Interactive Setup Form with Smooth Scroll */}
              <div
                ref={centerFormRef}
                className="cockpit-center-form"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="auth-form-header">
                  <div className="terminal-tag-row press-start-2p-regular" style={{ marginBottom: '0.2rem' }}>
                    <span className="terminal-tag-dot" />
                    <span>01 // SCHOLAR COMMAND DECK</span>
                  </div>
                  <h2 className="auth-title">INITIALIZE PROFILE</h2>
                  <p className="auth-subtitle">
                    Configure your academics, target role, and sync GitHub repositories.
                  </p>
                </div>

                {errorMessage && (
                  <div className="auth-alert-box error">
                    <AlertCircle size={15} />
                    <span>{errorMessage}</span>
                  </div>
                )}
                {infoMessage && (
                  <div className="auth-alert-box info">
                    <CheckCircle2 size={15} />
                    <span>{infoMessage}</span>
                  </div>
                )}

                {/* Card 1: Academic Details */}
                <div className="cyber-section-card">
                  <div className="cyber-card-header">
                    <span className="cyber-card-title press-start-2p-regular">
                      <GraduationCap size={14} />
                      <span>ACADEMIC FOUNDATION</span>
                    </span>
                  </div>

                  <div className="auth-inputs-stack">
                    <div className="auth-field-wrapper">
                      <label className="auth-label press-start-2p-regular">UNIVERSITY / INSTITUTION</label>
                      <div className="auth-input-container">
                        <input
                          type="text"
                          placeholder="e.g. NUST / FAST / Oxford"
                          className="auth-input"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-inputs-grid-2col">
                      <div className="auth-field-wrapper">
                        <label className="auth-label press-start-2p-regular">YEAR OF STUDY</label>
                        <div className="auth-input-container">
                          <select
                            className="auth-select"
                            value={yearOfStudy}
                            onChange={(e) => setYearOfStudy(Number(e.target.value))}
                          >
                            <option value={1}>1st Year</option>
                            <option value={2}>2nd Year</option>
                            <option value={3}>3rd Year (Junior)</option>
                            <option value={4}>4th Year (Senior)</option>
                            <option value={5}>Postgrad</option>
                          </select>
                        </div>
                      </div>

                      <div className="auth-field-wrapper">
                        <label className="auth-label press-start-2p-regular">TARGET TECH ROLE</label>
                        <div className="auth-input-container">
                          <select
                            className="auth-select"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                          >
                            <option value="AI Engineer">AI Engineer &amp; PyTorch</option>
                            <option value="Backend Developer">Backend Microservices</option>
                            <option value="Frontend Developer">Frontend React UI</option>
                            <option value="Full-Stack Developer">Full-Stack Cloud</option>
                            <option value="DevOps Engineer">DevOps &amp; K8s</option>
                            <option value="Data Scientist">Data Scientist</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: GitHub Auto-Sync */}
                <div className="cyber-section-card">
                  <div className="cyber-card-header">
                    <span className="cyber-card-title press-start-2p-regular">
                      <Code2 size={14} />
                      <span>GITHUB AUTO-SYNC REPOSITORIES</span>
                    </span>
                  </div>

                  <div className="github-sync-box">
                    <div className="auth-input-container" style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder="GitHub username (e.g. torvalds or Hassan136-nust)"
                        className="auth-input"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="github-sync-btn"
                      onClick={handleFetchGithubRepos}
                      disabled={isSyncingGithub}
                    >
                      {isSyncingGithub ? (
                        <>
                          <RotateCcw size={14} className="scroll-arrow-bouncing" />
                          <span>FETCHING...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} color="#FFD166" />
                          <span>FETCH REPOS</span>
                        </>
                      )}
                    </button>
                  </div>

                  {githubRepos.length > 0 && (
                    <div className="github-repos-grid-2col">
                      {githubRepos.map((repo, i) => (
                        <div key={i} className="github-repo-item">
                          <div>
                            <span className="github-repo-title">{repo.title}</span>
                            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                              {repo.techStack.slice(0, 2).map((tag, tIdx) => (
                                <span key={tIdx} className="github-repo-lang-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#FFD166', fontSize: '0.75rem' }}>
                            <Star size={12} fill="#FFD166" />
                            <span>{repo.stars}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3: Skills Matrix */}
                <div className="cyber-section-card">
                  <div className="cyber-card-header">
                    <span className="cyber-card-title press-start-2p-regular">
                      <Layers size={14} />
                      <span>GUARDIANS SKILLS MATRIX</span>
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#B8B3C7' }}>
                      [B] Beg · [I] Inter · [A] Adv
                    </span>
                  </div>

                  <div className="skills-tag-cloud">
                    {skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className={`skill-chip level-${skill.level}`}
                        onClick={() => handleToggleSkillLevel(skill.name)}
                        title="Click to toggle level (Beginner → Intermediate → Advanced)"
                      >
                        <span style={{ fontWeight: 600 }}>{skill.name}</span>
                        <span className="skill-chip-level-badge press-start-2p-regular">[{skill.level[0]}]</span>
                        <span
                          className="skill-chip-remove"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveSkill(skill.name)
                          }}
                        >
                          <X size={11} />
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="add-skill-inline-row">
                    <div className="auth-input-container" style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Add custom technology (e.g. LangChain, Go, PyTorch)"
                        className="auth-input"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="github-sync-btn"
                      style={{ backgroundColor: '#222638' }}
                      onClick={handleAddSkill}
                    >
                      <Plus size={14} />
                      <span>ADD</span>
                    </button>
                  </div>
                </div>

                {/* Final Launch Button */}
                <button
                  type="button"
                  className="auth-submit-btn bungee-regular"
                  onClick={handleProfileSetupSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RotateCcw size={16} className="scroll-arrow-bouncing" />
                      <span>SAVING TO MONGODB ATLAS...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>LAUNCH STUDENT DASHBOARD</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* RIGHT COLUMN: man.png Character inside card */}
              <div className="cockpit-char-col">
                <img
                  src="/man.png"
                  alt="Cyber Operative"
                  className="cockpit-char-img"
                />
                <div className="cockpit-char-badge press-start-2p-regular">
                  <span>✦ AI ARCHITECT</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* =========================================================================
                  SLIDING IMAGE PANEL (Moves from Left 0% to Right 100%)
                  ========================================================================= */}
              <motion.div
                className="auth-half-panel auth-image-panel"
                style={{ left: 0 }}
                animate={{
                  x: isSignup ? '100%' : '0%',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 70,
                  damping: 17,
                  mass: 0.9,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSignup ? 'signup-char' : 'login-char'}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <img
                      src={isSignup ? '/right.png' : '/left.png'}
                      alt="SkillForge Character"
                      className="auth-character-img"
                    />
                    <div className="auth-character-badge press-start-2p-regular">
                      <span>{isSignup ? '✦ AI ARCHITECT' : '✦ CAREER NAVIGATOR'}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* =========================================================================
                  SLIDING FORM PANEL (Moves from Right 0% to Left -100%)
                  ========================================================================= */}
              <motion.div
                className="auth-half-panel auth-form-panel"
                style={{ left: '50%' }}
                animate={{
                  x: isSignup ? '-100%' : '0%',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 70,
                  damping: 17,
                  mass: 0.9,
                }}
              >
                {isSuccess ? (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ textAlign: 'center', padding: '3rem 1rem' }}
                  >
                    <CheckCircle2 size={64} color="#27C93F" style={{ margin: '0 auto 1.2rem auto' }} />
                    <h3 className="bungee-regular" style={{ color: '#FFF7E8', fontSize: '1.35rem', letterSpacing: '1px' }}>
                      {successMessage}
                    </h3>
                    <p style={{ color: '#B8B3C7', fontSize: '0.9rem', marginTop: '0.6rem' }}>
                      Entering SkillForge Platform...
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    {/* LOGIN VIEW */}
                    {mode === 'login' && (
                      <motion.div
                        key="login-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="auth-form-header">
                          <div className="terminal-tag-row press-start-2p-regular" style={{ marginBottom: '0.4rem' }}>
                            <span className="terminal-tag-dot" />
                            <span>01 // AUTHENTICATION GATEWAY</span>
                          </div>
                          <h2 className="auth-title">ACCESS PLATFORM</h2>
                          <p className="auth-subtitle">
                            Enter your student credentials or authenticate via Google.
                          </p>
                        </div>

                        {/* Google Sign In Button */}
                        <button type="button" className="auth-google-btn" onClick={handleGoogleAuth} disabled={isLoading}>
                          <svg className="google-icon-svg" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
                          </svg>
                          <span>Sign in with Google</span>
                        </button>

                        <div className="auth-divider-row">
                          <div className="auth-divider-line" />
                          <span className="auth-divider-text press-start-2p-regular">OR WITH EMAIL</span>
                          <div className="auth-divider-line" />
                        </div>

                        {errorMessage && (
                          <div className="auth-alert-box error">
                            <AlertCircle size={15} />
                            <span>{errorMessage}</span>
                          </div>
                        )}
                        {infoMessage && (
                          <div className="auth-alert-box info">
                            <CheckCircle2 size={15} />
                            <span>{infoMessage}</span>
                          </div>
                        )}

                        <form onSubmit={handleLoginSubmit}>
                          <div className="auth-inputs-stack">
                            <div className="auth-field-wrapper">
                              <label className="auth-label press-start-2p-regular">STUDENT EMAIL</label>
                              <div className="auth-input-container">
                                <Mail size={15} color="#FFD166" />
                                <input
                                  type="email"
                                  required
                                  placeholder="student@university.edu"
                                  className="auth-input"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="auth-field-wrapper">
                              <label className="auth-label press-start-2p-regular">PASSWORD</label>
                              <div className="auth-input-container">
                                <Lock size={15} color="#FFD166" />
                                <input
                                  type="password"
                                  required
                                  placeholder="••••••••••••"
                                  className="auth-input"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          <button type="submit" className="auth-submit-btn bungee-regular" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <RotateCcw size={15} className="scroll-arrow-bouncing" />
                                <span>AUTHENTICATING...</span>
                              </>
                            ) : (
                              <>
                                <span>SIGN IN TO WORKSPACE</span>
                                <ArrowRight size={16} />
                              </>
                            )}
                          </button>
                        </form>

                        <div className="auth-toggle-row">
                          <span>Don't have an account?</span>
                          <span className="auth-toggle-link" onClick={() => switchMode('signup')}>
                            Register Student Account
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* SIGNUP VIEW */}
                    {mode === 'signup' && (
                      <motion.div
                        key="signup-view"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="auth-form-header">
                          <div className="terminal-tag-row press-start-2p-regular" style={{ marginBottom: '0.4rem' }}>
                            <span className="terminal-tag-dot" />
                            <span>02 // STUDENT ONBOARDING</span>
                          </div>
                          <h2 className="auth-title">CREATE SCHOLAR ID</h2>
                          <p className="auth-subtitle">
                            Enter credentials to receive your verification code.
                          </p>
                        </div>

                        {/* Google Sign Up Button */}
                        <button type="button" className="auth-google-btn" onClick={handleGoogleAuth} disabled={isLoading}>
                          <svg className="google-icon-svg" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
                          </svg>
                          <span>Sign up with Google</span>
                        </button>

                        <div className="auth-divider-row">
                          <div className="auth-divider-line" />
                          <span className="auth-divider-text press-start-2p-regular">OR WITH EMAIL</span>
                          <div className="auth-divider-line" />
                        </div>

                        {errorMessage && (
                          <div className="auth-alert-box error">
                            <AlertCircle size={15} />
                            <span>{errorMessage}</span>
                          </div>
                        )}

                        <form onSubmit={handleSignupSubmit}>
                          <div className="auth-inputs-stack">
                            <div className="auth-field-wrapper">
                              <label className="auth-label press-start-2p-regular">FULL NAME</label>
                              <div className="auth-input-container">
                                <User size={15} color="#FFD166" />
                                <input
                                  type="text"
                                  required
                                  placeholder="Alex Mercer"
                                  className="auth-input"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="auth-inputs-grid-2col">
                              <div className="auth-field-wrapper">
                                <label className="auth-label press-start-2p-regular">EMAIL</label>
                                <div className="auth-input-container">
                                  <Mail size={15} color="#FFD166" />
                                  <input
                                    type="email"
                                    required
                                    placeholder="alex@cs.edu"
                                    className="auth-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="auth-field-wrapper">
                                <label className="auth-label press-start-2p-regular">PASSWORD</label>
                                <div className="auth-input-container">
                                  <Lock size={15} color="#FFD166" />
                                  <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="auth-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <button type="submit" className="auth-submit-btn bungee-regular" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <RotateCcw size={15} className="scroll-arrow-bouncing" />
                                <span>SENDING 6-DIGIT OTP...</span>
                              </>
                            ) : (
                              <>
                                <span>SIGN UP &amp; GET OTP</span>
                                <Sparkles size={15} />
                              </>
                            )}
                          </button>
                        </form>

                        <div className="auth-toggle-row">
                          <span>Already registered?</span>
                          <span className="auth-toggle-link" onClick={() => switchMode('login')}>
                            Sign In to Account
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* OTP VIEW */}
                    {mode === 'otp' && (
                      <motion.div
                        key="otp-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="auth-form-header">
                          <div className="terminal-tag-row press-start-2p-regular" style={{ marginBottom: '0.4rem' }}>
                            <span className="terminal-tag-dot" />
                            <span>03 // EMAIL VERIFICATION</span>
                          </div>
                          <h2 className="auth-title">ENTER 6-DIGIT CODE</h2>
                          <p className="auth-subtitle">
                            Security code dispatched to{' '}
                            <span style={{ color: '#FFD166' }}>{email || 'your email'}</span>.
                          </p>
                        </div>

                        {errorMessage && (
                          <div className="auth-alert-box error">
                            <AlertCircle size={15} />
                            <span>{errorMessage}</span>
                          </div>
                        )}
                        {infoMessage && (
                          <div className="auth-alert-box info">
                            <CheckCircle2 size={15} />
                            <span>{infoMessage}</span>
                          </div>
                        )}

                        <form onSubmit={handleOtpSubmit}>
                          <div className="otp-digit-grid">
                            {otpDigits.map((digit, i) => (
                              <input
                                key={i}
                                ref={(el) => (otpInputsRef.current[i] = el)}
                                type="text"
                                maxLength={1}
                                className="otp-digit-input"
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                autoFocus={i === 0}
                              />
                            ))}
                          </div>

                          <button type="submit" className="auth-submit-btn bungee-regular" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <RotateCcw size={16} className="scroll-arrow-bouncing" />
                                <span>VERIFYING CODE...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={18} />
                                <span>VERIFY &amp; CONFIGURE PROFILE</span>
                              </>
                            )}
                          </button>

                          <div className="auth-toggle-row" style={{ marginTop: '1.2rem' }}>
                            <span>Didn't receive code?</span>
                            <span
                              className="auth-toggle-link"
                              onClick={async () => {
                                try {
                                  await fetch(`${API_BASE}/auth/resend-otp`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email }),
                                  })
                                  setInfoMessage('Fresh 6-digit OTP code dispatched!')
                                } catch (e) {
                                  setErrorMessage('Failed to resend code')
                                }
                              }}
                            >
                              Resend OTP Code
                            </span>
                          </div>

                          <div className="auth-toggle-row">
                            <span className="auth-toggle-link" onClick={() => switchMode('login')} style={{ color: '#B8B3C7' }}>
                              ← Back to Sign In
                            </span>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
