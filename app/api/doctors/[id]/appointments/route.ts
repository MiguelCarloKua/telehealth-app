import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Appointment } from '@/lib/models/Appointment';
import '@/lib/models/User';
import '@/lib/models/Patient'; // Important for population

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // FIX: Next.js 15 Promise params
) {
  try {
    await connectDB();
    const { id } = await params;

    const appointments = await Appointment.find({ doctor: id })
      // FIX: Correct Mongoose populate syntax and updated 'name' to 'firstname lastname'
      .populate('patient', 'firstname lastname email') 
      .sort({ scheduledDate: 1 });

    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}