import Profile from '../models/Profile.js'
import User from '../models/User.js'

// @desc    Get profile by user ID or email
// @route   GET /api/profile/:userId
// @access  Public
export const getProfileByUserId = async (req, res) => {
  try {
    let profile = null
    const param = decodeURIComponent(req.params.userId || '').trim()

    if (param.includes('@')) {
      const user = await User.findOne({ email: param.toLowerCase() })
      if (user) {
        profile = await Profile.findOne({ userId: user._id }).populate('userId', 'name email role avatar')
      }
    } else {
      profile = await Profile.findOne({ userId: param }).populate('userId', 'name email role avatar').catch(() => null)
      if (!profile) {
        const user = await User.findById(param).catch(() => null)
        if (user) {
          profile = await Profile.findOne({ userId: user._id }).populate('userId', 'name email role avatar')
        }
      }
      if (!profile) {
        profile = await Profile.findById(param).populate('userId', 'name email role avatar').catch(() => null)
      }
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' })
    }

    res.status(200).json({ success: true, profile })
  } catch (error) {
    console.error('[Get Profile Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create or update full student profile (including GitHub projects & skills)
// @route   POST /api/profile
// @access  Public / Authenticated
export const saveProfile = async (req, res) => {
  try {
    const {
      userId,
      email,
      university,
      degree,
      yearOfStudy,
      experienceLevel,
      skills,
      projects,
      certifications,
      careerGoal,
      completedTasks,
    } = req.body

    let targetUserId = req.user?._id || userId

    // Resolve by email if userId not explicitly provided
    if (!targetUserId && email) {
      const user = await User.findOne({ email: email.toLowerCase().trim() })
      if (user) {
        targetUserId = user._id
      }
    }

    if (!targetUserId) {
      // Create a student user record if one doesn't exist yet
      const fallbackEmail = email || `student_${Date.now()}@skillforge.io`
      let user = await User.findOne({ email: fallbackEmail })
      if (!user) {
        user = await User.create({
          name: 'Scholar Student',
          email: fallbackEmail,
          password: 'temp_password_' + Date.now(),
          role: 'student',
          avatar: 'https://imgs.search.brave.com/en8GueUwEke4A7ecDjpRnIpFR8Y-WWOEbjzD2xCNTu0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWd2/My5mb3Rvci5jb20v/aW1hZ2VzL2hvbWVw/YWdlLWZlYXR1cmUt/Y2FyZC9mb3Rvci0z/ZC1hdmF0YXIuanBn',
          isVerified: true,
        })
      }
      targetUserId = user._id
    }

    let profile = await Profile.findOne({ userId: targetUserId })

    if (profile) {
      if (university !== undefined) profile.university = university
      if (degree !== undefined) profile.degree = degree
      if (yearOfStudy !== undefined) profile.yearOfStudy = yearOfStudy
      if (experienceLevel !== undefined) profile.experienceLevel = experienceLevel
      if (skills !== undefined) profile.skills = skills
      if (projects !== undefined) profile.projects = projects
      if (certifications !== undefined) profile.certifications = certifications
      if (careerGoal !== undefined) profile.careerGoal = careerGoal
      if (completedTasks !== undefined) profile.completedTasks = completedTasks

      await profile.save()
    } else {
      profile = await Profile.create({
        userId: targetUserId,
        university: university || 'NUST',
        degree: degree || 'BS Computer Science',
        yearOfStudy: yearOfStudy || 3,
        experienceLevel: experienceLevel || 'intermediate',
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || [],
        careerGoal: careerGoal || 'AI Engineer',
        completedTasks: completedTasks || [],
      })
    }

    // Update user profile status if available
    await User.findByIdAndUpdate(targetUserId, {
      profileCompleted: true,
      targetRole: careerGoal || 'AI Engineer',
    }).catch(() => {})

    res.status(200).json({
      success: true,
      message: 'Student registration & profile saved successfully in MongoDB Atlas!',
      profile,
    })
  } catch (error) {
    console.error('[Save Profile Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Add custom skill
// @route   POST /api/profile/skills
// @access  Public / Authenticated
export const addSkill = async (req, res) => {
  try {
    const { skillName, level, userId, email } = req.body
    let targetUserId = req.user?.id || userId

    if (!targetUserId && email) {
      const user = await User.findOne({ email: email.toLowerCase().trim() })
      if (user) targetUserId = user._id
    }

    const profile = await Profile.findOne({ userId: targetUserId })
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' })

    const exists = profile.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())
    if (!exists) {
      profile.skills.push({ name: skillName, level: level || 'intermediate' })
      await profile.save()
    }

    res.status(200).json({ success: true, skills: profile.skills })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
