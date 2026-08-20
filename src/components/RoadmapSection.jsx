import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import {
  Code2,
  Brain,
  Database,
  Bot,
  Rocket,
  Clock,
  CheckCircle2,
  Terminal,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import './RoadmapSection.css'

const ROADMAP_TRACKS = {
  'AI Engineer': [
    {
      step: 1,
      title: 'Python OOP & Vector Math Core',
      eta: '2 WEEKS',
      Icon: Code2,
      accent: 'node-accent-gold',
      position: 'pos-top',
      capstone: 'Vector Math & Data Engine',
      desc: 'Object-oriented architecture, metaclasses, NumPy dense vector operations, and memory-efficient matrix data structures.',
      topics: [
        'Python 3.12 Protocol Classes & Type Hints',
        'NumPy Matrix Vectorization & Broadcasting',
        'Memory Profiling & C-Extension Bindings'
      ],
      repoSnippet: 'git clone https://github.com/skillforge/vector-math-engine.git'
    },
    {
      step: 2,
      title: 'Deep Learning & PyTorch Loops',
      eta: '3 WEEKS',
      Icon: Brain,
      accent: 'node-accent-cream',
      position: 'pos-bottom',
      capstone: 'Neural Classifier Engine',
      desc: 'Neural network training pipelines, custom loss optimizers, backpropagation, and dense numerical embedding generation.',
      topics: [
        'PyTorch Tensors, Autograd & GPU Acceleration',
        'Multi-Layer Perceptrons & Attention Mechanisms',
        'Weights & Biases Model Training Telemetry'
      ],
      repoSnippet: 'git clone https://github.com/skillforge/pytorch-classifier.git'
    },
    {
      step: 3,
      title: 'ChromaDB & Vector RAG Pipeline',
      eta: '3 WEEKS',
      Icon: Database,
      accent: 'node-accent-green',
      position: 'pos-top',
      capstone: 'RAG Knowledge Assistant',
      desc: 'Document chunking, cosine vector similarity search, hybrid dense-sparse retrieval, and prompt chaining.',
      topics: [
        'Sentence-Transformers Embedding Extraction',
        'ChromaDB Local Vector Collection Indexing',
        'Contextual Prompt Chaining & Citations'
      ],
      repoSnippet: 'git clone https://github.com/skillforge/chroma-rag-assistant.git'
    },
    {
      step: 4,
      title: 'LangGraph Stateful ReAct Agent',
      eta: '3 WEEKS',
      Icon: Bot,
      accent: 'node-accent-lavender',
      position: 'pos-bottom',
      capstone: 'Autonomous Career Agent',
      desc: 'Stateful LangGraph ReAct agents with cycle loops, external API tools, memory persistence, and dynamic routing.',
      topics: [
        'StateGraph Definition & Reducer Logic',
        'External Tools Integration (FastAPI / APIs)',
        'Checkpointer State Persistence & Threading'
      ],
      repoSnippet: 'git clone https://github.com/skillforge/langgraph-react-agent.git'
    },
    {
      step: 5,
      title: 'FastAPI Microservices & Kubernetes',
      eta: '2 WEEKS',
      Icon: Rocket,
      accent: 'node-accent-blue',
      position: 'pos-top',
      capstone: 'Cloud Containerized Stack',
      desc: 'Async REST/gRPC endpoints, Docker Compose multi-service orchestration, ConfigMaps, and Kubernetes deployment.',
      topics: [
        'FastAPI Async Routing & Pydantic Validation',
        'Docker Compose Multi-Container Orchestration',
        'Kubernetes Ingress & Deployment Manifests'
      ],
      repoSnippet: 'git clone https://github.com/skillforge/fastapi-k8s-stack.git'
    }
  ],
  'Backend Developer': [
    {
      step: 1,
      title: 'Distributed System Architecture',
      eta: '2 WEEKS',
      Icon: Layers,
      accent: 'node-accent-gold',
      position: 'pos-top',
      capstone: 'High-Concurrency API Gateway',
      desc: 'Thread pools, async event loops, rate limiting, and distributed authentication middlewares.',
      topics: ['AsyncIO Event Loops', 'Token Authentication & OAuth2', 'Redis In-Memory Caching'],
      repoSnippet: 'git clone https://github.com/skillforge/api-gateway-core.git'
    },
    {
      step: 2,
      title: 'PostgreSQL & Database Indexing',
      eta: '3 WEEKS',
      Icon: Database,
      accent: 'node-accent-cream',
      position: 'pos-bottom',
      capstone: 'ACID Transaction Engine',
      desc: 'Query execution plans, B-Tree and GIN indexing, database sharding, and write-ahead logs.',
      topics: ['Query Planner Optimization', 'B-Tree & GiST Indexing', 'Database Partitioning'],
      repoSnippet: 'git clone https://github.com/skillforge/postgres-sharded-db.git'
    },
    {
      step: 3,
      title: 'Kafka & Event-Driven Messaging',
      eta: '3 WEEKS',
      Icon: Sparkles,
      accent: 'node-accent-green',
      position: 'pos-top',
      capstone: 'Event Stream Processor',
      desc: 'Publish-subscribe messaging, partition consumer groups, dead-letter queues, and idempotency.',
      topics: ['Kafka Producer/Consumer Architecture', 'Avro Schema Registry', 'Eventual Consistency'],
      repoSnippet: 'git clone https://github.com/skillforge/event-stream-kafka.git'
    },
    {
      step: 4,
      title: 'gRPC & Microservices Mesh',
      eta: '3 WEEKS',
      Icon: Bot,
      accent: 'node-accent-lavender',
      position: 'pos-bottom',
      capstone: 'gRPC Microservices Cluster',
      desc: 'Protobuf binary serialization, HTTP/2 streaming, circuit breakers, and service discovery.',
      topics: ['Protobuf 3 IDL Definitions', 'Bi-Directional Streaming', 'Envoy Proxy Service Mesh'],
      repoSnippet: 'git clone https://github.com/skillforge/grpc-microservices.git'
    },
    {
      step: 5,
      title: 'Docker & Kubernetes Production',
      eta: '2 WEEKS',
      Icon: Rocket,
      accent: 'node-accent-blue',
      position: 'pos-top',
      capstone: 'Zero-Downtime Cluster',
      desc: 'Continuous deployment pipelines, Helm charts, health probes, and horizontal pod autoscalers.',
      topics: ['Multi-Stage Dockerfiles', 'Helm Chart Packaging', 'Kubernetes HPA Autoscaling'],
      repoSnippet: 'git clone https://github.com/skillforge/k8s-cluster-helm.git'
    }
  ]
}

export default function RoadmapSection() {
  const sectionRef = useRef(null)
  const pathRef = useRef(null)
  const cometRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const [activeRole, setActiveRole] = useState('AI Engineer')
  const [selectedStep, setSelectedStep] = useState(1)

  const currentMilestones = ROADMAP_TRACKS[activeRole] || ROADMAP_TRACKS['AI Engineer']
  const activeMilestoneData = currentMilestones.find((m) => m.step === selectedStep) || currentMilestones[0]

  // GSAP Path Drawing & Traveling Comet Pulse
  useEffect(() => {
    if (isInView && pathRef.current) {
      const length = pathRef.current.getTotalLength()
      gsap.set(pathRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length
      })
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 2.2,
        ease: 'power2.out'
      })

      // Animate travelling energy particle along SVG path continuously
      if (cometRef.current) {
        const path = pathRef.current
        const val = { progress: 0 }
        gsap.to(val, {
          progress: 1,
          duration: 6,
          repeat: -1,
          ease: 'linear',
          onUpdate: () => {
            const point = path.getPointAtLength(val.progress * length)
            if (cometRef.current) {
              cometRef.current.setAttribute('cx', point.x)
              cometRef.current.setAttribute('cy', point.y)
            }
          }
        })
      }
    }
  }, [isInView, activeRole])

  return (
    <section ref={sectionRef} className="winding-roadmap-section" id="roadmaps">
      <div className="winding-roadmap-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <div className="terminal-tag-row press-start-2p-regular" style={{ justifyContent: 'center' }}>
            <span className="terminal-tag-dot" />
            <span>02 // INTERACTIVE GENAI ROADMAP JOURNEY</span>
          </div>

          <h2 className="terminal-heading-main">
            ROADMAP TO <span className="terminal-heading-gold">TECH LEADERSHIP</span>
          </h2>
          <p className="terminal-desc-lead" style={{ margin: '0 auto' }}>
            A live, interactive milestone trajectory designed by the LangGraph AI Planner.
            Click any milestone pin to inspect technical topics and capstone blueprints.
          </p>

          {/* Dynamic Role Switcher */}
          <div className="roadmap-role-nav">
            {Object.keys(ROADMAP_TRACKS).map((role) => (
              <button
                key={role}
                className={`roadmap-role-pill bungee-regular ${activeRole === role ? 'active' : ''}`}
                onClick={() => {
                  setActiveRole(role)
                  setSelectedStep(1)
                }}
              >
                <Sparkles size={14} />
                <span>{role} Track</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Winding Canvas Stage */}
        <div className="journey-canvas-stage">
          {/* SVG Winding Path Curve */}
          <svg
            className="journey-svg-canvas"
            viewBox="0 0 1200 480"
            preserveAspectRatio="none"
          >
            {/* Background Track */}
            <path
              className="journey-path-track"
              d="M 50,180 C 180,60 280,380 400,380 C 520,380 620,100 740,100 C 860,100 950,380 1080,380 C 1140,380 1180,240 1180,240"
            />
            {/* Glowing Active Drawn Line */}
            <path
              ref={pathRef}
              className="journey-path-active"
              d="M 50,180 C 180,60 280,380 400,380 C 520,380 620,100 740,100 C 860,100 950,380 1080,380 C 1140,380 1180,240 1180,240"
            />
            {/* Animated Dashed Flow Line */}
            <path
              className="journey-path-dash"
              d="M 50,180 C 180,60 280,380 400,380 C 520,380 620,100 740,100 C 860,100 950,380 1080,380 C 1140,380 1180,240 1180,240"
            />
            {/* Travelling Live Energy Comet */}
            <circle
              ref={cometRef}
              cx="50"
              cy="180"
              r="8"
              className="comet-pulse-head"
            />
          </svg>

          {/* 5 Milestone Pin Nodes along the Wave with SVG Icons */}
          <div className="journey-milestones-row">
            {currentMilestones.map((item, idx) => {
              const NodeIcon = item.Icon
              const isSelected = selectedStep === item.step

              return (
                <motion.div
                  key={item.step}
                  className={`journey-pin-node ${item.position} ${item.accent} ${isSelected ? 'selected' : ''}`}
                  initial={{ opacity: 0, scale: 0.6, y: item.position === 'pos-top' ? -30 : 30 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + idx * 0.18, ease: 'backOut' }}
                  onClick={() => setSelectedStep(item.step)}
                >
                  {/* Top Pin Layout */}
                  {item.position === 'pos-top' && (
                    <>
                      <div className="pin-info-card">
                        <span className="pin-phase-title">{item.title}</span>
                        <span className="pin-eta-tag press-start-2p-regular">
                          <Clock size={11} />
                          <span>{item.eta}</span>
                        </span>
                        <div className="pin-capstone-deliverable">
                          <span className="gold">CAPSTONE:</span> {item.capstone}
                        </div>
                      </div>

                      <div className="pin-dotted-line" />

                      <div className="pin-badge-circle">
                        <div className="pin-radar-ring" />
                        <span className="pin-step-badge">{item.step}</span>
                        <span className="pin-icon-inner">
                          <NodeIcon size={34} strokeWidth={1.8} />
                        </span>
                      </div>

                      <div className="pin-anchor-dot" />
                    </>
                  )}

                  {/* Bottom Pin Layout */}
                  {item.position === 'pos-bottom' && (
                    <>
                      <div className="pin-anchor-dot" />

                      <div className="pin-badge-circle">
                        <div className="pin-radar-ring" />
                        <span className="pin-step-badge">{item.step}</span>
                        <span className="pin-icon-inner">
                          <NodeIcon size={34} strokeWidth={1.8} />
                        </span>
                      </div>

                      <div className="pin-dotted-line" />

                      <div className="pin-info-card">
                        <span className="pin-phase-title">{item.title}</span>
                        <span className="pin-eta-tag press-start-2p-regular">
                          <Clock size={11} />
                          <span>{item.eta}</span>
                        </span>
                        <div className="pin-capstone-deliverable">
                          <span className="gold">CAPSTONE:</span> {item.capstone}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Interactive Detailed Module Inspector Card */}
        {activeMilestoneData && (
          <motion.div
            key={`${activeRole}-${selectedStep}`}
            className="milestone-inspector-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <div className="inspector-tag-row press-start-2p-regular">
                <span>MILESTONE {activeMilestoneData.step} OF 5</span>
                <span>•</span>
                <span>ESTIMATED DURATION: {activeMilestoneData.eta}</span>
              </div>
              <h3 className="inspector-title">{activeMilestoneData.title}</h3>
              <p className="inspector-desc">{activeMilestoneData.desc}</p>

              <div className="inspector-topics-list">
                {activeMilestoneData.topics.map((t, i) => (
                  <div key={i} className="inspector-topic-item">
                    <CheckCircle2 size={16} color="#FFD166" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="inspector-right-box">
              <div className="inspector-capstone-header">
                CAPSTONE REPO &amp; STARTER CODE
              </div>
              <div className="inspector-repo-snippet">
                <Terminal size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                <span>{activeMilestoneData.repoSnippet}</span>
              </div>
              <button className="inspector-action-btn bungee-regular">
                <span>START MILESTONE {activeMilestoneData.step}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
