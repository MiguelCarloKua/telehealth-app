import mongoose from 'mongoose';

const clinicalNoteSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false, // Optional — notes can be added outside a formal consultation session
      default: null,
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
    chiefComplaint: {
      type: String,
      required: true,
    },
    clinicalFindings: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    recommendations: {
      type: String,
      required: true,
    },
    followUpDate: Date,
  },
  { timestamps: true }
);

export const ClinicalNote =
  mongoose.models.ClinicalNote ||
  mongoose.model('ClinicalNote', clinicalNoteSchema);
