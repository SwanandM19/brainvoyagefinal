import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required.' }, { status: 400 });
    }

    await connectDB();

    // Increment video view count
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true, select: 'views teacherId' }
    );

    if (!video) {
      return NextResponse.json({ error: 'Video not found.' }, { status: 404 });
    }

    // Also increment teacher's totalViews (used in leaderboard ranking)
    await User.findByIdAndUpdate(
      video.teacherId,
      { $inc: { totalViews: 1 } }
    );

    return NextResponse.json({ success: true, views: video.views });

  } catch (err) {
    console.error('[VIEW]', err);
    return NextResponse.json({ error: 'Failed to record view.' }, { status: 500 });
  }
}
