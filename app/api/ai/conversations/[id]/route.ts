import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { AIConversation } from '@/lib/models/AIConversation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const convo = await AIConversation.findById(id).lean();
    if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(convo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { messages, title } = await request.json();

    const update: any = { lastMessageAt: new Date() };
    if (messages !== undefined) update.messages = messages;
    if (title) update.title = title;

    const convo = await AIConversation.findByIdAndUpdate(id, update, { new: true });
    if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(convo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await AIConversation.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
