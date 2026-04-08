

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth.config';
import crypto               from 'crypto';
import Subscription         from '@/models/Subscription';
import connectDB            from '@/lib/db';
// import Teacher              from '@/models/Teacher';
// import Referral             from '@/models/Referral';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      isReactivation,              // ← NEW: true when teacher is renewing after cancel
    } = await req.json();

    if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    // ── Verify Razorpay signature ──────────────────────────
    const body     = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await connectDB();

    // ── Build update payload based on flow type ────────────
    // First registration → 'trial' with 30-day free period
    // Reactivation       → 'active' immediately, no trial, ₹200 charged now
    let updatePayload: any;

    if (isReactivation) {
      // No trial — charge was ₹200 immediately
      updatePayload = {
        teacherId:              session.user.id,
        razorpaySubscriptionId: razorpay_subscription_id,
        status:                 'active',
        isActive:               true,
        trialEndsAt:            null,
        currentPeriodStart:     new Date(),
        currentPeriodEnd:       new Date(new Date().setMonth(new Date().getMonth() + 1)),
        cancelledAt:            null,
      };
    } else {
      // Fresh registration — 30-day free trial then ₹200/month
      const trialEndsAt      = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);
      const currentPeriodEnd = new Date(trialEndsAt);

      updatePayload = {
        teacherId:              session.user.id,
        razorpaySubscriptionId: razorpay_subscription_id,
        status:                 'trial',
        isActive:               true,
        trialEndsAt,
        currentPeriodEnd,
        currentPeriodStart:     new Date(),
      };
    }

    await Subscription.findOneAndUpdate(
      { teacherId: session.user.id },
      updatePayload,
      { upsert: true, returnDocument: 'after' }
    );

    // // ── Award referral points on first payment only ────────
    // if (!isReactivation) {
    //   const newTeacher = await Teacher.findOne({ userId: session.user.id });
    //   if (newTeacher?.usedReferralCode) {
    //     const alreadyCredited = await Referral.findOne({
    //       referredUserId: session.user.id,
    //       status:         'credited',
    //     });

    //     if (!alreadyCredited) {
    //       const referrer = await Teacher.findOne({
    //         referralCode: newTeacher.usedReferralCode,
    //       });

    //       if (referrer) {
    //         referrer.referralPoints = (referrer.referralPoints ?? 0) + 50;
    //         await referrer.save();

    //         await Referral.create({
    //           referrerId:     referrer.userId,
    //           referredUserId: session.user.id,
    //           code:           newTeacher.usedReferralCode,
    //           status:         'credited',
    //           pointsAwarded:  50,
    //         });
    //       }
    //     }
    //   }
    // }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[subscription/verify]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Verification failed' },
      { status: 500 }
    );
  }
}