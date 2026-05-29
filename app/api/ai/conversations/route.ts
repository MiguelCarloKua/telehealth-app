import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { AIConversation } from '@/lib/models/AIConversation';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const patientId = new URL(request.url).searchParams.get('patientId');

    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json([], { status: 200 });
    }

    const convos = await AIConversation.find({ patient: patientId })
      .select('_id title lastMessageAt createdAt')
      .sort({ lastMessageAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(convos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { patientId, title } = await request.json();

    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: 'Invalid patientId' }, { status: 400 });
    }

    const convo = await AIConversation.create({
      patient: patientId,
      title: title || 'New Conversation',
      messages: [],
    });

    return NextResponse.json(convo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
