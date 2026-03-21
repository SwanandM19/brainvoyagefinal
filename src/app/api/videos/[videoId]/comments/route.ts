import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Comment from '@/models/Comment';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    await connectDB();

    const comments = await Comment.find({ videoId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      comments: comments.map((c) => ({
        id:           c._id.toString(),
        userName:     c.userName,
        userInitials: c.userInitials,
        text:         c.text,
        likes:        c.likes.length,
        createdAt:    (c.createdAt as Date).toISOString(),
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch comments.' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { text } = await req.json();
    if (!text?.trim())
      return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 });

    await connectDB();

    // ✅ Use mongoId (MongoDB _id) — fallback to email if mongoId not yet in token
    const userId   = (token.mongoId ?? token.email ?? token.sub) as string;
    const name     = (token.name as string) ?? 'User';
    const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    const comment = await Comment.create({
      videoId,
      userId,           // ✅ plain string, no ObjectId conversion
      userName:     name,
      userInitials: initials,
      text:         text.trim(),
      likes:        [],
    });

    return NextResponse.json({
      comment: {
        id:           comment._id.toString(),
        userName:     comment.userName,
        userInitials: comment.userInitials,
        text:         comment.text,
        likes:        0,
        createdAt:    comment.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to post comment.' }, { status: 500 });
  }
}
