import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role   = searchParams.get('role') ?? 'student'; // 'student' | 'teacher'
    const search = searchParams.get('search') ?? '';
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit  = 50;

    await connectDB();

    const query: any = { role };
    if (search.trim()) {
      query.$or = [
        { name:  { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v')
        .lean(),
      User.countDocuments(query),
    ]);

    const serialized = users.map((u: any) => ({
      id:                   u._id.toString(),
      name:                 u.name,
      email:                u.email,
      image:                u.image ?? null,
      role:                 u.role,
      // Teacher fields
      teacherStatus:        u.teacherStatus        ?? null,
      subjects:             u.subjects             ?? [],
      classes:              u.classes              ?? [],
      boards:               u.boards               ?? [],
      qualifications:       u.qualifications       ?? '',
      yearsOfExperience:    u.yearsOfExperience    ?? null,
      followersCount:       u.followersCount        ?? 0,
      totalViews:           u.totalViews            ?? 0,
      bio:                  u.bio                  ?? '',
      city:                 u.city                 ?? '',
      state:                u.state                ?? '',
      onboardingCompleted:  u.onboardingCompleted  ?? false,
      profileVideoUrl:      u.profileVideoUrl      ?? '',
      // Student fields
      studentClass:         u.studentClass         ?? '',
      studentBoard:         u.studentBoard         ?? '',
      school:               u.school               ?? '',
      // Shared
      points:               u.points               ?? 0,
      badges:               u.badges               ?? [],
      followingCount:       u.followingCount        ?? 0,
      createdAt:            u.createdAt.toISOString(),
    }));

    return NextResponse.json({
      users:      serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error('[ADMIN_USERS]', err);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}
