import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import './CosmicCatGuide.css'

export default function CosmicCatGuide({ active = true }) {
  const { scrollY } = useScroll()
  const [windowInfo, setWindowInfo] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })

  const [offsets, setOffsets] = useState({
    term: 3200,
    road: 4000,
    agent: 4800,
    price: 5600,
    sdg: 6400,
    footer: 7200
  })

  // Measure exact section trigger scroll heights dynamically
  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setWindowInfo({ width: w, height: h })

      const getTop = (id, fallback) => {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          return (window.scrollY || window.pageYOffset) + rect.top
        }
        return fallback
      }

      const termTop = getTop('skill-gaps', h * 4.0)
      const roadTop = getTop('roadmaps', h * 4.8)
      const agentTop = getTop('multi-agent', h * 5.6)
      const priceTop = getTop('pricing', h * 6.4)
      const sdgTop = getTop('sdg-impact', h * 7.2)
      const docHeight = document.documentElement.scrollHeight

      setOffsets({
        term: termTop,
        road: roadTop,
        agent: agentTop,
        price: priceTop,
        sdg: sdgTop,
        footer: docHeight - h - 100
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    window.addEventListener('scroll', updateDimensions, { passive: true })
    return () => {
      window.removeEventListener('resize', updateDimensions)
      window.removeEventListener('scroll', updateDimensions)
    }
  }, [])

  // Responsive Flank Offsets
  const isMobile = windowInfo.width < 768
  const isTablet = windowInfo.width >= 768 && windowInfo.width < 1180

  // On mobile screens, keep flank within bounds so it stays visible without overlapping content
  const rightFlankX = isMobile
    ? Math.min(windowInfo.width * 0.24, 110)
    : isTablet
    ? windowInfo.width * 0.32
    : Math.min(windowInfo.width * 0.34, 460)

  const leftFlankX = isMobile
    ? Math.min(windowInfo.width * 0.24, 110)
    : isTablet
    ? windowInfo.width * 0.36
    : Math.min(windowInfo.width * 0.40, 520)

  // Continuous X gliding: Right -> Left -> Right -> Left -> Right
  const rawX = useTransform(
    scrollY,
    [
      offsets.term - 200,
      offsets.term + 150,
      offsets.road - 100,
      offsets.road + 200,
      offsets.agent - 100,
      offsets.agent + 200,
      offsets.price - 100,
      offsets.price + 200,
      offsets.sdg - 100,
      offsets.sdg + 200,
      offsets.footer
    ],
    [
      rightFlankX,      // Right at Terminal
      rightFlankX,
      -leftFlankX,      // Left at Roadmap
      -leftFlankX,
      rightFlankX,      // Right at LangGraph
      rightFlankX,
      -leftFlankX,      // Left at Pricing
      -leftFlankX,
      rightFlankX,      // Right at SDGs
      rightFlankX,
      0                 // Center at footer
    ],
    { clamp: true }
  )

  // Subtle Y ascent when reaching footer
  const rawY = useTransform(
    scrollY,
    [offsets.footer - 150, offsets.footer + 100],
    [0, -350],
    { clamp: true }
  )

  // Dynamic Opacity: Strictly 0 during video track, 1 during homepage, 0 at footer
  const rawOpacity = useTransform(
    scrollY,
    [
      offsets.term - 80,
      offsets.term + 20,
      offsets.footer - 100,
      offsets.footer + 50
    ],
    [0, 1, 1, 0],
    { clamp: true }
  )

  // Fluid Spring Physics for continuous organic gliding
  const springConfig = { stiffness: 45, damping: 16, mass: 0.6 }
  const x = useSpring(rawX, springConfig)
  const y = useSpring(rawY, springConfig)
  const opacity = useSpring(rawOpacity, { stiffness: 60, damping: 20 })

  // Status Dialogue Tag Text
  const [badgeText, setBadgeText] = useState('Diagnosing Skill Gaps 🐾')

  useEffect(() => {
    const unsub = scrollY.on('change', (latest) => {
      if (latest < offsets.road - 150) {
        setBadgeText('Diagnosing Skill Gaps 🐾')
      } else if (latest < offsets.agent - 150) {
        setBadgeText('Navigating GenAI Roadmap 🗺️')
      } else if (latest < offsets.price - 150) {
        setBadgeText('LangGraph ReAct Cycle 🤖')
      } else if (latest < offsets.sdg - 150) {
        setBadgeText('UN SDG 10 Tier Access 💎')
      } else if (latest < offsets.footer - 150) {
        setBadgeText('Quality Education for All 🌍')
      } else {
        setBadgeText('Forging Tech Leadership ✨')
      }
    })
    return () => unsub()
  }, [scrollY, offsets])

  if (!active) return null

  return (
    <motion.div
      className="cat-scroll-companion-layer"
      style={{
        x,
        y,
        opacity
      }}
    >
      <div className="cat-avatar-large-wrapper">
        {/* Status Speech Pill */}
        <div className="cat-status-pill press-start-2p-regular">
          <span className="cat-status-pulse" />
          <span>{badgeText}</span>
        </div>

        {/* The Same Cat Image — Gliding Continuously with Scroll */}
        <img
          src="/cat.png"
          alt="Cosmic Cat Companion"
          className="cat-img-large"
        />
      </div>
    </motion.div>
  )
}
