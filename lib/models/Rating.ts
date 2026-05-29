import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Rating =
  mongoose.models.Rating || mongoose.model('Rating', ratingSchema);