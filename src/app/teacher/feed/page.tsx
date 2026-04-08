import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Video from '@/models/Video';
import Post from '@/models/Post';
import Subscription from '@/models/Subscription';
import TeacherFeedClient from '@/components/teacher/TeacherFeedClient';

export default async function TeacherFeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/auth/login');
  if (session.user.role !== 'teacher') redirect('/unauthorized');
  if (session.user.teacherStatus !== 'approved') redirect('/teacher/pending');

  await connectDB();

  const teacher = await User.findOne({ email: session.user.email }).lean() as any;
  if (!teacher) redirect('/auth/login');

  // ── Read real subscription from DB (no auto-overwriting) ──
  const sub = await Subscription.findOne({ teacherId: teacher._id }).lean() as any;

  // ── Own videos ────────────────────────────────────────────
  const ownVideosDocs = await Video.find({ teacherId: teacher._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean() as any[];

  const stats = {
    totalVideos: ownVideosDocs.length,
    totalViews: ownVideosDocs.reduce((s: number, v: any) => s + (v.views ?? 0), 0),
    totalFollowers: (teacher.followers ?? []).length,
    totalLikes: ownVideosDocs.reduce((s: number, v: any) => s + (v.likes?.length ?? 0), 0),
    avgRating: ownVideosDocs.length
      ? (ownVideosDocs.reduce((s: number, v: any) => s + (v.rating ?? 0), 0) / ownVideosDocs.length).toFixed(1)
      : '0.0',
  };

  const serializedOwnVideos = ownVideosDocs.map((v) => ({
    id: v._id.toString(),
    title: v.title ?? '',
    subject: v.subject ?? '',
    classes: v.classes ?? [],
    boards: v.boards ?? [],
    views: v.views ?? 0,
    rating: v.rating ?? 0,
    status: v.status ?? 'active',
    createdAt: v.createdAt.toISOString(),
    thumbnail: v.thumbnail ?? null,
    videoUrl: v.videoUrl ?? '',
    description: v.description ?? '',
  }));

  // ── Community videos ──────────────────────────────────────
  const communityDocs = await Video.find({
    status: { $in: ['active', 'approved'] },
    teacherId: { $ne: teacher._id },
  })
    .sort({ createdAt: -1 })
    .limit(80)
    .populate('teacherId', 'name image subjects')
    .lean() as any[];

  const serializedCommunity = communityDocs.map((v) => ({
    id: v._id.toString(),
    title: v.title ?? '',
    description: v.description ?? '',
    videoUrl: v.videoUrl ?? '',
    thumbnail: v.thumbnail ?? null,
    subject: v.subject ?? '',
    classes: v.classes ?? [],
    boards: v.boards ?? [],
    views: v.views ?? 0,
    rating: v.rating ?? 0,
    duration: v.duration ?? 0,
    createdAt: v.createdAt.toISOString(),
    teacher: {
      id: v.teacherId?._id?.toString() ?? '',
      name: v.teacherId?.name ?? 'Unknown',
      image: v.teacherId?.image ?? null,
      subjects: v.teacherId?.subjects ?? [],
    },
  }));

  // ── Community posts (photos + articles) ──────────────────
  const communityPostDocs = await Post.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(80)
    .populate('teacherId', 'name image subjects')
    .lean() as any[];

  const serializedCommunityPosts = communityPostDocs.map((p) => ({
    id: p._id.toString(),
    type: p.type ?? 'article',
    title: p.title ?? '',
    body: p.body ?? '',
    photoUrl: p.photoUrl ?? '',
    caption: p.caption ?? '',
    subject: p.subject ?? '',
    classes: p.classes ?? [],
    boards: p.boards ?? [],
    createdAt: p.createdAt.toISOString(),
    likesCount: p.likes?.length ?? 0,
    teacher: {
      id: p.teacherId?._id?.toString() ?? '',
      name: p.teacherId?.name ?? 'Unknown',
      image: p.teacherId?.image ?? null,
      subjects: p.teacherId?.subjects ?? [],
    },
  }));

  // ── Real subscription info from DB ────────────────────────
  const subInfo = {
    status:           sub?.status           ?? 'trial',
    trialEndsAt:      sub?.trialEndsAt      ? new Date(sub.trialEndsAt).toISOString()      : null,
    currentPeriodStart: sub?.currentPeriodStart ? new Date(sub.currentPeriodStart).toISOString() : null,
    currentPeriodEnd: sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
  };

  return (
    <TeacherFeedClient
      teacher={{
        id: teacher._id.toString(),
        name: teacher.name ?? '',
        email: session.user.email ?? '',
        image: teacher.image ?? null,
        subjects: teacher.subjects ?? [],
        classes: teacher.classes ?? [],
        boards: teacher.boards ?? [],
        bio: teacher.bio ?? '',
        city: teacher.city ?? '',
        state: teacher.state ?? '',
        yearsOfExperience: teacher.yearsOfExperience ?? 0,
        freeMonthsEarned: teacher.freeMonthsEarned ?? 0,
        pendingFreeMonths: teacher.pendingFreeMonths ?? 0,
      }}
      stats={stats}
      ownVideos={serializedOwnVideos}
      subscription={subInfo}
      communityVideos={serializedCommunity}
      communityPosts={serializedCommunityPosts}
    />
  );
}