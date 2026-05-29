import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Notification } from '@/lib/models/Notification';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
