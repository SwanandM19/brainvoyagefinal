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

    const video = await Video.findById(videoId)
      .select('title thumbnail videoUrl')
      .lean() as any;

    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const thumb = video.thumbnail ?? '';

    return NextResponse.json({
      videoId,
      title:          video.title,
      thumbnailRaw:   thumb,
      thumbnailLength: thumb.length,
      isEmpty:        thumb.trim() === '',
      startsWithHttp: thumb.startsWith('http'),
      videoUrl:       video.videoUrl,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
