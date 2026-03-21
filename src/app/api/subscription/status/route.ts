import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();

    const teacherId = (token.id ?? token.sub) as string;
    const sub = await Subscription.findOne({ teacherId }).lean() as any;

    if (!sub) return NextResponse.json({ hasSubscription: false });

    // Check if trial expired — demote to past_due
    if (sub.status === 'trial' && new Date() > new Date(sub.trialEndsAt)) {
      await Subscription.findOneAndUpdate(
        { teacherId },
        { status: 'past_due' }
      );
      return NextResponse.json({ hasSubscription: true, status: 'past_due' });
    }

    return NextResponse.json({
      hasSubscription: true,
      status:          sub.status,
      trialEndsAt:     sub.trialEndsAt,
      currentPeriodEnd: sub.currentPeriodEnd,
    });

  } catch (err) {
    console.error('[SUBSCRIPTION_STATUS]', err);
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
