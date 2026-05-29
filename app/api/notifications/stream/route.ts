import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Notification } from '@/lib/models/Notification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get('userId');

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return new Response('Invalid userId', { status: 400 });
  }

  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      await connectDB();
      let closed = false;

      const push = async () => {
        if (closed) return;
        try {
          const notifications = await Notification.find({ user: userId, isRead: false })
            .sort({ createdAt: -1 })
            .lean();
          if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(notifications)}\n\n`));
        } catch {
          if (!closed) controller.enqueue(encoder.encode(`data: []\n\n`));
        }
      };

      await push();
      interval = setInterval(push, 5000);

      request.signal.addEventListener('abort', () => {
        closed = true;
        if (interval) clearInterval(interval);
        try { controller.close(); } catch {}
      });
    },
    cancel() {
      if (interval) clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
