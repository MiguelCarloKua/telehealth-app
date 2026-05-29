import mongoose from 'mongoose';

const consultationMessageSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['doctor', 'patient'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create index for efficient queries
consultationMessageSchema.index({ appointment: 1, createdAt: 1 });

export const ConsultationMessage =
  mongoose.models.ConsultationMessage ||
  mongoose.model('ConsultationMessage', consultationMessageSchema);
