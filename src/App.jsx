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
import Footer from './components/Footer'
import './App.css'

export default function App() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const lenisRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

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
      const videoTrackHeight = window.innerHeight * 4
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
  }, [])

  // Smooth scroll helper using Lenis
  const scrollToVideoProgress = (prog) => {
    const videoTrackHeight = window.innerHeight * 4
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
      />

      {/* Frame 1: Box-Free Hero */}
      <HeroFrame
        visible={isHeroVisible}
        onStartJourney={() => setIsAuthOpen(true)}
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
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  )
}
