import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

async function resolveUserId(token: any): Promise<mongoose.Types.ObjectId | null> {
  const mongoId = token.mongoId ?? token.id;

  if (mongoId && mongoose.Types.ObjectId.isValid(mongoId)) {
    return new mongoose.Types.ObjectId(mongoId);
  }

  if (token.email) {
    const user = await User.findOne({ email: token.email }).select('_id').lean();
    if (user) return (user as any)._id as mongoose.Types.ObjectId;
  }

  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();

    const studentId = await resolveUserId(token);
    if (!studentId) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    if (studentId.toString() === teacherId)
      return NextResponse.json({ error: 'Cannot follow yourself.' }, { status: 400 });

    const teacher = await User.findById(teacherId);
    if (!teacher) return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });

    // ✅ Handle missing followers array on legacy documents
    const followersArray: mongoose.Types.ObjectId[] = Array.isArray(teacher.followers)
      ? teacher.followers
      : [];

    const isFollowing = followersArray.some((id) => id.equals(studentId));

    if (isFollowing) {
      await User.updateOne(
        { _id: teacherId },
        { $pull:      { followers: studentId }, $inc: { followersCount: -1 } }
      );
      await User.updateOne(
        { _id: studentId },
        { $pull:      { following: teacherId }, $inc: { followingCount: -1 } }
      );
    } else {
      await User.updateOne(
        { _id: teacherId },
        { $addToSet: { followers: studentId }, $inc: { followersCount:  1 } }
      );
      await User.updateOne(
        { _id: studentId },
        { $addToSet: { following: teacherId }, $inc: { followingCount:  1 } }
      );
    }

    const updated = await User.findById(teacherId).select('followersCount followers').lean();
    const followers = (updated as any)?.followersCount
      ?? (updated as any)?.followers?.length
      ?? 0;

    return NextResponse.json({ followers, isFollowing: !isFollowing });
  } catch (err) {
    console.error('[follow]', err);
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
