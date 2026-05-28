import mongoose from 'mongoose';
import { User } from './User';
import './Doctor';

const patientSchema = new mongoose.Schema(
  {
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    bloodType: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      default: null,
    },
    height: Number, // in cm
    weight: Number, // in kg
    allergies: [String],
    medicalHistory: [String],
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    ],
  },
  { timestamps: true }
);

export const Patient =
  mongoose.models.Patient || User.discriminators?.patient || User.discriminator('patient', patientSchema);
