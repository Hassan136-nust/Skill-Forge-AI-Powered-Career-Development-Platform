import './ScrollOverlays.css'

export default function ScrollOverlays({ progress }) {
  // Determine which sector / scene is active along the scroll scrub
  const isSector2 = progress >= 0.18 && progress < 0.42
  const isSector3 = progress >= 0.42 && progress < 0.65
  const isSector4 = progress >= 0.65 && progress < 0.85
  const isSector5 = progress >= 0.85 && progress < 0.96

  return (
    <>
      {/* SECTOR 2: Skill Gap Diagnostics — LEFT ALIGNED */}
      <div className={`cinematic-overlay-layer align-left ${isSector2 ? 'active' : 'hidden'}`}>
        <div className="hud-sector-tag">
          <span className="hud-pulse-dot" />
          <span>SECTOR 02 // SKILL GAP RADAR</span>
        </div>
        <h2 className="cinematic-title bungee-regular">
          DIAGNOSE <span className="highlight-orange">THE UNKNOWN.</span>
        </h2>
        <p className="cinematic-subtext">
          Precision benchmarking across Python OOP, Machine Learning, DevOps, and Distributed Databases.
        </p>
        <div className="telemetry-row">
          <div className="telemetry-item">STATUS: <span className="val">ANALYZER ONLINE</span></div>
          <div className="telemetry-item">ROLE BENCHMARKS: <span className="val">AI / BACKEND / DEVOPS</span></div>
          <div className="telemetry-item">ACCURACY: <span className="val">99.4%</span></div>
        </div>
      </div>

      {/* SECTOR 3: AI Trajectory Matrix — RIGHT ALIGNED */}
      <div className={`cinematic-overlay-layer align-right ${isSector3 ? 'active' : 'hidden'}`}>
        <div className="hud-sector-tag">
          <span className="hud-pulse-dot" />
          <span>SECTOR 03 // TRAJECTORY MATRIX</span>
        </div>
        <h2 className="cinematic-title bungee-regular">
          FORGE YOUR <span className="highlight-cyan">DESTINY.</span>
        </h2>
        <p className="cinematic-subtext">
          Generative AI roadmaps translating missing skills into step-by-step capstone projects and production milestones.
        </p>
        <div className="telemetry-row">
          <div className="telemetry-item">ROADMAP ENGINE: <span className="val">GENAI GROUNDED</span></div>
          <div className="telemetry-item">TIMELINE: <span className="val">12 WEEKS TO MASTERY</span></div>
          <div className="telemetry-item">CAPSTONE: <span className="val">STATEFUL RAG AGENT</span></div>
        </div>
      </div>

      {/* SECTOR 4: LangGraph Multi-Agent Engine — LEFT ALIGNED */}
      <div className={`cinematic-overlay-layer align-left ${isSector4 ? 'active' : 'hidden'}`}>
        <div className="hud-sector-tag">
          <span className="hud-pulse-dot" />
          <span>SECTOR 04 // AUTONOMOUS AGENTS</span>
        </div>
        <h2 className="cinematic-title bungee-regular">
          INTELLIGENCE <span className="highlight-magenta">IN MOTION.</span>
        </h2>
        <p className="cinematic-subtext">
          Stateful LangGraph ReAct agents querying ChromaDB vector stores to guide students with live contextual assistance.
        </p>
        <div className="telemetry-row">
          <div className="telemetry-item">AGENT LOOP: <span className="val">THINK → ACT → OBSERVE</span></div>
          <div className="telemetry-item">VECTOR DB: <span className="val">CHROMADB LOCAL</span></div>
          <div className="telemetry-item">TOOLS: <span className="val">4 CONNECTED MICROSERVICES</span></div>
        </div>
      </div>

      {/* SECTOR 5: Global SDG Impact — RIGHT ALIGNED */}
      <div className={`cinematic-overlay-layer align-right ${isSector5 ? 'active' : 'hidden'}`}>
        <div className="hud-sector-tag">
          <span className="hud-pulse-dot" />
          <span>SECTOR 05 // GLOBAL IMPACT</span>
        </div>
        <h2 className="cinematic-title bungee-regular">
          QUALITY EDUCATION <span className="highlight-orange">FOR ALL.</span>
        </h2>
        <p className="cinematic-subtext">
          Democratizing free, high-caliber career navigation aligned with United Nations SDGs 4, 8, 9 &amp; 10.
        </p>
        <div className="telemetry-row">
          <div className="telemetry-item">SDG 4 &amp; 8: <span className="val">EQUAL ACCESS</span></div>
          <div className="telemetry-item">DEPLOYMENT: <span className="val">DOCKER &amp; KUBERNETES READY</span></div>
          <div className="telemetry-item">IMPACT: <span className="val">12K+ CS LEARNERS</span></div>
        </div>
      </div>
    </>
  )
}
