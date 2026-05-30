import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;
    if (userId) {
      await connectDB();
      await User.findByIdAndUpdate(userId, { sessionToken: null });
    }

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.delete('userId');
    response.cookies.delete('userRole');
    response.cookies.delete('sessionToken');

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
