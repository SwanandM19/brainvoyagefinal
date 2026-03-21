import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';
import GameScore from '@/models/GameScore';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params;
    await connectDB();

    const teacher = await User.findById(teacherId)
      .select('name image bio subjects classes boards qualifications yearsOfExperience followersCount followingCount totalViews')
      .lean() as any;

    if (!teacher) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    const id = new mongoose.Types.ObjectId(teacherId);

    // All active videos by this teacher
    const videos = await Video.find({ teacherId: id, status: 'active' })
      .select('title subject views likes rating createdAt thumbnail')
      .sort({ views: -1 })
      .lean() as any[];

    const totalViews = videos.reduce((s, v) => s + (v.views ?? 0), 0);
    const totalLikes = videos.reduce((s, v) => s + (Array.isArray(v.likes) ? v.likes.length : 0), 0);
    const avgRating  = videos.length > 0
      ? parseFloat((videos.reduce((s, v) => s + (v.rating ?? 0), 0) / videos.length).toFixed(1))
      : 0;

    // Subject breakdown
    const subjectMap: Record<string, { views: number; videos: number }> = {};
    videos.forEach(v => {
      if (!subjectMap[v.subject]) subjectMap[v.subject] = { views: 0, videos: 0 };
      subjectMap[v.subject].views  += v.views ?? 0;
      subjectMap[v.subject].videos += 1;
    });

    // Growth trend — views grouped by week (last 8 weeks)
    const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000);
    const weeklyTrend = await Video.aggregate([
      { $match: { teacherId: id, status: 'active', createdAt: { $gte: eightWeeksAgo } } },
      {
        $group: {
          _id: {
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          views:  { $sum: '$views' },
          videos: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    return NextResponse.json({
      teacher: {
        id:              teacherId,
        name:            teacher.name,
        image:           teacher.image,
        bio:             teacher.bio,
        subjects:        teacher.subjects ?? [],
        classes:         teacher.classes  ?? [],
        boards:          teacher.boards   ?? [],
        qualifications:  teacher.qualifications,
        yearsOfExp:      teacher.yearsOfExperience,
        followersCount:  teacher.followersCount ?? 0,
      },
      stats: {
        totalViews,
        totalLikes,
        videoCount: videos.length,
        avgRating,
        engagementRate: parseFloat(((totalLikes + (teacher.followersCount ?? 0) * 2) / Math.max(totalViews, 1) * 100).toFixed(2)),
      },
      topVideos:    videos.slice(0, 5).map(v => ({
        id:        v._id.toString(),
        title:     v.title,
        subject:   v.subject,
        views:     v.views,
        likes:     Array.isArray(v.likes) ? v.likes.length : 0,
        rating:    v.rating,
        thumbnail: v.thumbnail,
      })),
      subjectBreakdown: Object.entries(subjectMap).map(([subject, data]) => ({ subject, ...data })).sort((a, b) => b.views - a.views),
      weeklyTrend,
    });
  } catch (err) {
    console.error('[TEACHER_PROFILE]', err);
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
