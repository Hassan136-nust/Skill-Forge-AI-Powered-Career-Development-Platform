"""
SkillForge ChromaDB Vector Store
==================================
Production-ready semantic search engine for the SkillForge RAG system.

Architecture:
  - Primary:  ChromaDB (persistent local) + sentence-transformers embeddings
  - Fallback: In-memory ChromaDB (if disk is read-only — e.g. serverless platforms)
  - Ultimate Fallback: BM25 keyword search (if chromadb not installed)

Works locally, in Docker, on Railway/Render/VPS — zero external APIs needed.
"""

import os
import re
import glob
import logging

logger = logging.getLogger("skillforge.vectorstore")

# ─────────────────────────────────────────────────────────────────────────────
# Lazy imports — fail gracefully so the app never crashes on missing packages
# ─────────────────────────────────────────────────────────────────────────────
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    logger.warning("chromadb not installed — falling back to BM25 search.")

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    logger.warning("sentence-transformers not installed — will use ChromaDB default embeddings.")


# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────
KB_DIR = os.path.join(os.path.dirname(__file__), "..", "rag", "knowledge-base")
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
COLLECTION_NAME = "skillforge_knowledge_base"


def _clean_title(fpath: str) -> str:
    """ai-engineer-roadmap.txt → Ai Engineer Roadmap"""
    return os.path.basename(fpath).replace(".txt", "").replace("-", " ").title()


def _chunk_document(text: str, source: str, chunk_size: int = 400) -> list[dict]:
    """
    Splits a document into overlapping paragraphs of ~chunk_size chars.
    Returns list of {"text": ..., "source": ..., "chunk_id": ...}
    """
    # Split on double newlines or markdown headers
    raw_chunks = [p.strip() for p in re.split(r'\n\s*\n|(?=#{1,3}\s)', text) if len(p.strip()) > 30]

    chunks = []
    for i, chunk in enumerate(raw_chunks):
        # Further split if chunk is very long
        if len(chunk) > chunk_size:
            words = chunk.split()
            sub = []
            sub_len = 0
            sub_idx = 0
            for word in words:
                sub.append(word)
                sub_len += len(word) + 1
                if sub_len >= chunk_size:
                    chunks.append({
                        "text": " ".join(sub),
                        "source": source,
                        "chunk_id": f"{source}_{i}_{sub_idx}"
                    })
                    sub = sub[-20:]  # 20-word overlap for context continuity
                    sub_len = sum(len(w) + 1 for w in sub)
                    sub_idx += 1
            if sub:
                chunks.append({
                    "text": " ".join(sub),
                    "source": source,
                    "chunk_id": f"{source}_{i}_{sub_idx}"
                })
        else:
            chunks.append({
                "text": chunk,
                "source": source,
                "chunk_id": f"{source}_{i}"
            })

    return chunks


