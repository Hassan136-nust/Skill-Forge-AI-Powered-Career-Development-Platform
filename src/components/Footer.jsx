import './Footer.css'

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer-section">
      <div className="footer-grid-container">
        {/* Brand Col */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <span style={{ fontSize: '1.6rem' }}>🪐</span>
            <span className="footer-brand-title">SKILLFORGE</span>
          </div>
          <p className="footer-brand-desc">
            AI-powered student skills and career roadmap platform for the LoopLearn Hackathon 2026 (PS-03).
          </p>
          <div className="press-start-2p-regular" style={{ fontSize: '0.65rem', color: '#00ff88' }}>
            ● ALL SYSTEMS OPERATIONAL
          </div>
        </div>

        {/* Navigation Links */}
        <div className="footer-links-col">
          <span className="footer-col-heading">PLATFORM</span>
          <button className="footer-link-item" onClick={() => onNavigate(0)}>Home</button>
          <button className="footer-link-item" onClick={() => onNavigate(0.25)}>Skill Gap Radar</button>
          <button className="footer-link-item" onClick={() => onNavigate(0.50)}>GenAI Roadmaps</button>
          <button className="footer-link-item" onClick={() => onNavigate(0.75)}>LangGraph Multi-Agent</button>
        </div>

        {/* SDG Impact */}
        <div className="footer-links-col">
          <span className="footer-col-heading">SDG ALIGNMENT</span>
          <span className="footer-link-item">SDG 4: Quality Education</span>
          <span className="footer-link-item">SDG 8: Decent Work</span>
          <span className="footer-link-item">SDG 9: Industry &amp; Innovation</span>
          <span className="footer-link-item">SDG 10: Reduced Inequalities</span>
        </div>

        {/* Tech Stack & DevOps */}
        <div className="footer-links-col">
          <span className="footer-col-heading">ARCHITECTURE</span>
          <span className="footer-link-item">React 19 &amp; Vite</span>
          <span className="footer-link-item">FastAPI Python Analyzer</span>
          <span className="footer-link-item">ChromaDB Local Vector Store</span>
          <span className="footer-link-item">Docker &amp; Kubernetes Stack</span>
        </div>
      </div>

      <div className="footer-bottom-bar press-start-2p-regular">
        <span>© 2026 SKILLFORGE • LOOPLEAP HACKATHON PS-03</span>
        <span style={{ color: '#FFD166' }}>FORGE YOUR TECH DESTINY</span>
      </div>
    </footer>
  )
}
