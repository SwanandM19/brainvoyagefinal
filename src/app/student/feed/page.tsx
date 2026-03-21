import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Video from '@/models/Video';
import Post from '@/models/Post';
import StudentFeedClient from '@/components/student/StudentFeedClient';

function StudentFeedFallback() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#9CA3AF]">Loading feed…</p>
      </div>
    </div>
  );
}

export default async function StudentFeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user)                  redirect('/auth/login');
  if (session.user.role !== 'student') redirect('/unauthorized');

  await connectDB();

  const student = await User.findOne({ email: session.user.email }).lean() as any;
  const followingIds  = (student?.following ?? []).map((id: any) => id.toString());
  const studentClass  = student?.studentClass ?? '';
  const studentBoard  = student?.studentBoard ?? '';
  const studentMongoId = student?._id?.toString() ?? '';

  // ── Videos ─────────────────────────────────────────────
  const videos = await Video.find({ status: 'active' })
    .sort({ views: -1, createdAt: -1 })
    .limit(60)
    .populate('teacherId', 'name subjects followersCount')
    .lean() as any[];

  const serializedVideos = videos.map((v) => ({
    id:          v._id.toString(),
    title:       v.title,
    description: v.description ?? '',
    videoUrl:    v.videoUrl,
    thumbnail:   v.thumbnail ?? null,
    subject:     v.subject,
    classes:     v.classes  ?? [],
    boards:      v.boards   ?? [],
    views:       v.views    ?? 0,
    rating:      v.rating   ?? 0,
    duration:    v.duration ?? 0,
    createdAt:   v.createdAt.toISOString(),
    isFollowed:  v.teacherId ? followingIds.includes((v.teacherId as any)._id.toString()) : false,
    sameClass:   v.classes?.includes(studentClass) ?? false,
    teacher: v.teacherId && typeof v.teacherId === 'object' ? {
      id:        (v.teacherId as any)._id.toString(),
      name:      (v.teacherId as any).name,
      subjects:  (v.teacherId as any).subjects  ?? [],
      followers: (v.teacherId as any).followersCount ?? 0,
    } : null,
  }));

  serializedVideos.sort((a, b) => {
    const scoreA = (a.isFollowed ? 100 : 0) + (a.sameClass ? 50 : 0) + (a.views * 0.001);
    const scoreB = (b.isFollowed ? 100 : 0) + (b.sameClass ? 50 : 0) + (b.views * 0.001);
    return scoreB - scoreA;
  });

  // ── Teacher community posts (photos + articles) ────────
  const rawPosts = await Post.find({
    status: 'active',
    type: { $in: ['photo', 'article'] },
    ...(studentClass ? { $or: [{ classes: studentClass }, { classes: { $size: 0 } }] } : {}),
  })
    .sort({ createdAt: -1 })
    .limit(40)
    .populate('teacherId', 'name image subjects')
    .lean() as any[];

  const serializedPosts = rawPosts.map((p) => ({
    id:         p._id.toString(),
    type:       p.type as 'photo' | 'article',
    title:      p.title    ?? '',
    body:       p.body     ?? '',
    photoUrl:   p.photoUrl ?? '',
    caption:    p.caption  ?? '',
    subject:    p.subject  ?? '',
    classes:    p.classes  ?? [],
    boards:     p.boards   ?? [],
    createdAt:  p.createdAt.toISOString(),
    liked:      Array.isArray(p.likes)
                  ? p.likes.some((id: any) => id.toString() === studentMongoId)
                  : false,
    likesCount: p.likesCount ?? 0,
    isFollowed: p.teacherId
                  ? followingIds.includes((p.teacherId as any)._id.toString())
                  : false,
    teacher: p.teacherId ? {
      id:       (p.teacherId as any)._id.toString(),
      name:     (p.teacherId as any).name,
      image:    (p.teacherId as any).image ?? null,
      subjects: (p.teacherId as any).subjects ?? [],
    } : null,
  }));

  const studentData = {
    name:           student?.name         ?? '',
    email:          session.user.email    ?? '',
    studentClass:   studentClass,
    studentBoard:   studentBoard,
    points:         student?.points       ?? 0,
    rank:           student?.rank         ?? 0,
    followingCount: followingIds.length,
    school:         student?.school       ?? '',
    city:           student?.city         ?? '',
  };

  return (
    <Suspense fallback={<StudentFeedFallback />}>
      <StudentFeedClient
        student={studentData}
        videos={serializedVideos}
        communityPosts={serializedPosts}
      />
    </Suspense>
  );
}
