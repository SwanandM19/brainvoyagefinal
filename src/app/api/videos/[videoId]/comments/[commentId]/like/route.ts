import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Comment from '@/models/Comment';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();

    // ✅ Plain string userId — no ObjectId
    const userId = (token.mongoId ?? token.email ?? token.sub) as string;
    const comment = await Comment.findById(commentId);
    if (!comment) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id: any) => id !== userId);
    } else {
      comment.likes.push(userId);
    }
    await comment.save();

    return NextResponse.json({ likes: comment.likes.length, liked: !alreadyLiked });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
