import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';
import mongoose from 'mongoose';

async function resolveUserId(token: any): Promise<mongoose.Types.ObjectId | null> {
  const mongoId = token.mongoId ?? token.id;
  if (mongoId && mongoose.Types.ObjectId.isValid(mongoId))
    return new mongoose.Types.ObjectId(mongoId);
  if (token.email) {
    const user = await User.findOne({ email: token.email }).select('_id').lean();
    if (user) return (user as any)._id;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    await connectDB();

    const video = await Video.findById(videoId).select('likes').lean();
    const totalLikes = Array.isArray((video as any)?.likes)
      ? (video as any).likes.length
      : 0;

    if (!token) {
      return NextResponse.json({ liked: false, following: false, likes: totalLikes });
    }

    const userId = await resolveUserId(token);
    if (!userId) {
      return NextResponse.json({ liked: false, following: false, likes: totalLikes });
    }

    // Check if user already liked this video
    const alreadyLiked = Array.isArray((video as any)?.likes)
      ? (video as any).likes.some((id: mongoose.Types.ObjectId) =>
          new mongoose.Types.ObjectId(id).equals(userId)
        )
      : false;

    // Check if user already follows this video's teacher
    const videoDoc   = await Video.findById(videoId).select('teacherId').lean();
    const teacherId  = (videoDoc as any)?.teacherId;
    let alreadyFollowing = false;

    if (teacherId) {
      const teacher = await User.findById(teacherId).select('followers').lean();
      alreadyFollowing = Array.isArray((teacher as any)?.followers)
        ? (teacher as any).followers.some((id: mongoose.Types.ObjectId) =>
            new mongoose.Types.ObjectId(id).equals(userId)
          )
        : false;
    }

    return NextResponse.json({
      liked:     alreadyLiked,
      following: alreadyFollowing,
      likes:     totalLikes,
    });
  } catch (err) {
    console.error('[my-state]', err);
    return NextResponse.json({ liked: false, following: false, likes: 0 });
  }
}
