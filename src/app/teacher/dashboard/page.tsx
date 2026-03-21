import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Video from '@/models/Video';
import Subscription from '@/models/Subscription';
import TeacherDashboardClient from '@/components/teacher/TeacherDashboardClient';

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user)                  redirect('/auth/login');
  if (session.user.role !== 'teacher') redirect('/unauthorized');
  if (session.user.teacherStatus !== 'approved') redirect('/teacher/pending');

  await connectDB();

  const teacher = await User.findOne({ email: session.user.email }).lean() as any;
  if (!teacher) redirect('/auth/login');

  // ── Subscription guard ───────────────────────────────
  const sub = await Subscription.findOne({ teacherId: teacher._id }).lean() as any;

  if (!sub) redirect('/teacher/subscription');
  if (sub.status !== 'active' && sub.status !== 'trial') redirect('/teacher/subscription');
  if (sub.status === 'trial' && new Date() > new Date(sub.trialEndsAt)) {
    redirect('/teacher/subscription?expired=true');
  }
  if (sub.status === 'cancelled' || sub.status === 'past_due') {
    redirect('/teacher/subscription?status=' + sub.status);
  }
  if (sub.status === 'pending') redirect('/teacher/subscription');
  // ── End subscription guard ───────────────────────────

  // ── Own videos ──────────────────────────────────────
  const videos = await Video.find({ teacherId: teacher._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean() as any[];

  const stats = {
    totalVideos:    videos.length,
    totalViews:     videos.reduce((s, v) => s + (v.views ?? 0), 0),
    totalFollowers: teacher?.followersCount ?? 0,
    avgRating:      videos.length
      ? (videos.reduce((s, v) => s + (v.rating ?? 0), 0) / videos.length).toFixed(1)
      : '0.0',
  };

  const serializedVideos = videos.map((v) => ({
    id:          v._id.toString(),
    title:       v.title,
    subject:     v.subject,
    views:       v.views       ?? 0,
    rating:      v.rating      ?? 0,
    status:      v.status      ?? 'active',
    createdAt:   v.createdAt.toISOString(),
    thumbnail:   v.thumbnail   ?? null,
    videoUrl:    v.videoUrl    ?? '',
    description: v.description ?? '',
  }));

  // ── Community feed (all approved videos from other teachers) ──
  const communityVideos = await Video.find({
    status: 'approved',
    teacherId: { $ne: teacher._id }, // exclude own videos for freshness
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('teacherId', 'name email')
    .lean() as any[];

  const serializedCommunity = communityVideos.map((v) => ({
    id:        v._id.toString(),
    title:     v.title,
    subject:   v.subject    ?? '',
    classes:   v.classes    ?? [],
    boards:    v.boards     ?? [],
    videoUrl:  v.videoUrl   ?? '',
    createdAt: v.createdAt.toISOString(),
    teacher: {
      id:    v.teacherId?._id?.toString() ?? '',
      name:  v.teacherId?.name            ?? 'Unknown',
      email: v.teacherId?.email           ?? '',
    },
  }));

  // ── Subscription info ────────────────────────────────
  const subInfo = {
    status:           sub.status as string,
    trialEndsAt:      sub.trialEndsAt
      ? new Date(sub.trialEndsAt).toISOString()
      : null,
    currentPeriodEnd: sub.currentPeriodEnd
      ? new Date(sub.currentPeriodEnd).toISOString()
      : null,
  };

  return (
    <TeacherDashboardClient
      teacher={{
        name:              teacher?.name              ?? '',
        email:             session.user.email         ?? '',
        subjects:          teacher?.subjects          ?? [],
        classes:           teacher?.classes           ?? [],
        boards:            teacher?.boards            ?? [],
        city:              teacher?.city              ?? '',
        state:             teacher?.state             ?? '',
        bio:               teacher?.bio               ?? '',
        yearsOfExperience: teacher?.yearsOfExperience ?? 0,
      }}
      stats={stats}
      videos={serializedVideos}
      subscription={subInfo}
      communityVideos={serializedCommunity}
    />
  );
}
