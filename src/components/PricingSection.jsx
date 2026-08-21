import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Rocket, Zap, Building2, RotateCcw, Sparkles, Check } from 'lucide-react'
import { API_BASE } from '../config/api'
import './PricingSection.css'

export default function PricingSection({ onOpenAuth, onStartJourney }) {
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('payment') === 'success') {
      setPaymentSuccess(true)
      const plan = urlParams.get('plan') || 'Pro'
      console.log(`[Stripe Checkout]: Payment successful for ${plan} plan!`)
    }
  }, [])

  const handleCheckout = async (planId) => {
    if (planId === 'free') {
      if (onStartJourney) onStartJourney()
      else if (onOpenAuth) onOpenAuth('signup')
      return
    }

    setLoadingPlan(planId)
    setErrorMessage('')

    try {
      let userEmail = ''
      try {
        const storedUser = localStorage.getItem('skillforge_user')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          userEmail = parsed.email || ''
        }
      } catch (e) {
        console.warn('Could not parse stored user:', e)
      }

      const res = await fetch(`${API_BASE}/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userEmail,
          successUrl: `${window.location.origin}/?payment=success&plan=${planId}#pricing`,
          cancelUrl: `${window.location.origin}/#pricing`,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Payment initiation failed')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received from Stripe')
      }
    } catch (err) {
      console.error('[Stripe Checkout Error]:', err)
      setErrorMessage(err.message || 'Unable to connect to Stripe checkout. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section className="pricing-section-wrapper" id="pricing">
      <div className="pricing-inner-container">
        {/* Payment Success Alert */}
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(6, 214, 160, 0.15), rgba(255, 209, 102, 0.15))',
              border: '1px solid #06D6A0',
              borderRadius: '16px',
              padding: '1.2rem 1.8rem',
              marginBottom: '2.5rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              color: '#FFF7E8',
              boxShadow: '0 10px 30px rgba(6, 214, 160, 0.2)',
            }}
          >
            <Sparkles size={24} color="#FFD166" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#06D6A0', letterSpacing: '1px' }}>
                🎉 PAYMENT SUCCESSFUL!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#FFF7E8', opacity: 0.9 }}>
                Your account has been upgraded to <strong>PRO ENGINEER</strong>. All LangGraph &amp; ChromaDB priority features unlocked!
              </div>
            </div>
            <button
              onClick={() => setPaymentSuccess(false)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFF7E8',
                borderRadius: '8px',
                padding: '0.3rem 0.7rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                marginLeft: 'auto',
              }}
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              borderRadius: '12px',
              padding: '0.8rem 1.2rem',
              marginBottom: '2rem',
              textAlign: 'center',
              color: '#FCA5A5',
              fontSize: '0.85rem',
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

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

            <button
              className="pricing-cta-btn neutral bungee-regular"
              onClick={() => handleCheckout('free')}
            >
              <span>GET STARTED FREE</span>
              <Rocket size={15} />
            </button>
          </motion.div>

          {/* Pro Developer Tier (Featured - Stripe Integrated) */}
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

            <button
              className="pricing-cta-btn gold-fill bungee-regular"
              disabled={loadingPlan === 'pro'}
              onClick={() => handleCheckout('pro')}
            >
              {loadingPlan === 'pro' ? (
                <>
                  <RotateCcw size={15} className="scroll-arrow-bouncing" />
                  <span>REDIRECTING TO STRIPE...</span>
                </>
              ) : (
                <>
                  <span>UPGRADE TO PRO ($9)</span>
                  <Zap size={15} />
                </>
              )}
            </button>
          </motion.div>

          {/* Institution Tier (Featured - Stripe Integrated) */}
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

            <button
              className="pricing-cta-btn neutral bungee-regular"
              disabled={loadingPlan === 'campus'}
              onClick={() => handleCheckout('campus')}
            >
              {loadingPlan === 'campus' ? (
                <>
                  <RotateCcw size={15} className="scroll-arrow-bouncing" />
                  <span>REDIRECTING TO STRIPE...</span>
                </>
              ) : (
                <>
                  <span>GET CAMPUS PLAN ($49)</span>
                  <Building2 size={15} />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
