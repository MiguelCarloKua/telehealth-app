import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Appointment } from '@/lib/models/Appointment';
import { Doctor } from '@/lib/models/Doctor';
import { Patient } from '@/lib/models/Patient';
import { Notification } from '@/lib/models/Notification';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    await connectDB();

    const { appointmentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'doctor',
        model: Doctor,
        select: 'firstname lastname specialty profileImage',
      })
      .populate({
        path: 'patient',
        model: Patient,
        select: 'firstname lastname email profileImage',
      });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    await connectDB();

    const { appointmentId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    // Allow status updates for consultation
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    )
      .populate({
        path: 'doctor',
        model: Doctor,
        select: 'firstname lastname specialty profileImage',
      })
      .populate({
        path: 'patient',
        model: Patient,
        select: 'firstname lastname email profileImage',
      });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const patientId = (appointment.patient as any)?._id ?? appointment.patient;
    const doctorName = appointment.doctor
      ? `Dr. ${(appointment.doctor as any).lastname ?? 'Your Doctor'}`
      : 'Your doctor';

    if (status === 'in_progress' && patientId) {
      // Alert the patient that the session has started
      await Notification.create({
        user: patientId,
        title: '🔴 Consultation is Live',
        message: `${doctorName} has started your consultation session. Join now!`,
        type: 'appointment',
      });
    }

    if (status === 'completed' && patientId) {
      // Tell the patient their records are now available
      await Notification.create({
        user: patientId,
        title: '✅ Consultation Complete',
        message: `Your session with ${doctorName} has ended. Your records and any prescriptions are now available in Medical Records.`,
        type: 'appointment',
      });
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
