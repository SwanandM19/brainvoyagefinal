import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import GameScore from '@/models/GameScore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gameType: string }> }
) {
  try {
    const { gameType } = await params;
    const subject = req.nextUrl.searchParams.get('subject') ?? 'all';
    const token   = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    await connectDB();

    const matchFilter: any = { gameType };
    if (subject !== 'all') matchFilter.subject = subject;

    // Best score per user, top 50
    const leaderboard = await GameScore.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id:          '$userId',
          userName:     { $first: '$userName' },
          userInitials: { $first: '$userInitials' },
          avatarColor:  { $first: '$avatarColor' },
          score:        { $max: '$score' },
          streak:       { $max: '$streak' },
          accuracy:     { $max: '$accuracy' },
          gamesPlayed:  { $sum: 1 },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 50 },
    ]);

    const ranked = leaderboard.map((e, i) => ({ ...e, rank: i + 1 }));

    // Current user's personal best
    let myStats = null;
    if (token) {
      const userId = (token.mongoId ?? token.id) as string;
      const myBest = await GameScore.findOne(
        { userId, ...matchFilter },
        {},
        { sort: { score: -1 } }
      ).lean() as any;

      if (myBest) {
        const ahead = await GameScore.aggregate([
          { $match: matchFilter },
          { $group: { _id: '$userId', bestScore: { $max: '$score' } } },
          { $match: { bestScore: { $gt: myBest.score } } },
          { $count: 'count' },
        ]);
        myStats = {
          score:      myBest.score,
          rank:       (ahead[0]?.count ?? 0) + 1,
          streak:     myBest.streak,
          accuracy:   myBest.accuracy,
          gamesPlayed: await GameScore.countDocuments({ userId, gameType }),
        };
      }
    }

    return NextResponse.json({ leaderboard: ranked, myStats });
  } catch (err) {
    console.error('[LEADERBOARD]', err);
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
