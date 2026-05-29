import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Appointment } from '@/lib/models/Appointment';
import { Notification } from '@/lib/models/Notification'; // 1. Import Notification

import { User } from '@/lib/models/User'; 
import { Doctor } from '@/lib/models/Doctor';
import { Patient } from '@/lib/models/Patient';

export async function GET(request: NextRequest) {
  // ... (Your GET method remains exactly the same as previously fixed)
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    let query: any = {};
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) query.doctor = doctorId;
    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) query.patient = patientId;
    if (status) query.status = status;
    const appointments = await Appointment.find(query)
      .populate({ path: 'doctor', model: Doctor, select: 'firstname lastname specialty' })
      .populate({ path: 'patient', model: Patient, select: 'firstname lastname email' })
      .sort({ scheduledDate: 1 });
    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // CONFLICT CHECKS — date-range query avoids timezone/ms exact-match issues.
    const aptDate  = new Date(body.scheduledDate);
    const dayStart = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
    const dayEnd   = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate() + 1);
    const timeSlot = { scheduledDate: { $gte: dayStart, $lt: dayEnd }, startTime: body.startTime, status: { $ne: 'cancelled' } };

    // 1. Doctor already has someone else at this time
    const doctorConflict = await Appointment.findOne({ doctor: body.doctor, ...timeSlot });
    if (doctorConflict) {
      return NextResponse.json(
        { error: 'This doctor is already booked at that time. Please choose a different slot.' },
        { status: 409 }
      );
    }

    // 2. Patient already has an appointment at this time (with any doctor)
    const patientConflict = await Appointment.findOne({ patient: body.patient, ...timeSlot });
    if (patientConflict) {
      return NextResponse.json(
        { error: 'You already have an appointment at this time. Please choose a different slot.' },
        { status: 409 }
      );
    }

    // 3. CREATE APPOINTMENT
    const appointment = await Appointment.create(body);
    await appointment.populate([
      { path: 'doctor', model: Doctor, select: 'firstname lastname specialty' },
      { path: 'patient', model: Patient, select: 'firstname lastname email' }
    ]);

    // 4. REAL-TIME NOTIFICATIONS: Create notification for Patient
    await Notification.create({
      user: body.patient,
      title: "Appointment Confirmed",
      message: `Your consultation with Dr. ${appointment.doctor.lastname} is scheduled for ${new Date(body.scheduledDate).toLocaleDateString()} at ${body.startTime}.`,
      type: "appointment"
    });

    // 5. REAL-TIME NOTIFICATIONS: Create notification for Doctor
    await Notification.create({
      user: body.doctor,
      title: "New Appointment Booked",
      message: `${appointment.patient.firstname} ${appointment.patient.lastname} has booked a consultation for ${new Date(body.scheduledDate).toLocaleDateString()} at ${body.startTime}.`,
      type: "appointment"
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Appointments POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}