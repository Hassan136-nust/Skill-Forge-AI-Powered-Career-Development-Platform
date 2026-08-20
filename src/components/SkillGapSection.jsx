import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './SkillGapSection.css'

const SCRIPT_STAGES = {
  analyzer: [
    { type: 'cmd', text: 'python -m skillforge.analyzer --profile="Student_CS_Year3" --goal="AI Engineer"' },
    { type: 'info', text: '● [SkillAnalyzer] Initializing OOP scoring engine with threshold definitions...' },
    { type: 'dim', text: '↳ Loading 6 assessment categories: Python, WebDev, Git, DevOps, AI/ML, Databases' },
    { type: 'highlight', text: '↳ Category Scores: Python: 75% | WebDev: 80% | Git: 60% | DevOps: 40% | AI/ML: 30% | DB: 65%' },
    { type: 'alert', text: '⚠ [Gap Detected] Missing Critical Skills: [AI/ML Fundamentals (Req: 85%), DevOps Containers (Req: 65%)]' },
    { type: 'success', text: '✔ [Diagnosis Complete] Calculated normalized gap matrix in 12ms. Status: 200 OK' }
  ],
  rag: [
    { type: 'cmd', text: 'python -m skillforge.rag.search --query="AI Engineer roadmap & capstone projects"' },
    { type: 'info', text: '● [ChromaDB] Connecting to local persistent vector collection "skillforge_kb"...' },
    { type: 'dim', text: '↳ Performing dense embedding similarity search using sentence-transformers...' },
    { type: 'highlight', text: '↳ Retrieved Top 3 Chunks: [ai-engineer-roadmap.txt, project-ideas-by-level.txt, industry-expectations.txt]' },
    { type: 'success', text: '✔ [RAG Grounded] Extracted 5 sequential learning milestones with verified capstone projects.' }
  ],
  agent: [
    { type: 'cmd', text: 'python -m skillforge.agent.orchestrator --user_id="usr_8921" --mode="ReAct"' },
    { type: 'info', text: '● [LangGraph] Initializing Stateful ReAct Graph (Think ➔ Act ➔ Observe ➔ Deliver)...' },
    { type: 'dim', text: '↳ Invoking Tool 1: analyze_student_skills(user_id="usr_8921")' },
    { type: 'dim', text: '↳ Invoking Tool 2: generate_skill_gap(current_scores, target_role="AI Engineer")' },
    { type: 'dim', text: '↳ Invoking Tool 3: search_learning_resources(topic="LangChain RAG & PyTorch")' },
    { type: 'highlight', text: '↳ Invoking Tool 4: create_roadmap(gaps, resources) ➔ Compiling structured JSON plan' },
    { type: 'success', text: '✔ [Agent ReAct Loop] Completed in 4 iterations. Personalized roadmap persisted to MongoDB.' }
  ],
  docker: [
    { type: 'cmd', text: 'docker-compose up -d --build' },
    { type: 'info', text: '● [Docker] Bootstrapping SkillForge full-stack microservices architecture...' },
    { type: 'dim', text: '↳ [1/6] frontend-service        ➔ Running on http://localhost:5173' },
    { type: 'dim', text: '↳ [2/6] api-gateway             ➔ Running on http://localhost:3000' },
    { type: 'dim', text: '↳ [3/6] auth & profile-service  ➔ Running on http://localhost:3001-3002' },
    { type: 'dim', text: '↳ [4/6] python-analyzer-service ➔ Running on http://localhost:8000 (FastAPI)' },
    { type: 'dim', text: '↳ [5/6] mongodb-database        ➔ Running on localhost:27017' },
    { type: 'dim', text: '↳ [6/6] chromadb-vectorstore    ➔ Local persistent storage ready' },
    { type: 'success', text: '✔ [All Services Healthy] Zero-downtime microservices stack ready for evaluation.' }
  ]
}

