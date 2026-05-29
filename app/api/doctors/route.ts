import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';

// --- CRITICAL FIX: Ensure base User schema is registered first ---
import '@/lib/models/User';
import { Doctor } from '@/lib/models/Doctor';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');

    let query: any = {};
    if (specialty) query.specialty = specialty;

    // FIX: Added blockedDates to the select statement so it reaches the frontend!
    const doctors = await Doctor.find(query).select(
      'firstname lastname specialty experience bio availableSlots blockedDates profileImage location expertiseTags'
    );

    return NextResponse.json(doctors);
  } catch (error: any) {
    console.error("Doctors GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}