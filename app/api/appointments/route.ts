import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Appointment } from '@/lib/models/Appointment';

// Ensure models are registered for population
import '@/lib/models/User'; 
import '@/lib/models/Doctor';
import '@/lib/models/Patient';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    let query: any = {};

    // SAFETY CHECK: Only query if the doctorId is a valid 24-character hex string
    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return NextResponse.json([], { status: 200 }); // Return empty array if invalid
      }
      query.doctor = doctorId;
    }

    // SAFETY CHECK: Only query if the patientId is a valid 24-character hex string
    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return NextResponse.json([], { status: 200 }); // Return empty array if invalid
      }
      query.patient = patientId;
    }

    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialty')
      .populate('patient', 'name email')
      .sort({ scheduledDate: 1 });

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error("Appointments GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const appointment = await Appointment.create(body);
    
    // Populate the newly created appointment before returning it to the frontend
    await appointment.populate([
      { path: 'doctor', select: 'name specialty' },
      { path: 'patient', select: 'name email' }
    ]);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Appointments POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}