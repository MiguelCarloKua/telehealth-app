import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models/User';
import { Doctor } from '@/lib/models/Doctor';
import { Patient } from '@/lib/models/Patient';
import { Rating } from '@/lib/models/Rating';

// Suppress unused-import warnings — these side-effect imports register
// the Mongoose discriminators that populate() needs at runtime.
void User; void Doctor; void Patient;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');

    const query: any = {};
    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (appointmentId) query.appointment = appointmentId;

    const ratings = await Rating.find(query)
      .populate({ path: 'patient', model: Patient, select: 'firstname lastname profileImage' })
      .populate({ path: 'doctor', model: Doctor, select: 'firstname lastname specialty' })
      .sort({ createdAt: -1 });

    return NextResponse.json(ratings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { appointment, doctor, patient, stars, reason } = body;

    if (!appointment || !doctor || !patient || !stars || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'Stars must be between 1 and 5' }, { status: 400 });
    }

    const existing = await Rating.findOne({ appointment });
    if (existing) {
      await existing.populate([
        { path: 'patient', model: Patient, select: 'firstname lastname profileImage' },
        { path: 'doctor', model: Doctor, select: 'firstname lastname specialty' },
      ]);
      return NextResponse.json(existing, { status: 409 });
    }

    const rating = await Rating.create({ appointment, doctor, patient, stars, reason });
    await rating.populate([
      { path: 'patient', model: Patient, select: 'firstname lastname profileImage' },
      { path: 'doctor', model: Doctor, select: 'firstname lastname specialty' },
    ]);

    return NextResponse.json(rating, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}