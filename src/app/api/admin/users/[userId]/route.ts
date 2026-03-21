import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

type Ctx = { params: Promise<{ userId: string }> };

// ── GET single user ───────────────────────────────────
export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { userId } = await params;
    if (!mongoose.isValidObjectId(userId))
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(userId).select('-followers -following -__v').lean();
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error('[ADMIN_GET_USER]', err);
    return NextResponse.json({ error: 'Failed to fetch user.' }, { status: 500 });
  }
}

// ── PATCH edit user ───────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { userId } = await params;
    if (!mongoose.isValidObjectId(userId))
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });

    const body = await req.json();

    // ── Whitelist — only these fields can be edited ───
    const ALLOWED_SHARED = [
      'name', 'bio', 'phone', 'city', 'state',
      'onboardingCompleted', 'points', 'badges',
    ];
    const ALLOWED_TEACHER = [
      'teacherStatus', 'teacherRejectionNote',
      'subjects', 'classes', 'boards',
      'qualifications', 'yearsOfExperience', 'profileVideoUrl',
    ];
    const ALLOWED_STUDENT = [
      'studentClass', 'studentBoard', 'school',
    ];

    await connectDB();
    const existing = await User.findById(userId).lean() as any;
    if (!existing) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const allowed = [
      ...ALLOWED_SHARED,
      ...(existing.role === 'teacher' ? ALLOWED_TEACHER : []),
      ...(existing.role === 'student' ? ALLOWED_STUDENT : []),
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0)
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true, select: '-followers -following -__v' }
    ).lean();

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error('[ADMIN_PATCH_USER]', err);
    if (err.name === 'ValidationError')
      return NextResponse.json({ error: err.message }, { status: 400 });
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

// ── DELETE user ───────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { userId } = await params;
    if (!mongoose.isValidObjectId(userId))
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });

    // Prevent admin from deleting themselves
    if (userId === (token.id ?? token.sub))
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 403 });

    await connectDB();
    const user = await User.findById(userId).lean() as any;
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    // Prevent deleting other admins
    if (user.role === 'admin')
      return NextResponse.json({ error: 'Cannot delete admin accounts.' }, { status: 403 });

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: `${user.name} has been deleted.` });
  } catch (err) {
    console.error('[ADMIN_DELETE_USER]', err);
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
