import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose'; // 1. Added mongoose import
import connectDB from '@/lib/db';
import { Prescription } from '@/lib/models/Prescription';

// 2. Ensure related models are registered for .populate() to work
import '@/lib/models/User'; 
import '@/lib/models/Doctor';
import '@/lib/models/Patient';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    let query: any = {};
    
    if (patientId) {
      // 3. THE FIX: Check if it's a valid MongoDB ID before querying
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        // If the frontend sends 'sample-patient-id', gracefully return an empty array
        return NextResponse.json([], { status: 200 }); 
      }
      query.patient = patientId;
    }
    
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('doctor', 'name specialty')
      .populate('patient', 'name email')
      .sort({ issuedDate: -1 });

    return NextResponse.json(prescriptions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const prescription = await Prescription.create(body);
    
    // 4. Safer population for POST returns
    await prescription.populate([
      { path: 'doctor', select: 'name specialty' },
      { path: 'patient', select: 'name email' }
    ]);

    return NextResponse.json(prescription, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}