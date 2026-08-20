import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Award,
  GraduationCap,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Code2,
  Terminal,
  Cpu,
  Database,
  Layers,
  GitBranch,
  Container,
  ArrowRight,
  Sun,
  Edit3,
  LogOut,
  X,
  Star,
  Zap,
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Bot,
  MessageSquare,
  Send,
  Download,
  History,
  FileText
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import html2pdf from 'html2pdf.js'
import AuthModal from './AuthModal'
import './StudentDashboard.css'
import './Navbar.css'

// Target Role Benchmarks for Dynamic Gap Analysis
const ROLE_BENCHMARKS = {
  'AI Engineer': ['Python', 'PyTorch', 'FastAPI', 'Docker', 'ChromaDB', 'Git', 'TypeScript'],
  'Backend Developer': ['TypeScript', 'Node.js', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'Redis'],
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'CSS', 'Next.js', 'Git', 'Tailwind'],
  'Full-Stack Developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Docker', 'PostgreSQL', 'Git'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'Linux', 'Git', 'Python', 'CI/CD', 'Bash'],
  'Data Scientist': ['Python', 'SQL', 'PyTorch', 'Pandas', 'NumPy', 'Git', 'Scikit-Learn']
}

// 100% Track-Grounded Dynamic 4-Step Roadmaps for all PRD Career Roles
const TRACK_ROADMAPS = {
  'AI Engineer': [
    {
      step: '01',
      title: 'PYTHON & ALGORITHMS',
      desc: 'Master Python async, OOP, vectorized arrays & data structures.',
      capstone: 'Capstone 1: Neural Base Engine',
      tech: 'python'
    },
    {
      step: '02',
      title: 'PYTORCH & NEURAL NETWORKS',
      desc: 'Train deep neural networks, transformer architectures & fine-tune LLMs.',
      capstone: 'Capstone 2: Deep Learning Pipeline',
      tech: 'pytorch'
    },
    {
      step: '03',
      title: 'FASTAPI & VECTOR DATABASES',
      desc: 'Build high-throughput AI microservices with ChromaDB, Redis & Pydantic.',
      capstone: 'Capstone 3: RAG Retrieval API',
      tech: 'fastapi'
    },
    {
      step: '04',
      title: 'AUTONOMOUS AI AGENTS & DOCKER',
      desc: 'Deploy multi-agent orchestration systems with Docker multi-stage builds & SLA monitoring.',
      capstone: 'Capstone 4: Enterprise Autonomous Agent',
      tech: 'docker'
    }
  ],
  'Backend Developer': [
    {
      step: '01',
      title: 'TYPESCRIPT & NODE.JS CORE',
      desc: 'Master asynchronous event loops, REST API design & clean architectural patterns.',
      capstone: 'Capstone 1: High-Performance Gateway',
      tech: 'typescript'
    },
    {
      step: '02',
      title: 'POSTGRESQL & DATABASE SCHEMAS',
      desc: 'Design relational schemas, complex SQL indexing, ORMs & ACID transactions.',
      capstone: 'Capstone 2: Relational Data Platform',
      tech: 'postgresql'
    },
    {
      step: '03',
      title: 'FASTAPI & REDIS CACHING',
      desc: 'Build scalable microservices, pub/sub queues & in-memory caching layers.',
      capstone: 'Capstone 3: Distributed Microservice',
      tech: 'fastapi'
    },
    {
      step: '04',
      title: 'DOCKER & CI/CD DEPLOYMENT',
      desc: 'Containerize backend services, manage environment secrets & automated test pipelines.',
      capstone: 'Capstone 4: Enterprise Production Backend',
      tech: 'docker'
    }
  ],
  'Frontend Developer': [
    {
      step: '01',
      title: 'JAVASCRIPT & CSS ARCHITECTURE',
      desc: 'Master modern ES6+, DOM manipulation, responsive Flexbox & CSS Grid design systems.',
      capstone: 'Capstone 1: Interactive UI Component System',
      tech: 'javascript'
    },
    {
      step: '02',
      title: 'REACT & STATE MANAGEMENT',
      desc: 'Master React hook lifecycles, Redux/Zustand global state & reusable component design.',
      capstone: 'Capstone 2: Dynamic Web Dashboard',
      tech: 'react'
    },
    {
      step: '03',
      title: 'NEXT.JS & TYPESCRIPT INTERFACES',
      desc: 'Implement Server-Side Rendering (SSR), App Router navigation & strict type safety.',
      capstone: 'Capstone 3: Full-Fledged Next.js Web App',
      tech: 'nextjs'
    },
    {
      step: '04',
      title: 'PERFORMANCE & TAILWIND STYLING',
      desc: 'Optimize Web Vitals, dynamic Framer Motion animations & production builds.',
      capstone: 'Capstone 4: Enterprise Web Platform',
      tech: 'tailwind'
    }
  ],
  'Full-Stack Developer': [
    {
      step: '01',
      title: 'JAVASCRIPT & REACT FRONTEND',
      desc: 'Build responsive interactive web UIs with modern React & state management.',
      capstone: 'Capstone 1: Single-Page Web App',
      tech: 'react'
    },
    {
      step: '02',
      title: 'NODE.JS & EXPRESS REST API',
      desc: 'Engineer robust server API endpoints, authentication (JWT/OAuth) & middleware.',
      capstone: 'Capstone 2: Secure RESTful Backend',
      tech: 'nodejs'
    },
    {
      step: '03',
      title: 'POSTGRESQL & DATABASE INTEGRATION',
      desc: 'Connect relational databases, design schemas & write efficient ORM queries.',
      capstone: 'Capstone 3: Full-Stack Data Engine',
      tech: 'postgresql'
    },
    {
      step: '04',
      title: 'DOCKER & FULL-STACK DEPLOYMENT',
      desc: 'Containerize frontend & backend services, set up CI/CD & deploy to cloud infrastructure.',
      capstone: 'Capstone 4: Enterprise Full-Stack Web Platform',
      tech: 'docker'
    }
  ],
  'DevOps Engineer': [
    {
      step: '01',
      title: 'LINUX & BASH SCRIPTING',
      desc: 'Master Linux system administration, shell scripting & server automation.',
      capstone: 'Capstone 1: System Automation CLI',
      tech: 'linux'
    },
    {
      step: '02',
      title: 'GIT & CI/CD PIPELINES',
      desc: 'Build automated GitHub Actions workflows, linting, build matrix & regression tests.',
      capstone: 'Capstone 2: Automated Delivery Pipeline',
      tech: 'git'
    },
    {
      step: '03',
      title: 'DOCKER & CONTAINERIZATION',
      desc: 'Write multi-stage Dockerfiles, Docker Compose orchestrations & security hardening.',
      capstone: 'Capstone 3: Container Orchestration Suite',
      tech: 'docker'
    },
    {
      step: '04',
      title: 'KUBERNETES & CLOUD CLUSTERS',
      desc: 'Deploy Kubernetes Pods, Ingress controllers, Helm charts & monitoring stack.',
      capstone: 'Capstone 4: Self-Healing Enterprise Cluster',
      tech: 'kubernetes'
    }
  ],
  'Data Scientist': [
    {
      step: '01',
      title: 'PYTHON & NUMPY / PANDAS',
      desc: 'Master data manipulation, clean dataframes, vectorization & exploratory analysis.',
      capstone: 'Capstone 1: Exploratory Data Pipeline',
      tech: 'pandas'
    },
    {
      step: '02',
      title: 'SQL & RELATIONAL ANALYTICS',
      desc: 'Write complex SQL aggregations, window functions & statistical analytical queries.',
      capstone: 'Capstone 2: Business Analytics Engine',
      tech: 'sql'
    },
    {
      step: '03',
      title: 'SCIKIT-LEARN & MACHINE LEARNING',
      desc: 'Build predictive models, feature engineering, classification & regression pipelines.',
      capstone: 'Capstone 3: Predictive ML Pipeline',
      tech: 'python'
    },
    {
      step: '04',
      title: 'PYTORCH & DEEP LEARNING',
      desc: 'Train neural networks, natural language models & deploy inference API endpoints.',
      capstone: 'Capstone 4: Production Predictive Analytics System',
      tech: 'pytorch'
    }
  ]
}

