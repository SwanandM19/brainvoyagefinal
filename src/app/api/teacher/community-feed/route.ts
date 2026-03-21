import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  // Fetch all active videos from ALL teachers (community feed)
  const videos = await Video.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('teacherId', 'id name email')
    .lean();

  // Map teacherId to teacher for frontend compatibility
  const mapped = videos.map((v: any) => ({
    ...v,
    _id: v._id.toString(),
    teacher: v.teacherId
      ? { id: v.teacherId._id?.toString(), name: v.teacherId.name, email: v.teacherId.email }
      : { id: '', name: 'Unknown', email: '' },
  }));

  return NextResponse.json(mapped);
}