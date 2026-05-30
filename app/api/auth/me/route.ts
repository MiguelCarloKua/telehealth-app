import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = request.cookies.get('userId')?.value;
    const cookieToken = request.cookies.get('sessionToken')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await User.findById(userId).select('firstname lastname role +sessionToken');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If the stored token doesn't match the cookie, a newer login has taken over
    if (user.sessionToken && cookieToken !== user.sessionToken) {
      return NextResponse.json({ error: 'Session superseded by a newer login' }, { status: 401 });
    }

    return NextResponse.json({
      _id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
