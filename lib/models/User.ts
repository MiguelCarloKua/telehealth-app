import mongoose from 'mongoose';

export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true, 
      unique: true, // <-- Added unique constraint
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    sessionToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true, discriminatorKey: 'role' }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);