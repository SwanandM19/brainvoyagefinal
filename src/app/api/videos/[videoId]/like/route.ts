import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';
import mongoose from 'mongoose';

async function resolveUserId(token: any): Promise<mongoose.Types.ObjectId | null> {
  const mongoId = token.mongoId ?? token.id;

  if (mongoId && mongoose.Types.ObjectId.isValid(mongoId)) {
    return new mongoose.Types.ObjectId(mongoId);
  }

  // Fallback — Google OAuth users whose token predates the mongoId fix
  if (token.email) {
    const user = await User.findOne({ email: token.email }).select('_id').lean();
    if (user) return (user as any)._id as mongoose.Types.ObjectId;
  }

  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();

    const userId = await resolveUserId(token);
    if (!userId) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const video = await Video.findById(videoId);
    if (!video) return NextResponse.json({ error: 'Video not found.' }, { status: 404 });

    // ✅ Migrate legacy number likes to array on the fly
    if (typeof (video as any).likes === 'number' || !Array.isArray(video.likes)) {
      await Video.updateOne({ _id: videoId }, { $set: { likes: [] } });
      video.likes = [] as any;
    }

    const alreadyLiked = (video.likes as mongoose.Types.ObjectId[])
      .some((id) => id.equals(userId));

    if (alreadyLiked) {
      await Video.updateOne({ _id: videoId }, { $pull:      { likes: userId } });
    } else {
      await Video.updateOne({ _id: videoId }, { $addToSet: { likes: userId } });
    }

    const updated = await Video.findById(videoId).select('likes').lean();
    const likes   = Array.isArray((updated as any)?.likes)
      ? (updated as any).likes.length
      : 0;

    return NextResponse.json({ likes, liked: !alreadyLiked });
  } catch (err) {
    console.error('[like]', err);
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
