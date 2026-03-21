import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    // ── Fetch top 7 students by points ────────────────────
    const students = await User.find({
      role: { $in: ['student', 'Student'] },
      points: { $gt: 0 },
    })
      .select('_id name points image')
      .sort({ points: -1 })
      .limit(7)
      .lean() as any[];

    // Fallback: get any students even if points = 0
    const fallback = students.length === 0
      ? await User.find({ role: { $in: ['student', 'Student'] } })
          .select('_id name points image')
          .sort({ points: -1 })
          .limit(7)
          .lean() as any[]
      : students;

    const ranked = fallback.map((s, i) => ({
      id:     s._id.toString(),
      name:   s.name   ?? 'Student',
      points: s.points ?? 0,
      rank:   i + 1,
      image:  s.image  ?? null,
    }));

    // ── Current logged-in student's position ──────────────
    let myEntry = null;
    if (token) {
      const me = token.id
        ? await User.findById(token.id)
            .select('_id name points image').lean() as any
        : await User.findOne({
            $or: [
              { googleId: token.sub },
              { email: token.email },
            ]
          }).select('_id name points image').lean() as any;

      if (me) {
        const above = await User.countDocuments({
          role: { $in: ['student', 'Student'] },
          points: { $gt: me.points ?? 0 },
        });
        myEntry = {
          id:     me._id.toString(),
          name:   me.name   ?? 'You',
          points: me.points ?? 0,
          rank:   above + 1,
          image:  me.image  ?? null,
          isMe:   true,
        };
      }
    }

    return NextResponse.json({ students: ranked, myEntry });
  } catch (err) {
    console.error('[STUDENT_LEADERBOARD]', err);
    return NextResponse.json({ error: 'Failed', detail: String(err) }, { status: 500 });
  }
}