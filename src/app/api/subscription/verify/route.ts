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
//       razorpay_payment_id,
//       razorpay_subscription_id,
//       razorpay_signature,
//     } = await req.json();

//     if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
//       return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
//     }

//     // Verify signature
//     // For Subscriptions: razorpay_payment_id + "|" + razorpay_subscription_id
//     const secret = process.env.RAZORPAY_KEY_SECRET!;
//     const body = `${razorpay_payment_id}|${razorpay_subscription_id}`;
//     const expected = crypto
//       .createHmac('sha256', secret)
//       .update(body)
//       .digest('hex');

//     if (expected !== razorpay_signature) {
//       console.error('[SUBSCRIPTION_VERIFY] Invalid signature');
//       return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
//     }

//     await connectDB();

//     const teacherId = (token.id ?? token.sub) as string;

//     // Mark as active
//     await Subscription.findOneAndUpdate(
//       { teacherId, razorpaySubscriptionId: razorpay_subscription_id },
//       {
//         status:   'active',
//         isActive: true,
//         currentPeriodStart: new Date(),
//         // trial period is 30 days, we can set tentative end
//         currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//       }
//     );

//     return NextResponse.json({ success: true });

//   } catch (err: any) {
//     console.error('[SUBSCRIPTION_VERIFY] Error:', err);
//     return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
//   }
// }

// import { NextResponse }     from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions }      from '@/lib/auth.config';
// import crypto               from 'crypto';
// import Subscription         from '@/models/Subscription';
// import connectDB            from '@/lib/db';   // ← change to your actual db file name
// import Teacher              from '@/models/Teacher';   // ← ADD THIS
// import Referral             from '@/models/Referral'; 

// export async function POST(req: Request) {
//   try {
//     // ── Auth ────────────────────────────────────────────────
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const {
//       razorpay_subscription_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = await req.json();

//     if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
//       return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
//     }

//     // ── Verify Razorpay signature ────────────────────────────
//     const body     = `${razorpay_payment_id}|${razorpay_subscription_id}`;
//     const expected = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
//       .update(body)
//       .digest('hex');

//     if (expected !== razorpay_signature) {
//       return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
//     }

//     // ── Mark as verified in DB ───────────────────────────────
//     await connectDB();
//     // await Subscription.findOneAndUpdate(
//     //   { razorpaySubscriptionId: razorpay_subscription_id },
//     //   {
//     //     status:   'trial',
//     //     isActive: true,
//     //   },
//     //   { returnDocument: 'after' }
//     // );

//     // return NextResponse.json({ success: true });
//         await Subscription.findOneAndUpdate(
//       { razorpaySubscriptionId: razorpay_subscription_id },
//       {
//         status:   'trial',
//         isActive: true,
//       },
//       { returnDocument: 'after' }
//     );

//     // ── Award 50 referral points to referrer ────────────────
//     const newTeacher = await Teacher.findOne({ userId: session.user.id });
//     if (newTeacher?.usedReferralCode) {
//       const alreadyCredited = await Referral.findOne({
//         referredUserId: session.user.id,
//         status:         'credited',
//       });
//       if (!alreadyCredited) {
//         const referrer = await Teacher.findOne({ referralCode: newTeacher.usedReferralCode });
//         if (referrer) {
//           referrer.referralPoints = (referrer.referralPoints ?? 0) + 50;
//           await referrer.save();
//           await Referral.create({
//             referrerId:     referrer.userId,
//             referredUserId: session.user.id,
//             code:           newTeacher.usedReferralCode,
//             status:         'credited',
//             pointsAwarded:  50,
//           });
//         }
//       }
//     }
//     // ── END referral block ──

//     return NextResponse.json({ success: true });

//   } catch (err: any) {
//     console.error('[subscription/verify]', err);
//     return NextResponse.json(
//       { error: err?.message ?? 'Verification failed' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth.config';
import crypto               from 'crypto';
import Subscription         from '@/models/Subscription';
import connectDB            from '@/lib/db';
import Teacher              from '@/models/Teacher';
import Referral             from '@/models/Referral';

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

    // ✅ FIXED — upsert by teacherId so it always saves correctly
    const trialEndsAt      = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    const currentPeriodEnd = new Date(trialEndsAt);

    await Subscription.findOneAndUpdate(
      { teacherId: session.user.id },          // ← find by teacherId
      {
        teacherId:              session.user.id,
        razorpaySubscriptionId: razorpay_subscription_id, // ← always save this
        status:                 'trial',
        isActive:               true,
        trialEndsAt,
        currentPeriodEnd,
        currentPeriodStart:     new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    // ── Award referral points on payment ──────────────────
    const newTeacher = await Teacher.findOne({ userId: session.user.id });
    if (newTeacher?.usedReferralCode) {
      const alreadyCredited = await Referral.findOne({
        referredUserId: session.user.id,
        status:         'credited',
      });

      if (!alreadyCredited) {
        const referrer = await Teacher.findOne({
          referralCode: newTeacher.usedReferralCode,
        });

        if (referrer) {
          referrer.referralPoints = (referrer.referralPoints ?? 0) + 50;
          await referrer.save();

          await Referral.create({
            referrerId:    referrer.userId,
            referredUserId: session.user.id,
            code:          newTeacher.usedReferralCode,
            status:        'credited',
            pointsAwarded: 50,
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[subscription/verify]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Verification failed' },
      { status: 500 }
    );
  }
}