import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ClinicalNote } from '@/lib/models/ClinicalNote';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');

    let query: any = {};
    if (patientId) query.patient = patientId;
    if (appointmentId) query.appointment = appointmentId;

    const notes = await ClinicalNote.find(query)
      .populate('doctor', 'name specialty')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const clinicalNote = await ClinicalNote.create(body);
    await clinicalNote.populate('doctor patient');

    return NextResponse.json(clinicalNote, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
