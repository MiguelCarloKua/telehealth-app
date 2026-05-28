import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { User } from '@/lib/models/User';
import { Patient } from '@/lib/models/Patient';
import { Doctor } from '@/lib/models/Doctor';  
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    // Use .populate or simply find by ID using the base model
    // Mongoose discriminators usually return all fields if you query the base model
    const user = await User.findById(id).select('-password');
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // If the user is a patient, Mongoose might not return the extra fields 
    // unless the Patient model is fully registered/loaded in this route.
    // Explicitly loading the Patient model ensures the fields exist.
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // 1. Fetch the user to determine the model
    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. FIX: Choose the exactly correct model to ensure discriminator validation runs
    const Model = user.role === 'patient' ? Patient : Doctor;

    // 3. Handle Password
    if (body.currentPassword && body.newPassword) {
      const isMatch = await bcrypt.compare(body.currentPassword, user.password);
      if (!isMatch) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      body.password = await bcrypt.hash(body.newPassword, 10);
      delete body.currentPassword;
      delete body.newPassword;
    }

    // 4. Clean request body
    delete body.firstname; 
    delete body.email;

    // 5. Update using the specific Model
    const updatedUser = await Model.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    // FIX: Intercept MongoDB Duplicate Key Error for Phone Numbers
    if (error.code === 11000 && error.keyPattern && error.keyPattern.phoneNumber) {
      return NextResponse.json(
        { error: 'This phone number is already registered to another account.' }, 
        { status: 400 }
      );
    }

    // Default error fallback
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    // FIX: Await the params object
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Account successfully deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}