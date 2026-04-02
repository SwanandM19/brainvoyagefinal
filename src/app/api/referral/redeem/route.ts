// import { NextResponse }     from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions }      from '@/lib/auth.config';
// import connectDB            from '@/lib/db';
// import Teacher              from '@/models/Teacher';
// import Subscription         from '@/models/Subscription';
// import Razorpay             from 'razorpay';

// const razorpay = new Razorpay({
//   key_id:     process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function POST() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await connectDB();

//     const teacher = await Teacher.findOne({ userId: session.user.id });
//     if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

//     if ((teacher.referralPoints ?? 0) < 100) {
//       return NextResponse.json({ error: 'Need 100 points to redeem.' }, { status: 400 });
//     }

//     const sub = await Subscription.findOne({ teacherId: session.user.id });
//     if (!sub?.razorpaySubscriptionId) {
//       return NextResponse.json({ error: 'No active subscription found.' }, { status: 404 });
//     }

//     // Pause Razorpay subscription for 30 days = 1 free month
//     const resumeAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
//     await (razorpay.subscriptions as any).pause(sub.razorpaySubscriptionId, {
//       pause_at: 'now', resume_at: resumeAt,
//     });

//     teacher.referralPoints   = (teacher.referralPoints ?? 0) - 100;
//     teacher.freeMonthsEarned = (teacher.freeMonthsEarned ?? 0) + 1;
//     await teacher.save();

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error('[referral/redeem]', err);
//     return NextResponse.json({ error: err?.error?.description ?? 'Redemption failed' }, { status: 500 });
//   }
// }


// import { NextResponse }     from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions }      from '@/lib/auth.config';
// import connectDB            from '@/lib/db';
// import Subscription         from '@/models/Subscription';
// import Razorpay             from 'razorpay';
// import mongoose             from 'mongoose';

// const razorpay = new Razorpay({
//   key_id:     process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// // ✅ Safe Teacher model access — avoids duplicate model error
// const Teacher = mongoose.models.Teacher ?? 
//   require('@/models/Teacher').default;

// export async function POST() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await connectDB();

//     const teacher = await Teacher.findOne({ userId: session.user.id });
//     if (!teacher) {
//       return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
//     }

//     if ((teacher.referralPoints ?? 0) < 100) {
//       return NextResponse.json(
//         { error: 'Need 100 points to redeem.' },
//         { status: 400 }
//       );
//     }

//     const sub = await Subscription.findOne({ teacherId: session.user.id });
//     if (!sub?.razorpaySubscriptionId) {
//       return NextResponse.json(
//         { error: 'No active subscription found.' },
//         { status: 404 }
//       );
//     }

//     // ✅ Fetch current subscription from Razorpay
//     const rzpSub = await razorpay.subscriptions.fetch(
//       sub.razorpaySubscriptionId
//     ) as any;

//     // ✅ Push next charge date forward by 30 days (no pause_at / resume_at)
//     const currentChargeAt = rzpSub.charge_at
//       ? new Date(rzpSub.charge_at * 1000)
//       : new Date();
//     currentChargeAt.setDate(currentChargeAt.getDate() + 30);

//     await (razorpay.subscriptions as any).update(
//       sub.razorpaySubscriptionId,
//       { charge_at: Math.floor(currentChargeAt.getTime() / 1000) }
//     );

//     // ✅ Deduct 100 points and increment free months
//     teacher.referralPoints   = (teacher.referralPoints   ?? 0) - 100;
//     teacher.freeMonthsEarned = (teacher.freeMonthsEarned ?? 0) + 1;
//     await teacher.save();

//     return NextResponse.json({ success: true });

//   } catch (err: any) {
//     console.error('[referral/redeem]', err?.error ?? err);
//     return NextResponse.json(
//       { error: err?.error?.description ?? 'Redemption failed' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth.config';
import connectDB            from '@/lib/db';
import Subscription         from '@/models/Subscription';
import mongoose             from 'mongoose';

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
    if (!sub) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 }
      );
    }

    // ✅ Just track in DB — refund issued when next payment hits
    teacher.referralPoints        = (teacher.referralPoints   ?? 0) - 100;
    teacher.freeMonthsEarned      = (teacher.freeMonthsEarned ?? 0) + 1;
    teacher.pendingFreeMonths     = (teacher.pendingFreeMonths ?? 0) + 1; // ← tracks pending refunds
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