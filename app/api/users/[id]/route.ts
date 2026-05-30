import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { User } from '@/lib/models/User';
import { Patient } from '@/lib/models/Patient';
import { Doctor } from '@/lib/models/Doctor';
import { Appointment } from '@/lib/models/Appointment';
import { ClinicalNote } from '@/lib/models/ClinicalNote';
import { Prescription } from '@/lib/models/Prescription';
import { ConsultationMessage } from '@/lib/models/ConsultationMessage';
import { Notification } from '@/lib/models/Notification';
import { AIConversation } from '@/lib/models/AIConversation';
import { Rating } from '@/lib/models/Rating';
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    const uid = new mongoose.Types.ObjectId(id);

    // 1. Collect all appointment IDs involving this user (as patient or doctor)
    const appointments = await Appointment.find({
      $or: [{ patient: uid }, { doctor: uid }],
    }).select('_id');
    const aptIds = appointments.map(a => a._id);

    // 2. Delete appointment-scoped data
    if (aptIds.length > 0) {
      await Promise.all([
        ClinicalNote.deleteMany({ appointment: { $in: aptIds } }),
        Prescription.deleteMany({ appointment: { $in: aptIds } }),
        ConsultationMessage.deleteMany({ appointment: { $in: aptIds } }),
        Rating.deleteMany({ appointment: { $in: aptIds } }),
      ]);
    }

    // 3. Delete the appointments themselves
    await Appointment.deleteMany({ $or: [{ patient: uid }, { doctor: uid }] });

    // 4. Delete user-scoped data
    await Promise.all([
      Notification.deleteMany({ user: uid }),
      AIConversation.deleteMany({ patient: uid }),
    ]);

    // 5. Delete the user document
    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Account and all associated data successfully deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}