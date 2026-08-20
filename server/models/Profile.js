import mongoose from 'mongoose'

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    university: {
      type: String,
      default: '',
    },
    degree: {
      type: String,
      default: 'BS Computer Science',
    },
    yearOfStudy: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    skills: [
      {
        name: { type: String, required: true },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
        verifiedScore: { type: Number, default: 0 },
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        techStack: [{ type: String }],
        link: { type: String, default: '' },
      },
    ],
    certifications: [{ type: String }],
    careerGoal: {
      type: String,
      enum: [
        'AI Engineer',
        'Backend Developer',
        'Frontend Developer',
        'Full-Stack Developer',
        'DevOps Engineer',
        'Data Scientist',
      ],
      default: 'AI Engineer',
    },
    currentRoadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Profile', ProfileSchema)
