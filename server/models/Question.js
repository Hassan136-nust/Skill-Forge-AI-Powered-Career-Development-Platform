import mongoose from 'mongoose'

const QuestionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Please provide question category (e.g., python, webDev, git, devops, ai, databases)'],
      enum: ['python', 'webDev', 'git', 'devops', 'ai', 'databases', 'algorithms', 'general'],
      default: 'python',
    },
    question: {
      type: String,
      required: [true, 'Please provide the question prompt'],
      trim: true,
    },
    code: {
      type: String,
      default: '',
    },
    options: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length >= 2 && val.length <= 6,
        'Question must have between 2 and 6 options',
      ],
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'intermediate', 'hard'],
      default: 'intermediate',
    },
    explanation: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Question', QuestionSchema)
