import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import assessmentRoutes from './routes/assessmentRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import mentorRoutes from './routes/mentorRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

dotenv.config()

// Connect to MongoDB Atlas
connectDB()

const app = express()

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
)
app.use(express.json())

// Health check endpoints for UptimeRobot & Cloud Observability
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SkillForge Express Backend Gateway',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  })
})

app.head(['/', '/health', '/api/health'], (req, res) => {
  res.status(200).end()
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/assessment', assessmentRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/mentor', mentorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payment', paymentRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`[SkillForge Auth & API Server] Running on http://localhost:${PORT}`)
})
