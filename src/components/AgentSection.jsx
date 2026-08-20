import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Workflow,
  Bot,
  Database,
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  GitFork,
  Terminal,
  Layers,
  Sparkles,
  ArrowDown,
  ArrowRight,
  FileCode
} from 'lucide-react'
import './AgentSection.css'

const GRAPH_NODES = [
  {
    id: 'profiler',
    title: 'student_profiler',
    type: 'TOOL NODE',
    desc: 'Extracts student degree, GitHub projects, and verified certifications from MongoDB.',
    statePayload: {
      user_id: 'usr_8921_cs',
      target_role: 'AI Engineer',
      assessment_scores: { python: 75, webDev: 80, git: 60, devops: 40, ai_ml: 30, db: 65 },
      profile_status: 'PARSED_OK'
    }
  },
  {
    id: 'analyzer',
    title: 'gap_analyzer_agent',
    type: 'PYTHON ANALYZER',
    desc: 'Computes normalized distance matrix against industry threshold benchmarks.',
    statePayload: {
      critical_gaps: ['AI/ML Fundamentals (Req: 85%)', 'DevOps Containers (Req: 65%)'],
      weak_competencies: ['Python OOP Memory Efficiency (75%)'],
      strengths: ['Web Development (80%)'],
      gap_status: 'GAPS_COMPUTED'
    }
  },
  {
    id: 'retriever',
    title: 'chroma_rag_retriever',
    type: 'VECTOR STORE',
    desc: 'Performs dense embedding similarity search across 1,420 ChromaDB knowledge chunks.',
    statePayload: {
      query: 'AI Engineer Roadmap + Capstone Repositories',
      top_k_chunks: [
        'rag/knowledge-base/ai-engineer-roadmap.txt (Score: 0.94)',
        'rag/knowledge-base/project-ideas-by-level.txt (Score: 0.89)',
        'rag/knowledge-base/industry-expectations.txt (Score: 0.87)'
      ],
      rag_status: 'CHUNKS_RETRIEVED'
    }
  },
  {
    id: 'supervisor',
    title: 'react_supervisor_loop',
    type: 'SUPERVISOR AGENT',
    desc: 'Stateful LangGraph ReAct cycle (Think ➔ Act ➔ Observe) validating learning sequence.',
    statePayload: {
      agent_thought: 'Verify if prerequisites exist for PyTorch attention mechanisms.',
      action_taken: 'Reordered Phase 1 (NumPy) before Phase 2 (PyTorch)',
      iterations_count: 4,
      react_status: 'CYCLE_VALIDATED'
    }
  },
  {
    id: 'synthesizer',
    title: 'roadmap_synthesizer',
    type: 'OUTPUT SINK',
    desc: 'Compiles final 5-phase career trajectory with capstone deliverables and deadlines.',
    statePayload: {
      roadmap_id: 'rdmp_ai_9942',
      total_phases: 5,
      estimated_weeks: 13,
      final_status: 'ROADMAP_PERSISTED_200_OK'
    }
  }
]

const CHROMA_COLLECTIONS = [
  { file: 'ai-engineer-roadmap.txt', chunks: 340 },
  { file: 'backend-developer-roadmap.txt', chunks: 280 },
  { file: 'project-ideas-by-level.txt', chunks: 420 },
  { file: 'industry-expectations.txt', chunks: 190 },
  { file: 'course-resources.txt', chunks: 190 }
]