# ─────────────────────────────────────────────────────────────────────────────
# ChromaDB Vector Store
# ─────────────────────────────────────────────────────────────────────────────
class SkillForgeVectorStore:
    """
    Wraps ChromaDB + sentence-transformers for semantic retrieval.

    Usage:
        vs = SkillForgeVectorStore()
        vs.build_index()              # once at startup (skipped if already indexed)
        results = vs.search("how to learn FastAPI", top_k=3)
    """

    def __init__(self):
        self._client = None
        self._collection = None
        self._embedder = None
        self._mode = "uninitialized"
        self._ready = False

    # ── Lazy initializer ─────────────────────────────────────────────────────
    def _init_chroma(self):
        if not CHROMADB_AVAILABLE:
            self._mode = "bm25_fallback"
            return

        try:
            # Try persistent first
            os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
            self._client = chromadb.PersistentClient(
                path=CHROMA_PERSIST_DIR,
                settings=Settings(anonymized_telemetry=False)
            )
            self._mode = "persistent"
            logger.info(f"ChromaDB: persistent mode at {CHROMA_PERSIST_DIR}")
        except Exception as e:
            logger.warning(f"ChromaDB persistent failed ({e}), switching to in-memory.")
            try:
                self._client = chromadb.EphemeralClient(
                    settings=Settings(anonymized_telemetry=False)
                )
                self._mode = "in_memory"
                logger.info("ChromaDB: in-memory mode (data resets on restart).")
            except Exception as e2:
                logger.error(f"ChromaDB in-memory also failed ({e2}). Using BM25 fallback.")
                self._mode = "bm25_fallback"
                return

        # Load sentence-transformers embedder (or fall back to chromadb default)
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                # all-MiniLM-L6-v2 is tiny (22MB), fast, and works offline
                self._embedder = SentenceTransformer("all-MiniLM-L6-v2")
                logger.info("Embedder: sentence-transformers/all-MiniLM-L6-v2")
            except Exception as e:
                logger.warning(f"SentenceTransformer load failed ({e}). Using ChromaDB default embeddings.")
                self._embedder = None
        else:
            self._embedder = None

        # Get or create collection
        try:
            self._collection = self._client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            logger.error(f"ChromaDB collection creation failed: {e}")
            self._mode = "bm25_fallback"

    # ── Build / Re-index ─────────────────────────────────────────────────────
    def build_index(self, force_rebuild: bool = False):
        """
        Index all knowledge base .txt files into ChromaDB.
        Skips if already indexed (unless force_rebuild=True).
        """
        self._init_chroma()

        if self._mode == "bm25_fallback":
            logger.info("VectorStore: running in BM25 fallback mode — no ChromaDB indexing.")
            self._ready = True
            return

        # Check if already indexed
        existing_count = self._collection.count()
        kb_files = glob.glob(os.path.join(KB_DIR, "*.txt"))

        if existing_count > 0 and not force_rebuild:
            logger.info(f"ChromaDB: {existing_count} chunks already indexed from {len(kb_files)} files. Skipping rebuild.")
            self._ready = True
            return

        if not kb_files:
            logger.warning(f"No .txt files found in {KB_DIR}")
            self._ready = True
            return

        logger.info(f"ChromaDB: Indexing {len(kb_files)} knowledge base files...")

        all_texts, all_ids, all_metadatas = [], [], []

        for fpath in kb_files:
            source = _clean_title(fpath)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception as e:
                logger.warning(f"Could not read {fpath}: {e}")
                continue

            chunks = _chunk_document(content, source)
            for chunk in chunks:
                all_texts.append(chunk["text"])
                all_ids.append(chunk["chunk_id"])
                all_metadatas.append({"source": chunk["source"], "file": os.path.basename(fpath)})

        if not all_texts:
            self._ready = True
            return

        # Clear old data if rebuilding
        if force_rebuild and existing_count > 0:
            self._client.delete_collection(COLLECTION_NAME)
            self._collection = self._client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )

        # Batch upsert (chromadb handles embeddings if no custom embedder)
        batch_size = 50
        for i in range(0, len(all_texts), batch_size):
            batch_texts = all_texts[i:i + batch_size]
            batch_ids = all_ids[i:i + batch_size]
            batch_metas = all_metadatas[i:i + batch_size]

            if self._embedder:
                embeddings = self._embedder.encode(batch_texts, normalize_embeddings=True).tolist()
                self._collection.upsert(
                    documents=batch_texts,
                    embeddings=embeddings,
                    ids=batch_ids,
                    metadatas=batch_metas,
                )
            else:
                # ChromaDB will auto-embed using its built-in model
                self._collection.upsert(
                    documents=batch_texts,
                    ids=batch_ids,
                    metadatas=batch_metas,
                )

        total = self._collection.count()
        logger.info(f"ChromaDB: Indexed {total} chunks from {len(kb_files)} files. Mode: {self._mode}")
        self._ready = True

    # ── Semantic Search ───────────────────────────────────────────────────────
    def search(self, query: str, top_k: int = 3) -> tuple[str, list[str]]:
        """
        Returns (context_string, list_of_sources) for the top_k most
        semantically relevant chunks.

        Falls back to BM25 if ChromaDB is unavailable.
        """
        if not self._ready:
            self.build_index()

        if self._mode == "bm25_fallback" or self._collection is None:
            return self._bm25_fallback(query, top_k)

        try:
            if self._embedder:
                query_embedding = self._embedder.encode([query], normalize_embeddings=True).tolist()
                results = self._collection.query(
                    query_embeddings=query_embedding,
                    n_results=min(top_k, self._collection.count()),
                    include=["documents", "metadatas", "distances"]
                )
            else:
                results = self._collection.query(
                    query_texts=[query],
                    n_results=min(top_k, self._collection.count()),
                    include=["documents", "metadatas", "distances"]
                )

            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0]

            # Filter low-relevance results (cosine distance > 0.85 = unrelated)
            context_parts = []
            sources = []
            for doc, meta, dist in zip(docs, metas, distances):
                if dist < 0.90:  # lower = more similar in cosine space
                    source = meta.get("source", "SkillForge Knowledge Base")
                    context_parts.append(f"[{source}]\n{doc}")
                    if source not in sources:
                        sources.append(source)

            if not context_parts:
                # All chunks were too dissimilar — fall back to top result anyway
                if docs:
                    source = metas[0].get("source", "SkillForge Knowledge Base")
                    context_parts.append(f"[{source}]\n{docs[0]}")
                    sources.append(source)

            context = "\n\n---\n\n".join(context_parts)
            return (context, sources)

        except Exception as e:
            logger.warning(f"ChromaDB search failed ({e}), using BM25 fallback.")
            return self._bm25_fallback(query, top_k)

    # ── BM25 Fallback ─────────────────────────────────────────────────────────
    def _bm25_fallback(self, query: str, top_k: int = 3) -> tuple[str, list[str]]:
        """
        TF-IDF / BM25 keyword search — used when ChromaDB is unavailable.
        This is the existing search logic preserved as a bulletproof fallback.
        """
        import math
        kb_files = glob.glob(os.path.join(KB_DIR, "*.txt"))
        if not kb_files:
            return ("SkillForge Knowledge Base: Comprehensive technical standards.", ["SkillForge Standard Curriculum"])

        stop_words = {"the","a","an","is","in","for","to","and","or","of","with","on","at","by","from","i","me","my","how","what","can","you","tell","do"}
        raw_q = re.findall(r'\b\w+\b', query.lower())
        q_words = [w for w in raw_q if w not in stop_words and len(w) > 1] or raw_q

        chunks_data, doc_freq, total_chunks = [], {}, 0

        for fpath in kb_files:
            source = _clean_title(fpath)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                paragraphs = [p.strip() for p in re.split(r'\n\s*\n|(?=##\s)', content) if len(p.strip()) > 35]
                for p in paragraphs:
                    total_chunks += 1
                    words_in_p = set(re.findall(r'\b\w+\b', p.lower()))
                    for qw in q_words:
                        if qw in words_in_p:
                            doc_freq[qw] = doc_freq.get(qw, 0) + 1
                    chunks_data.append({"text": p, "source": source, "words": words_in_p, "lower": p.lower()})
            except Exception:
                continue

        if not chunks_data:
            return ("SkillForge Core Engineering Curriculum.", ["SkillForge Standard Knowledge Base"])

        scored = []
        for chunk in chunks_data:
            score = 0.0
            for qw in q_words:
                if qw in chunk["words"]:
                    df = doc_freq.get(qw, 1)
                    idf = math.log((total_chunks + 1) / (df + 0.5)) + 1.0
                    tf = chunk["lower"].count(qw)
                    ts = (tf / (tf + 1.5)) * idf
                    if chunk["text"].startswith("#") and qw in chunk["text"].lower():
                        ts *= 2.0
                    score += ts
            if score > 0.1:
                scored.append((score, chunk["text"], chunk["source"]))

        scored.sort(key=lambda x: x[0], reverse=True)
        top = scored[:top_k] or [(1.0, chunks_data[0]["text"], chunks_data[0]["source"])]

        context_parts, sources = [], []
        for _, text, source in top:
            context_parts.append(f"[{source}]\n{text}")
            if source not in sources:
                sources.append(source)

        return ("\n\n---\n\n".join(context_parts), sources)

    # ── Debug / Status ────────────────────────────────────────────────────────
    def status(self) -> dict:
        """Returns current vector store status — exposed via /health endpoint."""
        count = 0
        if self._collection:
            try:
                count = self._collection.count()
            except Exception:
                pass
        return {
            "mode": self._mode,
            "ready": self._ready,
            "indexed_chunks": count,
            "embedder": "sentence-transformers/all-MiniLM-L6-v2" if self._embedder else "chromadb-default",
            "chroma_available": CHROMADB_AVAILABLE,
            "sentence_transformers_available": SENTENCE_TRANSFORMERS_AVAILABLE,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Singleton instance — shared across the whole Python service
# ─────────────────────────────────────────────────────────────────────────────
vector_store = SkillForgeVectorStore()
