import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    if (!token || token.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (token.teacherStatus !== 'approved') {
      return NextResponse.json({ error: 'Your account is not approved yet.' }, { status: 403 });
    }

    const {
      title, description, videoUrl,
      thumbnail,                        // ✅ was missing entirely
      subject, classes, boards, tags,
    } = await req.json();

    if (!title?.trim() || !subject || !videoUrl?.trim()) {
      return NextResponse.json(
        { error: 'Title, subject, and video URL are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const teacher = await User.findOne({ email: token.email });
    if (!teacher) return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });

    const video = await Video.create({
      teacherId:   teacher._id,
      title:       title.trim(),
      description: description?.trim() ?? '',
      videoUrl:    videoUrl.trim(),
      thumbnail:   thumbnail?.trim()   ?? '', // ✅ was missing entirely
      subject,
      classes:     classes ?? [],
      boards:      boards  ?? [],
      tags:        tags    ?? [],
      status:      'pending',
    });

    return NextResponse.json({ success: true, videoId: video._id.toString() });
  } catch (err) {
    console.error('[UPLOAD_VIDEO_ERROR]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
