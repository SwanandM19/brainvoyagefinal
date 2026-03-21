// app/api/videos/[videoId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { videoId } = await params;
    await connectDB();

    // Resolve real MongoDB _id from email
    const teacher = await User.findOne({ email: token.email }).select('_id').lean() as any;
    if (!teacher) return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });

    const video = await Video.findById(videoId);
    if (!video) return NextResponse.json({ error: 'Video not found.' }, { status: 404 });

    // Only owner can delete
    if (video.teacherId.toString() !== teacher._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Video.findByIdAndDelete(videoId);

    // Sync teacher totalViews
    await User.findByIdAndUpdate(teacher._id, {
      $inc: { totalViews: -(video.views ?? 0) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE_VIDEO]', err);
    return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 });
  }
}
