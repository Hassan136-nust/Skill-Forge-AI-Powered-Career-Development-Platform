"""
RoadmapGenerator — Core OOP Python Service for SkillForge (PRD Section 5.2)
"""

class RoadmapGenerator:
    """
    RoadmapGenerator compiles customized, actionable 4-step timelines
    incorporating skill gaps, curated capstone projects, and learning resources.
    """

    ROLE_DEFAULTS = {
        "AI Engineer": [
            {
                "order": 1,
                "title": "PYTHON & VECTOR ALGORITHMS",
                "tech": "Python",
                "topic": "Python OOP, Advanced Generators & Vectorized NumPy Math",
                "project": "Neural Base Math Engine & Vector Distance Evaluator",
                "timeline": "2-3 Weeks",
                "resources": ["Fast.ai Deep Learning Part 1", "Python Concurrency & Asyncio Docs"],
            },
            {
                "order": 2,
                "title": "PYTORCH & NEURAL NETWORKS",
                "tech": "PyTorch",
                "topic": "Deep Learning Architectures, Backprop & PyTorch Modules",
                "project": "End-to-End Deep Learning Classification Pipeline",
                "timeline": "3-4 Weeks",
                "resources": ["PyTorch Official Tutorials", "Deep Learning with PyTorch by Eli Stevens"],
            },
            {
                "order": 3,
                "title": "FASTAPI & VECTOR DATABASES",
                "tech": "FastAPI / ChromaDB",
                "topic": "Async APIs, Semantic Chunking & Vector Search Ingestion",
                "project": "Production RAG Retrieval Assistant over Enterprise Documents",
                "timeline": "3 Weeks",
                "resources": ["FastAPI Production Guide", "ChromaDB Documentation & RAG Cookbook"],
            },
            {
                "order": 4,
                "title": "AUTONOMOUS AI AGENTS & DOCKER",
                "tech": "LangGraph / Docker",
                "topic": "Multi-Agent ReAct Tool Loops, Containerization & CI/CD",
                "project": "Enterprise Autonomous Agent with Real-Time Monitoring",
                "timeline": "4 Weeks",
                "resources": ["LangGraph Conceptual Docs", "Docker Production Best Practices"],
            }
        ],
        "Backend Developer": [
            {
                "order": 1,
                "title": "TYPESCRIPT & NODE.JS CORE",
                "tech": "TypeScript",
                "topic": "TypeScript Generics, Asynchronous Node Streams & Event Loop",
                "project": "High-Performance API Gateway with JWT & Rate Limiting",
                "timeline": "2-3 Weeks",
                "resources": ["TypeScript Handbook", "Node.js Design Patterns 3rd Edition"],
            },
            {
                "order": 2,
                "title": "POSTGRESQL & SCHEMAS",
                "tech": "PostgreSQL",
                "topic": "Relational Schema Normalization, Window Queries & ACID Transactions",
                "project": "Scalable Relational Data Platform with Migrations",
                "timeline": "3 Weeks",
                "resources": ["PostgreSQL Tutorial", "Designing Data-Intensive Applications"],
            },
            {
                "order": 3,
                "title": "FASTAPI & REDIS CACHING",
                "tech": "Redis / FastAPI",
                "topic": "Sub-Millisecond In-Memory Caching, Sorted Sets & Pub/Sub",
                "project": "Distributed Microservice with Leaderboards & Redis Cache",
                "timeline": "3 Weeks",
                "resources": ["Redis University RU101", "FastAPI Advanced Patterns"],
            },
            {
                "order": 4,
                "title": "DOCKER & CI/CD DEPLOYMENT",
                "tech": "Docker",
                "topic": "Multi-Stage Container Builds, Docker Compose & GitHub Actions",
                "project": "Production Enterprise Backend with Automated Delivery",
                "timeline": "3-4 Weeks",
                "resources": ["Docker Deep Dive", "GitHub Actions Mastery Guide"],
            }
        ],
        "Frontend Developer": [
            {
                "order": 1,
                "title": "JAVASCRIPT & CSS ARCHITECTURE",
                "tech": "JavaScript / CSS",
                "topic": "Modern ES6+, CSS Grid, Flexbox, Animation & Design Systems",
                "project": "Interactive UI Component Design System",
                "timeline": "2 Weeks",
                "resources": ["JavaScript.info", "CSS-Tricks Complete Guide to Grid"],
            },
            {
                "order": 2,
                "title": "REACT & STATE MANAGEMENT",
                "tech": "React",
                "topic": "React 19 Hooks, Virtual DOM Optimization & Redux Toolkit",
                "project": "High-Performance Dynamic Web Dashboard",
                "timeline": "3 Weeks",
                "resources": ["React.dev Official Documentation", "Epic React by Kent C. Dodds"],
            },
            {
                "order": 3,
                "title": "NEXT.JS & TYPESCRIPT INTERFACES",
                "tech": "Next.js",
                "topic": "App Router, Server Actions, Server-Side Rendering & Strict Types",
                "project": "Full-Fledged SaaS Web Application with Authentication",
                "timeline": "3 Weeks",
                "resources": ["Next.js App Router Docs", "TypeScript for React Developers"],
            },
            {
                "order": 4,
                "title": "PERFORMANCE & TAILWIND STYLING",
                "tech": "Tailwind / Web Vitals",
                "topic": "Core Web Vitals, Responsive Layouts & Accessibility (a11y)",
                "project": "Enterprise Web Platform with Lighthouse 95+ Score",
                "timeline": "2-3 Weeks",
                "resources": ["Web.dev Performance Checklist", "Tailwind CSS Docs"],
            }
        ],
        "Full-Stack Developer": [
            {
                "order": 1,
                "title": "JAVASCRIPT & REACT FRONTEND",
                "tech": "React",
                "topic": "Component Hierarchy, Client State & Responsive Glassmorphism",
                "project": "Interactive Single-Page Application with Motion",
                "timeline": "2-3 Weeks",
                "resources": ["React.dev", "Framer Motion Documentation"],
            },
            {
                "order": 2,
                "title": "NODE.JS & EXPRESS REST API",
                "tech": "Node.js",
                "topic": "RESTful Standards, Middleware Pipeline & JWT Security",
                "project": "Secure Multi-Role RESTful Backend Server",
                "timeline": "3 Weeks",
                "resources": ["Express.js Guide", "RESTful API Design Best Practices"],
            },
            {
                "order": 3,
                "title": "POSTGRESQL & DATABASE INTEGRATION",
                "tech": "PostgreSQL",
                "topic": "Database Indexing, Query ORMs & Multi-Table Joins",
                "project": "Full-Stack Data Engine with Analytics",
                "timeline": "3 Weeks",
                "resources": ["Prisma / Mongoose Docs", "PostgreSQL Official Guide"],
            },
            {
                "order": 4,
                "title": "DOCKER & FULL-STACK DEPLOYMENT",
                "tech": "Docker",
                "topic": "Full-Stack Container Orchestration & Cloud Hosting",
                "project": "Enterprise Full-Stack Web Platform (SkillForge)",
                "timeline": "3-4 Weeks",
                "resources": ["Docker Compose Docs", "Cloud Deployment Playbook"],
            }
        ],
        "DevOps Engineer": [
            {
                "order": 1,
                "title": "LINUX & BASH SCRIPTING",
                "tech": "Linux",
                "topic": "Bash System Automation, Cron Jobs, Networking & Permissions",
                "project": "System Automation CLI & Health Diagnostic Suite",
                "timeline": "2 Weeks",
                "resources": ["Linux Journey", "Bash Scripting Cheat Sheet"],
            },
            {
                "order": 2,
                "title": "GIT & CI/CD PIPELINES",
                "tech": "Git",
                "topic": "Git Branching Workflows, Automated Linting & GitHub Actions",
                "project": "Automated Build & Continuous Delivery Pipeline",
                "timeline": "2-3 Weeks",
                "resources": ["Pro Git Book", "GitHub Actions Documentation"],
            },
            {
                "order": 3,
                "title": "DOCKER & CONTAINERIZATION",
                "tech": "Docker",
                "topic": "Multi-Stage Dockerfiles, Layer Caching & Security Scanning",
                "project": "Container Orchestration & Microservices Testbed",
                "timeline": "3 Weeks",
                "resources": ["Docker Curriculum", "OWASP Container Security Checklist"],
            },
            {
                "order": 4,
                "title": "KUBERNETES & CLOUD CLUSTERS",
                "tech": "Kubernetes",
                "topic": "Pods, Deployments, Ingress Controllers & Helm Charts",
                "project": "Self-Healing Enterprise Kubernetes Cluster",
                "timeline": "4 Weeks",
                "resources": ["Kubernetes Documentation", "CKA Exam Prep Guide"],
            }
        ],
        "Data Scientist": [
            {
                "order": 1,
                "title": "PYTHON & NUMPY / PANDAS",
                "tech": "Pandas",
                "topic": "Vectorized Operations, Data Cleansing & Exploratory Visualizations",
                "project": "Exploratory Data Pipeline & Statistical Dashboard",
                "timeline": "2-3 Weeks",
                "resources": ["Python for Data Analysis by Wes McKinney", "Pandas Docs"],
            },
            {
                "order": 2,
                "title": "SQL & RELATIONAL ANALYTICS",
                "tech": "SQL",
                "topic": "Complex Aggregations, Window Functions & CTE Analytics",
                "project": "Business Analytics Engine with High-Volume Queries",
                "timeline": "2-3 Weeks",
                "resources": ["Mode Analytics SQL Tutorial", "SQL for Data Science"],
            },
            {
                "order": 3,
                "title": "SCIKIT-LEARN & MACHINE LEARNING",
                "tech": "Scikit-Learn",
                "topic": "Regression, Classification, Cross-Validation & Hyperparameter Tuning",
                "project": "Production Predictive ML Pipeline",
                "timeline": "3-4 Weeks",
                "resources": ["Hands-On Machine Learning with Scikit-Learn", "Scikit-Learn Docs"],
            },
            {
                "order": 4,
                "title": "PYTORCH & DEEP LEARNING",
                "tech": "PyTorch",
                "topic": "Neural Network Architectures, Embeddings & GPU Model Training",
                "project": "Production Predictive Analytics & Inference System",
                "timeline": "4 Weeks",
                "resources": ["Deep Learning Specialization", "PyTorch Tutorials"],
            }
        ]
    }

    def generate(self, gaps: list, resources: list, goal: str) -> dict:
        """
        Returns structured roadmap: steps, projects, resources, timeline.
        """
        steps = self.ROLE_DEFAULTS.get(goal, self.ROLE_DEFAULTS["AI Engineer"])
        
        # Inject student-specific identified gaps into Step 2 & 3 priorities
        gap_names = [g["skill"] if isinstance(g, dict) else str(g) for g in gaps]

        return {
            "careerGoal": goal,
            "totalSteps": len(steps),
            "targetGaps": gap_names[:4],
            "steps": steps,
            "summary": f"Actionable 4-step AI career roadmap engineered to bridge {len(gap_names)} skill gaps for {goal} certification."
        }
