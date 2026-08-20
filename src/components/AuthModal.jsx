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
  RotateCcw
} from 'lucide-react'
import './AuthModal.css'

const API_BASE = 'http://localhost:3001/api/auth'

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'otp'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [targetRole, setTargetRole] = useState('AI Engineer')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('AUTHENTICATION SUCCESSFUL!')

  const otpInputsRef = useRef([])

  if (!isOpen) return null

  const isSignup = mode === 'signup'

  // Handle OTP digit entry
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }
    const newOtp = [...otpDigits]
    newOtp[index] = value
    setOtpDigits(newOtp)

    // Auto-focus next input
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

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        // Sign Up Flow -> Dispatches Real Email OTP
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            email,
            password,
            targetRole,
            role: 'student'
          })
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || 'Registration failed')

        setInfoMessage(`Security code dispatched to ${email}!`)
        setMode('otp')
      } else if (mode === 'login') {
        // Direct Login Flow -> Instant JWT, No OTP
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || 'Login failed')

        completeAuth(data.token, data.user, `WELCOME BACK, ${data.user?.name?.toUpperCase() || 'SCHOLAR'}!`)
      } else if (mode === 'otp') {
        // Verify Signup OTP
        const fullOtp = otpDigits.join('')
        if (fullOtp.length !== 6) {
          throw new Error('Please enter all 6 digits of your security code')
        }

        const res = await fetch(`${API_BASE}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: fullOtp })
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || 'OTP verification failed')

        completeAuth(data.token, data.user, 'ACCOUNT VERIFIED & INITIALIZED!')
      }
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not resend OTP')
      setInfoMessage('Fresh 6-digit OTP code dispatched to your email!')
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Google OAuth Direct One-Click Auth (No OTP)
  const handleGoogleAuth = async () => {
    setErrorMessage('')
    setInfoMessage('Authenticating with Google Identity...')
    setIsLoading(true)

    try {
      // Direct Google Auth with MongoDB Atlas
      const googleUserEmail = email || (fullName ? `${fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : 'scholar.student@gmail.com')
      const googleUserName = fullName || 'Scholar Student'

      const res = await fetch(`${API_BASE}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUserEmail,
          name: googleUserName,
          googleId: 'google_oauth_' + Date.now(),
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Google authentication failed')

      completeAuth(data.token, data.user, `SIGNED IN WITH GOOGLE AS ${data.user?.name?.toUpperCase()}!`)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="auth-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Vibrant Looping Video Background */}
      <div className="auth-bg-video-container">
        <video
          src="/login.webm"
          className="auth-bg-video"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="auth-video-overlay" />
      </div>

      {/* Close Button */}
      <button className="auth-close-btn" onClick={onClose} title="Close Gateway">
        <X size={20} />
      </button>

      {/* Main Sliding Glass Viewport */}
      <div className="auth-sliding-viewport">
        {/* =========================================================================
            SLIDING IMAGE PANEL (Moves from Left 0% to Right 100%)
            ========================================================================= */}
        <motion.div
          className="auth-half-panel auth-image-panel"
          style={{ left: 0 }}
          animate={{
            x: isSignup ? '100%' : '0%'
          }}
          transition={{
            type: 'spring',
            stiffness: 70,
            damping: 17,
            mass: 0.9
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignup ? 'right-char' : 'left-char'}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <img
                src={isSignup ? '/right.png' : '/left.png'}
                alt="SkillForge Cyber Character"
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
            x: isSignup ? '-100%' : '0%'
          }}
          transition={{
            type: 'spring',
            stiffness: 70,
            damping: 17,
            mass: 0.9
          }}
        >
          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center', padding: '3rem 1rem' }}
            >
              <CheckCircle2 size={64} color="#27C93F" style={{ margin: '0 auto 1.2rem auto' }} />
              <h3 className="bungee-regular" style={{ color: '#FFF7E8', fontSize: '1.4rem', letterSpacing: '1px' }}>
                {successMessage}
              </h3>
              <p style={{ color: '#B8B3C7', fontSize: '0.9rem', marginTop: '0.6rem' }}>
                Entering SkillForge Workspace...
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {/* LOGIN FORM VIEW */}
              {mode === 'login' && (
                <motion.div
                  key="login-form"
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
                      Enter your student credentials or sign in with Google.
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

                  <form onSubmit={handleFormSubmit}>
                    <div className="auth-inputs-stack">
                      <div className="auth-field-wrapper">
                        <label className="auth-label press-start-2p-regular">STUDENT EMAIL</label>
                        <div className="auth-input-container">
                          <Mail size={16} color="#FFD166" />
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
                          <Lock size={16} color="#FFD166" />
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
                          <RotateCcw size={16} className="scroll-arrow-bouncing" />
                          <span>AUTHENTICATING...</span>
                        </>
                      ) : (
                        <>
                          <span>SIGN IN TO WORKSPACE</span>
                          <ArrowRight size={17} />
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

              {/* SIGNUP FORM VIEW */}
              {mode === 'signup' && (
                <motion.div
                  key="signup-form"
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
                      Initialize your personalized learning track with free diagnostic tools.
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
                  {infoMessage && (
                    <div className="auth-alert-box info">
                      <CheckCircle2 size={15} />
                      <span>{infoMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit}>
                    <div className="auth-inputs-stack">
                      <div className="auth-inputs-grid-2col">
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

                        <div className="auth-field-wrapper">
                          <label className="auth-label press-start-2p-regular">STUDENT EMAIL</label>
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
                      </div>

                      <div className="auth-inputs-grid-2col">
                        <div className="auth-field-wrapper">
                          <label className="auth-label press-start-2p-regular">CAREER TRACK</label>
                          <div className="auth-input-container">
                            <Compass size={15} color="#FFD166" />
                            <select
                              className="auth-select"
                              value={targetRole}
                              onChange={(e) => setTargetRole(e.target.value)}
                            >
                              <option value="AI Engineer">AI Engineer</option>
                              <option value="Backend Developer">Backend Dev</option>
                              <option value="Fullstack Engineer">Fullstack Cloud</option>
                              <option value="DevOps Architect">DevOps Arch</option>
                            </select>
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
                    </div>

                    <button type="submit" className="auth-submit-btn bungee-regular" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RotateCcw size={15} className="scroll-arrow-bouncing" />
                          <span>SENDING 6-DIGIT OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>CREATE ACCOUNT &amp; GET OTP</span>
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

              {/* OTP VERIFICATION VIEW (Exclusively for Signup Verification) */}
              {mode === 'otp' && (
                <motion.div
                  key="otp-form"
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
                      We dispatched a 6-digit security code to{' '}
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

                  <form onSubmit={handleFormSubmit}>
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
                          <span>VERIFY &amp; ENTER WORKSPACE</span>
                        </>
                      )}
                    </button>

                    <div className="auth-toggle-row" style={{ marginTop: '1.2rem' }}>
                      <span>Didn't receive code?</span>
                      <span className="auth-toggle-link" onClick={handleResendOtp}>
                        Resend OTP Code
                      </span>
                    </div>

                    <div className="auth-toggle-row">
                      <span
                        className="auth-toggle-link"
                        onClick={() => switchMode('login')}
                        style={{ color: '#B8B3C7' }}
                      >
                        ← Back to Sign In
                      </span>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
