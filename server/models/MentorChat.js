import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sources: [{ type: String }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const MentorChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Mentorship Discussion',
    },
    careerGoal: {
      type: String,
      default: 'AI Engineer',
    },
    messages: [MessageSchema],
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('MentorChat', MentorChatSchema)
