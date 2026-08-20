"""
SkillAnalyzer — Core OOP Python Service for SkillForge (PRD Section 5.1)
"""

ROLE_BENCHMARKS = {
    "AI Engineer": {
        "python": 80,
        "pytorch": 80,
        "fastapi": 70,
        "docker": 70,
        "chromadb": 70,
        "git": 70,
        "typescript": 50,
    },
    "Backend Developer": {
        "typescript": 80,
        "node": 80,
        "postgresql": 80,
        "fastapi": 70,
        "redis": 70,
        "docker": 70,
        "git": 70,
    },
    "Frontend Developer": {
        "javascript": 85,
        "react": 85,
        "typescript": 80,
        "css": 80,
        "nextjs": 75,
        "tailwind": 75,
        "git": 70,
    },
    "Full-Stack Developer": {
        "javascript": 80,
        "react": 80,
        "node": 80,
        "postgresql": 75,
        "docker": 70,
        "git": 75,
        "typescript": 70,
    },
    "DevOps Engineer": {
        "linux": 85,
        "docker": 85,
        "kubernetes": 80,
        "git": 80,
        "python": 70,
        "sql": 60,
    },
    "Data Scientist": {
        "python": 85,
        "pandas": 85,
        "sql": 80,
        "pytorch": 75,
        "fastapi": 60,
        "git": 70,
    },
}

class SkillAnalyzer:
    """
    SkillAnalyzer implements calculation of normalized skill scores,
    identifies technical gaps relative to career benchmarks, and recommends ordered topics.
    """

    def calculate_score(self, assessment_results: dict) -> dict:
        """
        Returns per-category scores normalized 0-100.
        """
        normalized_scores = {}
        for category, data in assessment_results.items():
            if isinstance(data, dict):
                score = data.get("score", 0)
            elif isinstance(data, (int, float)):
                score = data
            else:
                score = 0
            normalized_scores[category.lower()] = max(0, min(100, int(score)))
        return normalized_scores

    def identify_gaps(self, scores: dict, target_role: str) -> list:
        """
        Compares student scores against role thresholds, returns gap list.
        """
        benchmarks = ROLE_BENCHMARKS.get(target_role, ROLE_BENCHMARKS["AI Engineer"])
        gaps = []

        for req_skill, threshold in benchmarks.items():
            s_key = req_skill.lower()
            current_score = scores.get(s_key, 0)

            if current_score < threshold:
                gap_severity = "high" if current_score < (threshold / 2) else "medium"
                gaps.append({
                    "skill": req_skill.capitalize(),
                    "requiredScore": threshold,
                    "currentScore": current_score,
                    "gapPoints": threshold - current_score,
                    "severity": gap_severity,
                })
        
        # Sort gaps by largest deficit first
        gaps.sort(key=lambda x: x["gapPoints"], reverse=True)
        return gaps

    def recommend_topics(self, gaps: list) -> list:
        """
        Maps identified gaps to ordered learning topics.
        """
        topic_mappings = {
            "pytorch": ["Neural Network Architectures", "Loss Functions & Backpropagation", "PyTorch Tensor Operations", "Model Inference"],
            "fastapi": ["Async Route Handlers", "Pydantic V2 Request Schemas", "Dependency Injection", "OpenAPI Documentation"],
            "docker": ["Multi-Stage Dockerfiles", "Container Security Hardening", "Docker Compose Orchestration", "Volume Persistence"],
            "chromadb": ["Dense Vector Embeddings", "Semantic Chunking", "ChromaDB Collection APIs", "Hybrid Search Querying"],
            "postgresql": ["Relational Indexing", "SQL Window Functions & CTEs", "ACID Transactions", "Foreign Key Relationships"],
            "redis": ["In-Memory Key-Value Caching", "Sorted Sets (ZSET) for Leaderboards", "Pub/Sub Messaging", "TTL Expiration"],
            "kubernetes": ["Kubernetes Pods & Deployments", "Cluster Services & Ingress", "ConfigMaps & Secrets", "Horizontal Pod Autoscaling"],
            "react": ["React 19 Hooks (useEffect, useMemo)", "State Management & Redux", "Component Composition", "Virtual DOM Performance"],
            "nextjs": ["Next.js App Router", "Server Components vs Client Components", "Server Actions", "Incremental Static Regeneration"],
            "typescript": ["Generics & Type Inference", "Utility Types (Partial, Pick)", "Interface Polymorphism", "Strict Null Checks"],
            "python": ["Advanced Python Generators", "Object-Oriented Design Patterns", "Concurrency with Asyncio", "NumPy Vectorization"],
            "pandas": ["DataFrame Manipulation", "GroupBy Aggregations", "Vectorized Boolean Indexing", "Data Cleansing"],
            "linux": ["Bash Scripting & Automation", "File Permissions (chmod/chown)", "Process Monitoring", "SSH & Networking"],
            "git": ["Rebase vs Merge Workflows", "Interactive Staging & Revert", "Branch Protection", "CI/CD Git Hooks"],
        }

        recommended = []
        for gap in gaps:
            s_name = gap["skill"].lower()
            topics = topic_mappings.get(s_name, [f"{gap['skill']} Core Concepts", f"{gap['skill']} Production Engineering"])
            recommended.append({
                "skill": gap["skill"],
                "topics": topics,
                "urgency": gap.get("severity", "medium"),
            })
        return recommended
