// app/api/teachers/[teacherId]/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Video from '@/models/Video';
import mongoose from 'mongoose';

async function getStudentId(token: any): Promise<mongoose.Types.ObjectId | null> {
  const rawId = token.mongoId ?? token.id ?? token.sub;
  if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
    return new mongoose.Types.ObjectId(rawId);
  }
  if (token.email) {
    const user = await User.findOne({ email: token.email }).select('_id').lean() as any;
    if (user) return user._id;
  }
  return null;
}

export async function GET(
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

  const teacher = await User.findOne({
    _id:  new mongoose.Types.ObjectId(teacherId),
    role: 'teacher',
  }).lean() as any;

  if (!teacher) {
    return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
  }

  const videos = await Video.find({
    teacherId: { $in: [
      new mongoose.Types.ObjectId(teacherId),
      teacherId, // also match string version
    ]},
    status: { $in: ['active', 'approved'] },
  }).lean() as any[];

  const totalViews = videos.reduce((s, v) => s + (v.views  ?? 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes?.length ?? v.likes ?? 0), 0);
  const ratedVids  = videos.filter(v => (v.rating ?? v.avgRating ?? 0) > 0);
  const avgRating  = ratedVids.length
    ? ratedVids.reduce((s, v) => s + (v.rating ?? v.avgRating ?? 0), 0) / ratedVids.length
    : 0;

  const studentId   = await getStudentId(token);
  const isFollowing = studentId
    ? (teacher.followers ?? []).map(String).includes(String(studentId))
    : false;

  return NextResponse.json({
    teacher: {
      teacherId:         teacher._id.toString(),
      name:              teacher.name              ?? '',
      email:             teacher.email             ?? '',
      bio:               teacher.bio               ?? '',
      subjects:          teacher.subjects          ?? [],
      boards:            teacher.boards            ?? [],
      classes:           teacher.classes           ?? [],
      yearsOfExperience: teacher.yearsOfExperience ?? 0,
      followersCount:    (teacher.followers        ?? []).length,
      videoCount:        videos.length,
      totalViews,
      totalLikes,
      avgRating:         parseFloat(avgRating.toFixed(1)),
      isFollowing,
    },
  });
}