export default function AgentSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const [activeNodeId, setActiveNodeId] = useState('profiler')
  const [isSimulating, setIsSimulating] = useState(false)
  const [completedNodes, setCompletedNodes] = useState([])

  const activeNodeData = GRAPH_NODES.find((n) => n.id === activeNodeId) || GRAPH_NODES[0]

  // Auto Execution Simulation Function
  const runLiveSimulation = () => {
    if (isSimulating) return
    setIsSimulating(true)
    setCompletedNodes([])

    let step = 0
    const sequence = GRAPH_NODES.map((n) => n.id)

    const interval = setInterval(() => {
      if (step < sequence.length) {
        const currentNode = sequence[step]
        setActiveNodeId(currentNode)
        setCompletedNodes((prev) => [...prev, currentNode])
        step++
      } else {
        setIsSimulating(false)
        clearInterval(interval)
      }
    }, 1100)
  }

  // Automatically trigger simulation when user reaches this section
  useEffect(() => {
    if (isInView) {
      runLiveSimulation()
    }
  }, [isInView])

  return (
    <section ref={sectionRef} className="agent-section-wrapper" id="multi-agent">
      <div className="agent-section-container">
        {/* Header Row */}
        <div className="agent-header-row">
          <motion.div
            className="agent-header-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="terminal-tag-row press-start-2p-regular">
              <span className="terminal-tag-dot" />
              <span>03 // STATEFUL MULTI-AGENT ARCHITECTURE</span>
            </div>

            <h2 className="terminal-heading-main">
              LANGGRAPH <span className="terminal-heading-gold">STATEGRAPH STUDIO</span>
            </h2>
            <p className="terminal-desc-lead">
              A live visual execution graph illustrating the stateful multi-agent ReAct loop
              (Think ➔ Act ➔ Observe) and ChromaDB vector retrieval pipeline.
            </p>
          </motion.div>

          <motion.button
            className="graph-sim-btn bungee-regular"
            onClick={runLiveSimulation}
            disabled={isSimulating}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {isSimulating ? (
              <>
                <RotateCcw size={16} className="scroll-arrow-bouncing" />
                <span>EXECUTING GRAPH...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>EXECUTE STATEGRAPH</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Main 2-Column Studio Layout */}
        <div className="langgraph-main-layout">
          {/* Left Column: Visual Node Graph Canvas */}
          <motion.div
            className="stategraph-canvas-card"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="stategraph-grid-pattern" />

            <div className="stategraph-studio-header">
              <div className="studio-title-badge">
                <Workflow size={16} color="#FFD166" />
                <span>SkillForge StateGraph (v0.8.4 • LangGraph)</span>
              </div>
              <div className="studio-cycle-indicator press-start-2p-regular">
                <span className="studio-pulse-dot" />
                <span>REACT LOOP: ACTIVE</span>
              </div>
            </div>

            {/* Visual Connected Nodes Flow */}
            <div className="graph-nodes-flow-container">
              {/* Row 1: Start ➔ Student Profiler ➔ Gap Analyzer */}
              <div className="graph-flow-row">
                <div
                  className={`graph-node-box ${activeNodeId === 'profiler' ? 'active-executing' : ''} ${completedNodes.includes('profiler') ? 'completed-node' : ''}`}
                  onClick={() => setActiveNodeId('profiler')}
                >
                  <div className="node-header-row">
                    <span className="node-label-title">1. student_profiler</span>
                    <span className="node-type-tag press-start-2p-regular">TOOL</span>
                  </div>
                  <p className="node-desc-small">Loads user skills &amp; verified quiz grades from MongoDB.</p>
                </div>

                <div className={`graph-edge-connector ${activeNodeId === 'profiler' || activeNodeId === 'analyzer' ? 'active' : ''}`}>
                  <ArrowRight size={20} />
                </div>

                <div
                  className={`graph-node-box ${activeNodeId === 'analyzer' ? 'active-executing' : ''} ${completedNodes.includes('analyzer') ? 'completed-node' : ''}`}
                  onClick={() => setActiveNodeId('analyzer')}
                >
                  <div className="node-header-row">
                    <span className="node-label-title">2. gap_analyzer</span>
                    <span className="node-type-tag press-start-2p-regular">FASTAPI</span>
                  </div>
                  <p className="node-desc-small">Computes gap matrix against industry benchmark vectors.</p>
                </div>
              </div>

              {/* Conditional Routing Edge */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem' }}>
                <ArrowDown size={18} color="#FFD166" />
                <span className="graph-cycle-pill press-start-2p-regular">
                  <GitFork size={13} />
                  <span>CONDITIONAL EDGE: [MISSING_GAPS] ➔ RAG RETRIEVER</span>
                </span>
                <ArrowDown size={18} color="#FFD166" />
              </div>

              {/* Row 2: ChromaDB Retriever ➔ ReAct Supervisor Loop */}
              <div className="graph-flow-row">
                <div
                  className={`graph-node-box ${activeNodeId === 'retriever' ? 'active-executing' : ''} ${completedNodes.includes('retriever') ? 'completed-node' : ''}`}
                  onClick={() => setActiveNodeId('retriever')}
                >
                  <div className="node-header-row">
                    <span className="node-label-title">3. chroma_retriever</span>
                    <span className="node-type-tag press-start-2p-regular">VECTOR DB</span>
                  </div>
                  <p className="node-desc-small">Cosine similarity retrieval over local vector embeddings.</p>
                </div>

                <div className={`graph-edge-connector ${activeNodeId === 'retriever' || activeNodeId === 'supervisor' ? 'active' : ''}`}>
                  <ArrowRight size={20} />
                </div>

                <div
                  className={`graph-node-box ${activeNodeId === 'supervisor' ? 'active-executing' : ''} ${completedNodes.includes('supervisor') ? 'completed-node' : ''}`}
                  onClick={() => setActiveNodeId('supervisor')}
                >
                  <div className="node-header-row">
                    <span className="node-label-title">4. react_supervisor</span>
                    <span className="node-type-tag press-start-2p-regular">AGENT CYCLE</span>
                  </div>
                  <p className="node-desc-small">Evaluates prerequisites, capstone difficulty &amp; timelines.</p>
                </div>
              </div>

              {/* Final Directed Edge */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ArrowDown size={18} color="#27C93F" />
              </div>

              {/* Row 3: Final Output Sink */}
              <div
                className={`graph-node-box ${activeNodeId === 'synthesizer' ? 'active-executing' : ''} ${completedNodes.includes('synthesizer') ? 'completed-node' : ''}`}
                onClick={() => setActiveNodeId('synthesizer')}
              >
                <div className="node-header-row">
                  <span className="node-label-title">5. roadmap_synthesizer (OUTPUT SINK)</span>
                  <span className="node-type-tag press-start-2p-regular">GENAI ENGINE</span>
                </div>
                <p className="node-desc-small">Compiles JSON career roadmap with capstone projects and triggers database persistence.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live State Payload Inspector & ChromaDB Vector Collections */}
          <div className="state-inspector-column">
            {/* Live State Payload Card */}
            <motion.div
              className="state-payload-card"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inspector-card-header">
                <Terminal size={17} color="#FFD166" />
                <span>STATEGRAPH PAYLOAD INSPECTOR</span>
              </div>
              <p className="inspector-card-subtitle">
                Active Node: <code style={{ color: '#FFD166' }}>{activeNodeData.title}</code> ({activeNodeData.type})
              </p>

              {/* Formatted JSON State Preview */}
              <div className="json-state-terminal">
                <div><span style={{ color: '#64748b' }}>// Current StateGraph Context</span></div>
                <div>{'{'}</div>
                {Object.entries(activeNodeData.statePayload).map(([k, v]) => (
                  <div key={k} style={{ paddingLeft: '1.2rem' }}>
                    <span className="json-key">"{k}"</span>: {typeof v === 'string' ? (
                      <span className="json-val-str">"{v}"</span>
                    ) : typeof v === 'number' ? (
                      <span className="json-val-num">{v}</span>
                    ) : Array.isArray(v) ? (
                      <span>[ <span className="json-val-str">{v.length} items</span> ]</span>
                    ) : (
                      <span>{JSON.stringify(v)}</span>
                    )},
                  </div>
                ))}
                <div>{'}'}</div>
              </div>
            </motion.div>

            {/* ChromaDB Knowledge Collections Card */}
            <motion.div
              className="chromadb-store-card"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inspector-card-header">
                <Database size={17} color="#FFD166" />
                <span>CHROMADB VECTOR COLLECTIONS</span>
              </div>
              <p className="inspector-card-subtitle">
                Local persistent storage embedded via <code style={{ color: '#FFD166' }}>sentence-transformers</code>.
              </p>

              {CHROMA_COLLECTIONS.map((c, i) => (
                <div key={i} className="chroma-file-item">
                  <div className="chroma-file-left">
                    <FileCode size={15} color="#FFD166" />
                    <span>rag/knowledge-base/{c.file}</span>
                  </div>
                  <span className="chroma-chunks-badge press-start-2p-regular">
                    {c.chunks} CHUNKS
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
