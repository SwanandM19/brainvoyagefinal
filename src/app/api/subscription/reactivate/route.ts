

import { NextRequest, NextResponse } from 'next/server';
import { getToken }                  from 'next-auth/jwt';
import connectDB                     from '@/lib/db';
import Subscription                  from '@/models/Subscription';
import razorpay                      from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const teacherId = (token.id ?? token.sub) as string;

    // ✅ Create a brand new Razorpay subscription (no trial this time)
    const rzpSub = await razorpay.subscriptions.create({
      plan_id:         process.env.RAZORPAY_PLAN_ID!,
      total_count:     12,
      quantity:        1,
      customer_notify: 1,
      notes: {
        teacherId,
        email: token.email ?? '',
      },
    });

    // ✅ Update DB with new subscription ID
    await Subscription.findOneAndUpdate(
      { teacherId },
      {
        razorpaySubscriptionId: rzpSub.id,
        status:                 'created',
        isActive:               false,
        cancelledAt:            null,
      },
      { upsert: true }
    );

    // ✅ Return subscription ID + key for frontend checkout
    return NextResponse.json({
      subscriptionId: rzpSub.id,
      razorpayKeyId:  process.env.RAZORPAY_KEY_ID,
    });

  } catch (err: any) {
    console.error('[subscription/reactivate]', err?.error ?? err);
    return NextResponse.json(
      { error: err?.error?.description ?? 'Reactivation failed' },
      { status: 500 }
    );
  }
}