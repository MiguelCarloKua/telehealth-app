import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Doctor } from '@/lib/models/Doctor';
import { Appointment } from '@/lib/models/Appointment';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const doctor = await Doctor.findById(params.id).select(
      'name specialty experience bio availableSlots profileImage licenseNumber'
    );

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json(doctor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
