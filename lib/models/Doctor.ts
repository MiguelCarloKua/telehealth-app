import mongoose from 'mongoose';
import { User } from './User';

const doctorSchema = new mongoose.Schema(
  {
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    expertiseTags: [
      {
        type: String, // e.g., ["headache", "migraine", "fever", "pediatrics"] for AI matching
      }
    ],
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    bio: {
      type: String,
      default: '',
    },
    availableSlots: [
      {
        dayOfWeek: String, // "Monday", "Tuesday", etc.
        startTime: String, // "09:00"
        endTime: String, // "17:00"
      },
    ],
    blockedDates: [
      {
        type: String, // Specific dates the doctor is unavailable (holidays, leaves)
      }
    ],
    location: {
      barangay: { type: String, default: '' },
      city: { type: String, default: 'Caloocan' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
      },
    ],
  },
  { timestamps: true }
);

export const Doctor =
  mongoose.models.Doctor || User.discriminators?.doctor || User.discriminator('doctor', doctorSchema);