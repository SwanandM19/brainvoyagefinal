import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, R2_BUCKET } from '@/lib/r2';
import connectDB from '@/lib/db';
import Post from '@/models/Post';

// ── DELETE — remove post + R2 asset if photo ────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Post ID required.' }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    // ── Ownership check (teacher owns it OR admin) ───
    const teacherId = (token.id ?? token.sub) as string;
    if (
      token.role !== 'admin' &&
      post.teacherId.toString() !== teacherId
    ) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // ── Delete photo from R2 if it's a photo post ────
    if (post.type === 'photo' && post.photoKey) {
      try {
        const r2 = getR2Client();
        await r2.send(new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key:    post.photoKey,
        }));
      } catch (r2Err) {
        console.error('[DELETE_POST] R2 delete failed:', r2Err);
      }
    }

    // ── Delete from MongoDB ──────────────────────────
    await Post.findByIdAndDelete(id);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[DELETE_POST]', err);
    return NextResponse.json({ error: 'Failed to delete post.' }, { status: 500 });
  }
}

// ── GET — fetch a single post by ID ─────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Post ID required.' }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(id)
      .populate('teacherId', 'name image subjects')
      .lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json({ post });

  } catch (err) {
    console.error('[GET_POST]', err);
    return NextResponse.json({ error: 'Failed to fetch post.' }, { status: 500 });
  }
}

// ── PATCH — update caption/title/body ───────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    const teacherId = (token.id ?? token.sub) as string;
    if (post.teacherId.toString() !== teacherId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const updates = await req.json();

    // ── Only allow safe fields to be updated ─────────
    const allowed: Record<string, boolean> = {
      caption: true, title: true, body: true,
      subject: true, classes: true, boards: true,
    };

    const sanitized: any = {};
    for (const key of Object.keys(updates)) {
      if (allowed[key]) sanitized[key] = updates[key];
    }

    const updated = await Post.findByIdAndUpdate(
      id,
      { $set: sanitized },
      { returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ success: true, post: updated });

  } catch (err) {
    console.error('[PATCH_POST]', err);
    return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 });
  }
}
