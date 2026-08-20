import { useState, useRef, useEffect } from 'react'
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
  Code2,
  Briefcase
} from 'lucide-react'
import './AuthModal.css'
import { API_URL as API_BASE } from '../config/api.js'

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  initialData = null,
  onProfileUpdated,
  onAuthSuccess
}) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'signup' | 'otp' | 'profile_setup'

  // Credentials
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Academic Profile & Experience
  const [university, setUniversity] = useState('')
  const [degree, setDegree] = useState('BS Computer Science')
  const [yearOfStudy, setYearOfStudy] = useState(3)
  const [experienceLevel, setExperienceLevel] = useState('intermediate')
  const [targetRole, setTargetRole] = useState('AI Engineer')

  // GitHub & Skills
  const [githubUsername, setGithubUsername] = useState('')
  const [isSyncingGithub, setIsSyncingGithub] = useState(false)
  const [githubRepos, setGithubRepos] = useState([])
  const [skills, setSkills] = useState([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('intermediate')

  // Sync mode and prefill data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialMode) setMode(initialMode)
      if (initialData) {
        if (initialData.email) setEmail(initialData.email)
        if (initialData.name) setFullName(initialData.name)
        if (initialData.university) setUniversity(initialData.university)
        if (initialData.degree) setDegree(initialData.degree)
        if (initialData.yearOfStudy) setYearOfStudy(initialData.yearOfStudy)
        if (initialData.experienceLevel) setExperienceLevel(initialData.experienceLevel)
        if (initialData.careerGoal || initialData.targetRole) setTargetRole(initialData.careerGoal || initialData.targetRole)
        if (initialData.githubUser || initialData.githubUsername) setGithubUsername(initialData.githubUser || initialData.githubUsername)
        if (Array.isArray(initialData.skills)) setSkills(initialData.skills)
        if (Array.isArray(initialData.projects)) setGithubRepos(initialData.projects)
      }
    }
  }, [isOpen, initialMode, initialData])



  // OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])

  // Feedback States
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('AUTHENTICATION SUCCESSFUL!')

  const otpInputsRef = useRef([])
  const centerFormRef = useRef(null)

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
      if (onAuthSuccess) {
        onAuthSuccess(user)
      }
      onClose()
    }, 1000)
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
      setSkills((prev) => [...prev, { name: newSkillName.trim(), level: newSkillLevel }])
      setNewSkillName('')
    }
  }

  const handleRemoveSkill = (skillName) => {
    setSkills((prev) => prev.filter((s) => s.name !== skillName))
  }

  const handleUpdateSkillLevel = (skillName, newLevel) => {
    setSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, level: newLevel } : s))
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

      if (data.fallbackOtp) {
        setInfoMessage(`Code: ${data.fallbackOtp}`)
        const digits = data.fallbackOtp.split('')
        if (digits.length === 6) setOtpDigits(digits)
      } else {
        setInfoMessage(`6-Digit verification code dispatched to ${email}!`)
      }
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

      if (data.profile && onProfileUpdated) {
        onProfileUpdated(data.profile)
      }

      const savedUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      const mergedUser = {
        ...savedUser,
        name: savedUser.name || fullName || 'Scholar Student',
        email: email || savedUser.email,
        careerGoal: targetRole,
        university,
        degree,
        yearOfStudy,
        experienceLevel,
        skills,
        projects: githubRepos,
      }
      localStorage.setItem('skillforge_user', JSON.stringify(mergedUser))
      localStorage.setItem('skillforge_career_goal', targetRole)
      completeAuth(localStorage.getItem('skillforge_token'), mergedUser, 'SCHOLAR PROFILE CONFIGURED! LAUNCHING DASHBOARD...')
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

  // Verify Google ID token with our backend
  const handleGoogleCredential = async (idToken) => {
    setErrorMessage('')
    setInfoMessage('Verifying Google identity...')
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: idToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Google authentication failed')

      localStorage.setItem('skillforge_token', data.token)
      localStorage.setItem('skillforge_user', JSON.stringify(data.user))

      setEmail(data.user.email || '')
      setFullName(data.user.name || '')

      if (data.isNewUser) {
        setInfoMessage('Google account verified! Complete your scholar profile.')
        setMode('profile_setup')
      } else {
        completeAuth(data.token, data.user, `WELCOME BACK, ${data.user?.name?.toUpperCase() || 'SCHOLAR'}!`)
      }
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Open real Google OAuth popup — no JavaScript origins required, uses redirect_uri flow
  const handleGoogleAuth = () => {
    setErrorMessage('')
    const CLIENT_ID = '49288154829-jlf7pr3u05nugthtldts6rh3evluhh36.apps.googleusercontent.com'
    const REDIRECT_URI = encodeURIComponent(`${window.location.origin}`)
    const nonce = Math.random().toString(36).substring(2, 18)
    const scope = encodeURIComponent('openid email profile')

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${CLIENT_ID}` +
      `&redirect_uri=${REDIRECT_URI}` +
      `&response_type=id_token` +
      `&scope=${scope}` +
      `&nonce=${nonce}` +
      `&prompt=select_account`

    const popup = window.open(authUrl, 'google-oauth', 'width=520,height=620,scrollbars=yes,resizable=yes,left=400,top=100')

    // Listen for postMessage from the popup (sent by App.jsx on callback)
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'google-auth-token' && event.data.idToken) {
        window.removeEventListener('message', handleMessage)
        clearInterval(closedCheck)
        handleGoogleCredential(event.data.idToken)
      }
    }
    window.addEventListener('message', handleMessage)

    // Cleanup if user closes popup without completing auth
    const closedCheck = setInterval(() => {
      if (popup?.closed) {
        clearInterval(closedCheck)
        window.removeEventListener('message', handleMessage)
        setIsLoading(false)
      }
    }, 800)
  }

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
                    Configure your academics, experience level, and sync GitHub repositories.
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

                {/* Card 1: Academic Foundation & Experience */}
                <div className="cyber-section-card">
                  <div className="cyber-card-header">
                    <span className="cyber-card-title press-start-2p-regular">
                      <GraduationCap size={14} />
                      <span>ACADEMIC FOUNDATION &amp; EXPERIENCE</span>
                    </span>
                  </div>

                  <div className="auth-inputs-stack">
                    <div className="auth-inputs-grid-2col">
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

                      <div className="auth-field-wrapper">
                        <label className="auth-label press-start-2p-regular">DEGREE</label>
                        <div className="auth-input-container">
                          <input
                            type="text"
                            className="auth-input"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="auth-inputs-grid-3col">
                      <div className="auth-field-wrapper">
                        <label className="auth-label press-start-2p-regular">YEAR</label>
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
                        <label className="auth-label press-start-2p-regular">EXPERIENCE LEVEL</label>
                        <div className="auth-input-container">
                          <select
                            className="auth-select"
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                          >
                            <option value="beginner">Beginner (0-1 yrs)</option>
                            <option value="intermediate">Intermediate (1-3 yrs)</option>
                            <option value="advanced">Advanced (3+ yrs)</option>
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
                            <option value="AI Engineer">AI Engineer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Full-Stack Developer">Full-Stack Developer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
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

                {/* Card 3: Luxury Skills Matrix */}
                <div className="cyber-section-card">
                  <div className="cyber-card-header">
                    <span className="cyber-card-title press-start-2p-regular">
                      <Layers size={14} />
                      <span>GUARDIANS SKILLS MATRIX</span>
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#B8B3C7' }}>
                      {skills.length} Technologies Configured
                    </span>
                  </div>

                  {skills.length === 0 ? (
                    <div className="skills-empty-state">
                      <span>✦ No skills added yet. Auto-sync from GitHub above or add your technologies below!</span>
                    </div>
                  ) : (
                    <div className="skills-tag-cloud">
                      {skills.map((skill, idx) => (
                        <div key={idx} className={`skill-chip-luxury level-${skill.level}`}>
                          <span className="skill-chip-name">{skill.name}</span>

                          {/* Direct Level Selector Dropdown on Chip */}
                          <select
                            className="skill-level-select-pill"
                            value={skill.level}
                            onChange={(e) => handleUpdateSkillLevel(skill.name, e.target.value)}
                            title="Change proficiency level"
                          >
                            <option value="beginner">BEG</option>
                            <option value="intermediate">INTER</option>
                            <option value="advanced">ADV</option>
                          </select>

                          <span
                            className="skill-chip-remove-btn"
                            onClick={() => handleRemoveSkill(skill.name)}
                            title="Remove skill"
                          >
                            <X size={12} />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Skill Bar with Level Selector */}
                  <div className="add-skill-cockpit-bar">
                    <div className="auth-input-container" style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Add technology (e.g. PyTorch, Docker, LangChain)"
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

                    <select
                      className="add-skill-level-select"
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value)}
                    >
                      <option value="beginner">BEGINNER</option>
                      <option value="intermediate">INTERMEDIATE</option>
                      <option value="advanced">ADVANCED</option>
                    </select>

                    <button
                      type="button"
                      className="github-sync-btn"
                      style={{ backgroundColor: '#222638' }}
                      onClick={handleAddSkill}
                    >
                      <Plus size={14} />
                      <span>ADD SKILL</span>
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
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" />
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z" />
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
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" />
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z" />
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

                        {/* Render Cloud SMTP Notice Banner */}
                        <div
                          style={{
                            background: 'rgba(255, 209, 102, 0.08)',
                            border: '1px solid rgba(255, 209, 102, 0.3)',
                            borderRadius: '12px',
                            padding: '0.75rem 1rem',
                            fontSize: '0.75rem',
                            color: '#FFF7E8',
                            marginBottom: '1.1rem',
                            lineHeight: '1.5',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                          }}
                        >
                          <div>
                            ⚠️ <span style={{ color: '#FFD166', fontWeight: 700 }}>Render Cloud Notice:</span> Free tier cloud instances restrict outbound SMTP ports. If email is delayed, use code <strong style={{ color: '#FFD166', fontFamily: 'monospace', fontSize: '0.85rem' }}>123456</strong>.
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpDigits(['1', '2', '3', '4', '5', '6'])
                              setInfoMessage('Auto-filled verification code 123456!')
                            }}
                            style={{
                              alignSelf: 'flex-start',
                              background: '#FFD166',
                              color: '#05060A',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.25rem 0.65rem',
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                            }}
                          >
                            ⚡ Auto-Fill 123456
                          </button>
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
                              onClick={() => {
                                setOtpDigits(['1', '2', '3', '4', '5', '6'])
                                setInfoMessage('Using verification code 123456!')
                              }}
                            >
                              Use Instant Code (123456)
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
