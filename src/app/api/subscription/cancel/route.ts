// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import connectDB from '@/lib/db';
// import Subscription from '@/models/Subscription';
// import { getRazorpay } from '@/lib/razorpay';

// export async function POST(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
//   if (!token || token.role !== 'teacher') {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   await connectDB();
//   const teacherId = (token.id ?? token.sub) as string;
//   const sub = await Subscription.findOne({ teacherId });

//   if (!sub?.razorpaySubscriptionId) {
//     return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
//   }

//   const razorpay = getRazorpay();
//   await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, false);

//   await Subscription.findOneAndUpdate(
//     { teacherId },
//     { status: 'cancelled', isActive: false, cancelledAt: new Date() }
//   );

//   return NextResponse.json({ ok: true });
// }

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';
import razorpay from '@/lib/razorpay'; // ✅ default import

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const teacherId = (token.id ?? token.sub) as string;
    const sub = await Subscription.findOne({ teacherId });

    if (!sub?.razorpaySubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // ✅ Guard: already cancelled — don't call Razorpay again
    if (sub.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled.' },
        { status: 400 }
      );
    }

    // ✅ Cancel on Razorpay — false = cancel at end of billing cycle
    await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, false);

    // ✅ Update DB
    await Subscription.findOneAndUpdate(
      { teacherId },
      { status: 'cancelled', isActive: false, cancelledAt: new Date() }
    );

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error('[subscription/cancel]', err?.error ?? err);
    return NextResponse.json(
      { error: err?.error?.description ?? 'Cancellation failed' },
      { status: 500 }
    );
  }
}