export default function SkillGapSection() {
  const sectionRef = useRef(null)
  const terminalBodyRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const [activeTab, setActiveTab] = useState('analyzer')
  const [displayedLines, setDisplayedLines] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  // Trigger typing when in view or when user switches tab
  useEffect(() => {
    if (!isInView) return

    setDisplayedLines([])
    setIsTyping(true)
    const lines = SCRIPT_STAGES[activeTab]
    let currentIdx = 0

    const timer = setInterval(() => {
      if (currentIdx < lines.length) {
        const nextLine = lines[currentIdx]
        setDisplayedLines((prev) => [...prev, nextLine])
        currentIdx++

        // Auto-scroll terminal to bottom
        if (terminalBodyRef.current) {
          terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
        }
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 400)

    return () => clearInterval(timer)
  }, [activeTab, isInView])

  return (
    <section ref={sectionRef} className="terminal-section-wrapper" id="skill-gaps">
      <div className="terminal-inner-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="terminal-tag-row press-start-2p-regular">
            <span className="terminal-tag-dot" />
            <span>01 // ENGINE CLI &amp; FUNCTION INSPECTOR</span>
          </div>

          <h2 className="terminal-heading-main">
            LIVE ENGINE <span className="terminal-heading-gold">DIAGNOSTIC TERMINAL</span>
          </h2>
          <p className="terminal-desc-lead">
            Real-time execution of the Python <code style={{ color: '#FFD166' }}>SkillAnalyzer</code> service,
            ChromaDB vector retriever, and LangGraph multi-agent ReAct orchestration.
          </p>

          {/* Interactive Command Tabs */}
          <div className="terminal-controls-bar">
            <button
              className={`term-cmd-btn press-start-2p-regular ${activeTab === 'analyzer' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyzer')}
            >
              ▶ RUN GAP ANALYZER
            </button>
            <button
              className={`term-cmd-btn press-start-2p-regular ${activeTab === 'agent' ? 'active' : ''}`}
              onClick={() => setActiveTab('agent')}
            >
              ▶ RUN MULTI-AGENT
            </button>
            <button
              className={`term-cmd-btn press-start-2p-regular ${activeTab === 'rag' ? 'active' : ''}`}
              onClick={() => setActiveTab('rag')}
            >
              ▶ RUN VECTOR RAG
            </button>
            <button
              className={`term-cmd-btn press-start-2p-regular ${activeTab === 'docker' ? 'active' : ''}`}
              onClick={() => setActiveTab('docker')}
            >
              ▶ RUN DOCKER STACK
            </button>
          </div>
        </motion.div>

        {/* macOS Terminal Window */}
        <motion.div
          className="macos-window-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="macos-window-header">
            <div className="macos-traffic-lights">
              <span className="traffic-light red" />
              <span className="traffic-light yellow" />
              <span className="traffic-light green" />
            </div>
            <div className="macos-window-title">
              skillforge-core ~ zsh (Python 3.12 • FastAPI :8000)
            </div>
            <div className="macos-window-status press-start-2p-regular">
              {isTyping ? '● EXECUTING...' : '✔ READY'}
            </div>
          </div>

          <div ref={terminalBodyRef} className="macos-terminal-body">
            {displayedLines.map((line, idx) => {
              if (line.type === 'cmd') {
                return (
                  <div key={idx}>
                    <span className="term-line-prompt">skillforge@engine:~$ </span>
                    <span className="term-line-cmd">{line.text}</span>
                  </div>
                )
              }
              if (line.type === 'highlight') {
                return <div key={idx} className="term-line-highlight">{line.text}</div>
              }
              if (line.type === 'alert') {
                return <div key={idx} className="term-line-alert">{line.text}</div>
              }
              if (line.type === 'success') {
                return <div key={idx} className="term-line-success">{line.text}</div>
              }
              if (line.type === 'dim') {
                return <div key={idx} className="term-line-dim">{line.text}</div>
              }
              return <div key={idx} className="term-line-info">{line.text}</div>
            })}
            {isTyping && <div><span className="terminal-cursor" /></div>}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
