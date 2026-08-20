import mongoose from 'mongoose'

const AssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scores: {
      python: { type: Number, default: 0, min: 0, max: 100 },
      webDev: { type: Number, default: 0, min: 0, max: 100 },
      git: { type: Number, default: 0, min: 0, max: 100 },
      devops: { type: Number, default: 0, min: 0, max: 100 },
      ai: { type: Number, default: 0, min: 0, max: 100 },
      databases: { type: Number, default: 0, min: 0, max: 100 },
    },
    categoryResults: [
      {
        category: String,
        correctCount: Number,
        totalCount: Number,
        score: Number,
      },
    ],
    takenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Assessment', AssessmentSchema)
