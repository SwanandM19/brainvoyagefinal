import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();

    const now             = new Date();
    const sevenDaysAgo    = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo   = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const raw = await Video.aggregate([
      {
        $group: {
          _id:               '$teacherId',
          totalVideos:       { $sum: 1 },
          totalViews:        { $sum: '$views' },
          // likes is an array of ObjectIds — count actual likes
          totalLikes:        { $sum: { $size: '$likes' } },
          // weighted average so rating is meaningful
          ratingWeightedSum: { $sum: { $multiply: ['$rating', '$ratingCount'] } },
          totalRatingCount:  { $sum: '$ratingCount' },
          lastUploadDate:    { $max: '$createdAt' },
          subjects:          { $push: '$subject' },
          videosLast7Days: {
            $sum: { $cond: [{ $gte: ['$createdAt', sevenDaysAgo] }, 1, 0] },
          },
          videosLast30Days: {
            $sum: { $cond: [{ $gte: ['$createdAt', thirtyDaysAgo] }, 1, 0] },
          },
        },
      },
      // Join teacher info
      {
        $lookup: {
          from:         'users',
          localField:   '_id',
          foreignField: '_id',
          as:           'teacher',
        },
      },
      { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id:           0,
          teacherId:     { $toString: '$_id' },
          name:          { $ifNull: ['$teacher.name',          'Unknown'] },
          email:         { $ifNull: ['$teacher.email',         '']        },
          teacherStatus: { $ifNull: ['$teacher.teacherStatus', '']        },
          totalVideos:   1,
          totalViews:    1,
          totalLikes:    1,
          avgRating: {
            $cond: [
              { $gt: ['$totalRatingCount', 0] },
              { $round: [{ $divide: ['$ratingWeightedSum', '$totalRatingCount'] }, 1] },
              0,
            ],
          },
          lastUploadDate:   1,
          subjects:         1,
          videosLast7Days:  1,
          videosLast30Days: 1,
        },
      },
      { $sort: { totalVideos: -1 } },
    ]);

    // Compute topSubject per teacher in JS (simpler than $reduce in aggregation)
    const stats = raw.map(s => {
      const freq: Record<string, number> = {};
      for (const sub of (s.subjects as string[] ?? [])) {
        freq[sub] = (freq[sub] ?? 0) + 1;
      }
      const topSubject =
        Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const { subjects, ...rest } = s;
      return { ...rest, topSubject };
    });

    return NextResponse.json({ stats });
  } catch (err) {
    console.error('[ADMIN_TEACHER_STATS]', err);
    return NextResponse.json({ error: 'Failed to fetch stats.' }, { status: 500 });
  }
}