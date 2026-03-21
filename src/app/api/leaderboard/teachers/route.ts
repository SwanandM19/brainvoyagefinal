import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const subject = searchParams.get('subject') ?? 'all';
    const sortBy  = searchParams.get('sortBy')  ?? 'views';
    const limit   = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    // ── Build video match — use BOTH statuses to be safe ──
    const videoMatch: any = { status: { $in: ['active', 'approved'] } };
    if (subject !== 'all') videoMatch.subject = subject;

    const teachers = await Video.aggregate([
      { $match: videoMatch },
      {
        $group: {
          _id:         '$teacherId',
          totalViews:  { $sum: '$views' },
          videoCount:  { $sum: 1 },
          totalLikes:  { $sum: { $size: { $ifNull: ['$likes', []] } } },
          avgRating:   { $avg: '$rating' },
          subjects:    { $addToSet: '$subject' },
          latestVideo: { $max: '$createdAt' },
        },
      },
      // Convert _id to ObjectId in case it's stored as string
      {
        $addFields: {
          teacherObjId: {
            $cond: {
              if:   { $eq: [{ $type: '$_id' }, 'objectId'] },
              then: '$_id',
              else: { $toObjectId: '$_id' },
            },
          },
        },
      },
      {
        $lookup: {
          from:         'users',
          localField:   'teacherObjId',
          foreignField: '_id',
          as:           'teacher',
        },
      },
      { $unwind: '$teacher' },
      { $match: { 'teacher.teacherStatus': 'approved' } },
      {
        $project: {
          teacherId:      { $toString: '$_id' },
          name:           '$teacher.name',
          image:          '$teacher.image',
          bio:            '$teacher.bio',
          subjects:       '$teacher.subjects',
          followersCount: { $size: { $ifNull: ['$teacher.followers', []] } }, // ← real array length
          followers:      '$teacher.followers', // ← include for isFollowing check
          totalViews:     1,
          videoCount:     1,
          totalLikes:     1,
          avgRating:      { $round: ['$avgRating', 1] },
          latestVideo:    1,
          engagementRate: {
            $multiply: [
              {
                $divide: [
                  { $add: [
                    { $ifNull: ['$totalLikes', 0] },
                    { $multiply: [{ $size: { $ifNull: ['$teacher.followers', []] } }, 2] }
                  ]},
                  { $max: ['$totalViews', 1] },
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $sort: sortBy === 'likes'      ? { totalLikes:     -1 }
             : sortBy === 'followers'  ? { followersCount: -1 }
             : sortBy === 'rating'     ? { avgRating:      -1 }
             : sortBy === 'engagement' ? { engagementRate: -1 }
             : sortBy === 'videos'     ? { videoCount:     -1 }
             :                          { totalViews:      -1 },
      },
      { $limit: limit },
    ]);

    // Add rank + isFollowing for the current student
    const studentId = token?.sub ?? token?.mongoId ?? null;

    const ranked = teachers.map((t, i) => {
      const isFollowing = studentId
        ? (t.followers ?? []).map(String).includes(String(studentId))
        : false;
      const { followers, ...rest } = t; // strip raw array from response
      return {
        ...rest,
        rank:           i + 1,
        avgRating:      t.avgRating      ?? 0,
        engagementRate: parseFloat((t.engagementRate ?? 0).toFixed(2)),
        isFollowing,                     // ← now included
      };
    });

    // Teacher's own stats (if logged in as teacher)
    let myStats = null;
    if (token && token.role === 'teacher') {
      const myEntry = ranked.find(t =>
        t.teacherId?.toString() === String(token.sub ?? token.mongoId ?? token.id)
      );
      if (myEntry) {
        myStats = {
          rank:           myEntry.rank,
          totalViews:     myEntry.totalViews,
          totalLikes:     myEntry.totalLikes,
          videoCount:     myEntry.videoCount,
          followersCount: myEntry.followersCount,
          engagementRate: myEntry.engagementRate,
          avgRating:      myEntry.avgRating,
        };
      } else {
        const me = await User.findOne({ email: token.email })
          .select('name followers followersCount').lean() as any;
        if (me) {
          myStats = {
            rank:           null,
            totalViews:     0,
            totalLikes:     0,
            videoCount:     0,
            followersCount: (me.followers ?? []).length,
            engagementRate: 0,
            avgRating:      0,
          };
        }
      }
    }

    const totalTeachers = await User.countDocuments({ role: 'teacher', teacherStatus: 'approved' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const [viewSum]     = await Video.aggregate([
      { $match: { status: { $in: ['active', 'approved'] } } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);

    return NextResponse.json({
      teachers: ranked,
      myStats,
      meta: { totalTeachers, totalStudents, totalViews: viewSum?.total ?? 0, subject, sortBy },
    });
  } catch (err) {
    console.error('[TEACHER_LEADERBOARD]', err);
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
