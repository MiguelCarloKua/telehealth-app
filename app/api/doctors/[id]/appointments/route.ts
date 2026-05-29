import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Appointment } from '@/lib/models/Appointment';

// Register core sub-models to keep discriminator lookups intact
import '@/lib/models/User';
import '@/lib/models/Patient'; 

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Next.js 15 requires dynamic route parameter types to be typed as Promises
) {
  try {
    await connectDB();
    const { id } = await params;

    // Guard against server runtime crash crashes when un-hashable text strings are parsed into find queries
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Doctor identification structure' }, { status: 400 });
    }

    const appointments = await Appointment.find({ doctor: id })
      .populate('patient', 'firstname lastname email profileImage medicalHistory') 
      .sort({ scheduledDate: 1 });

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error("Doctor Appointments Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}