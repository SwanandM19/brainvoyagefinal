import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const subject  = searchParams.get('subject') ?? 'Mathematics';
    const count    = Math.min(parseInt(searchParams.get('count') ?? '15'), 30);
    const gameType = searchParams.get('gameType') ?? 'blitz';

    await connectDB();

    let questions = await Question.aggregate([
      { $match: { subject, gameTypes: gameType } },
      { $sample: { size: count } },
      { $project: { explanation: 0, __v: 0 } },
    ]);

    // Fallback: if not enough questions for this subject, pull from any subject
    if (questions.length < count) {
      const existing = questions.map((q: any) => q._id.toString());
      const fallback = await Question.aggregate([
        { $match: { gameTypes: gameType, _id: { $nin: existing.map((id: string) => new (require('mongoose').Types.ObjectId)(id)) } } },
        { $sample: { size: count - questions.length } },
        { $project: { explanation: 0, __v: 0 } },
      ]);
      questions = [...questions, ...fallback];
    }

    return NextResponse.json({ questions, total: questions.length });
  } catch (err) {
    console.error('[GAMES_QUESTIONS]', err);
    return NextResponse.json({ error: 'Failed to fetch questions.' }, { status: 500 });
  }
}
