import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models/User';
import { Doctor } from '@/lib/models/Doctor';
import { Patient } from '@/lib/models/Patient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, firstname, lastname, role, specialization, licenseNumber, dateOfBirth, gender } = body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create base user
    let newUser;
    if (role === 'doctor') {
      newUser = new Doctor({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        role: 'doctor',
        specialty: specialization,
        licenseNumber,
        experience: 0,
      });
    } else {
      newUser = new Patient({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        role: 'patient',
        dateOfBirth,
        gender,
      });
    }

    await newUser.save();

    // Return success WITHOUT setting the HttpOnly cookies
    return NextResponse.json(
      {
        message: 'User registered successfully. Please log in.',
        user: {
          _id: newUser._id,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}