import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import Navbar from './components/Navbar'
import HeroFrame from './components/HeroFrame'
import ScrollOverlays from './components/ScrollOverlays'
import SkillGapSection from './components/SkillGapSection'
import RoadmapSection from './components/RoadmapSection'
import AgentSection from './components/AgentSection'
import PricingSection from './components/PricingSection'
import SdgArchSection from './components/SdgArchSection'
import CosmicCatGuide from './components/CosmicCatGuide'
import AuthModal from './components/AuthModal'
import StudentDashboard from './components/StudentDashboard'
import FullRoadmapPage from './components/FullRoadmapPage'
import AiMentorPage from './components/AiMentorPage'
import AdminDashboard from './components/AdminDashboard'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const lenisRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [currentView, setCurrentView] = useState('landing') // 'landing' | 'dashboard' | 'roadmap' | 'mentor' | 'admin'
  const [currentUser, setCurrentUser] = useState(null)

  const getDashboardPathForUser = (user) => {
    if (!user) return '/dashboard'
    const identifier = user._id || (user.email ? user.email.split('@')[0] : 'scholar')
    return `/${encodeURIComponent(identifier)}/dashboard`
  }

  const getRoadmapPathForUser = (user) => {
    if (!user) return '/roadmap'
    const identifier = user._id || (user.email ? user.email.split('@')[0] : 'scholar')
    return `/${encodeURIComponent(identifier)}/roadmap`
  }

  const getMentorPathForUser = (user) => {
    if (!user) return '/mentor'
    const identifier = user._id || (user.email ? user.email.split('@')[0] : 'scholar')
    return `/${encodeURIComponent(identifier)}/mentor`
  }

  const getAdminPathForUser = (user) => {
    if (!user) return '/admin'
    const identifier = user._id || (user.email ? user.email.split('@')[0] : 'admin')
    return `/${encodeURIComponent(identifier)}/admin`
  }

  const syncViewFromUrl = () => {
    const path = window.location.pathname
    const isAdminRoute = path.endsWith('/admin') || path.includes('/admin')
    const isMentorRoute = path.endsWith('/mentor') || path.includes('/mentor')
    const isRoadmapRoute = path.endsWith('/roadmap') || path.includes('/roadmap')
    const isDashboardRoute = path.endsWith('/dashboard') || path.includes('/dashboard')

    const token = localStorage.getItem('skillforge_token')
    let user = null
    try {
      user = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
    } catch {
      user = null
    }

    if (isAdminRoute) {
      if (token && user && user.role === 'admin') {
        setCurrentView('admin')
      } else {
        // Unauthorized admin attempt: force redirect to landing and prompt login
        window.history.replaceState({}, '', '/')
        setCurrentView('landing')
        setIsAuthOpen(true)
      }
    } else if (isMentorRoute) {
      if (token && user) {
        setCurrentView('mentor')
      } else {
        window.history.replaceState({}, '', '/')
        setCurrentView('landing')
        setIsAuthOpen(true)
      }
    } else if (isRoadmapRoute) {
      if (token && user) {
        setCurrentView('roadmap')
      } else {
        window.history.replaceState({}, '', '/')
        setCurrentView('landing')
        setIsAuthOpen(true)
      }
    } else if (isDashboardRoute) {
      if (token && user) {
        setCurrentView('dashboard')
      } else {
        window.history.replaceState({}, '', '/')
        setCurrentView('landing')
        setIsAuthOpen(true)
      }
    } else {
      setCurrentView('landing')
    }
  }

  // Check existing session & sync URL route
  useEffect(() => {
    // Handle Google OAuth popup callback (id_token in URL hash)
    if (window.opener && window.location.hash.includes('id_token')) {
      const params = new URLSearchParams(window.location.hash.substring(1))
      const idToken = params.get('id_token')
      if (idToken) {
        window.opener.postMessage({ type: 'google-auth-token', idToken }, window.location.origin)
        window.close()
        return
      }
    }

    try {
      const token = localStorage.getItem('skillforge_token')
      const user = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
      if (token && user) {
        setCurrentUser(user)
      } else {
        setCurrentUser(null)
      }
    } catch (e) {
      setCurrentUser(null)
    }

    syncViewFromUrl()

    const handlePopState = () => {
      syncViewFromUrl()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      infinite: false
    })

    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const reqId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(reqId)
      lenis.destroy()
    }
  }, [])

  // Scroll Scrubbing & Video Setup
  useEffect(() => {
    if (currentView !== 'landing') return

    let animationFrameId = null
    let blobUrl = null
    let isCancelled = false
    let userReady = false

    const video = videoRef.current
    if (!video) return

    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const smallMQ = window.matchMedia('(max-width: 860px)')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = () => coarse || smallMQ.matches

    let laidOutWidth = window.innerWidth
    const videoUrl = encodeURI('/new.mp4')

    let targetProgress = 0
    let currentProgress = 0
    const lerpFactor = isMobile() ? 0.15 : 0.08
    const minSeekDelta = isMobile() ? 0.012 : 0.003

    const primeVideo = () => {
      if (!video) return
      try {
        const p = video.play()
        if (p && p.then) {
          p.then(() => {
            try { video.pause() } catch (e) { }
          }).catch(() => { })
        }
      } catch (e) { }
    }

    const onFirstGesture = () => {
      if (userReady) return
      userReady = true
      primeVideo()
    }

    window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true })
    window.addEventListener('touchstart', onFirstGesture, { once: true, passive: true })

    fetch(videoUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        if (isCancelled) return
        blobUrl = URL.createObjectURL(blob)
        video.src = blobUrl
        video.load()
      })
      .catch((err) => {
        console.warn('Direct fallback for video:', err)
        if (!isCancelled) {
          video.src = videoUrl
          video.load()
        }
      })

    const onLoadedMetadata = () => {
      if (isCancelled) return
      setIsLoaded(true)
      primeVideo()
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)

    const updateScrollTarget = () => {
      const scrollY = window.scrollY || window.pageYOffset
      const videoTrackHeight = window.innerHeight * 5
      if (videoTrackHeight > 0) {
        const progress = Math.min(1, Math.max(0, scrollY / videoTrackHeight))
        targetProgress = progress
        setScrollProgress(progress)
      }
    }

    const renderLoop = () => {
      if (isCancelled) return

      if (video.duration && !isNaN(video.duration) && video.readyState >= 2) {
        currentProgress += (targetProgress - currentProgress) * (reduceMotion ? 1 : lerpFactor)
        // Clamp to avoid the empty/black EOF frame of the MP4
        const maxValidTime = Math.max(0, video.duration - 0.08)
        const targetTime = Math.min(maxValidTime, Math.max(0, currentProgress * maxValidTime))

        if (!video.seeking && Math.abs(video.currentTime - targetTime) > minSeekDelta) {
          try {
            if (typeof video.fastSeek === 'function') {
              video.fastSeek(targetTime)
            } else {
              video.currentTime = targetTime
            }
          } catch (e) {
            video.currentTime = targetTime
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop)
    }

    const onResize = () => {
      if (coarse && window.innerWidth === laidOutWidth) return
      laidOutWidth = window.innerWidth
      updateScrollTarget()
    }

    window.addEventListener('scroll', updateScrollTarget, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    animationFrameId = requestAnimationFrame(renderLoop)
    updateScrollTarget()

    return () => {
      isCancelled = true
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', updateScrollTarget)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('touchstart', onFirstGesture)
      if (video) video.removeEventListener('loadedmetadata', onLoadedMetadata)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [currentView])

  // Smooth scroll helper using Lenis
  const scrollToVideoProgress = (prog) => {
    const videoTrackHeight = window.innerHeight * 5
    if (lenisRef.current) {
      lenisRef.current.scrollTo(prog * videoTrackHeight, { duration: 1.4 })
    } else {
      window.scrollTo({
        top: prog * videoTrackHeight,
        behavior: 'smooth'
      })
    }
  }

  const scrollToElement = (id) => {
    const el = document.getElementById(id)
    if (el) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -90, duration: 1.4 })
      } else {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Hero visible on initial frame
  const isHeroVisible = scrollProgress < 0.16
  const isVideoScrubbingZone = scrollProgress < 0.98

  const handleOpenDashboard = () => {
    const token = localStorage.getItem('skillforge_token')
    const user = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')

    if (token && user) {
      const targetUrl = getDashboardPathForUser(user)
      window.history.pushState({}, '', targetUrl)
      setCurrentView('dashboard')
    } else {
      setIsAuthOpen(true)
    }
  }

  const handleOpenAdmin = () => {
    const token = localStorage.getItem('skillforge_token')
    const user = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
    if (token && user && user.role === 'admin') {
      const targetUrl = getAdminPathForUser(user)
      window.history.pushState({}, '', targetUrl)
      setCurrentView('admin')
    } else {
      setIsAuthOpen(true)
    }
  }

  const handleAuthSuccess = (user) => {
    setCurrentUser(user)
    setIsAuthOpen(false)
    if (user && user.role === 'admin') {
      const targetUrl = getAdminPathForUser(user)
      window.history.pushState({}, '', targetUrl)
      setCurrentView('admin')
    } else {
      const targetUrl = getDashboardPathForUser(user)
      window.history.pushState({}, '', targetUrl)
      setCurrentView('dashboard')
    }
  }

  // If in Admin Dashboard View, render the Admin Command Center (Protected)
  if (currentView === 'admin') {
    const token = localStorage.getItem('skillforge_token')
    const user = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
    if (!token || !user || user.role !== 'admin') {
      window.history.replaceState({}, '', '/')
      setCurrentView('landing')
      setIsAuthOpen(true)
      return null
    }

    return (
      <AdminDashboard
        onExitAdmin={() => {
          window.history.pushState({}, '', '/')
          window.scrollTo(0, 0)
          setScrollProgress(0)
          setCurrentView('landing')
          const t = localStorage.getItem('skillforge_token')
          const u = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
          setCurrentUser(t ? u : null)
        }}
        onOpenStudentDashboard={() => {
          const u = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
          const targetUrl = getDashboardPathForUser(u)
          window.history.pushState({}, '', targetUrl)
          setCurrentView('dashboard')
        }}
      />
    )
  }

  // If in Dedicated Full Roadmap View, render the interactive galaxy map with login.webm (Protected)
  if (currentView === 'roadmap') {
    const token = localStorage.getItem('skillforge_token')
    const user = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
    if (!token || !user) {
      window.history.replaceState({}, '', '/')
      setCurrentView('landing')
      setIsAuthOpen(true)
      return null
    }

    return (
      <FullRoadmapPage
        onBackToDashboard={() => {
          const u = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
          const targetUrl = getDashboardPathForUser(u)
          window.history.pushState({}, '', targetUrl)
          setCurrentView('dashboard')
        }}
      />
    )
  }

  // If in Dedicated AI Mentor View, render the full-context chat cockpit with login.webm (Protected)
  if (currentView === 'mentor') {
    const token = localStorage.getItem('skillforge_token')
    const user = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
    if (!token || !user) {
      window.history.replaceState({}, '', '/')
      setCurrentView('landing')
      setIsAuthOpen(true)
      return null
    }

    return (
      <AiMentorPage
        currentUser={currentUser}
        onBackToDashboard={() => {
          const u = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
          const targetUrl = getDashboardPathForUser(u)
          window.history.pushState({}, '', targetUrl)
          setCurrentView('dashboard')
        }}
      />
    )
  }

  // If in Dashboard View, render the Student Dashboard (Protected)
  if (currentView === 'dashboard') {
    const token = localStorage.getItem('skillforge_token')
    const user = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
    if (!token || !user) {
      window.history.replaceState({}, '', '/')
      setCurrentView('landing')
      setIsAuthOpen(true)
      return null
    }

    return (
      <StudentDashboard
        onExitDashboard={() => {
          window.history.pushState({}, '', '/')
          window.scrollTo(0, 0)
          setScrollProgress(0)
          setCurrentView('landing')
          const t = localStorage.getItem('skillforge_token')
          const u = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
          setCurrentUser(t ? u : null)
        }}
        onOpenFullRoadmap={(milestones) => {
          const u = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
          if (milestones && milestones.length > 0) {
            localStorage.setItem('skillforge_current_milestones', JSON.stringify(milestones))
          }
          const targetUrl = getRoadmapPathForUser(u)
          window.history.pushState({}, '', targetUrl)
          setCurrentView('roadmap')
        }}
        onOpenAiMentor={() => {
          const u = currentUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
          const targetUrl = getMentorPathForUser(u)
          window.history.pushState({}, '', targetUrl)
          setCurrentView('mentor')
        }}
        onOpenAdmin={handleOpenAdmin}
      />
    )
  }

  return (
    <main ref={containerRef} className="scroll-wrapper">
      {/* Background Video Layer */}
      <div className={`video-viewport ${isVideoScrubbingZone ? 'active' : 'passed'}`}>
        <video
          ref={videoRef}
          className={`scrub-video ${isLoaded ? 'loaded' : 'loading'}`}
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          autoPlay={false}
        />
        <div className="video-overlay-tint" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onNavigate={scrollToVideoProgress}
        onStart={() => setIsAuthOpen(true)}
        onOpenDashboard={handleOpenDashboard}
        onOpenAdmin={handleOpenAdmin}
        currentUser={currentUser}
      />

      {/* Frame 1: Box-Free Hero */}
      <HeroFrame
        visible={isHeroVisible}
        onStartJourney={handleOpenDashboard}
        onExploreMissions={() => scrollToElement('roadmaps')}
        onScrollDown={() => scrollToVideoProgress(0.25)}
      />

      {/* Frame 2 - 5: Minimalist Cinematic Typography Overlays */}
      <ScrollOverlays progress={scrollProgress} />

      {/* Video scrub height track */}
      <div className="scroll-track" />

      {/* =========================================================================
          HOMEPAGE CONTINUATION — FULL SOLID CYBER PRESENTATION & PRD SHOWCASE
          ========================================================================= */}
      <div className="homepage-content-layer">
        <CosmicCatGuide active={scrollProgress >= 0.99} />
        <SkillGapSection />
        <RoadmapSection />
        <AgentSection />
        <PricingSection />
        <SdgArchSection />
        <Footer onNavigate={scrollToVideoProgress} />
      </div>

      {/* Authentication Gateway Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </main>
  )
}
