import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { ConsultationMessage } from '@/lib/models/ConsultationMessage';
import { Appointment } from '@/lib/models/Appointment';
import { User } from '@/lib/models/User';
import { Doctor } from '@/lib/models/Doctor';
import { Patient } from '@/lib/models/Patient';

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

    const messages = await ConsultationMessage.find({ appointment: appointmentId })
      .populate('sender', 'firstname lastname profileImage')
      .sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    await connectDB();

    const { appointmentId } = await params;
    const body = await request.json();
    const { message, senderId, senderRole } = body;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    if (!message || !senderId || !senderRole) {
      return NextResponse.json(
        { error: 'Message, senderId, and senderRole are required' },
        { status: 400 }
      );
    }

    // Verify the appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Create the message
    const newMessage = await ConsultationMessage.create({
      appointment: appointmentId,
      sender: senderId,
      senderRole,
      message,
    });

    await newMessage.populate('sender', 'firstname lastname profileImage');

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
