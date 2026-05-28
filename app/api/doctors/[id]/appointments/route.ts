import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Appointment } from '@/lib/models/Appointment';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const appointments = await Appointment.find({ doctor: params.id })
      .populate('patient', 'name', 'email')
      .sort({ scheduledDate: 1 });

    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
