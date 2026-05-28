import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Appointment } from '@/lib/models/Appointment';
import { Notification } from '@/lib/models/Notification';

// Ensure base schema is registered before Discriminators to prevent cold-start crashes
import '@/lib/models/User';
import { Doctor } from '@/lib/models/Doctor';
import { Patient } from '@/lib/models/Patient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Appointment ID' }, { status: 400 });
    }

    const appointment = await Appointment.findById(id)
      .populate({ path: 'doctor', model: Doctor, select: 'firstname lastname specialty' })
      .populate({ path: 'patient', model: Patient, select: 'firstname lastname email' });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Appointment ID' }, { status: 400 });
    }

    const body = await request.json();

    const updatedApt = await Appointment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    )
      .populate({ path: 'doctor', model: Doctor, select: 'lastname' })
      .populate({ path: 'patient', model: Patient, select: 'firstname lastname' });

    if (!updatedApt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // --- FIX: Added Rescheduled Notification Logic ---
    if (body.status === 'cancelled') {
      await Notification.create({
        user: updatedApt.patient._id,
        title: "Appointment Cancelled",
        message: `Your appointment with Dr. ${updatedApt.doctor.lastname} on ${new Date(updatedApt.scheduledDate).toLocaleDateString()} was cancelled.`,
        type: "appointment"
      });

      await Notification.create({
        user: updatedApt.doctor._id,
        title: "Appointment Cancelled",
        message: `${updatedApt.patient.firstname} cancelled their appointment on ${new Date(updatedApt.scheduledDate).toLocaleDateString()}.`,
        type: "appointment"
      });
    } else if (body.status === 'rescheduled') {
      // Notify the patient that the doctor changed the time
      await Notification.create({
        user: updatedApt.patient._id,
        title: "Appointment Rescheduled",
        message: `Dr. ${updatedApt.doctor.lastname} has rescheduled your appointment to ${new Date(updatedApt.scheduledDate).toLocaleDateString()} at ${body.startTime}.`,
        type: "appointment"
      });
    }

    return NextResponse.json(updatedApt);
  } catch (error: any) {
    console.error("Appointment PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Appointment ID' }, { status: 400 });
    }

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Appointment deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}