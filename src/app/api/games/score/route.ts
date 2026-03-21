import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import GameScore from '@/models/GameScore';
import User from '@/models/User';

const AVATAR_COLORS = [
  'from-rose-500 to-pink-600',     'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',  'from-sky-500 to-cyan-600',
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const {
      gameType, subject, score, streak,
      questionsTotal, questionsCorrect, timeTaken,
    } = await req.json();

    if (!gameType || !subject || score === undefined)
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });

    await connectDB();

    const userId   = (token.mongoId ?? token.id) as string;
    const userName = (token.name as string) ?? 'Student';
    const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const accuracy = questionsTotal > 0 ? Math.round((questionsCorrect / questionsTotal) * 100) : 0;

    await GameScore.create({
      userId, userName,
      userInitials: initials,
      avatarColor:  colorFor(userName),
      gameType, subject, score,
      streak:           streak ?? 0,
      accuracy,
      questionsTotal:   questionsTotal ?? 0,
      questionsCorrect: questionsCorrect ?? 0,
      timeTaken:        timeTaken ?? 0,
    });

    // Award points to user (1 point per 10 game score)
    await User.updateOne({ email: token.email }, { $inc: { points: Math.floor(score / 10) } });

    // Calculate rank
    const rank = await GameScore.aggregate([
      { $match: { gameType, subject } },
      { $group: { _id: '$userId', bestScore: { $max: '$score' } } },
      { $match: { bestScore: { $gt: score } } },
      { $count: 'count' },
    ]);

    return NextResponse.json({ success: true, rank: (rank[0]?.count ?? 0) + 1 });
  } catch (err) {
    console.error('[GAMES_SCORE]', err);
    return NextResponse.json({ error: 'Failed to save score.' }, { status: 500 });
  }
}
