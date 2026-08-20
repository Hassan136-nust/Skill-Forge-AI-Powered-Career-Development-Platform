import express from 'express'
import {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  googleAuth,
  getMe,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/verify-otp', verifyOtp)
router.post('/resend-otp', resendOtp)
router.post('/google', googleAuth)
router.get('/me', protect, getMe)

export default router
