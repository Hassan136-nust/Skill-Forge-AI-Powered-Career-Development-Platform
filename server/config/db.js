import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    })
    console.log(`[MongoDB Atlas] Connected to database: ${conn.connection.host} (${conn.connection.name})`)
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Warning: ${error.message}`)
    console.log('[MongoDB Atlas] Retrying connection in 5 seconds...')
    setTimeout(connectDB, 5000)
  }
}
