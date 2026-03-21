import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import UploadLog from '@/models/UploadLog';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const {
      objectKey, publicUrl, thumbnailKey, thumbnailUrl,
      title, description, subject, classes, boards, tags,
      duration, fileSize,
    } = await req.json();

    if (!objectKey || !title || !subject) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    await connectDB();

    const today     = new Date().toISOString().slice(0, 10);
    const month     = today.slice(0, 7);
    const teacherId = (token.id ?? token.sub) as string;

    // ── Save video to MongoDB ────────────────────────
    const video = await Video.create({
      teacherId,
      title:          title.trim(),
      description:    description?.trim() ?? '',
      videoUrl:       publicUrl,
      r2Key:          objectKey,
      thumbnail:      thumbnailUrl  ?? '',
      r2ThumbnailKey: thumbnailKey  ?? '',
      subject,
      classes:  classes  ?? [],
      boards:   boards   ?? [],
      tags:     tags     ?? [],
      duration: duration ?? 0,
      status:   'active',
    });

    const bytes = fileSize ?? 0;

    // ── FIX: removed $set: { month } from daily upsert ──
    await UploadLog.findOneAndUpdate(
      { teacherId, period: 'day', date: today },
      { $inc: { uploadsToday: 1, bytesUsed: bytes } },
      { upsert: true }
    );

    await UploadLog.findOneAndUpdate(
      { teacherId, period: 'month', month },
      { $inc: { uploadsMonth: 1, bytesUsed: bytes } },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      videoId: video._id.toString(),
      message: 'Video uploaded. Pending admin approval.',
    });

  } catch (err) {
    console.error('[UPLOAD_COMPLETE]', err);
    return NextResponse.json({ error: 'Failed to save video.' }, { status: 500 });
  }
}
