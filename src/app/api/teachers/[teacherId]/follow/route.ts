// app/api/teachers/[teacherId]/follow/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

async function getStudentId(token: any): Promise<mongoose.Types.ObjectId | null> {
  // Try all possible ID fields NextAuth might set
  const rawId = token.mongoId ?? token.id ?? token.sub;

  if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
    return new mongoose.Types.ObjectId(rawId);
  }

  // Fallback: look up by email
  if (token.email) {
    const user = await User.findOne({ email: token.email }).select('_id').lean() as any;
    if (user) return user._id;
  }

  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { teacherId } = await params;

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return NextResponse.json({ error: 'Invalid teacher ID' }, { status: 400 });
  }

  const studentId = await getStudentId(token);
  if (!studentId) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  const teacher = await User.findById(teacherId);
  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

  const alreadyFollowing = teacher.followers.map(String).includes(String(studentId));
  if (alreadyFollowing) {
    return NextResponse.json({ ok: true, followersCount: teacher.followers.length });
  }

  teacher.followers.push(studentId);
  teacher.followersCount = teacher.followers.length;
  await teacher.save();

  // Add to student's following list
  await User.findByIdAndUpdate(studentId, {
    $addToSet: { following: new mongoose.Types.ObjectId(teacherId) },
    $inc:      { followingCount: 1 },
  });

  return NextResponse.json({ ok: true, followersCount: teacher.followersCount });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { teacherId } = await params;

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return NextResponse.json({ error: 'Invalid teacher ID' }, { status: 400 });
  }

  const studentId = await getStudentId(token);
  if (!studentId) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  const teacher = await User.findById(teacherId);
  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

  const wasFollowing = teacher.followers.map(String).includes(String(studentId));
  if (!wasFollowing) {
    return NextResponse.json({ ok: true, followersCount: teacher.followers.length });
  }

  teacher.followers = teacher.followers.filter(
    id => String(id) !== String(studentId)
  ) as mongoose.Types.ObjectId[];
  teacher.followersCount = teacher.followers.length;
  await teacher.save();

  await User.findByIdAndUpdate(studentId, {
    $pull: { following: new mongoose.Types.ObjectId(teacherId) },
    $inc:  { followingCount: -1 },
  });

  return NextResponse.json({ ok: true, followersCount: teacher.followersCount });
}
