import { Rocket, Compass, ShieldCheck, Bot, Zap, ChevronDown, Sparkles } from 'lucide-react'
import './HeroFrame.css'

export default function HeroFrame({ visible, onStartJourney, onExploreMissions, onScrollDown }) {
  return (
    <section className={`hero-screen-layer ${visible ? 'visible' : 'hidden'}`}>
      <div className="hero-stage">
        {/* Completely Box-Free Floating Hero Content */}
        <div className="hero-floating-content">
          {/* Top Tag with Press Start 2P */}
          <div className="hero-tag-badge press-start-2p-regular">
            <Sparkles size={12} color="#FFD166" />
            <span>AI-POWERED STUDENT ROADMAPS</span>
            <Sparkles size={12} color="#FFD166" />
          </div>

          {/* Main Title with Bungee font */}
          <h1 className="hero-forge-title bungee-regular">
            <span style={{ color: "#FFD166" }}>SKILL</span>FORGE
          </h1>

          {/* Subtitle & PRD Problem/Solution description */}
          <h2 className="hero-forge-subtitle bungee-regular">
            FORGE YOUR PATH FROM STUDENT TO TECH LEADER.
          </h2>
          <p className="hero-forge-desc">
            AI-grounded skill gap analysis, personalized GenAI learning roadmaps,
            and LangGraph multi-agent career acceleration tailored for ambitious developers.
          </p>

          {/* Action Buttons with Lucide SVG Icons */}
          <div className="hero-forge-actions">
            <button className="btn-forge-primary bungee-regular" onClick={onStartJourney}>
              <span>START ASSESSMENT</span>
              <Rocket size={17} />
            </button>
            <button className="btn-forge-secondary bungee-regular" onClick={onExploreMissions}>
              <span>EXPLORE ROADMAPS</span>
              <Compass size={17} />
            </button>
          </div>

          {/* PRD Badges Row */}
          <div className="hero-forge-badges">
            <div className="forge-badge green press-start-2p-regular">
              <ShieldCheck size={14} color="#FFD166" />
              <span>SDG 4 &amp; 8 ALIGNED</span>
            </div>
            <div className="forge-badge cyan press-start-2p-regular">
              <Bot size={14} color="#FFF7E8" />
              <span>LANGGRAPH AGENT</span>
            </div>
            <div className="forge-badge amber press-start-2p-regular">
              <Zap size={14} color="#FFD166" />
              <span>FASTAPI ANALYZER</span>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Scroll Indicator */}
        <div className="clean-scroll-prompt press-start-2p-regular" onClick={onScrollDown}>
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown size={18} className="scroll-arrow-bouncing" />
        </div>
      </div>
    </section>
  )
}

