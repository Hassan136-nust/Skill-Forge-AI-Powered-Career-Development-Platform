import Profile from '../models/Profile.js'
import User from '../models/User.js'

// @desc    Get profile by user ID
// @route   GET /api/profile/:userId
// @access  Public / Private
export const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).populate('userId', 'name email role avatar')

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
// @access  Private / Authenticated
export const saveProfile = async (req, res) => {
  try {
    const {
      userId,
      university,
      degree,
      yearOfStudy,
      experienceLevel,
      skills,
      projects,
      certifications,
      careerGoal,
    } = req.body

    const targetUserId = req.user?._id || userId

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'User ID is required' })
    }

    let profile = await Profile.findOne({ userId: targetUserId })

    if (profile) {
      profile.university = university ?? profile.university
      profile.degree = degree ?? profile.degree
      profile.yearOfStudy = yearOfStudy ?? profile.yearOfStudy
      profile.experienceLevel = experienceLevel ?? profile.experienceLevel
      if (skills) profile.skills = skills
      if (projects) profile.projects = projects
      if (certifications) profile.certifications = certifications
      if (careerGoal) profile.careerGoal = careerGoal

      await profile.save()
    } else {
      profile = await Profile.create({
        userId: targetUserId,
        university: university || '',
        degree: degree || 'BS Computer Science',
        yearOfStudy: yearOfStudy || 3,
        experienceLevel: experienceLevel || 'intermediate',
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || [],
        careerGoal: careerGoal || 'AI Engineer',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully in MongoDB Atlas',
      profile,
    })
  } catch (error) {
    console.error('[Save Profile Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Add custom skill
// @route   POST /api/profile/skills
// @access  Private
export const addSkill = async (req, res) => {
  try {
    const { skillName, level } = req.body
    const userId = req.user?.id || req.body.userId

    const profile = await Profile.findOne({ userId })
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
