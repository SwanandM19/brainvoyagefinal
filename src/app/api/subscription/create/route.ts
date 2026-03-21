// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import Razorpay from 'razorpay';
// import connectDB from '@/lib/db';
// import Subscription from '@/models/Subscription';
// import User from '@/models/User';

// export async function POST(req: NextRequest) {
//   try {
//     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
//     if (!token || token.role !== 'teacher') {
//       return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
//     }

//     await connectDB();

//     const teacherId = (token.id ?? token.sub) as string;

//     // Already paid — go to dashboard
//     const existing = await Subscription.findOne({ teacherId });
//     if (existing && existing.status === 'active') {
//       return NextResponse.json({ alreadyActive: true });
//     }

//     const user = await User.findById(teacherId).lean() as any;

//     const razorpay = new Razorpay({
//       key_id:     process.env.RAZORPAY_KEY_ID!,
//       key_secret: process.env.RAZORPAY_KEY_SECRET!,
//     });

//     // Create a simple one-time order for ₹200
//     const order = await razorpay.orders.create({
//       amount:   20000,   // ₹200 in paise
//       currency: 'INR',
//       receipt: `tchr_${teacherId.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
//       notes: {
//         teacherId,
//         teacherName:  user?.name  ?? '',
//         teacherEmail: token.email ?? '',
//         purpose:      'Teacher Onboarding Fee',
//       },
//     });

//     // Save pending record
//     await Subscription.findOneAndUpdate(
//       { teacherId },
//       {
//         teacherId,
//         razorpaySubscriptionId: order.id,   // storing orderId here
//         planId:  'one-time',
//         status:  'pending',
//         trialEndsAt: new Date(),
//       },
//       { upsert: true, new: true }
//     );

//     return NextResponse.json({
//       orderId:     order.id,
//       amount:      order.amount,
//       currency:    order.currency,
//       keyId:       process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//       teacherName:  user?.name  ?? '',
//       teacherEmail: token.email ?? '',
//     });

//   } catch (err: any) {
//     console.error('[PAYMENT_CREATE] Error:', err);
//     return NextResponse.json(
//       { error: err?.error?.description ?? err?.message ?? 'Failed to create payment.' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectDB();

    const teacherId = (token.id ?? token.sub) as string;

    // Auto-activate — free onboarding, no payment needed
    await Subscription.findOneAndUpdate(
      { teacherId },
      {
        teacherId,
        status:             'active',
        planId:             'free',
        currentPeriodStart: new Date(),
        currentPeriodEnd:   new Date('2099-12-31'), // far future = never expires
        trialEndsAt:        null,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, alreadyActive: false });

  } catch (err: any) {
    console.error('[SUBSCRIPTION_CREATE] Error:', err);
    return NextResponse.json({ error: 'Failed to activate subscription.' }, { status: 500 });
  }
}
