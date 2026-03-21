import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';

// ── GET — public feed of posts (photos + articles) ──────
// Query params:
//   page      number   default 1
//   limit     number   default 20 (max 50)
//   type      'photo' | 'article' | 'all'   default 'all'
//   subject   string   optional filter
//   teacherId string   optional — fetch single teacher's posts
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    // Both teachers and students can view the feed
    // but must be logged in
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page      = Math.max(1, parseInt(searchParams.get('page')      ?? '1'));
    const limit     = Math.min(50, parseInt(searchParams.get('limit')    ?? '20'));
    const type      = searchParams.get('type')      ?? 'all';
    const subject   = searchParams.get('subject')   ?? '';
    const teacherId = searchParams.get('teacherId') ?? '';

    await connectDB();

    // ── Build filter ─────────────────────────────────
    const filter: any = { status: 'active' };

    if (type && type !== 'all' && ['photo', 'article'].includes(type)) {
      filter.type = type;
    }
    if (subject && subject !== 'all') {
      filter.subject = subject;
    }
    if (teacherId) {
      filter.teacherId = teacherId;
    }

    // ── Fetch posts with teacher info populated ───────
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('teacherId', 'name image subjects city state')
        .lean(),
      Post.countDocuments(filter),
    ]);

    // ── Shape response — safe for client ─────────────
    const shaped = posts.map((p: any) => {
      const teacher = p.teacherId ?? {};
      return {
        id:         p._id.toString(),
        type:       p.type,

        // Photo fields
        photoUrl:   p.photoUrl  ?? null,
        caption:    p.caption   ?? '',

        // Article fields
        title:      p.title     ?? '',
        body:       p.body      ?? '',

        // Common
        subject:    p.subject   ?? '',
        classes:    p.classes   ?? [],
        boards:     p.boards    ?? [],
        likesCount: p.likesCount ?? 0,
        views:      p.views      ?? 0,
        status:     p.status,
        createdAt:  p.createdAt,

        teacher: {
          id:       teacher._id?.toString() ?? '',
          name:     teacher.name            ?? 'Teacher',
          image:    teacher.image           ?? null,
          subjects: teacher.subjects        ?? [],
          city:     teacher.city            ?? '',
          state:    teacher.state           ?? '',
        },
      };
    });

    return NextResponse.json({
      posts: shaped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore:    page * limit < total,
      },
    });

  } catch (err) {
    console.error('[FEED_POSTS_GET]', err);
    return NextResponse.json({ error: 'Failed to fetch feed.' }, { status: 500 });
  }
}

// ── POST — increment view count ──────────────────────────
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { postId, action } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: 'postId required.' }, { status: 400 });
    }

    await connectDB();

    // ── View ─────────────────────────────────────────
    if (action === 'view') {
      await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });
      return NextResponse.json({ success: true });
    }

    // ── Like / Unlike toggle ─────────────────────────
    if (action === 'like' || action === 'unlike') {
      const userId = (token.id ?? token.sub) as string;
      const update = action === 'like'
        ? { $addToSet: { likes: userId }, $inc: { likesCount:  1 } }
        : { $pull:     { likes: userId }, $inc: { likesCount: -1 } };

      await Post.findByIdAndUpdate(postId, update);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });

  } catch (err) {
    console.error('[FEED_POSTS_POST]', err);
    return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 });
  }
}
