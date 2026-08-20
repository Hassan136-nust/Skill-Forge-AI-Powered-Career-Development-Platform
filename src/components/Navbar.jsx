import { Sun } from 'lucide-react'
import './Navbar.css'

export default function Navbar({ onNavigate, onStart, onOpenDashboard, onOpenAdmin, currentUser }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      onNavigate(0)
    }
  }

  const isAdmin = currentUser?.role === 'admin'

  return (
    <header className="navbar-container">
      {/* Brand: Same Planet Icon + SKILLFORGE */}
      <div className="navbar-brand" onClick={() => onNavigate(0)}>
        <div className="brand-icon-planet">🪐</div>
        <div className="brand-logo-text">
          <span className="brand-text-top bungee-regular">SKILL</span>
          <span className="brand-text-bottom bungee-regular">FORGE</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="navbar-menu">
        <button className="navbar-item-btn" onClick={() => onNavigate(0)}>
          Home
        </button>
        <button className="navbar-item-btn" onClick={() => scrollToSection('skill-gaps')}>
          Skill Gaps
        </button>
        <button className="navbar-item-btn" onClick={() => scrollToSection('roadmaps')}>
          Roadmaps
        </button>
        <button className="navbar-item-btn" onClick={() => scrollToSection('multi-agent')}>
          Agent AI
        </button>
        <button className="navbar-item-btn" onClick={() => scrollToSection('pricing')}>
          Pricing
        </button>
        <button className="navbar-item-btn" onClick={() => scrollToSection('sdg-impact')}>
          SDG Impact
        </button>
        <button className="navbar-item-btn" onClick={() => scrollToSection('architecture')}>
          DevOps
        </button>
        {isAdmin && (
          <button
            className="navbar-item-btn"
            style={{
              color: '#00F0FF',
              fontWeight: 800,
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '20px',
              padding: '0.25rem 0.75rem',
              backgroundColor: 'rgba(0, 240, 255, 0.12)',
            }}
            onClick={() => onOpenAdmin && onOpenAdmin()}
          >
            👑 Admin Portal
          </button>
        )}
      </nav>

      {/* Right Actions: Dashboard shortcut + theme button + Get Started pill button */}
      <div className="navbar-right-actions">
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isAdmin && (
              <button
                className="navbar-item-btn"
                style={{
                  color: '#020612',
                  backgroundColor: '#00F0FF',
                  border: '1px solid #00F0FF',
                  borderRadius: '20px',
                  padding: '0.45rem 1rem',
                  fontWeight: 800,
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
                }}
                onClick={() => onOpenAdmin && onOpenAdmin()}
              >
                👑 Admin Portal
              </button>
            )}
            <button
              className="navbar-item-btn"
              style={{
                color: '#05060A',
                backgroundColor: '#FFD166',
                border: '1px solid #FFD166',
                borderRadius: '20px',
                padding: '0.45rem 1.1rem',
                fontWeight: 700,
                boxShadow: '0 0 15px rgba(255, 209, 102, 0.4)',
              }}
              onClick={() => onOpenDashboard && onOpenDashboard()}
            >
              ✦ {currentUser.name?.split(' ')[0] || 'Scholar'}'s Dashboard
            </button>
          </div>
        ) : (
          <>
            <button
              className="navbar-item-btn"
              style={{
                color: '#FFD166',
                border: '1px solid rgba(255, 209, 102, 0.4)',
                borderRadius: '20px',
                padding: '0.4rem 0.9rem',
              }}
              onClick={() => onOpenDashboard && onOpenDashboard()}
            >
              ✦ Student Dashboard
            </button>
            <button className="get-started-btn bungee-regular" onClick={onStart}>
              Get Started
            </button>
          </>
        )}
      </div>
    </header>
  )
}
