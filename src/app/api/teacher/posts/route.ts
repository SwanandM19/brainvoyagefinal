import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import UploadLog from '@/models/UploadLog';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const teacherId = (token.id ?? token.sub) as string;
    const body      = await req.json();
    const { type }  = body;

    if (!type || !['photo', 'article'].includes(type)) {
      return NextResponse.json({ error: 'Invalid post type.' }, { status: 400 });
    }

    await connectDB();

    // ── PHOTO POST ───────────────────────────────────
    if (type === 'photo') {
      const { objectKey, publicUrl, caption, subject, classes, boards, fileSize } = body;

      if (!objectKey || !publicUrl) {
        return NextResponse.json(
          { error: 'Missing photo URL. Complete the R2 upload first.' },
          { status: 400 }
        );
      }

      const post = await Post.create({
        teacherId,
        type:     'photo',
        photoUrl: publicUrl,
        photoKey: objectKey,
        caption:  caption?.trim()  ?? '',
        subject:  subject          ?? '',
        classes:  classes          ?? [],
        boards:   boards           ?? [],
        status:   'active',
      });

      try {
        const today = new Date().toISOString().slice(0, 10);
        const month = today.slice(0, 7);
        const bytes = fileSize ?? 0;

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
      } catch (logErr) {
        console.warn('[POSTS_CREATE] UploadLog failed (non-critical):', logErr);
      }

      return NextResponse.json({
        success: true,
        postId:  post._id.toString(),
        message: 'Photo posted successfully.',
      });
    }

    // ── ARTICLE POST ─────────────────────────────────
    if (type === 'article') {
      const { title, body: articleBody, subject, classes, boards } = body;

      if (!title?.trim()) {
        return NextResponse.json({ error: 'Article title is required.' }, { status: 400 });
      }
      if (!articleBody?.trim()) {
        return NextResponse.json({ error: 'Article body is required.' }, { status: 400 });
      }

      const post = await Post.create({
        teacherId,
        type:    'article',
        title:   title.trim(),
        body:    articleBody.trim(),
        subject: subject ?? '',
        classes: classes ?? [],
        boards:  boards  ?? [],
        status:  'active',
      });

      return NextResponse.json({
        success: true,
        postId:  post._id.toString(),
        message: 'Article published successfully.',
      });
    }

  } catch (err) {
    console.error('[POSTS_CREATE]', err);
    return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const teacherId = (token.id ?? token.sub) as string;
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const type  = searchParams.get('type');

    await connectDB();

    const filter: any = { teacherId };
    if (type && ['photo', 'article'].includes(type)) filter.type = type;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error('[POSTS_GET]', err);
    return NextResponse.json({ error: 'Failed to fetch posts.' }, { status: 500 });
  }
}
