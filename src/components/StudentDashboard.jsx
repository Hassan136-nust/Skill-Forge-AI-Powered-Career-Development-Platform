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
  Menu,
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
  FileText,
  BookOpen,
  Brain,
  CheckCircle
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import html2pdf from 'html2pdf.js'
import AuthModal from './AuthModal'
import { API_BASE_URL } from '../config/api.js'
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

// User-Scoped LocalStorage Helper to ensure strict 100% per-user data isolation
const getUserScopedKey = (baseKey, overrideUser = null) => {
  try {
    const u = overrideUser || JSON.parse(localStorage.getItem('skillforge_user') || 'null')
    const id = u?.email || u?._id || u?.id
    if (!id) return baseKey
    const cleanId = String(id).toLowerCase().replace(/[^a-z0-9]/g, '_')
    return `${baseKey}_${cleanId}`
  } catch {
    return baseKey
  }
}

export default function StudentDashboard({ onExitDashboard, onOpenFullRoadmap, onOpenAiMentor, onOpenAdmin }) {
  const DEFAULT_AVATAR = 'https://imgs.search.brave.com/en8GueUwEke4A7ecDjpRnIpFR8Y-WWOEbjzD2xCNTu0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWd2/My5mb3Rvci5jb20v/aW1hZ2VzL2hvbWVw/YWdlLWZlYXR1cmUt/Y2FyZC9mb3Rvci0z/ZC1hdmF0YXIuanBn'

  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
      if (!storedUser) {
        return {
          name: 'Scholar Student',
          email: '',
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
        }
      }
      const userGoalKey = getUserScopedKey('skillforge_career_goal', storedUser)
      const savedGoal = localStorage.getItem(userGoalKey) || storedUser.careerGoal || 'AI Engineer'
      return {
        name: storedUser.name || 'Scholar Student',
        email: storedUser.email || '',
        university: storedUser.university || 'NUST',
        degree: storedUser.degree || 'BS Computer Science',
        yearOfStudy: storedUser.yearOfStudy || 3,
        experienceLevel: storedUser.experienceLevel || 'intermediate',
        careerGoal: savedGoal,
        avatar: storedUser.avatar || DEFAULT_AVATAR,
        githubUser: storedUser.githubUser || '',
        reposCount: 0,
        skills: storedUser.skills || [],
        projects: storedUser.projects || [],
      }
    } catch {
      return {
        name: 'Scholar Student',
        email: '',
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
      }
    }
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showRepos, setShowRepos] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // User-Isolated Skill Scores (0/100 default for new users)
  const [skillScores, setSkillScores] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
      if (!storedUser) return {}
      const key = getUserScopedKey('skillforge_scores', storedUser)
      return JSON.parse(localStorage.getItem(key) || '{}')
    } catch {
      return {}
    }
  })

  const [activeMilestone, setActiveMilestone] = useState(2)

  // User-Isolated Completed Tasks
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
      if (!storedUser) return []
      const key = getUserScopedKey('skillforge_completed_tasks', storedUser)
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      return []
    }
  })

  // Load profile from MongoDB Atlas API & LocalStorage Cache with strict User Isolation
  const loadProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
      if (!storedUser || !storedUser.email) return

      const userScoresKey = getUserScopedKey('skillforge_scores', storedUser)
      const userTasksKey = getUserScopedKey('skillforge_completed_tasks', storedUser)
      const userGoalKey = getUserScopedKey('skillforge_career_goal', storedUser)

      const cachedScores = JSON.parse(localStorage.getItem(userScoresKey) || '{}')
      setSkillScores(cachedScores)

      const cachedTasks = JSON.parse(localStorage.getItem(userTasksKey) || '[]')
      setCompletedTasks(cachedTasks)

      const userEmail = storedUser.email
      const savedGoal = localStorage.getItem(userGoalKey) || storedUser.careerGoal

      if (storedUser.name) {
        setStudentProfile((prev) => ({
          ...prev,
          name: storedUser.name,
          email: storedUser.email,
          avatar: storedUser.avatar || prev.avatar || DEFAULT_AVATAR,
          careerGoal: savedGoal || prev.careerGoal,
        }))
      }

      const res = await fetch(`${API_BASE_URL}/api/profile/${storedUser._id || encodeURIComponent(userEmail)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          const p = data.profile
          const resolvedGoal = savedGoal || p.careerGoal || 'AI Engineer'
          
          setStudentProfile((prev) => ({
            ...prev,
            university: p.university || prev.university,
            degree: p.degree || prev.degree,
            yearOfStudy: p.yearOfStudy || prev.yearOfStudy,
            experienceLevel: p.experienceLevel || prev.experienceLevel,
            careerGoal: resolvedGoal,
            avatar: p.userId?.avatar || p.avatar || prev.avatar || DEFAULT_AVATAR,
            skills: p.skills || [],
            projects: p.projects || [],
            reposCount: p.projects?.length || 0,
          }))

          // Strict DB syncing: Only this user's completed tasks
          const dbTasks = Array.isArray(p.completedTasks) ? p.completedTasks : []
          setCompletedTasks(dbTasks)
          localStorage.setItem(userTasksKey, JSON.stringify(dbTasks))

          // Strict DB syncing: Only this user's verified scores
          const verifiedScores = { ...cachedScores }
          if (Array.isArray(p.skills)) {
            p.skills.forEach((s) => {
              if (s && s.name) {
                const sKey = s.name.toLowerCase()
                if (typeof s.verifiedScore === 'number' && s.verifiedScore > 0) {
                  verifiedScores[sKey] = s.verifiedScore
                } else if (s.isVerified && typeof s.verifiedScore === 'number') {
                  verifiedScores[sKey] = s.verifiedScore
                } else if (s.isVerified) {
                  verifiedScores[sKey] = 80
                }
              }
            })
          }

          try {
            const assessRes = await fetch(`${API_BASE_URL}/api/assessment/results/${encodeURIComponent(userEmail)}`)
            if (assessRes.ok) {
              const assessData = await assessRes.json()
              if (assessData.scores && typeof assessData.scores === 'object') {
                Object.entries(assessData.scores).forEach(([sk, sc]) => {
                  if (typeof sc === 'number' && sc > 0) {
                    verifiedScores[sk.toLowerCase()] = sc
                  }
                })
              }
            }
          } catch {}

          setSkillScores(verifiedScores)
          localStorage.setItem(userScoresKey, JSON.stringify(verifiedScores))

          if (resolvedGoal) {
            loadRoadmapHistory(resolvedGoal, userEmail)
          }
        }
      }
    } catch (e) {
      console.warn('Using cached profile:', e)
    }
  }

  // Generate interactive sub-tasks for any roadmap milestone step
  const getTasksForStep = (stepItem, stepNum) => {
    const tasks = []
    const prefix = `step_${stepNum}_`

    // Extract clean tasks from topics or desc
    let sourceText = stepItem.topics || stepItem.desc || ''
    if (sourceText) {
      const parts = sourceText
        .split(/[•\n,]/)
        .map((s) => s.replace(/https?:\/\/\S+/g, '').replace(/[*_#`()]/g, '').trim())
        .filter((s) => s.length >= 4 && !s.toLowerCase().startsWith('http'))

      const uniqueParts = Array.from(new Set(parts)).slice(0, 2)
      uniqueParts.forEach((p, idx) => {
        tasks.push({
          id: `${prefix}task_${idx}`,
          label: p.length > 55 ? p.substring(0, 52) + '...' : p,
        })
      })
    }

    if (tasks.length === 0) {
      tasks.push({ id: `${prefix}task_0`, label: `Master core foundations of ${stepItem.title}` })
      tasks.push({ id: `${prefix}task_1`, label: `Complete hands-on implementation labs` })
    }

    const capstoneName = (stepItem.capstone || 'Milestone Capstone')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*_#`]/g, '')
      .split(/[•\n]/)[0]
      .trim()

    tasks.push({
      id: `${prefix}capstone`,
      label: `🚀 Deliverable: ${capstoneName.length > 46 ? capstoneName.substring(0, 43) + '...' : capstoneName}`,
      isCapstone: true,
    })

    return tasks
  }

  // 1-Click Interactive Checkbox Toggle with MongoDB & LocalStorage Sync
  const handleToggleTask = async (taskId) => {
    const updated = completedTasks.includes(taskId)
      ? completedTasks.filter((id) => id !== taskId)
      : [...completedTasks, taskId]

    setCompletedTasks(updated)
    localStorage.setItem(getUserScopedKey('skillforge_completed_tasks'), JSON.stringify(updated))

    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
      await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUser._id,
          email: studentProfile.email,
          completedTasks: updated,
        }),
      })
    } catch (err) {
      console.warn('Could not sync completed tasks to DB:', err)
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
  
  // Persistent AI-generated milestones initialized from user-scoped localStorage
  const [aiGeneratedMilestones, setAiGeneratedMilestones] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
      if (!storedUser) return null
      const targetRole = (storedUser.careerGoal || 'AI Engineer').toLowerCase().replace(/\s+/g, '_')
      const userRoadmapRoleKey = getUserScopedKey(`skillforge_roadmap_${targetRole}`, storedUser)
      const cachedRoleRoadmap = JSON.parse(localStorage.getItem(userRoadmapRoleKey) || 'null')
      if (Array.isArray(cachedRoleRoadmap) && cachedRoleRoadmap.length > 0) {
        return cachedRoleRoadmap
      }
      const genericKey = getUserScopedKey('skillforge_current_milestones', storedUser)
      const genericCached = JSON.parse(localStorage.getItem(genericKey) || 'null')
      if (Array.isArray(genericCached) && genericCached.length > 0) {
        return genericCached
      }
    } catch {}
    return null
  })

  // Helper to keep state and localStorage strictly synchronized per career track and user
  const saveAndSetMilestones = (ms, role = null) => {
    const currentRole = (role || studentProfile.careerGoal || 'AI Engineer').toLowerCase().replace(/\s+/g, '_')
    const genericKey = getUserScopedKey('skillforge_current_milestones')
    const roleKey = getUserScopedKey(`skillforge_roadmap_${currentRole}`)

    if (!ms || ms.length === 0) {
      setAiGeneratedMilestones(null)
      localStorage.removeItem(genericKey)
      localStorage.removeItem(roleKey)
      return
    }
    setAiGeneratedMilestones(ms)
    localStorage.setItem(genericKey, JSON.stringify(ms))
    localStorage.setItem(roleKey, JSON.stringify(ms))
  }

  // =========================================================================
  // LANGGRAPH STATEGRAPH VISUALIZER STATES & PIPELINE DEFINITION
  // =========================================================================
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false)
  const [agentCurrentNodeIndex, setAgentCurrentNodeIndex] = useState(0) // 0: cat, 1: left, 2: hard, 3: last, 4: final report
  const [isAgentExecuting, setIsAgentExecuting] = useState(false)
  const [agentFinalReport, setAgentFinalReport] = useState(null)

  const AGENT_NODES_PIPELINE = [
    {
      id: 'SkillProfiler',
      num: '01',
      title: 'SKILL PROFILER & GAP DETECTOR',
      badge: 'NODE 01',
      img: '/cat.png',
      characterName: 'Cosmic Cat Diagnostician',
      desc: 'Ingests verified diagnostic assessment scores and calculates technical benchmark deficits.',
      logs: [
        '🚀 [INIT] Initializing LangGraph StateGraph Execution Cycle for scholar...',
        '🔍 [PROFILER] Reading verified diagnostic test scores from student profile...',
        '📊 [DIAGNOSIS] Comparing proficiencies against 2026 Industry Benchmark standards...',
        '⚡ [GAPS DETECTED] Identified core competency deficits requiring capstone reinforcement.',
        '✓ [STATUS] State updated -> Transitioning state to Knowledge Retriever...'
      ]
    },
    {
      id: 'KnowledgeRetriever',
      num: '02',
      title: 'RAG KNOWLEDGE BASE RETRIEVER',
      badge: 'NODE 02',
      img: '/left.png',
      characterName: 'RAG Knowledge Archivist',
      desc: 'Searches 8 curated SkillForge Knowledge Base modules using semantic BM25 / TF-IDF indexing.',
      logs: [
        '📚 [RAG LOOKUP] Querying 8 curated SkillForge Knowledge Base tracks...',
        '⚡ [SEMANTIC RANKING] Ingesting industry capstones, syllabi & HEC curriculum mappings...',
        '📌 [CONTEXT BOUND] Retrieved verified technical reference modules and capstone templates.',
        '✓ [STATUS] Ingested grounded context -> Transitioning to Pedagogical Planner...'
      ]
    },
    {
      id: 'AgentPlanner',
      num: '03',
      title: 'REACT PEDAGOGICAL PLANNER',
      badge: 'NODE 03',
      img: '/hard.png',
      characterName: 'ReAct Strategy Mentor',
      desc: 'Formulates multi-stage Thought -> Action -> Observation deliberation loop for 4 milestones.',
      logs: [
        '🧠 [REACT THOUGHT] Architecting 4-stage pedagogical milestone progression...',
        '🛠️ [TOOL EXECUTION] generator.generate(detected_gaps, rag_context, target_role)...',
        '📈 [CALIBRATION] Calibrating difficulty curve for Junior/Intermediate scholar level...',
        '✓ [STATUS] Pedagogical strategy formulated -> Transitioning to Groq LLaMA 3.3 Synthesis...'
      ]
    },
    {
      id: 'RoadmapSynthesizer',
      num: '04',
      title: 'GROQ LLAMA 3.3 ROADMAP SYNTHESIZER',
      badge: 'NODE 04',
      img: '/last.png',
      characterName: 'Groq LLaMA 3.3 Master Synthesizer',
      desc: 'Generates high-precision production roadmaps, capstones, and verifiable career blueprints.',
      logs: [
        '✨ [GROQ INFERENCE] Calling Groq Cloud LLaMA 3.3 (120B / 70B Instant Engine)...',
        '📝 [COMPILATION] Synthesizing comprehensive 4-stage job-ready learning blueprint...',
        '🔒 [VERIFICATION] Embedding verifiable capstone criteria, rubrics, and source citations...',
        '🎉 [COMPLETE] Autonomous Agent Plan Synthesized! Revealing Final Verified Report...'
      ]
    },
  ]

  const handleStartAgentVisualization = async () => {
    setIsAgentModalOpen(true)
    setIsAgentExecuting(true)
    setAgentCurrentNodeIndex(0)
    setAgentFinalReport(null)

    // Trigger Python LangGraph Agent in background
    const agentPromise = fetch(`${API_BASE_URL}/api/ai/agent/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: {
          name: studentProfile.name,
          email: studentProfile.email,
          degree: studentProfile.degree,
          yearOfStudy: studentProfile.yearOfStudy,
          experienceLevel: studentProfile.experienceLevel,
          careerGoal: studentProfile.careerGoal,
          skills: studentProfile.skills,
        },
        prompt: `Generate autonomous 4-stage career roadmap for ${studentProfile.careerGoal}`,
      }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.warn('Agent API fallback:', err)
        return null
      })

    // Sequential Animated Realistic Pacing across all 4 visual character stages
    // Node 0: Skill Profiler (0s - 4.5s)
    setTimeout(() => {
      setAgentCurrentNodeIndex(1) // Node 1: ChromaDB Semantic Knowledge Retriever (4.5s - 9.0s)
    }, 4500)

    // Node 1: Knowledge Retriever (4.5s - 9.0s)
    setTimeout(() => {
      setAgentCurrentNodeIndex(2) // Node 2: ReAct Multi-Stage Planner (9.0s - 13.5s)
    }, 9000)

    // Node 2: ReAct Agent Planner (9.0s - 13.5s)
    setTimeout(() => {
      setAgentCurrentNodeIndex(3) // Node 3: Groq LLM Master Synthesizer (13.5s - 18.0s)
    }, 13500)

    // Node 3: Final Synthesis -> Reveal Verified Report (18.0s)
    setTimeout(async () => {
      const data = await agentPromise
      if (data && (data.agentAnalysis || data.roadmap)) {
        setAgentFinalReport(data)
        let ms = null
        if (data.roadmap && data.roadmap.steps && data.roadmap.steps.length > 0) {
          ms = data.roadmap.steps.map((st, sIdx) => ({
            step: String(sIdx + 1).padStart(2, '0'),
            title: (st.title || `Milestone ${sIdx + 1}`).toUpperCase(),
            desc: st.topic || st.title || '',
            topics: st.topic || '',
            resources: (st.resources || []).join(', '),
            capstone: st.project || `Capstone ${sIdx + 1}`,
            tech: (st.tech || 'python').toLowerCase(),
          }))
        } else if (data.agentAnalysis) {
          ms = parseMilestonesFromRoadmapText(data.agentAnalysis)
        }

        if (ms && ms.length > 0) {
          saveAndSetMilestones(ms, studentProfile.careerGoal)
        }
        loadRoadmapHistory(studentProfile.careerGoal, studentProfile.email) // Sync into Previous History list immediately!
      } else {
        setAgentFinalReport({
          success: true,
          careerGoal: studentProfile.careerGoal,
          agentAnalysis: `## Autonomous Career Strategy for ${studentProfile.careerGoal}\n\nAll 4 LangGraph StateGraph nodes executed successfully across SkillProfiler, KnowledgeRetriever, AgentPlanner, and RoadmapSynthesizer.`,
        })
        loadRoadmapHistory(studentProfile.careerGoal, studentProfile.email)
      }
      setIsAgentExecuting(false)
      setAgentCurrentNodeIndex(4) // Reveal Final Verified Report!
    }, 18000)
  }

  // Helper: Client-side robust milestone extractor for any generated roadmap text
  const parseMilestonesFromRoadmapText = (text) => {
    const milestones = []
    if (!text) return milestones

    const lines = text.split('\n')
    for (const line of lines) {
      if (line.startsWith('|') && (line.includes('1') || line.includes('2') || line.includes('3') || line.includes('4') || line.includes('5') || line.includes('6') || line.includes('Milestone') || line.includes('Step'))) {
        const parts = line.split('|').map((p) => p.trim()).filter(Boolean)
        if (parts.length >= 3 && !parts[0].includes('---') && parts[0].toLowerCase().trim() !== 'milestone') {
          const stepNum = String(milestones.length + 1).padStart(2, '0')
          const rawTitle = parts[0].replace(/[*_#`1234567890️⃣]/g, '').trim()
          const rawDesc = parts[1]?.replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ' • ').trim() || ''
          const rawTopics = parts[2]?.replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ', ').trim() || ''
          const rawResources = parts[3]?.replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ', ').trim() || ''
          const rawCapstone = (parts[4] || parts[2] || `Capstone ${milestones.length + 1}`).replace(/[*_#`]/g, '').replace(/<br\s*\/?>/gi, ' ').trim()

          let tech = 'python'
          const lower = (rawTitle + ' ' + rawDesc + ' ' + rawTopics + ' ' + rawCapstone).toLowerCase()
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
            desc: rawDesc,
            topics: rawTopics,
            resources: rawResources,
            capstone: rawCapstone,
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
          const desc = bLines.slice(1, 6).join(' ').replace(/[*_#`]/g, '').trim()
          milestones.push({
            step: stepNum,
            title: title,
            desc: desc,
            topics: '',
            resources: '',
            capstone: `Capstone ${stepNum}: Production Showcase & Benchmark`,
            tech: idx === 0 ? 'python' : idx === 1 ? 'pytorch' : idx === 2 ? 'fastapi' : 'docker',
          })
        }
      })
    }

    return milestones
  }

  // Fetch Previous Roadmaps History from MongoDB Atlas and auto-apply recent roadmap for target career track
  const loadRoadmapHistory = async (roleOverride = null, emailOverride = null) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || 'null')
      const email = emailOverride || studentProfile.email || storedUser?.email
      if (!email) return

      const activeRole = (roleOverride || studentProfile.careerGoal || 'AI Engineer').toLowerCase().trim()
      const res = await fetch(`${API_BASE_URL}/api/ai/roadmap/history/${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.history && data.history.length > 0) {
          setRoadmapHistoryList(data.history)
          
          // Match the most recent roadmap for this specific career goal
          const matched = data.history.find((h) => {
            const hGoal = (h.careerGoal || '').toLowerCase()
            return hGoal.includes(activeRole) || activeRole.includes(hGoal.replace(/\(.*?\)/g, '').trim())
          }) || data.history[0]

          if (matched && (matched.milestones?.length > 0 || matched.generatedRoadmapText)) {
            let ms = parseMilestonesFromRoadmapText(matched.generatedRoadmapText)
            if (!ms || ms.length === 0) {
              ms = matched.milestones || []
            }
            if (ms && ms.length > 0) {
              saveAndSetMilestones(ms, activeRole)
              return
            }
          }
        } else {
          // Fresh user account with 0 generated roadmaps in history -> Reset to standard blueprint
          setRoadmapHistoryList([])
          saveAndSetMilestones(null, activeRole)
        }
      }
    } catch (e) {
      console.warn('Could not load roadmap history:', e)
    }
  }

  const handleGenerateAiRoadmap = async () => {
    setIsGeneratingAiRoadmap(true)
    const startTime = Date.now()

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/roadmap/generate`, {
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
      
      const elapsed = Date.now() - startTime
      const remainingDelay = Math.max(0, 1800 - elapsed)
      
      if (res.ok) {
        const data = await res.json()
        setTimeout(() => {
          setAiRoadmapModalData(data)
          let ms = (data.milestones && data.milestones.length > 0)
            ? data.milestones
            : parseMilestonesFromRoadmapText(data.generatedRoadmapText)
          if (!ms || ms.length < 5) {
            const parsedAll = parseMilestonesFromRoadmapText(data.generatedRoadmapText)
            if (parsedAll && parsedAll.length > ms.length) {
              ms = parsedAll
            }
          }
          if (ms && ms.length > 0) {
            saveAndSetMilestones(ms, studentProfile.careerGoal)
          }
          loadRoadmapHistory()
          setIsGeneratingAiRoadmap(false)
        }, remainingDelay)
      } else {
        setIsGeneratingAiRoadmap(false)
      }
    } catch (e) {
      console.warn('AI Roadmap generation error:', e)
      setIsGeneratingAiRoadmap(false)
    }
  }

  const handleSelectPastRoadmap = (hist) => {
    setAiRoadmapModalData(hist)
    let ms = parseMilestonesFromRoadmapText(hist.generatedRoadmapText)
    if (!ms || ms.length === 0) {
      ms = hist.milestones || []
    }
    if (ms && ms.length > 0) {
      saveAndSetMilestones(ms, hist.careerGoal || studentProfile.careerGoal)
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

    setTimeout(async () => {
      let captureHost = null
      try {
        const element = document.getElementById('skillforge-active-pdf-template')
        if (!element) {
          throw new Error('Template element not found in DOM')
        }

        // Clone element into an isolated, visible top-level capture container
        const clone = element.cloneNode(true)
        clone.style.position = 'static'
        clone.style.opacity = '1'
        clone.style.visibility = 'visible'
        clone.style.width = '760px'
        clone.style.margin = '0 auto'
        clone.style.background = '#FFFFFF'
        clone.style.color = '#0F172A'
        clone.style.display = 'block'

        captureHost = document.createElement('div')
        captureHost.style.position = 'fixed'
        captureHost.style.top = '0'
        captureHost.style.left = '0'
        captureHost.style.width = '100vw'
        captureHost.style.height = '100vh'
        captureHost.style.background = '#FFFFFF'
        captureHost.style.zIndex = '99999999'
        captureHost.style.overflow = 'auto'
        captureHost.style.opacity = '1'
        captureHost.appendChild(clone)
        document.body.appendChild(captureHost)

        const opt = {
          margin: [10, 10, 10, 10],
          filename: `SkillForge_${(roadmap.careerGoal || studentProfile.careerGoal).replace(/\s+/g, '_')}_Roadmap.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FFFFFF',
            scrollY: 0,
            scrollX: 0,
            logging: false,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        }

        await html2pdf().set(opt).from(clone).save()
      } catch (err) {
        console.warn('PDF export error:', err)
      } finally {
        if (captureHost && document.body.contains(captureHost)) {
          document.body.removeChild(captureHost)
        }
        setIsExportingPdf(false)
        setPdfGeneratingId(null)
        setActivePdfRoadmap(null)
      }
    }, 450)
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
  const baseSkillScore = targetRequiredSkills.length > 0 
    ? Math.round((matchPoints / targetRequiredSkills.length) * 100)
    : 0

  const activeRoadmapSteps = (aiGeneratedMilestones && aiGeneratedMilestones.length > 0)
    ? aiGeneratedMilestones
    : (TRACK_ROADMAPS[studentProfile.careerGoal] || TRACK_ROADMAPS['AI Engineer'])

  const totalPossibleTasks = activeRoadmapSteps.reduce((sum, step, idx) => sum + getTasksForStep(step, idx + 1).length, 0)
  const totalCompletedTasks = completedTasks.filter((id) => id.startsWith('step_')).length
  const checklistBonus = totalPossibleTasks > 0 ? Math.round((totalCompletedTasks / totalPossibleTasks) * 35) : 0

  // Live Career Readiness: Skill Assessments (65%) + Interactive Roadmap Checklists (35%)
  const readinessPercent = Math.min(100, Math.round(baseSkillScore * 0.65 + checklistBonus))

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
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
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
      const res = await fetch(`${API_BASE_URL}/api/assessment/questions`)
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
      localStorage.setItem(getUserScopedKey('skillforge_scores'), JSON.stringify(updated))
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

      await fetch(`${API_BASE_URL}/api/assessment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUser._id,
          email: studentProfile.email,
          category: sName,
          answers: answersPayload,
        }),
      })

      await fetch(`${API_BASE_URL}/api/profile`, {
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

        {/* Desktop Right Actions */}
        <div className="navbar-right-actions desktop-navbar-actions">
          {(() => {
            try {
              const u = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
              if (u.role === 'admin') {
                return (
                  <button
                    className="navbar-item-btn"
                    style={{
                      color: '#020612',
                      backgroundColor: '#00F0FF',
                      border: '1px solid #00F0FF',
                      borderRadius: '20px',
                      padding: '0.45rem 1rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
                    }}
                    onClick={() => onOpenAdmin && onOpenAdmin()}
                    title="Open Admin Command Center"
                  >
                    <span>👑 Admin Dashboard</span>
                  </button>
                )
              }
            } catch {}
            return null
          })()}

          <button
            className="navbar-item-btn"
            style={{
              color: '#FFD166',
              border: '1px solid rgba(255, 209, 102, 0.4)',
              backgroundColor: 'rgba(255, 209, 102, 0.08)',
              borderRadius: '20px',
              padding: '0.45rem 1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (onOpenAiMentor) onOpenAiMentor()
              else setIsAiChatOpen(true)
            }}
            title="Open Dedicated AI Mentor Page"
          >
            <Bot size={14} color="#FFD166" />
            <span>AI Mentor</span>
          </button>

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

          <button
            className="navbar-item-btn"
            style={{
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderRadius: '20px',
              padding: '0.45rem 1.1rem',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)'
              e.currentTarget.style.borderColor = '#EF4444'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onClick={() => {
              try {
                localStorage.removeItem('skillforge_token')
                localStorage.removeItem('skillforge_user')
                localStorage.removeItem('skillforge_scores')
                localStorage.removeItem('skillforge_completed_tasks')
                localStorage.removeItem('skillforge_current_milestones')
                localStorage.removeItem('skillforge_career_goal')
              } catch {}
              if (onExitDashboard) onExitDashboard()
            }}
            title="Sign Out of Session"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="dashboard-mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={22} color="#FFD166" /> : <Menu size={22} color="#FFD166" />}
        </button>

        {/* Mobile Animated Dropdown Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="dashboard-mobile-drawer"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {(() => {
                try {
                  const u = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
                  if (u.role === 'admin') {
                    return (
                      <button
                        className="mobile-drawer-btn"
                        style={{ color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.4)' }}
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          if (onOpenAdmin) onOpenAdmin()
                        }}
                      >
                        <span>👑 Admin Dashboard</span>
                      </button>
                    )
                  }
                } catch {}
                return null
              })()}

              <button
                className="mobile-drawer-btn"
                style={{ color: '#FFD166' }}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  if (onOpenAiMentor) onOpenAiMentor()
                  else setIsAiChatOpen(true)
                }}
              >
                <Bot size={16} color="#FFD166" />
                <span>AI Mentor Page</span>
              </button>

              <button
                className="mobile-drawer-btn"
                style={{ color: '#FFD166' }}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsEditModalOpen(true)
                }}
              >
                <Edit3 size={16} />
                <span>Edit Profile & Skills</span>
              </button>

              <button
                className="mobile-drawer-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  if (onExitDashboard) onExitDashboard()
                }}
              >
                <span>Home Page</span>
              </button>

              <button
                className="mobile-drawer-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  const el = document.getElementById('roadmap-section')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span>3D Career Roadmap</span>
              </button>

              <button
                className="mobile-drawer-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  const el = document.getElementById('skill-assessment-hub')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span>Skill Assessment Hub</span>
              </button>

              <button
                className="mobile-drawer-btn signout-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  try {
                    localStorage.removeItem('skillforge_token')
                    localStorage.removeItem('skillforge_user')
                    localStorage.removeItem('skillforge_scores')
                    localStorage.removeItem('skillforge_completed_tasks')
                    localStorage.removeItem('skillforge_current_milestones')
                    localStorage.removeItem('skillforge_career_goal')
                  } catch {}
                  if (onExitDashboard) onExitDashboard()
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
                  onChange={async (e) => {
                    const newRole = e.target.value
                    setStudentProfile((prev) => ({ ...prev, careerGoal: newRole }))
                    localStorage.setItem(getUserScopedKey('skillforge_career_goal'), newRole)
                    try {
                      const storedUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}')
                      localStorage.setItem('skillforge_user', JSON.stringify({ ...storedUser, careerGoal: newRole }))
                      await fetch(`${API_BASE_URL}/api/profile`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: storedUser._id,
                          email: studentProfile.email,
                          careerGoal: newRole,
                        }),
                      })
                    } catch (err) {
                      console.warn('Could not persist career goal to DB:', err)
                    }
                    loadRoadmapHistory(newRole)
                  }}
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

            <div className="roadmap-header-actions-row">
              {aiGeneratedMilestones && (
                <button
                  onClick={() => saveAndSetMilestones(null)}
                  className="dashboard-nav-btn reset-default-btn"
                  title="Reset to default benchmark track"
                >
                  Reset Default
                </button>
              )}

              {/* History Button */}
              <button
                className="dashboard-nav-btn history-action-btn"
                onClick={() => setIsHistoryModalOpen(true)}
                title="View previous roadmaps history"
              >
                <History size={13} color="#FFD166" />
                <span>HISTORY</span>
              </button>

              {/* Button 1: FAST GENAI ROADMAP */}
              <button
                className="dashboard-nav-btn fast-genai-action-btn"
                onClick={handleGenerateAiRoadmap}
                disabled={isGeneratingAiRoadmap}
                title="Fast single-shot Groq GenAI roadmap generation"
              >
                {isGeneratingAiRoadmap ? (
                  <>
                    <RotateCcw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>GENERATING...</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} color="#00D2FF" />
                    <span>FAST GENAI</span>
                  </>
                )}
              </button>

              {/* Button 2: AUTONOMOUS AGENT (LANGGRAPH) */}
              <button
                className="bungee-regular autonomous-agent-action-btn"
                onClick={handleStartAgentVisualization}
                disabled={isAgentExecuting}
                title="Run full 4-node LangGraph ReAct Autonomous Agent"
              >
                <Bot size={15} color="#05060A" strokeWidth={2.5} />
                <span>AUTONOMOUS AGENT</span>
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

            {/* Alternating Up-Down-Up-Down 3D Step Roadmap Deck (First 4 Core Focus Cards) */}
            <div className="roadmap-3d-zigzag-stage">
              {/* Horizontal Center Laser Line */}
              <div className="roadmap-zigzag-laser-line" />

              <div className="roadmap-zigzag-deck">
                {(() => {
                  const fullRoadmapSteps = (aiGeneratedMilestones && aiGeneratedMilestones.length > 0)
                    ? aiGeneratedMilestones
                    : (TRACK_ROADMAPS[studentProfile.careerGoal] || TRACK_ROADMAPS['AI Engineer'])
                  const roadmapSteps = fullRoadmapSteps.slice(0, 4)
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
                          {/* Card Top Bar */}
                          <div className="step-card-header-bar">
                            <span className="step-card-num-badge">STEP 0{stepNum}</span>
                            <span className="step-card-status-badge" style={{ color: statusColor, borderColor: statusColor }}>
                              {statusText}
                            </span>
                          </div>

                          {/* Title & One-line Summary */}
                          <div>
                            <h3 className="step-card-title">{stepItem.title}</h3>
                            <p className="step-card-brief">
                              {stepItem.desc ? stepItem.desc.split(/[•\n]/)[0].trim() : 'Master technical foundations & pipelines.'}
                            </p>
                          </div>

                          {/* Dynamic Interactive Sub-Tasks Checklist */}
                          {(() => {
                            const stepTasks = getTasksForStep(stepItem, stepNum)
                            const stepDoneCount = stepTasks.filter((t) => completedTasks.includes(t.id)).length
                            const stepPct = Math.round((stepDoneCount / stepTasks.length) * 100)

                            return (
                              <div className="step-checklist-container" onClick={(e) => e.stopPropagation()}>
                                <div className="checklist-meta-row">
                                  <span className="checklist-title press-start-2p-regular">
                                    ✦ TASKS ({stepDoneCount}/{stepTasks.length})
                                  </span>
                                  <span
                                    className="checklist-pct-badge"
                                    style={{ color: stepPct === 100 ? '#27C93F' : '#FFD166' }}
                                  >
                                    {stepPct}%
                                  </span>
                                </div>

                                <div className="checklist-progress-bar">
                                  <div
                                    className="checklist-progress-fill"
                                    style={{
                                      width: `${stepPct}%`,
                                      background:
                                        stepPct === 100
                                          ? '#27C93F'
                                          : 'linear-gradient(90deg, #FFD166 0%, #00D2FF 100%)',
                                    }}
                                  />
                                </div>

                                <div className="checklist-items-stack">
                                  {stepTasks.map((t) => {
                                    const isDone = completedTasks.includes(t.id)
                                    return (
                                      <div
                                        key={t.id}
                                        className={`checklist-row ${isDone ? 'checked' : ''} ${t.isCapstone ? 'capstone' : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleToggleTask(t.id)
                                        }}
                                        title="Click to toggle completion & boost Career Readiness"
                                      >
                                        <div className={`cyber-check-circle ${isDone ? 'checked' : ''}`}>
                                          {isDone && <Check size={10} color="#05060A" strokeWidth={3.5} />}
                                        </div>
                                        <span className="checklist-label-text">{t.label}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })()}


                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          </div>

          {/* =========================================================================
              SHOW COMPLETE ROADMAP ACTION BANNER (NAVIGATES TO FULL DEDICATED ROUTE)
              ========================================================================= */}
          {(() => {
            const allRoadmapSteps = (aiGeneratedMilestones && aiGeneratedMilestones.length > 0)
              ? aiGeneratedMilestones
              : (TRACK_ROADMAPS[studentProfile.careerGoal] || TRACK_ROADMAPS['AI Engineer'])
            
            return (
              <div className="roadmap-expand-full-banner">
                <div className="expand-banner-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                    <div className="expand-icon-pulse">
                      <Compass size={24} color="#00D2FF" style={{ animation: 'spin 12s linear infinite' }} />
                    </div>
                    <div>
                      <h3 className="bungee-regular" style={{ color: '#FFD166', fontSize: '1.02rem', margin: 0, letterSpacing: '0.04em' }}>
                        SHOW COMPLETE ROADMAP ({allRoadmapSteps.length} MILESTONES)
                      </h3>
                      <p style={{ color: '#B8B3C7', fontSize: '0.82rem', margin: '0.3rem 0 0 0', lineHeight: 1.4 }}>
                        Launch full-screen deep space interactive pathway with all {allRoadmapSteps.length} waypoints, task sync &amp; capstone deliverables.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (typeof onOpenFullRoadmap === 'function') {
                        onOpenFullRoadmap(allRoadmapSteps)
                      } else {
                        const identifier = studentProfile.name ? studentProfile.name.split(' ')[0].toLowerCase() : 'scholar'
                        window.history.pushState({}, '', `/${encodeURIComponent(identifier)}/roadmap`)
                        window.dispatchEvent(new PopStateEvent('popstate'))
                      }
                    }}
                    className="bungee-regular expand-launch-btn"
                  >
                    <span>VIEW FULL MAP</span>
                    <ArrowRight size={16} color="#05060A" strokeWidth={2.8} />
                  </button>
                </div>
              </div>
            )
          })()}
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
          6.9 FAST GENAI LIVE TERMINAL EXECUTION MODAL (WITH CAT.PNG)
          ========================================================================= */}
      <AnimatePresence>
        {isGeneratingAiRoadmap && (
          <motion.div
            className="quiz-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 10005 }}
          >
            <motion.div
              className="ai-roadmap-modal-card agent-cockpit-modal fast-genai-modal-card"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
            >
              {/* Header */}
              <div className="ai-roadmap-header-row fast-genai-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(0, 210, 255, 0.12)',
                      border: '1.5px solid #00D2FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Zap size={20} color="#00D2FF" />
                  </div>
                  <div>
                    <h2 className="bungee-regular fast-genai-title">
                      GROQ CLOUD FAST GENAI GENERATOR
                    </h2>
                    <span className="fast-genai-subtitle">
                      Target Track: <strong style={{ color: '#00D2FF' }}>{studentProfile.careerGoal}</strong> • LLaMA 3.3 (120B / 70B Instant Engine)
                    </span>
                  </div>
                </div>

                <div className="fast-genai-status-badge">
                  <RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>GENERATING ROADMAP...</span>
                </div>
              </div>

              {/* Grid with Cat on left and Terminal on right */}
              <div className="fast-genai-grid-stage">
                {/* Free standing Cosmic Cat */}
                <div className="fast-genai-cat-col">
                  <img
                    src="/cat.png"
                    alt="Cosmic Cat Fast GenAI Guide"
                    className="fast-genai-cat-img"
                  />
                  <div className="press-start-2p-regular fast-genai-cat-badge">
                    ✦ COSMIC CAT GENAI NAVIGATOR
                  </div>
                </div>

                {/* Cyberpunk Live Terminal Console */}
                <div className="fast-genai-terminal-col">
                  <div>
                    <h3 className="bungee-regular fast-genai-terminal-title">
                      SYNTHESIZING FAST CAREER BLUEPRINT
                    </h3>
                    <p className="fast-genai-terminal-desc">
                      Compiling 4-stage milestones, project capstones, verified resources, and semester alignment.
                    </p>
                  </div>

                  <div className="fast-genai-terminal-box">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c2030', paddingBottom: '0.45rem' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#FF5F56' }} />
                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#FFBD2E' }} />
                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#27C93F' }} />
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                        GROQ_LLAMA3_TURBO_STREAM.LOG
                      </span>
                    </div>

                    <div data-lenis-prevent="true" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', overflowY: 'auto' }}>
                      {[
                        `⚡ [INIT] Connecting to Groq Cloud LLaMA 3.3 Turbo Engine...`,
                        `📊 [DIAGNOSIS] Ingesting student profile: ${studentProfile.name} • ${studentProfile.careerGoal}...`,
                        `🔍 [BENCHMARKS] Cross-referencing verified skill matrix & capstone deliverables...`,
                        `✨ [SYNTHESIS] Synthesizing personalized 4-milestone roadmap & resources...`,
                        `✓ [COMPLETE] Fast GenAI Roadmap Ready! Displaying Full Syllabus...`,
                      ].map((logLine, lIdx) => (
                        <motion.div
                          key={lIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: lIdx * 0.28, duration: 0.25 }}
                          style={{
                            fontSize: '0.8rem',
                            color: logLine.includes('✓') ? '#27C93F' : logLine.includes('⚡') ? '#00D2FF' : '#E2E8F0',
                            lineHeight: 1.45,
                          }}
                        >
                          <span style={{ color: '#00D2FF', marginRight: '0.45rem' }}>&gt;</span>
                          <span>{logLine}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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
              className="ai-roadmap-modal-card genai-roadmap-modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="ai-roadmap-header-row genai-roadmap-header-row">
                <div className="genai-header-left">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(255, 209, 102, 0.25) 0%, rgba(255, 107, 129, 0.25) 100%)',
                      border: '1.5px solid #FFD166',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={20} color="#FFD166" />
                  </div>
                  <div>
                    <h2 className="bungee-regular genai-roadmap-title">
                      AI PERSONALIZED ROADMAP • {aiRoadmapModalData.careerGoal?.toUpperCase()}
                    </h2>
                    <div className="genai-roadmap-badges">
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

                <div className="genai-header-right-btns">
                  {/* Previous Roadmaps History Toggle */}
                  <button
                    onClick={() => {
                      setShowHistoryDrawer(!showHistoryDrawer)
                      if (!showHistoryDrawer) loadRoadmapHistory()
                    }}
                    className="genai-history-btn"
                    title="View previously generated roadmaps"
                  >
                    <History size={13} />
                    <span>PAST ({roadmapHistoryList.length})</span>
                  </button>

                  {/* Close Modal Button */}
                  <button
                    onClick={() => {
                      setAiRoadmapModalData(null)
                      setShowHistoryDrawer(false)
                    }}
                    className="genai-close-btn"
                    title="Close Roadmap"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Main Content Area (With optional History Sidebar) */}
              <div
                className="genai-roadmap-content-area"
                onWheel={(e) => {
                  const el = document.getElementById('ai-roadmap-printable-area')
                  if (el) {
                    el.scrollTop += e.deltaY
                  }
                }}
              >
                {/* Previous Roadmaps History Drawer */}
                {showHistoryDrawer && (
                  <motion.div
                    data-lenis-prevent="true"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '260px', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="genai-history-drawer"
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
                  className="ai-roadmap-scroll-container genai-roadmap-scroll-box"
                  data-lenis-prevent="true"
                  tabIndex={0}
                >
                  <div className="ai-roadmap-markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {aiRoadmapModalData.generatedRoadmapText}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="ai-roadmap-footer-row genai-roadmap-footer">
                <span className="genai-footer-note">
                  ✦ Generated dynamically based on your verified assessment scores &amp; skill gaps.
                </span>

                <div className="genai-footer-btns">
                  {/* Download as PDF Button */}
                  <button
                    onClick={() => handleDownloadRoadmapPdf(aiRoadmapModalData)}
                    disabled={isExportingPdf}
                    className="genai-download-pdf-btn"
                  >
                    {isExportingPdf && pdfGeneratingId === (aiRoadmapModalData._id || 'active') ? (
                      <>
                        <RotateCcw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>EXPORTING...</span>
                      </>
                    ) : (
                      <>
                        <Download size={15} />
                        <span>DOWNLOAD AS PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    className="auth-submit-btn bungee-regular genai-close-action-btn"
                    onClick={() => {
                      setAiRoadmapModalData(null)
                      setShowHistoryDrawer(false)
                    }}
                  >
                    <span>CLOSE</span>
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
                id="previous-roadmaps-scroll-area"
                className="ai-roadmap-scroll-container"
                style={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: 'calc(75vh - 140px)',
                  maxHeight: 'calc(75vh - 140px)',
                  padding: '1.2rem',
                  overflowY: 'scroll',
                  overflowX: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  pointerEvents: 'auto',
                  touchAction: 'pan-y',
                }}
                onWheel={(e) => {
                  const el = document.getElementById('previous-roadmaps-scroll-area')
                  if (el) {
                    el.scrollTop += e.deltaY
                  }
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
          7.8 INTERACTIVE LANGGRAPH STATEGRAPH VISUALIZER COCKPIT MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isAgentModalOpen && (
          <motion.div
            className="quiz-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 10000 }}
          >
            <motion.div
              className="ai-roadmap-modal-card agent-cockpit-modal agent-visualizer-modal-card"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
            >
              {/* Top Flow Header Track */}
              <div className="ai-roadmap-header-row agent-visualizer-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(255, 209, 102, 0.12)',
                      border: '1.5px solid #FFD166',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={22} color="#FFD166" />
                  </div>
                  <div>
                    <h2 className="bungee-regular agent-visualizer-title">
                      LANGGRAPH AUTONOMOUS AGENT STATEGRAPH
                    </h2>
                    <span className="agent-visualizer-subtitle">
                      Target Track: <strong style={{ color: '#FFD166' }}>{studentProfile.careerGoal}</strong> • Multi-Node ReAct Reasoning Workflow
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAgentModalOpen(false)}
                  className="agent-visualizer-close-btn"
                  title="Close Agent Cockpit"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Top 5 Connected Sequential Nodes Stepper Flow (100% Responsive Grid, Zero Overflow) */}
              <div className="agent-visualizer-stepper-track">
                {[
                  { num: '01', title: 'SkillProfiler', icon: Award },
                  { num: '02', title: 'KnowledgeRAG', icon: BookOpen },
                  { num: '03', title: 'ReActPlanner', icon: Brain },
                  { num: '04', title: 'Synthesizer', icon: Sparkles },
                  { num: '05', title: 'Verified Blueprint', icon: CheckCircle },
                ].map((stepObj, sIdx) => {
                  const Icon = stepObj.icon
                  const isActive = agentCurrentNodeIndex === sIdx
                  const isDone = agentCurrentNodeIndex > sIdx

                  return (
                    <div
                      key={sIdx}
                      className={`agent-visualizer-step-item ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
                      onClick={() => {
                        if (agentFinalReport && sIdx <= 4) {
                          setAgentCurrentNodeIndex(sIdx)
                        }
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: isActive ? '#FFD166' : isDone ? '#27C93F' : '#141828',
                          color: isActive || isDone ? '#05060A' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {isDone ? <Check size={11} strokeWidth={3.5} /> : <span>{stepObj.num}</span>}
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stepObj.title}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Main Sliding Content Area */}
              <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {agentCurrentNodeIndex < 4 ? (
                  /* ACTIVE NODE SLIDING STAGE (0..3) */
                  (() => {
                    const currentNode = AGENT_NODES_PIPELINE[agentCurrentNodeIndex] || AGENT_NODES_PIPELINE[0]
                    return (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={agentCurrentNodeIndex}
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.4 }}
                          className="agent-visualizer-node-stage"
                        >
                          {/* Character Col Standing Freely (NO Card Background!) */}
                          <div className="agent-visualizer-char-col">
                            <img
                              src={currentNode.img}
                              alt={currentNode.characterName}
                              className="agent-visualizer-char-img"
                            />
                            <div className="press-start-2p-regular agent-visualizer-char-badge">
                              ✦ {currentNode.characterName.toUpperCase()}
                            </div>
                          </div>

                          {/* Interactive Console & Node Reasoning */}
                          <div className="agent-visualizer-terminal-col">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                              <span
                                className="press-start-2p-regular"
                                style={{
                                  fontSize: '0.66rem',
                                  color: '#FFD166',
                                  background: 'rgba(255, 209, 102, 0.12)',
                                  border: '1.5px solid #FFD166',
                                  borderRadius: '8px',
                                  padding: '0.3rem 0.75rem',
                                }}
                              >
                                {currentNode.badge}
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: '#27C93F', fontWeight: 800 }}>
                                <RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                <span>EXECUTING STATE GRAPH</span>
                              </div>
                            </div>

                            <div>
                              <h3 className="bungee-regular agent-visualizer-node-title">
                                {currentNode.title}
                              </h3>
                              <p className="agent-visualizer-node-desc">
                                {currentNode.desc}
                              </p>
                            </div>

                            {/* Live Cyberpunk Terminal Thought Stream */}
                            <div className="agent-visualizer-terminal-box">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c2030', paddingBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F56' }} />
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E' }} />
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27C93F' }} />
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                                  LANGGRAPH_STATE_STREAM.LOG
                                </span>
                              </div>

                              <div data-lenis-prevent="true" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
                                {currentNode.logs.map((logLine, lIdx) => (
                                  <motion.div
                                    key={lIdx}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: lIdx * 0.95, duration: 0.4 }}
                                    style={{
                                      fontSize: '0.84rem',
                                      color: logLine.includes('✓') || logLine.includes('COMPLETE') ? '#27C93F' : logLine.includes('⚡') || logLine.includes('GROQ') ? '#FFD166' : '#E2E8F0',
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    <span style={{ color: '#00D2FF', marginRight: '0.5rem' }}>&gt;</span>
                                    <span>{logLine}</span>
                                  </motion.div>
                                ))}

                                <motion.div
                                  animate={{ opacity: [0.2, 1, 0.2] }}
                                  transition={{ repeat: Infinity, duration: 1.1 }}
                                  style={{
                                    fontSize: '0.76rem',
                                    color: '#00D2FF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    marginTop: '0.3rem',
                                  }}
                                >
                                  <span style={{ display: 'inline-block', width: '6px', height: '13px', background: '#00D2FF' }} />
                                  <span>Evaluating LangGraph tensor state...</span>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )
                  })()
                ) : (
                  /* FINAL REPORT & BLUEPRINT VIEW (STAGE 4) */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="agent-final-report-wrapper"
                    data-lenis-prevent="true"
                  >
                    {/* Top Executive Banner */}
                    <div className="agent-final-banner">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Award size={24} color="#27C93F" />
                        <div>
                          <h3 className="bungee-regular agent-final-banner-title">
                            AUTONOMOUS CAREER BLUEPRINT SYNTHESIZED
                          </h3>
                          <span className="agent-final-banner-sub">
                            ✓ 4-Node LangGraph State Graph &amp; RAG Knowledge Base fully grounded.
                          </span>
                        </div>
                      </div>

                      <span className="agent-final-engine-badge">
                        <Cpu size={13} />
                        <span>GROQ LLAMA 3.3 (120B)</span>
                      </span>
                    </div>

                    {/* Markdown Report Scroll Container */}
                    <div
                      id="agent-final-report-scroll-container"
                      className="ai-roadmap-scroll-container agent-final-scroll-container"
                      data-lenis-prevent="true"
                      tabIndex={0}
                      onWheel={(e) => {
                        const el = document.getElementById('agent-final-report-scroll-container')
                        if (el) el.scrollTop += e.deltaY
                      }}
                    >
                      <div className="ai-roadmap-markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {agentFinalReport?.agentAnalysis || 'Generated personalized 4-step blueprint.'}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="agent-final-footer">
                      <span className="agent-final-footer-text">
                        ✦ Apply directly to your 3D interactive dashboard deck or export as PDF.
                      </span>

                      <div className="agent-final-footer-btns">
                        {/* Download PDF for LangGraph Agent */}
                        <button
                          onClick={() => {
                            const customRoadmap = {
                              _id: agentFinalReport.roadmapId || 'agent_plan',
                              careerGoal: `${studentProfile.careerGoal} (Autonomous Agent)`,
                              generatedRoadmapText: agentFinalReport.agentAnalysis,
                              createdAt: agentFinalReport.createdAt || new Date(),
                            }
                            handleDownloadRoadmapPdf(customRoadmap)
                          }}
                          disabled={isExportingPdf}
                          style={{
                            background: 'rgba(39, 201, 63, 0.15)',
                            border: '1.5px solid #27C93F',
                            borderRadius: '10px',
                            padding: '0.6rem 1.3rem',
                            color: '#27C93F',
                            fontFamily: '"Bungee", cursive, sans-serif',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: isExportingPdf ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isExportingPdf ? (
                            <>
                              <RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                              <span>DOWNLOADING...</span>
                            </>
                          ) : (
                            <>
                              <Download size={14} />
                              <span>DOWNLOAD PDF</span>
                            </>
                          )}
                        </button>

                        {/* Apply to 3D Deck (Solid Green, No Gradient) */}
                        <button
                          className="bungee-regular"
                          style={{
                            width: 'auto',
                            padding: '0.6rem 1.5rem',
                            fontSize: '0.82rem',
                            background: '#27C93F',
                            border: '1.5px solid #27C93F',
                            borderRadius: '10px',
                            color: '#05060A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(39, 201, 63, 0.3)',
                          }}
                          onClick={() => {
                            let ms = null
                            if (agentFinalReport?.roadmap?.steps && agentFinalReport.roadmap.steps.length > 0) {
                              ms = agentFinalReport.roadmap.steps.map((st, sIdx) => ({
                                step: String(sIdx + 1).padStart(2, '0'),
                                title: (st.title || `Milestone ${sIdx + 1}`).toUpperCase(),
                                desc: st.topic || st.title || '',
                                topics: st.topic || '',
                                resources: (st.resources || []).join(', '),
                                capstone: st.project || `Capstone ${sIdx + 1}`,
                                tech: (st.tech || 'python').toLowerCase(),
                              }))
                            } else if (agentFinalReport?.agentAnalysis) {
                              ms = parseMilestonesFromRoadmapText(agentFinalReport.agentAnalysis)
                            }
                            if (ms && ms.length > 0) {
                              saveAndSetMilestones(ms, studentProfile.careerGoal)
                            }
                            setIsAgentModalOpen(false)
                          }}
                        >
                          <Check size={16} strokeWidth={3.5} />
                          <span>APPLY TO 3D ROADMAP</span>
                        </button>

                        {/* Close Cockpit (Solid Clean Button) */}
                        <button
                          className="dashboard-nav-btn"
                          style={{
                            padding: '0.6rem 1.3rem',
                            fontSize: '0.82rem',
                            borderColor: '#33394f',
                            background: '#131724',
                            color: '#FFF7E8',
                            borderRadius: '10px',
                            cursor: 'pointer',
                          }}
                          onClick={() => setIsAgentModalOpen(false)}
                        >
                          <span>CLOSE COCKPIT</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* =========================================================================
          8. FLOATING AI ASSISTANT CHAT COCKPIT (RAG + GROQ CLOUD)
          ========================================================================= */}
      {/* =========================================================================
          8. FLOATING AI ASSISTANT CHAT COCKPIT (RAG + GROQ CLOUD)
          ========================================================================= */}
      <div className="floating-ai-mentor-container">
        {!isAiChatOpen ? (
          <motion.div
            className="floating-ai-mentor-trigger"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            onClick={() => {
              if (onOpenAiMentor) {
                onOpenAiMentor()
              } else {
                setIsAiChatOpen(true)
              }
            }}
          >
            {/* Top Speech Bubble Badge */}
            <div className="floating-ai-mentor-badge">
              <Sparkles size={13} color="#FFD166" />
              <span className="press-start-2p-regular ai-mentor-badge-text">ASK AI MENTOR</span>
            </div>

            {/* Character Image hard.png */}
            <img
              src="/hard.png"
              alt="AI Mentor Character"
              className="floating-ai-mentor-img"
            />
          </motion.div>
        ) : (
          <motion.div
            className="floating-ai-mentor-chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
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
              data-lenis-prevent="true"
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

      {/* DEDICATED IN-DOM HIGH-CONTRAST PDF RENDERER (POWERED BY REACTMARKDOWN & REHYPE-RAW) */}
      {activePdfRoadmap && (
        <div
          id="skillforge-active-pdf-template"
          className="pdf-export-template"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '790px',
            zIndex: -9999,
            background: '#FFFFFF',
            color: '#0F172A',
            opacity: 0.01,
            pointerEvents: 'none',
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
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {activePdfRoadmap.generatedRoadmapText}
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
