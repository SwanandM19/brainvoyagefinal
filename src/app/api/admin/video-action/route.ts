import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { videoId, action } = await req.json();

    if (!videoId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    await connectDB();

    await Video.updateOne(
      { _id: videoId },
      { $set: { status: action === 'approve' ? 'active' : 'rejected' } }
    );

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error('[VIDEO_ACTION_ERROR]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