// Real Diagnostic Questions Generator for Any Technology across all Track Benchmarks
const SKILL_QUIZ_BANK = {
  'python': {
    question: 'Which method in Python is used to customize developer object string representation?',
    code: `class NeuralNode:\n    def __init__(self, weights):\n        self.weights = weights\n    \n    def __repr__(self):\n        return f"NeuralNode(w={self.weights})"`,
    options: ['__str__()', '__repr__()', '__format__()', '__init__()'],
    correctIndex: 1,
  },
  'pytorch': {
    question: 'Which PyTorch method clears old gradients before running backward propagation?',
    code: `optimizer.zero_grad()\noutputs = model(inputs)\nloss = criterion(outputs, targets)\nloss.backward()`,
    options: ['optimizer.reset()', 'optimizer.zero_grad()', 'model.clear()', 'loss.flush()'],
    correctIndex: 1,
  },
  'fastapi': {
    question: 'How do you declare an async route handler in FastAPI validating JSON payloads via Pydantic?',
    code: `from fastapi import FastAPI\nfrom pydantic import BaseModel\n\nclass SkillModel(BaseModel):\n  title: str\n\n@app.post("/skills")\nasync def add_skill(data: SkillModel):\n  return data`,
    options: ['Using @app.get query params', 'Using Pydantic BaseModel with @app.post', 'Using raw Flask request', 'Using header parameters'],
    correctIndex: 1,
  },
  'docker': {
    question: 'What is the primary benefit of multi-stage Docker builds?',
    code: `FROM node:18-alpine AS builder\nWORKDIR /app\nRUN npm install\n\nFROM node:18-alpine AS runner\nCOPY --from=builder /app/node_modules ./node_modules`,
    options: ['Runs multiple containers simultaneously', 'Drastically reduces production image size & security footprint', 'Bypasses build cache', 'Compiles JavaScript into WebAssembly'],
    correctIndex: 1,
  },
  'chromadb': {
    question: 'In ChromaDB, what operation adds document text and vector embeddings into a collection?',
    code: `collection.add(\n  documents=["AI Agent Architecture"],\n  metadatas=[{"source": "paper"}],\n  ids=["id1"]\n)`,
    options: ['collection.insert_row()', 'collection.add()', 'collection.push()', 'collection.write()'],
    correctIndex: 1,
  },
  'git': {
    question: 'Which command combines feature branch commits into main while maintaining linear history?',
    code: `git checkout feature/ai-quiz\ngit rebase main`,
    options: ['git merge --no-ff', 'git rebase', 'git cherry-pick', 'git stash pop'],
    correctIndex: 1,
  },
  'typescript': {
    question: 'Which TypeScript utility type constructs a type with all properties set to optional?',
    code: `interface Scholar {\n  name: string;\n  score: number;\n}\n\ntype PartialScholar = Partial<Scholar>;`,
    options: ['Required<T>', 'Partial<T>', 'Readonly<T>', 'Record<K, T>'],
    correctIndex: 1,
  },
  'node': {
    question: 'In Node.js, which built-in module provides asynchronous filesystem operations?',
    code: `import fs from 'node:fs/promises';\nconst data = await fs.readFile('config.json', 'utf8');`,
    options: ['path', 'node:fs/promises', 'http', 'events'],
    correctIndex: 1,
  },
  'nodejs': {
    question: 'In Node.js, which built-in module provides asynchronous filesystem operations?',
    code: `import fs from 'node:fs/promises';\nconst data = await fs.readFile('config.json', 'utf8');`,
    options: ['path', 'node:fs/promises', 'http', 'events'],
    correctIndex: 1,
  },
  'postgresql': {
    question: 'Which SQL clause is used to filter aggregated group results in PostgreSQL?',
    code: `SELECT department, COUNT(*) FROM scholars GROUP BY department HAVING COUNT(*) > 5;`,
    options: ['WHERE', 'HAVING', 'GROUP BY', 'FILTER'],
    correctIndex: 1,
  },
  'redis': {
    question: 'Which Redis data structure stores unique elements with associated floating point scores for leaderboard sorting?',
    code: `ZADD scholar_leaderboard 95 "Alex" 100 "Hassan"`,
    options: ['Hash', 'Sorted Set (ZSET)', 'List', 'Set'],
    correctIndex: 1,
  },
  'javascript': {
    question: 'Which array method creates a new array populated with the results of calling a provided function on every element?',
    code: `const scores = [80, 90, 95];\nconst boosted = scores.map(s => s + 5);`,
    options: ['forEach()', 'map()', 'filter()', 'reduce()'],
    correctIndex: 1,
  },
  'react': {
    question: 'In React, which hook is used to run side effects like API fetching or DOM updates after render?',
    code: `import { useEffect } from 'react';\n\nuseEffect(() => {\n  fetchScholarData();\n}, []);`,
    options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
    correctIndex: 1,
  },
  'css': {
    question: 'Which CSS layout system is optimized for two-dimensional grid layouts with rows and columns?',
    code: `.dashboard-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n}`,
    options: ['Flexbox', 'CSS Grid', 'Float Layout', 'Absolute Positioning'],
    correctIndex: 1,
  },
  'nextjs': {
    question: 'In Next.js App Router, which file convention defines a page UI route?',
    code: `// app/dashboard/page.tsx\nexport default function Page() {\n  return <h1>Dashboard</h1>\n}`,
    options: ['index.js', 'page.tsx', 'route.js', 'layout.tsx'],
    correctIndex: 1,
  },
  'tailwind': {
    question: 'In Tailwind CSS, which class sets flex container alignment along the cross-axis?',
    code: `<div className="flex items-center justify-between">...</div>`,
    options: ['justify-center', 'items-center', 'content-center', 'self-auto'],
    correctIndex: 1,
  },
  'kubernetes': {
    question: 'Which Kubernetes resource manages a set of identical Pods to ensure specified replicas run?',
    code: `apiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: 3`,
    options: ['ConfigMap', 'Deployment', 'Service', 'Ingress'],
    correctIndex: 1,
  },
  'linux': {
    question: 'Which Linux command changes file read/write permissions for a user or group?',
    code: `chmod 755 deploy.sh`,
    options: ['chown', 'chmod', 'chgrp', 'umask'],
    correctIndex: 1,
  },
  'sql': {
    question: 'Which SQL operation returns all records from the left table and matched records from the right table?',
    code: `SELECT * FROM students S LEFT JOIN grades G ON S.id = G.student_id;`,
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
    correctIndex: 1,
  },
  'pandas': {
    question: 'In Pandas, which method filters rows based on boolean conditions?',
    code: `import pandas as pd\ndf_high = df[df['score'] >= 80]`,
    options: ['df.filter()', 'Boolean indexing df[df["col"] > x]', 'df.select()', 'df.group()'],
    correctIndex: 1,
  }
}

// Fallback quiz generator for any technology
const getQuizForSkill = (skillName) => {
  const key = skillName.toLowerCase().replace(/[^a-z]/g, '')
  if (SKILL_QUIZ_BANK[key]) return SKILL_QUIZ_BANK[key]
  
  return {
    question: `What is a core best practice when engineering production systems with ${skillName}?`,
    code: `// ${skillName} Production Architecture Check\nconst verified = await validateSystemCompliance('${skillName}');`,
    options: [
      'Ignore error handling and logging',
      'Enforce modular architecture, strict type checks & automated testing',
      'Hardcode passwords directly in source code',
      'Disable async concurrency'
    ],
    correctIndex: 1,
  }
}

