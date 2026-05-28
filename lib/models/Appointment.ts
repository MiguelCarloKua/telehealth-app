import mongoose from 'mongoose';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export enum AppointmentType {
  VIDEO = 'video',
  LIVE_CHAT = 'live_chat', // 1. Changed from in_person
}

const appointmentSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    scheduledDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.SCHEDULED },
    type: { type: String, enum: Object.values(AppointmentType), required: true },
    reason: { type: String, required: true },
    notes: String,
    joinURL: String, 
  },
  { timestamps: true }
);

export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);