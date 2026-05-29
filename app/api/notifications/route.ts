import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Notification } from '@/lib/models/Notification';

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json([], { status: 200 });
    }

    // Fetch unread notifications for this user, newest first
    const notifications = await Notification.find({ user: userId, isRead: false })
      .sort({ createdAt: -1 });

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}