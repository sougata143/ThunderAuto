import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
})

// Create compound index for efficient queries
reviewSchema.index({ car: 1, user: 1 }, { unique: true })

export const Review = mongoose.model('Review', reviewSchema)
