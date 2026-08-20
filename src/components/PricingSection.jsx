import { motion } from 'framer-motion'
import { CheckCircle2, Rocket, Zap, Building2, ChevronRight } from 'lucide-react'
import './PricingSection.css'

export default function PricingSection() {
  return (
    <section className="pricing-section-wrapper" id="pricing">
      <div className="pricing-inner-container">
        {/* Header */}
        <motion.div
          className="pricing-header-block"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="terminal-tag-row press-start-2p-regular" style={{ justifyContent: 'center' }}>
            <span className="terminal-tag-dot" />
            <span>04 // ACCESS &amp; ACCESSIBILITY TIERS</span>
          </div>

          <h2 className="terminal-heading-main">
            TRANSPARENT <span className="terminal-heading-gold">STUDENT PRICING</span>
          </h2>
          <p className="terminal-desc-lead" style={{ margin: '0 auto' }}>
            Democratizing high-caliber AI career intelligence for every aspiring software engineer,
            directly eliminating paywall disparities in accordance with UN SDG 10.
          </p>
        </motion.div>

        {/* 3 Refined Tier Cards */}
        <div className="pricing-grid-layout">
          {/* Free Student Scholar */}
          <motion.div
            className="pricing-card-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div>
              <div className="pricing-card-top-head">
                <div className="pricing-tier-name">STUDENT SCHOLAR</div>
                <p className="pricing-tier-desc">
                  100% Free career guidance for any student or self-taught developer worldwide.
                </p>
              </div>

              <div className="pricing-cost-row">
                <span className="pricing-amount">$0</span>
                <span className="pricing-interval press-start-2p-regular">/ FOREVER FREE</span>
              </div>

              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Unlimited Skill Gap Diagnostic Quizzes</span>
                </li>
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Personalized GenAI Learning Roadmaps</span>
                </li>
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>ChromaDB Vector Study Assistant</span>
                </li>
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Portfolio Project Recommendations</span>
                </li>
              </ul>
            </div>

            <button className="pricing-cta-btn neutral bungee-regular">
              <span>GET STARTED FREE</span>
              <Rocket size={15} />
            </button>
          </motion.div>

          {/* Pro Developer Tier (Featured) */}
          <motion.div
            className="pricing-card-box featured"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="pricing-badge-popular press-start-2p-regular">
              MOST POPULAR
            </div>

            <div>
              <div className="pricing-card-top-head">
                <div className="pricing-tier-name" style={{ color: '#FFD166' }}>PRO ENGINEER</div>
                <p className="pricing-tier-desc">
                  For ambitious developers preparing for competitive high-scale technical hiring.
                </p>
              </div>

              <div className="pricing-cost-row">
                <span className="pricing-amount">$9</span>
                <span className="pricing-interval press-start-2p-regular">/ MONTH</span>
              </div>

              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Everything in Student Tier</span>
                </li>
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>LangGraph Autonomous ReAct Agent API</span>
                </li>
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Automated GitHub Repo Skill Verification</span>
                </li>
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Priority RAG Knowledge Base Search</span>
                </li>
              </ul>
            </div>

            <button className="pricing-cta-btn gold-fill bungee-regular">
              <span>UPGRADE TO PRO</span>
              <Zap size={15} />
            </button>
          </motion.div>

          {/* Institution Tier */}
          <motion.div
            className="pricing-card-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div>
              <div className="pricing-card-top-head">
                <div className="pricing-tier-name">CAMPUS COHORT</div>
                <p className="pricing-tier-desc">
                  For universities, bootcamps, and CS departments tracking batch skill growth.
                </p>
              </div>

              <div className="pricing-cost-row">
                <span className="pricing-amount">$49</span>
                <span className="pricing-interval press-start-2p-regular">/ BATCH / MO</span>
              </div>

              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Dedicated Mentor &amp; Faculty Dashboard</span>
                </li>
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Batch-Wide Skill Gap Matrix &amp; Analytics</span>
                </li>
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Moodle &amp; Blackboard LMS Sync</span>
                </li>
                <li className="pricing-feature-item">
                  <span className="feature-check-wrapper"><CheckCircle2 size={16} color="#FFD166" /></span>
                  <span>Custom Assessment Question Banks</span>
                </li>
              </ul>
            </div>

            <button className="pricing-cta-btn neutral bungee-regular">
              <span>CONTACT INSTITUTION</span>
              <Building2 size={15} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
