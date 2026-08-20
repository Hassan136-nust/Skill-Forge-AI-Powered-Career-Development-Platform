import express from 'express'
import Profile from '../models/Profile.js'
import User from '../models/User.js'

const router = express.Router()

// PRD Category-Based Assessment Question Bank (5 Questions per Category)
const ASSESSMENT_QUESTION_BANK = {
  python: [
    {
      id: 'py_1',
      question: 'Which method in Python is used to customize developer object string representation?',
      code: `class NeuralNode:\n    def __init__(self, weights):\n        self.weights = weights\n    \n    def __repr__(self):\n        return f"NeuralNode(w={self.weights})"`,
      options: ['__str__()', '__repr__()', '__format__()', '__init__()'],
      correctIndex: 1,
      difficulty: 'easy',
    },
    {
      id: 'py_2',
      question: 'What is the key difference between list.sort() and sorted(iterable) in Python?',
      code: `a = [3, 1, 2]\nb = sorted(a)\na.sort()`,
      options: [
        'list.sort() returns a new list; sorted() mutates in place',
        'list.sort() mutates in place; sorted() returns a new sorted list',
        'Both create deep copies of object memory',
        'sorted() only accepts dictionary keys'
      ],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'py_3',
      question: 'Which decorator is used to define class-level constructor factory methods in Python?',
      code: `class Vector:\n    @classmethod\n    def from_dict(cls, data):\n        return cls(data["x"], data["y"])`,
      options: ['@staticmethod', '@classmethod', '@property', '@abstractmethod'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'py_4',
      question: 'What does a generator function yield in Python when iterated?',
      code: `def count_stream(n):\n    for i in range(n):\n        yield i * 2`,
      options: ['Memory array of all items', 'Generator iterator computing items on demand (lazy loading)', 'Tuple of fixed references', 'JSON stream buffer'],
      correctIndex: 1,
      difficulty: 'hard',
    },
    {
      id: 'py_5',
      question: 'Which built-in module provides high-performance thread/process pool executors in Python?',
      code: `from concurrent.futures import ThreadPoolExecutor\nwith ThreadPoolExecutor(max_workers=4) as executor:\n    results = executor.map(fetch_url, urls)`,
      options: ['asyncio', 'concurrent.futures', 'multiprocessing.raw', 'threading.Pool'],
      correctIndex: 1,
      difficulty: 'hard',
    }
  ],
  webDev: [
    {
      id: 'web_1',
      question: 'In React, which hook is used to handle side effects like data fetching or DOM subscriptions?',
      code: `import { useEffect } from 'react';\n\nuseEffect(() => {\n  fetchData();\n}, []);`,
      options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
      correctIndex: 1,
      difficulty: 'easy',
    },
    {
      id: 'web_2',
      question: 'Which TypeScript utility type constructs a type with all properties set to optional?',
      code: `interface Scholar {\n  name: string;\n  score: number;\n}\n\ntype PartialScholar = Partial<Scholar>;`,
      options: ['Required<T>', 'Partial<T>', 'Readonly<T>', 'Record<K, T>'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'web_3',
      question: 'Which CSS layout system is optimized for two-dimensional grid layouts with rows and columns?',
      code: `.dashboard-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n}`,
      options: ['Flexbox', 'CSS Grid', 'Float Layout', 'Absolute Positioning'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'web_4',
      question: 'In Next.js App Router, which file convention defines a route UI page component?',
      code: `// app/dashboard/page.tsx\nexport default function Page() {\n  return <h1>Dashboard</h1>;\n}`,
      options: ['index.js', 'page.tsx', 'route.js', 'layout.tsx'],
      correctIndex: 1,
      difficulty: 'hard',
    },
    {
      id: 'web_5',
      question: 'Which JavaScript array method creates a new array populated with transformed results?',
      code: `const scores = [80, 90, 95];\nconst boosted = scores.map(s => s + 5);`,
      options: ['forEach()', 'map()', 'filter()', 'reduce()'],
      correctIndex: 1,
      difficulty: 'hard',
    }
  ],
  git: [
    {
      id: 'git_1',
      question: 'Which Git command combines feature branch commits into main while maintaining a linear history?',
      code: `git checkout feature/ai-quiz\ngit rebase main`,
      options: ['git merge --no-ff', 'git rebase', 'git cherry-pick', 'git stash pop'],
      correctIndex: 1,
      difficulty: 'easy',
    },
    {
      id: 'git_2',
      question: 'How do you temporarily shelf uncommitted changes without committing them?',
      code: `git stash save "work in progress"\ngit checkout main\ngit stash pop`,
      options: ['git commit -m "temp"', 'git stash', 'git reset --hard', 'git branch -d'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'git_3',
      question: 'Which Git command undoes a specific commit by creating a new commit with inverted changes?',
      code: `git revert <commit-hash>`,
      options: ['git reset --hard', 'git revert', 'git checkout --force', 'git rebase -i'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'git_4',
      question: 'What is the purpose of a .gitignore file in a software repository?',
      code: `node_modules/\n.env\ndist/\n*.log`,
      options: [
        'Encrypts sensitive source code files',
        'Excludes specified files/directories from being tracked by Git',
        'Deletes temporary files on push',
        'Compiles TypeScript into JavaScript'
      ],
      correctIndex: 1,
      difficulty: 'hard',
    },
    {
      id: 'git_5',
      question: 'Which command fetches updates from a remote repository and merges them into current branch?',
      code: `git pull origin main`,
      options: ['git push', 'git pull', 'git fetch --bare', 'git clone'],
      correctIndex: 1,
      difficulty: 'hard',
    }
  ],
  devops: [
    {
      id: 'devops_1',
      question: 'What is the primary benefit of multi-stage Docker builds?',
      code: `FROM node:18-alpine AS builder\nWORKDIR /app\nRUN npm install\n\nFROM node:18-alpine AS runner\nCOPY --from=builder /app/node_modules ./node_modules`,
      options: [
        'Runs multiple containers simultaneously',
        'Drastically reduces production image size & security footprint',
        'Bypasses build cache',
        'Compiles JavaScript into WebAssembly'
      ],
      correctIndex: 1,
      difficulty: 'easy',
    },
    {
      id: 'devops_2',
      question: 'Which Kubernetes resource manages a set of identical Pods to ensure specified replicas run?',
      code: `apiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: 3`,
      options: ['ConfigMap', 'Deployment', 'Service', 'Ingress'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'devops_3',
      question: 'Which Linux command changes file read/write execution permissions?',
      code: `chmod 755 deploy.sh`,
      options: ['chown', 'chmod', 'chgrp', 'umask'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'devops_4',
      question: 'In Docker Compose, which keyword links microservice containers on a shared network?',
      code: `services:\n  web:\n    build: .\n    depends_on:\n      - db`,
      options: ['links', 'depends_on', 'network_mode', 'volumes'],
      correctIndex: 1,
      difficulty: 'hard',
    },
    {
      id: 'devops_5',
      question: 'What infrastructure-as-code tool uses declarative HCL files to provision cloud resources?',
      code: `resource "aws_instance" "app_server" {\n  ami = "ami-830c0fef"\n  instance_type = "t2.micro"\n}`,
      options: ['Ansible', 'Terraform', 'Puppet', 'Chef'],
      correctIndex: 1,
      difficulty: 'hard',
    }
  ],
  ai: [
    {
      id: 'ai_1',
      question: 'Which PyTorch method clears old gradients before running backward propagation?',
      code: `optimizer.zero_grad()\noutputs = model(inputs)\nloss = criterion(outputs, targets)\nloss.backward()`,
      options: ['optimizer.reset()', 'optimizer.zero_grad()', 'model.clear()', 'loss.flush()'],
      correctIndex: 1,
      difficulty: 'easy',
    },
    {
      id: 'ai_2',
      question: 'In ChromaDB vector store, what operation inserts document text and vector embeddings?',
      code: `collection.add(\n  documents=["AI Agent Architecture"],\n  metadatas=[{"source": "paper"}],\n  ids=["id1"]\n)`,
      options: ['collection.insert_row()', 'collection.add()', 'collection.push()', 'collection.write()'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'ai_3',
      question: 'What is the primary role of Retrieval-Augmented Generation (RAG) in LLM applications?',
      code: `query -> embed -> vector search -> top-k context -> LLM prompt`,
      options: [
        'Fine-tunes transformer weights from scratch',
        'Grounds LLM responses with real-time domain knowledge from external vector stores',
        'Compresses prompt text into GZIP',
        'Replaces Python with C++'
      ],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'ai_4',
      question: 'In PyTorch, which activation function introduces non-linearity by zeroing negative values?',
      code: `import torch.nn as nn\nself.relu = nn.ReLU()`,
      options: ['Sigmoid', 'ReLU (Rectified Linear Unit)', 'Softmax', 'Tanh'],
      correctIndex: 1,
      difficulty: 'hard',
    },
    {
      id: 'ai_5',
      question: 'What agent design pattern relies on an iterative loop of Reasoning, Action, and Observation?',
      code: `Thought: I need student skills.\nAction: analyze_student_skills()\nObservation: { python: 80, docker: 40 }\nThought: I will suggest Docker roadmap step.`,
      options: ['Plan-And-Solve', 'ReAct (Reason + Act)', 'Zero-Shot Prompting', 'Chain-Of-Thought'],
      correctIndex: 1,
      difficulty: 'hard',
    }
  ],
  databases: [
    {
      id: 'db_1',
      question: 'Which SQL clause filters aggregated group results in PostgreSQL?',
      code: `SELECT department, COUNT(*) FROM scholars GROUP BY department HAVING COUNT(*) > 5;`,
      options: ['WHERE', 'HAVING', 'GROUP BY', 'FILTER'],
      correctIndex: 1,
      difficulty: 'easy',
    },
    {
      id: 'db_2',
      question: 'Which Redis data structure stores unique elements with associated floating point scores?',
      code: `ZADD scholar_leaderboard 95 "Alex" 100 "Hassan"`,
      options: ['Hash', 'Sorted Set (ZSET)', 'List', 'Set'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'db_3',
      question: 'In MongoDB, which aggregation pipeline stage matches documents based on query filters?',
      code: `db.profiles.aggregate([\n  { $match: { careerGoal: "AI Engineer" } }\n])`,
      options: ['$group', '$match', '$project', '$unwind'],
      correctIndex: 1,
      difficulty: 'intermediate',
    },
    {
      id: 'db_4',
      question: 'What SQL join type returns all records from left table and matching records from right table?',
      code: `SELECT * FROM students S LEFT JOIN grades G ON S.id = G.student_id;`,
      options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
      correctIndex: 1,
      difficulty: 'hard',
    },
    {
      id: 'db_5',
      question: 'What ACID property guarantees that all operations in a database transaction succeed or all fail?',
      code: `BEGIN TRANSACTION;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;`,
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctIndex: 0,
      difficulty: 'hard',
    }
  ]
}

// GET /api/assessment/questions — Fetch all PRD 6 categories (5 questions each)
router.get('/questions', (req, res) => {
  const { category } = req.query
  if (category && ASSESSMENT_QUESTION_BANK[category]) {
    return res.json({
      success: true,
      category,
      questions: ASSESSMENT_QUESTION_BANK[category],
    })
  }

  res.json({
    success: true,
    categories: Object.keys(ASSESSMENT_QUESTION_BANK),
    totalCategories: 6,
    questionsPerCategory: 5,
    questions: ASSESSMENT_QUESTION_BANK,
  })
})

// POST /api/assessment/submit — Submit assessment answers & auto-score 0-100 per category
router.post('/submit', async (req, res) => {
  try {
    const { email, userId, category, answers } = req.body

    let correctCount = 0
    const catQuestions = ASSESSMENT_QUESTION_BANK[category] || []

    if (Array.isArray(answers) && catQuestions.length > 0) {
      answers.forEach((ans) => {
        const q = catQuestions.find((item) => item.id === ans.questionId)
        if (q && ans.selectedIndex === q.correctIndex) {
          correctCount++
        }
      })
    }

    const calculatedScore = catQuestions.length > 0
      ? Math.round((correctCount / catQuestions.length) * 100)
      : 100

    // Persist result to MongoDB Profile if user email or ID provided
    if (email || userId) {
      let targetUserId = userId
      const cleanEmail = email ? email.toLowerCase().trim() : 'student@nust.edu.pk'

      let user = null
      if (targetUserId) {
        user = await User.findById(targetUserId).catch(() => null)
      }
      if (!user && cleanEmail) {
        user = await User.findOne({ email: cleanEmail })
      }
      if (!user) {
        user = await User.create({
          name: 'Scholar Student',
          email: cleanEmail,
          password: 'temp_password_' + Date.now(),
          role: 'student',
          avatar: 'https://imgs.search.brave.com/en8GueUwEke4A7ecDjpRnIpFR8Y-WWOEbjzD2xCNTu0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWd2/My5mb3Rvci5jb20v/aW1hZ2VzL2hvbWVw/YWdlLWZlYXR1cmUt/Y2FyZC9mb3Rvci0z/ZC1hdmF0YXIuanBn',
          isVerified: true,
        })
      }
      targetUserId = user._id

      let profile = await Profile.findOne({ userId: targetUserId })
      if (!profile) {
        profile = new Profile({
          userId: targetUserId,
          university: 'NUST',
          degree: 'BS Computer Science',
          yearOfStudy: 3,
          experienceLevel: 'intermediate',
          careerGoal: 'AI Engineer',
          skills: [],
          projects: []
        })
      }

      if (!Array.isArray(profile.skills)) profile.skills = []

      let sIdx = profile.skills.findIndex(s => 
        s.name.toLowerCase() === category.toLowerCase() ||
        s.name.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(s.name.toLowerCase())
      )
      if (sIdx >= 0) {
        profile.skills[sIdx].verifiedScore = calculatedScore
        profile.skills[sIdx].isVerified = true
        profile.skills[sIdx].level = calculatedScore >= 80 ? 'advanced' : 'intermediate'
      } else {
        profile.skills.push({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          level: calculatedScore >= 80 ? 'advanced' : 'intermediate',
          isVerified: true,
          verifiedScore: calculatedScore,
        })
      }
      await profile.save()
    }

    res.json({
      success: true,
      category,
      score: calculatedScore,
      correctCount,
      totalQuestions: catQuestions.length,
      message: `Category ${category} scored ${calculatedScore}/100 and persisted to MongoDB Atlas!`,
    })
  } catch (error) {
    console.error('Assessment Submission Error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/assessment/results/:userId — Retrieve assessment scores
router.get('/results/:userId', async (req, res) => {
  try {
    const rawParam = decodeURIComponent(req.params.userId || '').trim()
    let profile = null

    if (rawParam.includes('@')) {
      const user = await User.findOne({ email: rawParam.toLowerCase() })
      if (user) {
        profile = await Profile.findOne({ userId: user._id })
      }
    } else {
      profile = await Profile.findOne({ userId: rawParam }).catch(() => null)
      if (!profile) {
        const user = await User.findById(rawParam).catch(() => null)
        if (user) {
          profile = await Profile.findOne({ userId: user._id })
        }
      }
      if (!profile) {
        profile = await Profile.findById(rawParam).catch(() => null)
      }
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' })
    }

    const scores = {}
    if (Array.isArray(profile.skills)) {
      profile.skills.forEach((s) => {
        if (s && s.name) {
          scores[s.name.toLowerCase()] = typeof s.verifiedScore === 'number' ? s.verifiedScore : (s.isVerified ? 80 : 0)
        }
      })
    }

    res.json({
      success: true,
      userId: rawParam,
      scores,
      profile,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
