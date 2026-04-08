
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';
import mongoose from 'mongoose';

const Teacher = mongoose.models.Teacher ??
  require('@/models/Teacher').default;

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const teacher = await Teacher.findOne({ userId: session.user.id });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if ((teacher.referralPoints ?? 0) < 100) {
      return NextResponse.json(
        { error: 'Need 100 points to redeem.' },
        { status: 400 }
      );
    }

    const sub = await Subscription.findOne({ teacherId: session.user.id });
    if (!sub || (sub.status !== 'active' && sub.status !== 'trial')) {
      return NextResponse.json(
        { error: 'An active subscription is required to redeem.' },
        { status: 400 }
      );
    } 

    // ✅ Just track in DB — refund issued when next payment hits
    teacher.referralPoints = (teacher.referralPoints ?? 0) - 100;
    teacher.freeMonthsEarned = (teacher.freeMonthsEarned ?? 0) + 1;
    teacher.pendingFreeMonths = (teacher.pendingFreeMonths ?? 0) + 1; // ← tracks pending refunds
    await teacher.save();

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[referral/redeem]', err?.error ?? err);
    return NextResponse.json(
      { error: err?.error?.description ?? 'Redemption failed' },
      { status: 500 }
    );
  }
}