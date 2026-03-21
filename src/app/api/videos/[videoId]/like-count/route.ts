import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    await connectDB();
    const video = await Video.findById(videoId).select('likes').lean();
    return NextResponse.json({ likes: (video as any)?.likes?.length ?? 0 });
  } catch {
    return NextResponse.json({ likes: 0 });
  }
}
