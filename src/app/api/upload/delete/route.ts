import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, R2_BUCKET } from '@/lib/r2';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { videoId } = await req.json();
    await connectDB();

    const video = await Video.findById(videoId);
    if (!video) return NextResponse.json({ error: 'Video not found.' }, { status: 404 });

    // Only owner or admin can delete
    if (
      token.role !== 'admin' &&
      video.teacherId.toString() !== (token.mongoId ?? token.id)
    ) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const r2 = getR2Client();

    // Delete video file from R2 (1 Class A op)
    if (video.r2Key) {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: video.r2Key }));
    }

    // Delete thumbnail from R2 (1 Class A op)
    if (video.r2ThumbnailKey) {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: video.r2ThumbnailKey }));
    }

    // Delete from MongoDB
    await Video.findByIdAndDelete(videoId);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[DELETE_VIDEO]', err);
    return NextResponse.json({ error: 'Failed to delete video.' }, { status: 500 });
  }
}
