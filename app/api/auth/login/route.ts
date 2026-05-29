import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    // This entirely neutralizes object-based NoSQL Injection payload attacks.
    const email = String(body.email);
    const password = String(body.password);

    if (!email || !password || email === 'undefined') {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Find user and verify password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const response = NextResponse.json(
      {
          user: {
          _id: user._id, 
          firstname: user.firstname, 
          lastname: user.lastname,  
          email: user.email,
          phoneNumber: user.phoneNumber, // <-- Add this here
          role: user.role,
          isOnboarded: user.role === 'patient' ? user.height > 0 : true,
          },
      },
      { status: 200 }
    );

    // Set authentication cookie
    response.cookies.set('userId', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set('userRole', user.role, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}