import { motion } from 'framer-motion'
import {
  GraduationCap,
  Briefcase,
  Cpu,
  Users,
  Server,
  Globe,
  Database,
  ArrowRight,
  Container,
  CheckCircle2
} from 'lucide-react'
import './SdgArchSection.css'

const SDG_TILES = [
  {
    num: '04',
    badge: 'UN SDG 04',
    title: 'QUALITY EDUCATION',
    Icon: GraduationCap,
    desc: 'Personalized GenAI roadmaps replacing outdated static curricula with actionable, milestone-driven technical mastery.',
    points: ['Targeted skill gap benchmarks', 'Personalized milestone roadmaps', 'Interactive study assistants']
  },
  {
    num: '08',
    badge: 'UN SDG 08',
    title: 'DECENT WORK & GROWTH',
    Icon: Briefcase,
    desc: 'Aligning student project portfolios directly with verified high-scale industry tech stacks and hiring criteria.',
    points: ['Verified industry competencies', 'Hands-on capstone projects', 'Direct career acceleration']
  },
  {
    num: '09',
    badge: 'UN SDG 09',
    title: 'INDUSTRY & INNOVATION',
    Icon: Cpu,
    desc: 'Stateful LangGraph multi-agent orchestration, ChromaDB local vector embeddings, and containerized microservices.',
    points: ['Autonomous ReAct agent graph', 'ChromaDB local vector RAG', 'Microservices architecture']
  },
  {
    num: '10',
    badge: 'UN SDG 10',
    title: 'REDUCED INEQUALITIES',
    Icon: Users,
    desc: '100% Free career acceleration eliminating cost barriers for underprivileged, self-taught, and global student cohorts.',
    points: ['100% Forever-free core tier', 'Zero paywall on diagnostic quizzes', 'Democratized mentorship access']
  }
]

export default function SdgArchSection() {
  return (
    <section className="sdg-section-wrapper" id="sdg-impact">
      <div className="sdg-inner-container">
        {/* SDG Header */}
        <motion.div
          className="sdg-header-block"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="terminal-tag-row press-start-2p-regular" style={{ justifyContent: 'center' }}>
            <span className="terminal-tag-dot" />
            <span>05 // UN SUSTAINABLE DEVELOPMENT GOALS</span>
          </div>

          <h2 className="terminal-heading-main">
            GLOBAL <span className="terminal-heading-gold">SUSTAINABILITY IMPACT</span>
          </h2>
          <p className="terminal-desc-lead" style={{ margin: '0 auto' }}>
            SkillForge directly advances 4 United Nations SDGs by democratizing high-caliber technical guidance
            and providing verified career acceleration for every student worldwide.
          </p>
        </motion.div>

        {/* 4 Refined Modern SDG Tiles */}
        <div className="sdg-four-grid">
          {SDG_TILES.map((tile, idx) => {
            const TileIcon = tile.Icon
            return (
              <motion.div
                key={tile.num}
                className="sdg-glass-tile"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
              >
                <div className="sdg-watermark-num">{tile.num}</div>

                <div>
                  <div className="sdg-tile-header">
                    <div className="sdg-tile-icon-box">
                      <TileIcon size={22} />
                    </div>
                    <span className="sdg-badge-label">{tile.badge}</span>
                  </div>

                  <h3 className="sdg-tile-title">{tile.title}</h3>
                  <p className="sdg-tile-desc">{tile.desc}</p>
                </div>

                <div className="sdg-impact-points-list">
                  {tile.points.map((pt, pIdx) => (
                    <div key={pIdx} className="sdg-impact-point-item">
                      <CheckCircle2 size={13} color="#FFD166" style={{ flexShrink: 0 }} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Microservices Architecture Blueprint */}
        <motion.div
          className="arch-blueprint-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          id="architecture"
        >
          <div className="arch-header-top-row">
            <div className="arch-header-title">SYSTEM MICROSERVICES &amp; DEVOPS BLUEPRINT</div>
            <div className="arch-devops-badge press-start-2p-regular">
              <Container size={14} />
              <span>DOCKER &amp; K8S READY</span>
            </div>
          </div>

          <p className="arch-desc">
            Production decoupled microservices architecture with zero-cloud vendor lock-in. Single-command
            bootstrap via <code style={{ color: '#FFD166' }}>docker-compose up -d --build</code> with local persistent MongoDB and ChromaDB volumes.
          </p>

          <div className="arch-flow-diagram">
            <div className="arch-flow-node highlight-gold">
              <Globe size={15} />
              <span>React 19 Frontend (:5173)</span>
            </div>
            <span className="arch-arrow"><ArrowRight size={16} /></span>

            <div className="arch-flow-node">
              <Server size={15} />
              <span>API Gateway (:3000)</span>
            </div>
            <span className="arch-arrow"><ArrowRight size={16} /></span>

            <div className="arch-flow-node">
              <Cpu size={15} />
              <span>Auth &amp; Profile (:3001-3003)</span>
            </div>
            <span className="arch-arrow"><ArrowRight size={16} /></span>

            <div className="arch-flow-node highlight-gold">
              <Cpu size={15} />
              <span>FastAPI Python Analyzer (:8000)</span>
            </div>
            <span className="arch-arrow"><ArrowRight size={16} /></span>

            <div className="arch-flow-node">
              <Database size={15} />
              <span>MongoDB &amp; ChromaDB</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
