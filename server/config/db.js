import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Profile from '../models/Profile.js'

dotenv.config()

const seedAdminUser = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'hjamal.bscs24seecs@seecs.edu.pk').toLowerCase().trim()
    const adminPassword = process.env.ADMIN_PASSWORD || 'Password123'
    
    let adminUser = await User.findOne({ email: adminEmail }).select('+password')
    
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Hassan Jamal (Lead Admin)',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      })
      
      await Profile.create({
        userId: adminUser._id,
        careerGoal: 'AI Engineer & System Architect',
        university: 'NUST SEECS',
      })
      console.log(`[Admin Seed] ✨ Created new admin user: ${adminEmail} (Role: admin)`)
    } else {
      // Ensure role is admin, isVerified is true, and password is up to date
      adminUser.role = 'admin'
      adminUser.isVerified = true
      adminUser.name = adminUser.name || 'Hassan Jamal (Lead Admin)'
      adminUser.password = adminPassword
      await adminUser.save()
      console.log(`[Admin Seed] 🔒 Verified existing admin user: ${adminEmail} (Role: admin)`)
    }
  } catch (err) {
    console.warn(`[Admin Seed Warning]: ${err.message}`)
  }
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    })
    console.log(`[MongoDB Atlas] Connected to database: ${conn.connection.host} (${conn.connection.name})`)
    await seedAdminUser()
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Warning: ${error.message}`)
    console.log('[MongoDB Atlas] Retrying connection in 5 seconds...')
    setTimeout(connectDB, 5000)
  }
}
