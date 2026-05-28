import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Doctor } from '@/lib/models/Doctor';
import { Patient } from '@/lib/models/Patient';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');

    let query: any = {};
    if (specialty) query.specialty = specialty;

    const doctors = await Doctor.find(query).select(
      'name specialty experience bio availableSlots profileImage'
    );

    return NextResponse.json(doctors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
