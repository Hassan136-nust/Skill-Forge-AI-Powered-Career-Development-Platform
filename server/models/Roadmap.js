import mongoose from 'mongoose'

const RoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    careerGoal: {
      type: String,
      required: true,
      default: 'AI Engineer',
    },
    gaps: [
      {
        skill: String,
        currentScore: Number,
        requiredScore: Number,
      },
    ],
    generatedRoadmapText: {
      type: String,
      required: true,
    },
    milestones: [mongoose.Schema.Types.Mixed],
    model: {
      type: String,
      default: 'openai/gpt-oss-120b (Groq Cloud)',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema)
