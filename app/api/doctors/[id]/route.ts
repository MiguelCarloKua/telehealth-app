import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import '@/lib/models/User'; // Ensure base schema is registered
import { Doctor } from '@/lib/models/Doctor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // FIX: Next.js 15 Promise params
) {
  try {
    await connectDB();
    const { id } = await params;

    // FIX: Replaced 'name' with 'firstname lastname' and added 'blockedDates'
    const doctor = await Doctor.findById(id).select(
      'firstname lastname specialty experience bio availableSlots blockedDates profileImage licenseNumber'
    );

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json(doctor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}