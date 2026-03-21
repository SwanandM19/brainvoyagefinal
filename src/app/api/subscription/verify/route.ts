// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import crypto from 'crypto';
// import connectDB from '@/lib/db';
// import Subscription from '@/models/Subscription';

// export async function POST(req: NextRequest) {
//   try {
//     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
//     if (!token || token.role !== 'teacher') {
//       return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
//     }

//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = await req.json();

//     // Verify signature
//     const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
//     const expected = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
//       .update(body)
//       .digest('hex');

//     if (expected !== razorpay_signature) {
//       return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
//     }

//     await connectDB();

//     const teacherId = (token.id ?? token.sub) as string;

//     // Mark as active — teacher has paid
//     await Subscription.findOneAndUpdate(
//       { teacherId },
//       {
//         status:             'active',
//         razorpaySubscriptionId: razorpay_payment_id,  // store payment ID
//         currentPeriodStart: new Date(),
//       }
//     );

//     return NextResponse.json({ success: true });

//   } catch (err) {
//     console.error('[PAYMENT_VERIFY] Error:', err);
//     return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
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

    // Free period — just mark active, no signature verification needed
    await Subscription.findOneAndUpdate(
      { teacherId },
      {
        status:             'active',
        planId:             'free',
        currentPeriodStart: new Date(),
        currentPeriodEnd:   new Date('2099-12-31'),
        trialEndsAt:        null,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[SUBSCRIPTION_VERIFY] Error:', err);
    return NextResponse.json({ error: 'Activation failed.' }, { status: 500 });
  }
}
