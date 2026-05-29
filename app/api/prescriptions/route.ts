import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Prescription } from '@/lib/models/Prescription';

// Doctor and Patient are Mongoose discriminators of User.
// Importing them ensures the discriminator models are registered before
// .populate() attempts to look them up by name ('Doctor', 'Patient').
import '@/lib/models/User';
import { Doctor } from '@/lib/models/Doctor';
import { Patient } from '@/lib/models/Patient';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    let query: any = {};

    if (patientId) {
      // Guard against non-ObjectId strings (e.g. placeholder values from UI)
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return NextResponse.json([], { status: 200 });
      }
      query.patient = patientId;
    }

    if (status) query.status = status;

    // Use the explicit { path, model, select } form for discriminator models.
    // Passing `model` directly avoids ambiguity when Mongoose resolves the ref
    // name against its internal model registry at runtime.
    const prescriptions = await Prescription.find(query)
      .populate({ path: 'doctor', model: Doctor, select: 'firstname lastname specialty profileImage' })
      .populate({ path: 'patient', model: Patient, select: 'firstname lastname email profileImage' })
      .sort({ createdAt: -1 });

    return NextResponse.json(prescriptions);
  } catch (error: any) {
    console.error('Prescriptions GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const prescription = await Prescription.create(body);

    await prescription.populate([
      { path: 'doctor', model: Doctor, select: 'firstname lastname specialty' },
      { path: 'patient', model: Patient, select: 'firstname lastname email' },
    ]);

    return NextResponse.json(prescription, { status: 201 });
  } catch (error: any) {
    console.error('Prescriptions POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
