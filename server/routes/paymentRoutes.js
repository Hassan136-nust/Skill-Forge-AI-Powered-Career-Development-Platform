import express from 'express'
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Initialize Stripe client from environment variables
const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
const stripe = stripeSecret ? new Stripe(stripeSecret) : null

// Plan definitions
const PLANS = {
  pro: {
    name: 'SkillForge Pro Engineer Plan',
    description: 'Autonomous LangGraph Agent, GitHub Verification & Priority ChromaDB RAG',
    amount: 900, // $9.00 in cents
    currency: 'usd',
    interval: 'month',
  },
  campus: {
    name: 'SkillForge Campus Cohort Plan',
    description: 'Faculty Intelligence Dashboard, Batch-Wide Skill Matrix & LMS Integrations',
    amount: 4900, // $49.00 in cents
    currency: 'usd',
    interval: 'month',
  },
}

// @route   POST /api/payment/create-checkout-session
// @desc    Create a Stripe Checkout Hosted Session
// @access  Public / Protected
router.post('/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe secret key is not configured in server environment',
      })
    }

    const { planId, userEmail, successUrl, cancelUrl } = req.body

    const selectedPlan = PLANS[planId] || PLANS.pro
    const clientOrigin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: selectedPlan.currency,
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
              images: ['https://skillforge-app.vercel.app/favicon.svg'],
            },
            unit_amount: selectedPlan.amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${clientOrigin}/?payment=success&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${clientOrigin}/#pricing`,
      metadata: {
        planId,
        userEmail: userEmail || 'guest@scholar.com',
        platform: 'SkillForge Career Acceleration Platform',
      },
    })

    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('[Stripe Checkout Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize Stripe checkout session',
    })
  }
})

// @route   GET /api/payment/config
// @desc    Get Stripe Publishable Key
// @access  Public
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  })
})

export default router
