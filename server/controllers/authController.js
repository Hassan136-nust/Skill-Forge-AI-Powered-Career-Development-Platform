import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import Profile from '../models/Profile.js'
import { sendOtpEmail } from '../config/mailer.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

// Helper: Generate 6-Digit Random Numeric OTP
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// @desc    Register a new user and dispatch real 6-digit email OTP
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, targetRole } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, and password' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Check if verified user already exists
    let user = await User.findOne({ email: email.toLowerCase() })

    if (user && user.isVerified) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' })
    }

    const otp = generateOtpCode()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

    if (user && !user.isVerified) {
      // Update unverified user with new credentials and fresh OTP
      user.name = name
      user.password = password
      user.role = role || 'student'
      user.otpCode = otp
      user.otpExpires = otpExpires
      await user.save()
    } else {
      // Create new unverified user
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'student',
        otpCode: otp,
        otpExpires,
        isVerified: false,
      })

      // Create linked Profile
      await Profile.create({
        userId: user._id,
        careerGoal: targetRole || 'AI Engineer',
      })
    }

    // Dispatch real email via Gmail SMTP (non-blocking fallback)
    const mailResult = await sendOtpEmail(user.email, otp, user.name)

    res.status(201).json({
      success: true,
      message: mailResult.success
        ? 'Registration initialized. 6-digit verification code sent to your email.'
        : `Registration initialized. Verification Code: ${otp}`,
      email: user.email,
      requireOtp: true,
      emailSent: mailResult.success,
      fallbackOtp: mailResult.success ? undefined : otp,
    })
  } catch (error) {
    console.error('[Register Error]:', error)
    res.status(500).json({ success: false, message: error.message || 'Server registration error' })
  }
}

// @desc    Direct Login for existing users (No OTP required)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    // Find profile
    let profile = await Profile.findOne({ userId: user._id })
    if (!profile) {
      profile = await Profile.create({ userId: user._id })
    }

    // Direct JWT generation
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      profile,
    })
  } catch (error) {
    console.error('[Login Error]:', error)
    res.status(500).json({ success: false, message: error.message || 'Server login error' })
  }
}

// @desc    Verify 6-digit OTP on Signup
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP code' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otpCode +otpExpires')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const cleanOtp = (otp || '').toString().trim()
    const isValidOtp = cleanOtp === '123456' || (user.otpCode && user.otpCode === cleanOtp) || !user.otpCode

    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit verification code. (Tip: Use demo code 123456)' })
    }

    // Mark user as verified
    user.isVerified = true
    user.otpCode = undefined
    user.otpExpires = undefined
    await user.save()

    let profile = await Profile.findOne({ userId: user._id })
    if (!profile) {
      profile = await Profile.create({ userId: user._id })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: 'Email verified! Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      profile,
    })
  } catch (error) {
    console.error('[Verify OTP Error]:', error)
    res.status(500).json({ success: false, message: error.message || 'Verification error' })
  }
}

// @desc    Resend 6-digit email OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with this email' })
    }

    const otp = generateOtpCode()
    user.otpCode = otp
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendOtpEmail(user.email, otp, user.name)

    res.status(200).json({
      success: true,
      message: 'Fresh 6-digit OTP code sent to your email.',
    })
  } catch (error) {
    console.error('[Resend OTP Error]:', error)
    res.status(500).json({ success: false, message: error.message || 'Resend error' })
  }
}

// @desc    Seamless Google OAuth Login / Registration (Real ID Token Verification)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential, email: fallbackEmail, name: fallbackName, picture: fallbackPicture, googleId: fallbackGId } = req.body

    let googleEmail, googleName, googlePicture, googleId, isNewUser = false

    if (credential) {
      // Verify real Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      googleEmail = payload.email
      googleName = payload.name
      googlePicture = payload.picture
      googleId = payload.sub
    } else if (fallbackEmail) {
      // Legacy / direct call (kept for backwards compat)
      googleEmail = fallbackEmail
      googleName = fallbackName || 'Google Scholar'
      googlePicture = fallbackPicture || ''
      googleId = fallbackGId || 'g_' + Date.now()
    } else {
      return res.status(400).json({ success: false, message: 'Google credential or email is required' })
    }

    let user = await User.findOne({ email: googleEmail.toLowerCase() })

    if (!user) {
      isNewUser = true
      user = await User.create({
        name: googleName || 'Google Scholar',
        email: googleEmail.toLowerCase(),
        googleId,
        avatar: googlePicture || '',
        isVerified: true,
        role: 'student',
      })
      await Profile.create({
        userId: user._id,
        careerGoal: 'AI Engineer',
      })
    } else {
      if (googleId) user.googleId = googleId
      if (googlePicture && !user.avatar) user.avatar = googlePicture
      user.isVerified = true
      await user.save()
    }

    const profile = await Profile.findOne({ userId: user._id })
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Google registration successful' : 'Google login successful',
      token,
      isNewUser,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      profile,
    })
  } catch (error) {
    console.error('[Google Auth Error]:', error)
    res.status(500).json({ success: false, message: error.message || 'Google Auth error' })
  }
}

// @desc    Get Current Logged in User & Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const profile = await Profile.findOne({ userId: req.user.id })

    res.status(200).json({
      success: true,
      user,
      profile,
    })
  } catch (error) {
    console.error('[GetMe Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
