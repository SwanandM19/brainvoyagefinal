import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { postId } = await params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId))
      return NextResponse.json({ error: 'Invalid post ID.' }, { status: 400 });

    const userId = (token.mongoId ?? token.id ?? token.sub) as string;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId))
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    await connectDB();

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });

    const userObjectId  = new mongoose.Types.ObjectId(userId);
    const alreadyLiked  = post.likes.some((id: mongoose.Types.ObjectId) => id.equals(userObjectId));

    if (alreadyLiked) {
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: userObjectId },
        $inc:  { likesCount: -1 },
      });
    } else {
      await Post.findByIdAndUpdate(postId, {
        $addToSet: { likes: userObjectId },
        $inc:      { likesCount: 1 },
      });
    }

    const updated = await Post.findById(postId).select('likesCount').lean();
    return NextResponse.json({
      liked: !alreadyLiked,
      likes: (updated as any)?.likesCount ?? 0,
    });

  } catch (err) {
    console.error('[POST_LIKE]', err);
    return NextResponse.json({ error: 'Failed to toggle like.' }, { status: 500 });
  }
}
