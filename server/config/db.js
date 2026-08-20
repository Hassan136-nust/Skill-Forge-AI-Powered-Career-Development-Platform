import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    })
    console.log(`[MongoDB Atlas] Connected to database: ${conn.connection.host} (${conn.connection.name})`)
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Error: ${error.message}`)
    // Do not crash the server in dev mode if offline
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