export default function StudentDashboard({ onExitDashboard }) {
  const DEFAULT_AVATAR = 'https://imgs.search.brave.com/en8GueUwEke4A7ecDjpRnIpFR8Y-WWOEbjzD2xCNTu0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWd2/My5mb3Rvci5jb20v/aW1hZ2VzL2hvbWVw/YWdlLWZlYXR1cmUt/Y2FyZC9mb3Rvci0z/ZC1hdmF0YXIuanBn'

  const [studentProfile, setStudentProfile] = useState({
    name: 'Scholar Student',
    email: 'student@nust.edu.pk',
    university: 'NUST',
    degree: 'BS Computer Science',
    yearOfStudy: 3,
    experienceLevel: 'intermediate',
    careerGoal: 'AI Engineer',
    avatar: DEFAULT_AVATAR,
    githubUser: '',
    reposCount: 0,
    skills: [],
    projects: [],
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showRepos, setShowRepos] = useState(false)
  const [skillScores, setSkillScores] = useState({})
  const [activeMilestone, setActiveMilestone] = useState(2)

  // Load profile from MongoDB Atlas API & LocalStorage Cache
  const loadProfile = async () => {
    try {
      const cachedScores = JSON.parse(localStorage.getItem('skillforge_scores') || '{}')
      if (Object.keys(cachedScores).length > 0) {
        setSkillScores((prev) => ({ ...prev, ...cachedScores }))
      }

      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      const userEmail = storedUser.email || 'student@nust.edu.pk'

      if (storedUser.name) {
        setStudentProfile((prev) => ({
          ...prev,
          name: storedUser.name,
          email: storedUser.email || prev.email,
          avatar: storedUser.avatar || prev.avatar || DEFAULT_AVATAR,
        }))
      }

      const res = await fetch(`http://localhost:3001/api/profile/${storedUser._id || userEmail}`)
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          const p = data.profile
          setStudentProfile((prev) => ({
            ...prev,
            university: p.university || prev.university,
            degree: p.degree || prev.degree,
            yearOfStudy: p.yearOfStudy || prev.yearOfStudy,
            experienceLevel: p.experienceLevel || prev.experienceLevel,
            careerGoal: p.careerGoal || prev.careerGoal,
            avatar: p.userId?.avatar || p.avatar || prev.avatar || DEFAULT_AVATAR,
            skills: p.skills || [],
            projects: p.projects || [],
            reposCount: p.projects?.length || 0,
          }))

          const mergedScores = { ...cachedScores }
          if (Array.isArray(p.skills)) {
            p.skills.forEach((s) => {
              if (s && s.name) {
                const sKey = s.name.toLowerCase()
                if (s.isVerified && typeof s.verifiedScore === 'number') {
                  mergedScores[sKey] = s.verifiedScore
                }
              }
            })
          }
          setSkillScores(mergedScores)
          localStorage.setItem('skillforge_scores', JSON.stringify(mergedScores))
        }
      }
    } catch (e) {
      console.warn('Using cached profile:', e)
    }
  }

  useEffect(() => {
    loadProfile()
    loadRoadmapHistory()
  }, [])

  // AI Roadmap Generator States (Powered by Groq)
  const [aiRoadmapModalData, setAiRoadmapModalData] = useState(null)
  const [isGeneratingAiRoadmap, setIsGeneratingAiRoadmap] = useState(false)
  const [roadmapHistoryList, setRoadmapHistoryList] = useState([])
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [pdfGeneratingId, setPdfGeneratingId] = useState(null)
  const [activePdfRoadmap, setActivePdfRoadmap] = useState(null)
  const [aiGeneratedMilestones, setAiGeneratedMilestones] = useState(null)

  // Helper: Client-side robust milestone extractor for any generated roadmap text
  const parseMilestonesFromRoadmapText = (text) => {
    const milestones = []
    if (!text) return milestones

    const lines = text.split('\n')
    for (const line of lines) {
      if (line.startsWith('|') && (line.includes('1') || line.includes('2') || line.includes('3') || line.includes('4') || line.includes('5') || line.includes('6') || line.includes('Milestone') || line.includes('Step'))) {
        const parts = line.split('|').map((p) => p.trim()).filter(Boolean)
        if (parts.length >= 3 && !parts[0].includes('---') && !parts[0].toLowerCase().includes('milestone')) {
          const stepNum = String(milestones.length + 1).padStart(2, '0')
          const rawTitle = parts[0].replace(/[*_#`1234567890️⃣]/g, '').trim()
          const rawDesc = parts[1]?.replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ' ').trim() || ''
          const rawCapstone = parts[2]?.replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ' ').trim() || `Capstone ${milestones.length + 1}`

          let tech = 'python'
          const lower = (rawTitle + ' ' + rawDesc + ' ' + rawCapstone).toLowerCase()
          if (lower.includes('torch') || lower.includes('deep learning') || lower.includes('neural')) tech = 'pytorch'
          else if (lower.includes('fastapi') || lower.includes('vector') || lower.includes('chroma') || lower.includes('api')) tech = 'fastapi'
          else if (lower.includes('docker') || lower.includes('cloud') || lower.includes('deploy') || lower.includes('agent')) tech = 'docker'
          else if (lower.includes('react') || lower.includes('frontend') || lower.includes('next')) tech = 'react'
          else if (lower.includes('node') || lower.includes('express') || lower.includes('typescript')) tech = 'typescript'
          else if (lower.includes('postgres') || lower.includes('sql') || lower.includes('database') || lower.includes('redis')) tech = 'postgresql'
          else if (lower.includes('kube') || lower.includes('kubernetes') || lower.includes('linux') || lower.includes('ci/cd')) tech = 'kubernetes'

          milestones.push({
            step: stepNum,
            title: rawTitle.toUpperCase(),
            desc: rawDesc.length > 115 ? rawDesc.substring(0, 112) + '...' : rawDesc,
            capstone: rawCapstone.length > 55 ? rawCapstone.substring(0, 52) + '...' : rawCapstone,
            tech: tech,
          })
        }
      }
    }

    if (milestones.length === 0) {
      const blocks = text.split(/(?=#{1,3}\s*(?:Milestone|Step|\d))/i)
      blocks.forEach((block, idx) => {
        const bLines = block.trim().split('\n')
        if (bLines.length > 0 && /(?:Milestone|Step|\d)/i.test(bLines[0])) {
          const stepNum = String(milestones.length + 1).padStart(2, '0')
          const title = bLines[0].replace(/[*_#`]/g, '').trim().toUpperCase()
          const desc = bLines.slice(1, 4).join(' ').replace(/[*_#`]/g, '').trim()
          milestones.push({
            step: stepNum,
            title: title,
            desc: desc.length > 115 ? desc.substring(0, 112) + '...' : desc,
            capstone: `Capstone ${stepNum}: Production Showcase`,
            tech: idx === 0 ? 'python' : idx === 1 ? 'pytorch' : idx === 2 ? 'fastapi' : 'docker',
          })
        }
      })
    }

    return milestones
  }

  // Fetch Previous Roadmaps History from MongoDB Atlas
  const loadRoadmapHistory = async () => {
    try {
      const email = studentProfile.email || 'student@nust.edu.pk'
      const res = await fetch(`http://localhost:3001/api/ai/roadmap/history/${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.history && data.history.length > 0) {
          setRoadmapHistoryList(data.history)
          if (!aiGeneratedMilestones && data.history[0]?.generatedRoadmapText) {
            const ms = (data.history[0].milestones && data.history[0].milestones.length > 0)
              ? data.history[0].milestones
              : parseMilestonesFromRoadmapText(data.history[0].generatedRoadmapText)
            if (ms && ms.length > 0) {
              setAiGeneratedMilestones(ms)
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not load roadmap history:', e)
    }
  }

  const handleGenerateAiRoadmap = async () => {
    setIsGeneratingAiRoadmap(true)
    try {
      const res = await fetch('http://localhost:3001/api/ai/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: studentProfile.email,
          email: studentProfile.email,
          careerGoal: studentProfile.careerGoal,
          currentSkills: skillScores,
          missingSkills: missingSkills,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setAiRoadmapModalData(data)
        const ms = (data.milestones && data.milestones.length > 0)
          ? data.milestones
          : parseMilestonesFromRoadmapText(data.generatedRoadmapText)
        if (ms && ms.length > 0) {
          setAiGeneratedMilestones(ms)
        }
        loadRoadmapHistory()
      }
    } catch (e) {
      console.warn('AI Roadmap generation error:', e)
    } finally {
      setIsGeneratingAiRoadmap(false)
    }
  }

  const handleSelectPastRoadmap = (hist) => {
    setAiRoadmapModalData(hist)
    const ms = (hist.milestones && hist.milestones.length > 0)
      ? hist.milestones
      : parseMilestonesFromRoadmapText(hist.generatedRoadmapText)
    if (ms && ms.length > 0) {
      setAiGeneratedMilestones(ms)
    }
    setIsHistoryModalOpen(false)
    setShowHistoryDrawer(false)
  }

  // 1-Click Crisp High-Contrast PDF Exporter for any roadmap snapshot
  const handleDownloadRoadmapPdf = (customRoadmap = null) => {
    const roadmap = (customRoadmap && customRoadmap.generatedRoadmapText) ? customRoadmap : aiRoadmapModalData
    if (!roadmap || !roadmap.generatedRoadmapText) {
      console.warn('No roadmap content found for PDF export.')
      return
    }

    const rId = roadmap._id || 'active'
    setPdfGeneratingId(rId)
    setIsExportingPdf(true)
    setActivePdfRoadmap(roadmap)

    setTimeout(() => {
      const element = document.getElementById('skillforge-active-pdf-template')
      if (!element) {
        setIsExportingPdf(false)
        setPdfGeneratingId(null)
        setActivePdfRoadmap(null)
        return
      }

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `SkillForge_${(roadmap.careerGoal || studentProfile.careerGoal).replace(/\s+/g, '_')}_Roadmap.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#FFFFFF', scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          setIsExportingPdf(false)
          setPdfGeneratingId(null)
          setActivePdfRoadmap(null)
        })
        .catch((err) => {
          console.warn('PDF export error:', err)
          setIsExportingPdf(false)
          setPdfGeneratingId(null)
          setActivePdfRoadmap(null)
        })
    }, 250)
  }

  // Dynamic Skill Gap Engine
  const targetRequiredSkills = ROLE_BENCHMARKS[studentProfile.careerGoal] || ROLE_BENCHMARKS['AI Engineer']
  
  const userSkillMap = new Map()
  studentProfile.skills.forEach((s) => {
    if (s && s.name) {
      userSkillMap.set(s.name.toLowerCase(), s.level || 'intermediate')
    }
  })

  const strongSkills = []
  const developingSkills = []
  const missingSkills = []

  targetRequiredSkills.forEach((reqSkill) => {
    const sKey = reqSkill.toLowerCase()
    const level = userSkillMap.get(sKey)
    const score = skillScores[sKey] || 0

    if (score >= 80 || level === 'advanced') {
      strongSkills.push({ name: reqSkill, level: 'advanced', score: score || 90 })
    } else if (score > 0 || level === 'intermediate' || level === 'beginner') {
      developingSkills.push({ name: reqSkill, level: level || 'intermediate', score: score || 50 })
    } else {
      missingSkills.push({ name: reqSkill, level: 'missing', score: 0 })
    }
  })

  studentProfile.skills.forEach((userSkill) => {
    if (userSkill && userSkill.name) {
      const isReq = targetRequiredSkills.some((r) => r.toLowerCase() === userSkill.name.toLowerCase())
      if (!isReq) {
        const sKey = userSkill.name.toLowerCase()
        const score = skillScores[sKey] || 0
        if (score >= 80 || userSkill.level === 'advanced') {
          strongSkills.push(userSkill)
        } else {
          developingSkills.push(userSkill)
        }
      }
    }
  })

  const matchPoints = strongSkills.length * 1.0 + developingSkills.length * 0.5
  const readinessPercent = targetRequiredSkills.length > 0 
    ? Math.min(100, Math.round((matchPoints / targetRequiredSkills.length) * 100))
    : 0

  // Quiz Runner States
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [slideDirection, setSlideDirection] = useState(1)
  const [quizSummary, setQuizSummary] = useState(null)
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)

  // Floating AI Assistant Chat States (Powered by Groq + RAG)
  const [isAiChatOpen, setIsAiChatOpen] = useState(false)
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello Scholar! 🪐 I am your SkillForge AI Career Mentor powered by Groq LLaMA 3.3. Ask me any questions about career pathways, project ideas, or skill gap strategies!',
    },
  ])
  const [aiChatInput, setAiChatInput] = useState('')
  const [isAiChatLoading, setIsAiChatLoading] = useState(false)
  const chatMessagesEndRef = useRef(null)

  useEffect(() => {
    if (isAiChatOpen) {
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }, [aiChatMessages, isAiChatLoading, isAiChatOpen])


  const handleSendAiChatMessage = async (e) => {
    if (e) e.preventDefault()
    if (!aiChatInput.trim() || isAiChatLoading) return
    const userMsg = aiChatInput.trim()
    setAiChatInput('')
    const updated = [...aiChatMessages, { role: 'user', content: userMsg }]
    setAiChatMessages(updated)
    setIsAiChatLoading(true)

    try {
      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          chatHistory: updated,
          studentContext: {
            name: studentProfile.name,
            degree: studentProfile.degree,
            careerGoal: studentProfile.careerGoal,
            missingSkills: missingSkills.map((m) => m.name),
          },
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setAiChatMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
      }
    } catch (err) {
      setAiChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Could not connect to AI Mentor. Please check backend connection.' },
      ])
    } finally {
      setIsAiChatLoading(false)
    }
  }

  // Start Diagnostic 5-Question Assessment Quiz via Express Backend
  const handleStartSkillQuiz = async (skillName) => {
    setQuizSummary(null)
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedOption(null)
    setSlideDirection(1)
    setIsSubmittingQuiz(false)

    try {
      const res = await fetch(`http://localhost:3001/api/assessment/questions`)
      if (res.ok) {
        const data = await res.json()
        if (data.questions) {
          const sKey = skillName.toLowerCase()
          let catKey = 'python'
          if (sKey.includes('web') || sKey.includes('react') || sKey.includes('html') || sKey.includes('css') || sKey.includes('javascript') || sKey.includes('typescript') || sKey.includes('next') || sKey.includes('tailwind')) {
            catKey = 'webDev'
          } else if (sKey.includes('git')) {
            catKey = 'git'
          } else if (sKey.includes('docker') || sKey.includes('kubernetes') || sKey.includes('linux') || sKey.includes('devops') || sKey.includes('bash') || sKey.includes('ci')) {
            catKey = 'devops'
          } else if (sKey.includes('ai') || sKey.includes('torch') || sKey.includes('chroma') || sKey.includes('ml') || sKey.includes('pandas') || sKey.includes('numpy') || sKey.includes('scikit')) {
            catKey = 'ai'
          } else if (sKey.includes('sql') || sKey.includes('db') || sKey.includes('postgres') || sKey.includes('redis') || sKey.includes('database')) {
            catKey = 'databases'
          }

          const qList = data.questions[catKey] || data.questions.python
          setActiveQuiz({
            skillName,
            category: catKey,
            questions: qList,
          })
          return
        }
      }
    } catch (e) {
      console.warn('Using fallback question set:', e)
    }

    const fallbackQ = getQuizForSkill(skillName)
    setActiveQuiz({
      skillName,
      category: 'python',
      questions: [
        { ...fallbackQ, difficulty: 'easy' },
        { ...fallbackQ, id: 'q2', difficulty: 'intermediate' },
        { ...fallbackQ, id: 'q3', difficulty: 'intermediate' },
        { ...fallbackQ, id: 'q4', difficulty: 'hard' },
        { ...fallbackQ, id: 'q5', difficulty: 'hard' },
      ],
    })
  }

  // Handle Next Question or Final Submission
  const handleNextOrSubmitQuestion = async () => {
    if (selectedOption === null || !activeQuiz || !activeQuiz.questions || isSubmittingQuiz) return

    const updatedAnswers = [...userAnswers, selectedOption]
    setUserAnswers(updatedAnswers)

    // Check if more questions exist
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setSlideDirection(1)
      setSelectedOption(null)
      setCurrentQuestionIndex((prev) => prev + 1)
      return
    }

    // Final question answered -> Activate loader state while saving to backend
    setIsSubmittingQuiz(true)

    let correctCount = 0
    activeQuiz.questions.forEach((q, idx) => {
      if (updatedAnswers[idx] === q.correctIndex) {
        correctCount++
      }
    })

    const finalScore = Math.round((correctCount / activeQuiz.questions.length) * 100)
    const sName = activeQuiz.skillName
    const sKey = sName.toLowerCase()

    setSkillScores((prev) => {
      const updated = { ...prev, [sKey]: finalScore }
      localStorage.setItem('skillforge_scores', JSON.stringify(updated))
      return updated
    })

    let updatedSkills = studentProfile.skills.map((s) => {
      if (s && s.name && s.name.toLowerCase() === sKey) {
        return {
          ...s,
          verifiedScore: finalScore,
          isVerified: true,
          level: finalScore >= 80 ? 'advanced' : 'intermediate',
        }
      }
      return s
    })

    if (!updatedSkills.some((s) => s && s.name && s.name.toLowerCase() === sKey)) {
      updatedSkills.push({
        name: sName,
        level: finalScore >= 80 ? 'advanced' : 'intermediate',
        isVerified: true,
        verifiedScore: finalScore,
      })
    }

    setStudentProfile((prev) => {
      const newProf = { ...prev, skills: updatedSkills }
      const stored = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      localStorage.setItem('skillforge_user', JSON.stringify({ ...stored, skills: updatedSkills }))
      return newProf
    })

    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      const answersPayload = activeQuiz.questions.map((q, idx) => ({
        questionId: q.id,
        selectedIndex: updatedAnswers[idx],
      }))

      await fetch(`http://localhost:3001/api/assessment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUser._id,
          email: studentProfile.email,
          category: sName,
          answers: answersPayload,
        }),
      })

      await fetch(`http://localhost:3001/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUser._id,
          email: studentProfile.email,
          skills: updatedSkills,
          careerGoal: studentProfile.careerGoal,
        }),
      })
    } catch (e) {
      console.warn('Submission error:', e)
    } finally {
      setIsSubmittingQuiz(false)
    }

    setQuizSummary({
      score: finalScore,
      correctCount,
      total: activeQuiz.questions.length,
      skillName: activeQuiz.skillName,
    })
  }

  const handleProfileUpdated = (updated) => {
    if (updated) {
      setStudentProfile((prev) => ({
        ...prev,
        university: updated.university || prev.university,
        degree: updated.degree || prev.degree,
        yearOfStudy: updated.yearOfStudy || prev.yearOfStudy,
        experienceLevel: updated.experienceLevel || prev.experienceLevel,
        careerGoal: updated.careerGoal || prev.careerGoal,
        skills: updated.skills || prev.skills,
        projects: updated.projects || prev.projects,
        reposCount: updated.projects?.length || 0,
      }))
    }
  }

  return (
    <div className="dashboard-root">
      {/* Space Video Background */}
      <div className="dashboard-bg-video-container">
        <video src="/login.webm" className="dashboard-bg-video" autoPlay loop muted playsInline />
        <div className="dashboard-video-overlay" />
      </div>

      {/* TOP NAVBAR */}
      <header className="navbar-container" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="navbar-brand" onClick={() => onExitDashboard && onExitDashboard()}>
          <div className="brand-icon-planet">🪐</div>
          <div className="brand-logo-text">
            <span className="brand-text-top bungee-regular">SKILL</span>
            <span className="brand-text-bottom bungee-regular">FORGE</span>
          </div>
        </div>

        <nav className="navbar-menu">
          <button className="navbar-item-btn" onClick={() => onExitDashboard && onExitDashboard()}>
            Home
          </button>
          <button
            className="navbar-item-btn"
            onClick={() => {
              const el = document.getElementById('skill-assessment-hub')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Skill Hub
          </button>
          <button
            className="navbar-item-btn"
            onClick={() => {
              const el = document.getElementById('my-skills-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            My Skills
          </button>
          <button
            className="navbar-item-btn"
            onClick={() => {
              const el = document.getElementById('gap-matrix-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Skill Gaps
          </button>
          <button
            className="navbar-item-btn"
            onClick={() => {
              const el = document.getElementById('roadmap-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            3D Roadmap
          </button>
        </nav>

        <div className="navbar-right-actions">
          <button
            className="navbar-item-btn"
            style={{
              color: '#FFD166',
              border: '1px solid #FFD166',
              backgroundColor: 'rgba(255, 209, 102, 0.12)',
              borderRadius: '20px',
              padding: '0.45rem 1.1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(255, 209, 102, 0.25)',
            }}
            onClick={() => setIsEditModalOpen(true)}
            title="Edit Profile & Skills"
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>

          <button className="theme-toggle-btn" title="Theme Settings">
            <Sun size={18} />
          </button>

          <button
            className="get-started-btn bungee-regular"
            style={{
              background: 'linear-gradient(135deg, #FF6B81 0%, #E5243B 100%)',
              color: '#FFF7E8',
              boxShadow: '0 4px 15px rgba(229, 36, 59, 0.3)',
            }}
            onClick={() => {
              localStorage.removeItem('skillforge_token')
              localStorage.removeItem('skillforge_user')
              if (onExitDashboard) onExitDashboard()
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="dashboard-main-container">
        {/* =========================================================================
            1. STUDENT PROFILE HERO
            ========================================================================= */}
        <motion.div
          className="profile-hero-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="profile-hero-left">
            <div className="profile-avatar-wrapper">
              <img
                src={studentProfile.avatar || DEFAULT_AVATAR}
                alt="Scholar Avatar"
                className="profile-avatar-img"
              />
            </div>

            <div className="profile-info-block">
              <div className="profile-name-row">
                <h1 className="profile-student-name">{studentProfile.name.toUpperCase()}</h1>
                <span className="profile-uni-pill press-start-2p-regular">
                  ✦ {studentProfile.university || 'NUST'}
                </span>
                <button
                  className="dashboard-nav-btn"
                  style={{
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.68rem',
                    borderColor: 'rgba(255, 209, 102, 0.4)',
                    color: '#FFD166',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsEditModalOpen(true)}
                  title="Edit scholar profile data"
                >
                  <Edit3 size={11} />
                  <span>EDIT PROFILE</span>
                </button>
              </div>

              <div className="profile-details-row">
                <span>{studentProfile.degree || 'BS Computer Science'}</span>
                <span>•</span>
                <span>{studentProfile.yearOfStudy}rd Year (Junior)</span>
                <span>•</span>
                <span style={{ color: '#FFD166' }}>⚡ {(studentProfile.experienceLevel || 'INTERMEDIATE').toUpperCase()} LEVEL</span>
              </div>

              <div className="profile-role-selector-pill">
                <Compass size={14} color="#FFD166" />
                <span style={{ fontSize: '0.72rem', color: '#B8B3C7' }}>TARGET TRACK:</span>
                <select
                  className="role-select-input"
                  value={studentProfile.careerGoal}
                  onChange={(e) =>
                    setStudentProfile({ ...studentProfile, careerGoal: e.target.value })
                  }
                >
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                </select>
              </div>
            </div>
          </div>

          <div className="profile-hero-right">
            {/* GitHub Sync Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(13, 16, 26, 0.8)',
                border: '1px solid #222638',
                borderRadius: '12px',
                padding: '0.7rem 1.1rem',
                cursor: 'pointer'
              }}
              onClick={() => setShowRepos(!showRepos)}
              title="Click to view/hide GitHub repos"
            >
              <Code2 size={16} color="#FFD166" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>GITHUB AUTO-SYNC</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFF7E8' }}>
                  {studentProfile.projects?.length || 0} Repos Synced {showRepos ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Circular Readiness Gauge */}
            <div className="readiness-gauge-box">
              <div
                className="gauge-circle"
                style={{ '--progress': `${readinessPercent * 3.6}deg` }}
              >
                <div className="gauge-inner">{readinessPercent}%</div>
              </div>
              <div className="readiness-text-col">
                <span className="readiness-label press-start-2p-regular">CAREER READINESS</span>
                <span className="readiness-status">
                  {readinessPercent >= 70 ? '🔥 Job Ready Track' : '⚡ Developing Foundation'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            2. REAL-TIME SKILL ASSESSMENT HUB (DYNAMIC FOR SELECTED TARGET TRACK)
            ========================================================================= */}
        <div id="skill-assessment-hub" className="dashboard-glass-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">
              <Award size={18} color="#FFD166" />
              <span>REAL-TIME SKILL ASSESSMENT HUB</span>
            </h2>
            <span style={{ fontSize: '0.72rem', color: '#FFD166' }}>
              Target Track: {studentProfile.careerGoal} ({targetRequiredSkills.length} Core Technologies)
            </span>
          </div>

          <div className="assessment-cards-grid">
            {targetRequiredSkills.map((skillName, idx) => {
              const sKey = skillName.toLowerCase()
              const userSkill = studentProfile.skills.find(s => s && s.name && s.name.toLowerCase() === sKey)
              const isVerified = Boolean((userSkill && userSkill.isVerified) || (skillScores[sKey] && skillScores[sKey] > 0))
              const score = isVerified ? (skillScores[sKey] || (userSkill && userSkill.verifiedScore) || 100) : 0

              return (
                <div key={idx} className="assessment-item-card">
                  <div className="assessment-top-row">
                    <span className="assessment-cat-name">
                      <Terminal size={15} color="#FFD166" />
                      <span>{skillName}</span>
                    </span>
                    <span
                      className="assessment-score-badge"
                      style={{
                        color: isVerified ? '#27C93F' : '#B8B3C7',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      {isVerified ? `${score}/100 VERIFIED` : '0/100 (UNTESTED)'}
                    </span>
                  </div>

                  <div className="assessment-progress-track">
                    <div
                      className="assessment-progress-fill"
                      style={{
                        width: `${score}%`,
                        background: isVerified
                          ? 'linear-gradient(90deg, #FFD166 0%, #27C93F 100%)'
                          : '#222638'
                      }}
                    />
                  </div>

                  <button
                    className="assessment-quiz-btn"
                    style={{
                      backgroundColor: isVerified ? '#1c2030' : 'rgba(255, 209, 102, 0.15)',
                      borderColor: isVerified ? '#33394f' : '#FFD166',
                      color: isVerified ? '#FFF7E8' : '#FFD166',
                    }}
                    onClick={() => handleStartSkillQuiz(skillName)}
                  >
                    <Sparkles size={13} color="#FFD166" />
                    <span>{isVerified ? 'Retake Diagnosis' : 'Take Diagnostic Quiz'}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* =========================================================================
            3. MY CONFIGURED SKILLS MATRIX (PERMANENTLY SHOWN AS REQUESTED)
            ========================================================================= */}
        <div id="my-skills-section" className="dashboard-glass-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">
              <Layers size={18} color="#FFD166" />
              <span>GUARDIANS CONFIGURED SKILLS MATRIX</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#B8B3C7' }}>
                {studentProfile.skills.length} Active Technologies
              </span>
              <button
                className="assessment-quiz-btn"
                style={{ width: 'auto', padding: '0.35rem 0.8rem' }}
                onClick={() => setIsEditModalOpen(true)}
              >
                <Plus size={13} color="#FFD166" />
                <span>Add / Edit Skills</span>
              </button>
            </div>
          </div>

          {studentProfile.skills.length === 0 ? (
            <div className="skills-empty-state" style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
              <span style={{ color: '#B8B3C7', fontSize: '0.8rem' }}>
                No custom skills added yet. Click "Add / Edit Skills" to populate your technologies!
              </span>
            </div>
          ) : (
            <div className="skills-tag-cloud" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              {studentProfile.skills.map((skill, idx) => (
                <div key={idx} className={`skill-chip-luxury level-${skill.level || 'intermediate'}`}>
                  <span className="skill-chip-name" style={{ fontSize: '0.84rem', fontWeight: 700 }}>
                    {skill.name}
                  </span>
                  <span
                    className="skill-level-select-pill"
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background:
                        skill.level === 'advanced'
                          ? 'rgba(39, 201, 63, 0.2)'
                          : skill.level === 'beginner'
                          ? 'rgba(0, 210, 255, 0.2)'
                          : 'rgba(255, 209, 102, 0.2)',
                      color:
                        skill.level === 'advanced'
                          ? '#27C93F'
                          : skill.level === 'beginner'
                          ? '#00D2FF'
                          : '#FFD166',
                    }}
                  >
                    {skill.level === 'advanced' ? (
                      <>
                        <Flame size={11} color="#27C93F" />
                        <span>ADV</span>
                      </>
                    ) : skill.level === 'beginner' ? (
                      <>
                        <Star size={11} color="#00D2FF" />
                        <span>BEG</span>
                      </>
                    ) : (
                      <>
                        <Zap size={11} color="#FFD166" />
                        <span>INTER</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            4. FETCHED GITHUB REPOSITORIES (HIDDEN BY DEFAULT, EXPANDS ON TOGGLE)
            ========================================================================= */}
        <div className="dashboard-glass-panel">
          <div
            className="panel-header-row"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setShowRepos(!showRepos)}
          >
            <h2 className="panel-title">
              <Code2 size={18} color="#FFD166" />
              <span>FETCHED GITHUB REPOSITORIES ({studentProfile.projects?.length || 0})</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FFD166', fontSize: '0.78rem', fontWeight: 700 }}>
              <span>{showRepos ? 'Hide Repositories' : 'Click to View Repositories'}</span>
              {showRepos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          <AnimatePresence>
            {showRepos && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden', paddingTop: '1rem' }}
              >
                {!studentProfile.projects || studentProfile.projects.length === 0 ? (
                  <div className="skills-empty-state" style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                    <span style={{ color: '#B8B3C7', fontSize: '0.8rem' }}>
                      No GitHub repositories synced yet. Click "Edit Profile" to auto-fetch public repositories!
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {studentProfile.projects.map((repo, rIdx) => (
                      <a
                        key={rIdx}
                        href={repo.link || `https://github.com/${studentProfile.githubUser}/${repo.title}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="assessment-item-card" style={{ height: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFF7E8' }}>
                              {repo.title}
                            </span>
                            <ExternalLink size={14} color="#FFD166" />
                          </div>

                          <p style={{ fontSize: '0.74rem', color: '#B8B3C7', lineHeight: 1.35, marginBottom: '0.6rem' }}>
                            {repo.description || 'Public repository'}
                          </p>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {repo.techStack &&
                              repo.techStack.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} className="github-repo-lang-tag">
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* =========================================================================
            5. DYNAMIC SKILL GAP ANALYSIS MATRIX
            ========================================================================= */}
        <div id="gap-matrix-section" className="dashboard-glass-panel">
          <div className="panel-header-row">
            <h2 className="panel-title">
              <Layers size={18} color="#FFD166" />
              <span>DYNAMIC SKILL GAP ANALYSIS</span>
            </h2>
            <span style={{ fontSize: '0.68rem', color: '#FFD166' }}>
              Target Track: {studentProfile.careerGoal}
            </span>
          </div>

          <div className="gap-columns-grid">
            {/* Strong Skills */}
            <div className="gap-col-box">
              <span className="gap-col-header strong press-start-2p-regular">
                <CheckCircle2 size={12} />
                <span>STRONG ({strongSkills.length})</span>
              </span>
              {strongSkills.length === 0 ? (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>No strong skills verified yet</span>
              ) : (
                strongSkills.map((s, i) => (
                  <div key={i} className="gap-skill-item">
                    <span>{s.name}</span>
                    <span style={{ color: '#27C93F', fontWeight: 700 }}>
                      {s.score ? `${s.score}%` : '80%'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Developing Skills */}
            <div className="gap-col-box">
              <span className="gap-col-header weak press-start-2p-regular">
                <AlertTriangle size={12} />
                <span>DEVELOPING ({developingSkills.length})</span>
              </span>
              {developingSkills.length === 0 ? (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>No developing skills</span>
              ) : (
                developingSkills.map((s, i) => (
                  <div key={i} className="gap-skill-item">
                    <span>{s.name}</span>
                    <span style={{ color: '#FFD166', fontWeight: 700 }}>
                      {s.score ? `${s.score}%` : '50%'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Missing Skills */}
            <div className="gap-col-box">
              <span className="gap-col-header missing press-start-2p-regular">
                <Flame size={12} />
                <span>MISSING ({missingSkills.length})</span>
              </span>
              {missingSkills.length === 0 ? (
                <span style={{ fontSize: '0.72rem', color: '#27C93F' }}>All target role skills matched!</span>
              ) : (
                missingSkills.map((s, i) => (
                  <div key={i} className="gap-skill-item">
                    <span>{s.name}</span>
                  <span style={{ color: '#FF6B81', fontWeight: 700 }}>0%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. 3D INTERACTIVE AI CAREER ROADMAP PATHWAY (DYNAMICALLY GENERATED BY AI)
            ========================================================================= */}
        <div id="roadmap-section" className="dashboard-glass-panel">
          <div className="panel-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <h2 className="panel-title">
                <Compass size={18} color="#FFD166" />
                <span>3D AI CAREER ROADMAP PATHWAY</span>
              </h2>
              {aiGeneratedMilestones && aiGeneratedMilestones.length > 0 ? (
                <span
                  style={{
                    background: 'rgba(255, 209, 102, 0.15)',
                    border: '1px solid #FFD166',
                    borderRadius: '12px',
                    padding: '0.2rem 0.6rem',
                    color: '#FFD166',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Sparkles size={11} color="#FFD166" />
                  <span>AI DYNAMIC BLUEPRINT ({aiGeneratedMilestones.length} MILESTONES)</span>
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Standard Track: {studentProfile.careerGoal}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {aiGeneratedMilestones && (
                <button
                  onClick={() => setAiGeneratedMilestones(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #33394f',
                    borderRadius: '10px',
                    padding: '0.45rem 0.75rem',
                    color: '#B8B3C7',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                  title="Reset to default benchmark track"
                >
                  Reset Default
                </button>
              )}

              {/* Previous Roadmaps Button */}
              <button
                style={{
                  background: 'rgba(255, 209, 102, 0.1)',
                  border: '1px solid rgba(255, 209, 102, 0.4)',
                  borderRadius: '12px',
                  padding: '0.45rem 0.9rem',
                  color: '#FFD166',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  loadRoadmapHistory()
                  setIsHistoryModalOpen(true)
                }}
              >
                <History size={14} color="#FFD166" />
                <span>HISTORY</span>
              </button>

              <button
                className="assessment-quiz-btn"
                style={{
                  width: 'auto',
                  padding: '0.4rem 0.9rem',
                  background: 'linear-gradient(135deg, rgba(255, 209, 102, 0.25) 0%, rgba(255, 107, 129, 0.25) 100%)',
                  borderColor: '#FFD166',
                  color: '#FFD166',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: isGeneratingAiRoadmap ? 'not-allowed' : 'pointer',
                }}
                onClick={handleGenerateAiRoadmap}
                disabled={isGeneratingAiRoadmap}
              >
                {isGeneratingAiRoadmap ? (
                  <>
                    <RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>AI GENERATING...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} color="#FFD166" />
                    <span>GENERATE AI ROADMAP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="roadmap-side-by-side-layout">
            {/* Cosmic Cat standing FREELY on the left side */}
            <div className="roadmap-side-cat-companion">
              <div className="cat-free-dialog-bubble">
                <span className="press-start-2p-regular" style={{ fontSize: '0.62rem', color: '#FFD166' }}>
                  ✦ COSMIC CAT NAVIGATOR
                </span>
                <p style={{ fontSize: '0.8rem', color: '#FFF7E8', margin: '0.35rem 0 0 0', lineHeight: 1.35 }}>
                  {(() => {
                    const steps = (aiGeneratedMilestones && aiGeneratedMilestones.length > 0)
                      ? aiGeneratedMilestones
                      : (TRACK_ROADMAPS[studentProfile.careerGoal] || TRACK_ROADMAPS['AI Engineer'])
                    const activeStep = steps[1] || steps[0]
                    return `"Scholar ${studentProfile.name.split(' ')[0]}! Step ${activeStep?.step || '02'} ('${activeStep?.title || 'PyTorch'}') is your active target!"`
                  })()}
                </p>
              </div>

              <img src="/cat.png" alt="Cosmic Cat Guide" className="cat-free-standing-img" />
            </div>

            {/* Alternating Up-Down-Up-Down 3D Step Roadmap Deck */}
            <div className="roadmap-3d-zigzag-stage">
              {/* Horizontal Center Laser Line */}
              <div className="roadmap-zigzag-laser-line" />

              <div className="roadmap-zigzag-deck">
                {(() => {
                  const roadmapSteps = (aiGeneratedMilestones && aiGeneratedMilestones.length > 0)
                    ? aiGeneratedMilestones
                    : (TRACK_ROADMAPS[studentProfile.careerGoal] || TRACK_ROADMAPS['AI Engineer'])
                  let activeFocusFound = false

                  return roadmapSteps.map((stepItem, sIdx) => {
                    const stepNum = sIdx + 1
                    const positionClass = sIdx % 2 === 0 ? 'position-up' : 'position-down'
                    const sTechKey = (stepItem.tech || '').toLowerCase()
                    
                    const userSkill = studentProfile.skills.find(s => s && s.name && s.name.toLowerCase().includes(sTechKey))
                    const isVerified = Boolean((userSkill && userSkill.isVerified) || (skillScores[sTechKey] && skillScores[sTechKey] >= 80))

                    let statusText = '🔒 LOCKED'
                    let statusColor = '#64748b'
                    let cardStateClass = ''

                    if (isVerified) {
                      statusText = '✓ VERIFIED'
                      statusColor = '#27C93F'
                      cardStateClass = 'completed'
                    } else if (!activeFocusFound) {
                      statusText = '⚡ ACTIVE FOCUS'
                      statusColor = '#FFD166'
                      cardStateClass = 'active'
                      activeFocusFound = true
                    } else if (sIdx === roadmapSteps.length - 1) {
                      statusText = '🔒 GRADUATION'
                      statusColor = '#64748b'
                    }

                    return (
                      <div
                        key={sIdx}
                        className={`zigzag-card-wrapper ${positionClass} ${activeMilestone === stepNum ? 'active' : ''} ${cardStateClass}`}
                        onClick={() => setActiveMilestone(stepNum)}
                      >
                        <div className="zigzag-connector-stem" />
                        <div className="zigzag-laser-node-dot">0{stepNum}</div>

                        <div className="zigzag-3d-card">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className="step-card-num-badge">STEP 0{stepNum}</span>
                            <span style={{ color: statusColor, fontSize: '0.68rem', fontWeight: 800 }}>{statusText}</span>
                          </div>
                          <h3 className="step-card-title">{stepItem.title}</h3>
                          <p className="step-card-desc">{stepItem.desc}</p>
                          <div
                            className="step-capstone-pill"
                            style={{ color: isVerified ? '#27C93F' : cardStateClass === 'active' ? '#FFD166' : '#B8B3C7' }}
                          >
                            ✦ {stepItem.capstone}
                          </div>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* INTERACTIVE 5-QUESTION SLIDING QUIZ COCKPIT MODAL */}
      <AnimatePresence>
        {activeQuiz && (
          <motion.div
            className="quiz-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {quizSummary ? (
              /* FINAL QUIZ SUMMARY COCKPIT VIEW */
              <motion.div
                className="quiz-runner-card"
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                style={{ textAlign: 'center', alignItems: 'center' }}
              >
                <div className="quiz-header" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Award size={20} color="#FFD166" />
                    <h3 className="bungee-regular" style={{ fontSize: '1.2rem', color: '#FFF7E8' }}>
                      {quizSummary.skillName.toUpperCase()} DIAGNOSIS COMPLETED!
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveQuiz(null)
                      setQuizSummary(null)
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#FFF7E8', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ margin: '1.2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: quizSummary.score >= 70 ? 'rgba(39, 201, 63, 0.2)' : 'rgba(255, 209, 102, 0.2)',
                      border: quizSummary.score >= 70 ? '3px solid #27C93F' : '3px solid #FFD166',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: quizSummary.score >= 70 ? '#27C93F' : '#FFD166',
                      boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                    }}
                  >
                    {quizSummary.score}%
                  </div>

                  <h2 style={{ fontSize: '1.1rem', color: '#FFF7E8', fontWeight: 800 }}>
                    {quizSummary.score >= 80 ? '🔥 EXPERT VERIFIED SCHOLAR!' : '⚡ DEVELOPING SKILL FOUNDATION'}
                  </h2>

                  <p style={{ fontSize: '0.85rem', color: '#B8B3C7', maxWidth: '420px', lineHeight: 1.4 }}>
                    You correctly answered <strong style={{ color: '#FFD166' }}>{quizSummary.correctCount} of {quizSummary.total}</strong> authentic PRD technical questions. Score persisted to MongoDB Atlas!
                  </p>
                </div>

                <button
                  className="auth-submit-btn bungee-regular"
                  onClick={() => {
                    setActiveQuiz(null)
                    setQuizSummary(null)
                  }}
                  style={{ width: '100%' }}
                >
                  <span>RETURN TO SKILL HUB</span>
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            ) : (
              /* ACTIVE QUESTION SLIDING COCKPIT VIEW */
              (() => {
                const qList = activeQuiz.questions || []
                const currentQ = qList[currentQuestionIndex] || qList[0]
                const difficulty = (
                  currentQ?.difficulty ||
                  (currentQuestionIndex === 0 ? 'easy' : currentQuestionIndex < 3 ? 'intermediate' : 'hard')
                ).toLowerCase()

                const isEasyOrHard = difficulty === 'easy' || difficulty === 'hard'
                const isIntermediate = difficulty === 'intermediate'

                return (
                  <div
                    className={`quiz-cockpit-stage ${!isEasyOrHard ? 'no-left' : ''} ${!isIntermediate ? 'no-right' : ''}`}
                  >
                    {/* LEFT CHARACTER (Shown for EASY or HARD difficulty) */}
                    {isEasyOrHard && (
                      <div className="quiz-char-side-col">
                        <img
                          src={difficulty === 'easy' ? '/easy.png' : '/hard.png'}
                          alt="Diagnostic Mentor"
                          className="quiz-char-side-img"
                        />
                        <div className="quiz-char-side-badge press-start-2p-regular">
                          <span>{difficulty === 'easy' ? '✦ EASY DIAGNOSIS' : '✦ HARD DIAGNOSIS'}</span>
                        </div>
                      </div>
                    )}

                    {/* CENTER SLIDING QUESTION FORM */}
                    <AnimatePresence mode="wait" custom={slideDirection}>
                      <motion.div
                        key={currentQuestionIndex}
                        custom={slideDirection}
                        initial={{ opacity: 0, x: slideDirection > 0 ? 70 : -70 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: slideDirection > 0 ? -70 : 70 }}
                        transition={{ type: 'spring', stiffness: 130, damping: 18 }}
                        className="quiz-center-form-box"
                      >
                        {/* Header & Question Counter */}
                        <div className="quiz-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Award size={18} color="#FFD166" />
                            <h3 className="bungee-regular" style={{ fontSize: '1rem', color: '#FFF7E8' }}>
                              {activeQuiz.skillName.toUpperCase()} ASSESSMENT
                            </h3>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span className={`quiz-difficulty-pill ${difficulty}`}>
                              {difficulty.toUpperCase()}
                            </span>

                            <span
                              className="press-start-2p-regular"
                              style={{
                                fontSize: '0.68rem',
                                color: '#FFD166',
                                backgroundColor: 'rgba(255, 209, 102, 0.12)',
                                border: '1px solid rgba(255, 209, 102, 0.4)',
                                borderRadius: '12px',
                                padding: '0.3rem 0.65rem',
                              }}
                            >
                              {currentQuestionIndex + 1} / {qList.length}
                            </span>

                            <button
                              onClick={() => {
                                setActiveQuiz(null)
                                setSelectedOption(null)
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#FFF7E8',
                                cursor: 'pointer',
                              }}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Top Progress Track */}
                        <div className="quiz-progress-bar-container">
                          <div
                            className="quiz-progress-bar-fill"
                            style={{
                              width: `${((currentQuestionIndex + 1) / qList.length) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Question Text */}
                        <p style={{ fontSize: '0.88rem', color: '#FFF7E8', fontWeight: 600, lineHeight: 1.4 }}>
                          {currentQ?.question}
                        </p>

                        {/* Code Snippet if present */}
                        {currentQ?.code && (
                          <div className="quiz-code-block">{currentQ.code}</div>
                        )}

                        {/* Options List */}
                        <div className="quiz-options-list">
                          {currentQ?.options?.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              className={`quiz-option-btn ${selectedOption === oIdx ? 'selected' : ''}`}
                              onClick={() => setSelectedOption(oIdx)}
                            >
                              <span
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '6px',
                                  background: selectedOption === oIdx ? '#FFD166' : '#1c2030',
                                  color: selectedOption === oIdx ? '#05060A' : '#FFD166',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                }}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>

                        {/* Next / Finish Button */}
                        <button
                          className="auth-submit-btn bungee-regular"
                          onClick={handleNextOrSubmitQuestion}
                          disabled={selectedOption === null || isSubmittingQuiz}
                          style={{
                            opacity: (selectedOption === null || isSubmittingQuiz) ? 0.55 : 1,
                            cursor: (selectedOption === null || isSubmittingQuiz) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem'
                          }}
                        >
                          {isSubmittingQuiz ? (
                            <>
                              <RotateCcw size={16} className="scroll-arrow-bouncing" style={{ animation: 'spin 1s linear infinite' }} />
                              <span>SAVING DIAGNOSIS TO MONGODB ATLAS...</span>
                            </>
                          ) : (
                            <>
                              <span>
                                {currentQuestionIndex < qList.length - 1
                                  ? `NEXT QUESTION (${currentQuestionIndex + 1}/${qList.length})`
                                  : `FINISH & SUBMIT DIAGNOSIS (${qList.length}/${qList.length})`}
                              </span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </motion.div>
                    </AnimatePresence>

                    {/* RIGHT CHARACTER (Shown for INTERMEDIATE difficulty) */}
                    {isIntermediate && (
                      <div className="quiz-char-side-col">
                        <img
                          src="/man.png"
                          alt="Intermediate Mentor"
                          className="quiz-char-side-img"
                        />
                        <div className="quiz-char-side-badge press-start-2p-regular">
                          <span>✦ INTERMEDIATE DIAGNOSIS</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          7. GENAI CAREER ROADMAP MODAL (POWERED BY GROQ CLOUD)
          ========================================================================= */}
      <AnimatePresence>
        {aiRoadmapModalData && (
          <motion.div
            className="quiz-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 10000 }}
          >
            <motion.div
              className="ai-roadmap-modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                height: '88vh',
                maxHeight: '88vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div className="ai-roadmap-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(255, 209, 102, 0.25) 0%, rgba(255, 107, 129, 0.25) 100%)',
                      border: '1.5px solid #FFD166',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={22} color="#FFD166" />
                  </div>
                  <div>
                    <h2 className="bungee-regular" style={{ fontSize: '1.25rem', color: '#FFF7E8', margin: 0 }}>
                      AI PERSONALIZED ROADMAP • {aiRoadmapModalData.careerGoal?.toUpperCase()}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.35rem' }}>
                      <span className="ai-roadmap-badge-pill">
                        <Cpu size={12} />
                        <span>POWERED BY GROQ CLOUD (GPT-OSS-120B)</span>
                      </span>
                      <span className="ai-roadmap-badge-pill" style={{ borderColor: '#FFD166', color: '#FFD166', background: 'rgba(255, 209, 102, 0.12)' }}>
                        <Terminal size={12} />
                        <span>SPEED: 0.27s</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {/* Previous Roadmaps History Toggle */}
                  <button
                    onClick={() => {
                      setShowHistoryDrawer(!showHistoryDrawer)
                      if (!showHistoryDrawer) loadRoadmapHistory()
                    }}
                    style={{
                      background: showHistoryDrawer ? 'rgba(255, 209, 102, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid #FFD166',
                      borderRadius: '12px',
                      padding: '0.45rem 0.85rem',
                      color: '#FFD166',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                    }}
                    title="View previously generated roadmaps"
                  >
                    <History size={14} />
                    <span>PREVIOUS ({roadmapHistoryList.length})</span>
                  </button>

                  {/* Close Modal Button */}
                  <button
                    onClick={() => {
                      setAiRoadmapModalData(null)
                      setShowHistoryDrawer(false)
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid #33394f',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF7E8',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Main Content Area (With optional History Sidebar) */}
              <div style={{ display: 'flex', flex: '1 1 auto', minHeight: 0, gap: '1rem', overflow: 'hidden' }}>
                {/* Previous Roadmaps History Drawer */}
                {showHistoryDrawer && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '280px', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    style={{
                      background: 'rgba(13, 16, 26, 0.95)',
                      border: '1px solid #222638',
                      borderRadius: '16px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      overflowY: 'auto',
                      minWidth: '260px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c2030', paddingBottom: '0.5rem' }}>
                      <span className="press-start-2p-regular" style={{ fontSize: '0.62rem', color: '#FFD166' }}>
                        PAST ROADMAPS
                      </span>
                      <button
                        onClick={() => setShowHistoryDrawer(false)}
                        style={{ background: 'transparent', border: 'none', color: '#B8B3C7', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {roadmapHistoryList.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>
                        No previous roadmaps found for this account.
                      </span>
                    ) : (
                      roadmapHistoryList.map((hist, hIdx) => (
                        <div
                          key={hIdx}
                          onClick={() => {
                            setAiRoadmapModalData(hist)
                            setShowHistoryDrawer(false)
                          }}
                          style={{
                            background: aiRoadmapModalData?._id === hist._id ? 'rgba(255, 209, 102, 0.18)' : '#070910',
                            border: aiRoadmapModalData?._id === hist._id ? '1.5px solid #FFD166' : '1px solid #1c2030',
                            borderRadius: '10px',
                            padding: '0.65rem 0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFF7E8' }}>
                              {hist.careerGoal}
                            </span>
                            <FileText size={13} color="#FFD166" />
                          </div>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            {hist.createdAt ? new Date(hist.createdAt).toLocaleString() : 'Saved Snapshot'}
                          </span>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {/* Printable and Scrollable Rich Markdown Content */}
                <div
                  id="ai-roadmap-printable-area"
                  className="ai-roadmap-scroll-container"
                  tabIndex={0}
                  style={{
                    flex: '1 1 auto',
                    minHeight: 0,
                    height: '100%',
                    maxHeight: '100%',
                    overflowY: 'auto',
                    paddingRight: '0.8rem',
                  }}
                >
                  <div className="ai-roadmap-markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiRoadmapModalData.generatedRoadmapText}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  marginTop: '1.2rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #1c2030',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ✦ Generated dynamically based on your verified assessment scores &amp; skill gaps.
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  {/* Download as PDF Button */}
                  <button
                    onClick={() => handleDownloadRoadmapPdf(aiRoadmapModalData)}
                    disabled={isExportingPdf}
                    style={{
                      background: 'linear-gradient(135deg, rgba(39, 201, 63, 0.2) 0%, rgba(0, 210, 255, 0.2) 100%)',
                      border: '1.5px solid #27C93F',
                      borderRadius: '12px',
                      padding: '0.55rem 1.3rem',
                      color: '#27C93F',
                      fontFamily: '"Bungee", cursive, sans-serif',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: isExportingPdf ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 20px rgba(39, 201, 63, 0.25)',
                    }}
                  >
                    {isExportingPdf && pdfGeneratingId === (aiRoadmapModalData._id || 'active') ? (
                      <>
                        <RotateCcw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>EXPORTING PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download size={15} />
                        <span>DOWNLOAD AS PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    className="auth-submit-btn bungee-regular"
                    onClick={() => {
                      setAiRoadmapModalData(null)
                      setShowHistoryDrawer(false)
                    }}
                    style={{ width: 'auto', padding: '0.55rem 1.6rem', fontSize: '0.85rem' }}
                  >
                    <span>CLOSE ROADMAP</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          7.5 DEDICATED PREVIOUS ROADMAPS MODAL (WITH 1-CLICK DOWNLOAD & VIEW)
          ========================================================================= */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <motion.div
            className="quiz-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 10000 }}
          >
            <motion.div
              className="ai-roadmap-modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '780px',
                maxWidth: '94vw',
                height: '75vh',
                maxHeight: '75vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div className="ai-roadmap-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(255, 209, 102, 0.2)',
                      border: '1.5px solid #FFD166',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <History size={22} color="#FFD166" />
                  </div>
                  <div>
                    <h2 className="bungee-regular" style={{ fontSize: '1.2rem', color: '#FFF7E8', margin: 0 }}>
                      PREVIOUS GENERATED ROADMAPS ({roadmapHistoryList.length})
                    </h2>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Stored in MongoDB Atlas • Access &amp; Download previous career blueprints anytime
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #33394f',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF7E8',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* History List */}
              <div
                className="ai-roadmap-scroll-container"
                style={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  padding: '1.2rem',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {roadmapHistoryList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <FileText size={42} color="#33394f" />
                    <span style={{ color: '#64748b', fontSize: '0.88rem' }}>
                      No previous roadmaps found yet. Click "GENERATE AI ROADMAP" to generate your first roadmap!
                    </span>
                    <button
                      className="assessment-quiz-btn"
                      style={{ width: 'auto', padding: '0.5rem 1.2rem' }}
                      onClick={() => {
                        setIsHistoryModalOpen(false)
                        handleGenerateAiRoadmap()
                      }}
                    >
                      <Sparkles size={14} color="#FFD166" />
                      <span>GENERATE FIRST ROADMAP</span>
                    </button>
                  </div>
                ) : (
                  roadmapHistoryList.map((hist, hIdx) => (
                    <div
                      key={hIdx}
                      style={{
                        background: 'rgba(13, 16, 26, 0.85)',
                        border: '1px solid #222638',
                        borderRadius: '16px',
                        padding: '1.1rem 1.3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span className="bungee-regular" style={{ fontSize: '1rem', color: '#FFF7E8' }}>
                            {hist.careerGoal}
                          </span>
                          <span
                            style={{
                              background: 'rgba(39, 201, 63, 0.15)',
                              border: '1px solid #27C93F',
                              borderRadius: '8px',
                              padding: '0.15rem 0.5rem',
                              color: '#27C93F',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                            }}
                          >
                            ✓ COMPLETE ROADMAP
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.72rem', color: '#64748b' }}>
                          <span>📅 {hist.createdAt ? new Date(hist.createdAt).toLocaleString() : 'Saved Snapshot'}</span>
                          <span>•</span>
                          <span style={{ color: '#FFD166' }}>⚡ Groq LLaMA 3.3 (120B)</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {/* Download PDF Button */}
                        <button
                          onClick={() => handleDownloadRoadmapPdf(hist)}
                          disabled={isExportingPdf && pdfGeneratingId === (hist._id || 'active')}
                          style={{
                            background: 'rgba(39, 201, 63, 0.15)',
                            border: '1px solid #27C93F',
                            borderRadius: '10px',
                            padding: '0.45rem 0.95rem',
                            color: '#27C93F',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                          }}
                          title="Download high-resolution PDF for this snapshot"
                        >
                          {isExportingPdf && pdfGeneratingId === (hist._id || 'active') ? (
                            <>
                              <RotateCcw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                              <span>DOWNLOADING...</span>
                            </>
                          ) : (
                            <>
                              <Download size={13} />
                              <span>DOWNLOAD PDF</span>
                            </>
                          )}
                        </button>

                        {/* View Roadmap Button */}
                        <button
                          onClick={() => handleSelectPastRoadmap(hist)}
                          className="auth-submit-btn bungee-regular"
                          style={{ width: 'auto', padding: '0.45rem 1.1rem', fontSize: '0.78rem' }}
                        >
                          <span>VIEW ROADMAP</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* =========================================================================
          8. FLOATING AI ASSISTANT CHAT COCKPIT (RAG + GROQ CLOUD)
          ========================================================================= */}
      <div style={{ position: 'fixed', bottom: '20px', right: '25px', zIndex: 999 }}>
        {!isAiChatOpen ? (
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            onClick={() => setIsAiChatOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {/* Top Speech Bubble Badge */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(13, 16, 26, 0.95) 0%, rgba(30, 20, 45, 0.95) 100%)',
                border: '1.5px solid #FFD166',
                borderRadius: '16px',
                padding: '0.45rem 0.95rem',
                color: '#FFD166',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 8px 25px rgba(255, 209, 102, 0.35)',
                marginBottom: '-12px',
                zIndex: 2,
                position: 'relative',
              }}
            >
              <Sparkles size={13} color="#FFD166" />
              <span className="press-start-2p-regular" style={{ fontSize: '0.62rem' }}>ASK AI MENTOR</span>
            </div>

            {/* Character Image hard.png */}
            <img
              src="/hard.png"
              alt="AI Mentor Character"
              style={{
                width: '130px',
                height: '150px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 20px rgba(255, 209, 102, 0.35))',
                transition: 'transform 0.3s ease',
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              width: '430px',
              maxWidth: '92vw',
              height: '570px',
              maxHeight: '88vh',
              background: 'rgba(7, 9, 16, 0.98)',
              backdropFilter: 'blur(30px)',
              border: '1.5px solid #FFD166',
              borderRadius: '22px',
              boxShadow: '0 25px 80px rgba(0,0,0,0.98), 0 0 50px rgba(255, 209, 102, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                padding: '0.9rem 1.1rem',
                background: 'linear-gradient(135deg, rgba(255, 209, 102, 0.22) 0%, rgba(255, 107, 129, 0.22) 100%)',
                borderBottom: '1px solid #1c2030',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'rgba(255, 209, 102, 0.25)',
                    border: '1px solid #FFD166',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={18} color="#FFD166" />
                </div>
                <div>
                  <h4 className="bungee-regular" style={{ fontSize: '0.9rem', color: '#FFF7E8', margin: 0 }}>
                    AI CAREER MENTOR
                  </h4>
                  <span className="press-start-2p-regular" style={{ fontSize: '0.55rem', color: '#27C93F', display: 'block', marginTop: '0.2rem' }}>
                    ● GROQ RAG ONLINE
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {/* Clear Chat Button */}
                <button
                  onClick={() =>
                    setAiChatMessages([
                      {
                        role: 'assistant',
                        content: `Hello ${studentProfile.name.split(' ')[0]}! 🪐 I am your SkillForge AI Career Mentor. Ask me any questions regarding your ${studentProfile.careerGoal} target pathway!`,
                      },
                    ])
                  }
                  title="Clear Chat"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #33394f',
                    borderRadius: '8px',
                    padding: '0.35rem 0.6rem',
                    color: '#B8B3C7',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsAiChatOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #33394f',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF7E8',
                    cursor: 'pointer',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages Stream with Full Markdown & Smooth Scroll */}
            <div
              className="ai-chat-messages-viewport"
              tabIndex={0}
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                maxHeight: '370px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                padding: '1rem',
              }}
            >
              {aiChatMessages.map((msg, mIdx) => (
                <div
                  key={mIdx}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, rgba(255, 209, 102, 0.25) 0%, rgba(255, 107, 129, 0.25) 100%)'
                        : 'rgba(13, 16, 26, 0.95)',
                    border: msg.role === 'user' ? '1.5px solid #FFD166' : '1px solid #222638',
                    color: '#FFF7E8',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    maxWidth: msg.role === 'user' ? '82%' : '92%',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {msg.role === 'user' ? (
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, lineHeight: 1.4 }}>
                      {msg.content}
                    </span>
                  ) : (
                    <div className="ai-chat-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking Indicator */}
              {isAiChatLoading && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    background: 'rgba(13, 16, 26, 0.95)',
                    border: '1px solid #FFD166',
                    color: '#FFD166',
                    padding: '0.55rem 0.9rem',
                    borderRadius: '16px 16px 16px 4px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 15px rgba(255, 209, 102, 0.2)',
                  }}
                >
                  <RotateCcw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Groq AI Mentor is typing...</span>
                </div>
              )}

              <div ref={chatMessagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div
              style={{
                padding: '0.4rem 0.8rem',
                display: 'flex',
                gap: '0.45rem',
                overflowX: 'auto',
                borderTop: '1px solid #1c2030',
                background: 'rgba(5, 6, 10, 0.6)',
              }}
            >
              {[
                `🎯 How to fix my ${missingSkills[0]?.name || 'PyTorch'} gap?`,
                `💡 Capstone ideas for ${studentProfile.careerGoal}?`,
                `⚡ 4-week study plan`,
              ].map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => {
                    setAiChatInput(suggestion)
                  }}
                  style={{
                    whiteSpace: 'nowrap',
                    background: 'rgba(255, 209, 102, 0.1)',
                    border: '1px solid rgba(255, 209, 102, 0.35)',
                    borderRadius: '12px',
                    padding: '0.3rem 0.65rem',
                    color: '#FFD166',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendAiChatMessage}
              style={{
                padding: '0.7rem 0.9rem',
                borderTop: '1px solid #222638',
                display: 'flex',
                gap: '0.5rem',
                background: 'rgba(5, 6, 10, 0.95)',
              }}
            >
              <input
                type="text"
                placeholder={`Ask about ${studentProfile.careerGoal}, projects, gaps...`}
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                style={{
                  flex: 1,
                  background: '#0d101a',
                  border: '1px solid #33394f',
                  borderRadius: '10px',
                  padding: '0.6rem 0.9rem',
                  color: '#FFF7E8',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!aiChatInput.trim() || isAiChatLoading}
                style={{
                  background: 'linear-gradient(135deg, #FFD166 0%, #FF6B81 100%)',
                  color: '#05060A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.6rem 1rem',
                  cursor: !aiChatInput.trim() || isAiChatLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: !aiChatInput.trim() || isAiChatLoading ? 0.5 : 1,
                  fontWeight: 800,
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </div>

      {/* EDIT SCHOLAR PROFILE MODAL */}
      <AuthModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialMode="profile_setup"
        initialData={studentProfile}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* DEDICATED IN-DOM HIGH-CONTRAST PDF RENDERER (POWERED BY REACTMARKDOWN) */}
      {activePdfRoadmap && (
        <div
          id="skillforge-active-pdf-template"
          className="pdf-export-template"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '800px',
            zIndex: 999999,
            background: '#FFFFFF',
            color: '#0F172A',
            opacity: 1,
            pointerEvents: 'none',
            boxShadow: '0 0 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div
            style={{
              borderBottom: '2.5px solid #0284C7',
              paddingBottom: '16px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '24px' }}>🪐</span>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A' }}>SKILLFORGE AI</span>
                <span
                  style={{
                    background: '#0284C7',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  VERIFIED ROADMAP
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 500 }}>
                AI-Powered Student Career Pathway &amp; Diagnostic Learning Roadmap
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569', lineHeight: 1.45 }}>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>{studentProfile.name}</div>
              <div>
                {studentProfile.university || 'NUST'} • {studentProfile.degree || 'BS Computer Science'}
              </div>
              <div>
                Target Track: <strong style={{ color: '#0284C7' }}>{activePdfRoadmap.careerGoal}</strong>
              </div>
              <div style={{ color: '#94A3B8', marginTop: '2px' }}>
                Generated:{' '}
                {activePdfRoadmap.createdAt
                  ? new Date(activePdfRoadmap.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Markdown Body */}
          <div className="pdf-markdown-body" style={{ color: '#0F172A', fontSize: '12px', lineHeight: 1.6 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {activePdfRoadmap.generatedRoadmapText?.replace(/<br\s*\/?>/gi, '\n')}
            </ReactMarkdown>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '28px',
              borderTop: '1px solid #CBD5E1',
              paddingTop: '10px',
              fontSize: '10px',
              color: '#64748B',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>SkillForge — LoopLearn Hackathon 2026 (PS-03)</span>
            <span>Engine: Groq Cloud LLaMA 3.3 (120B)</span>
          </div>
        </div>
      )}
    </div>
  )
}
