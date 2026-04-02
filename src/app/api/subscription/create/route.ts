// // import { NextRequest, NextResponse } from 'next/server';
// // import { getToken } from 'next-auth/jwt';
// // import Razorpay from 'razorpay';
// // import connectDB from '@/lib/db';
// // import Subscription from '@/models/Subscription';
// // import User from '@/models/User';

// // export async function POST(req: NextRequest) {
// //   try {
// //     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
// //     if (!token || token.role !== 'teacher') {
// //       return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
// //     }

// //     await connectDB();

// //     const teacherId = (token.id ?? token.sub) as string;

// //     // Already paid — go to dashboard
// //     const existing = await Subscription.findOne({ teacherId });
// //     if (existing && existing.status === 'active') {
// //       return NextResponse.json({ alreadyActive: true });
// //     }

// //     const user = await User.findById(teacherId).lean() as any;

// //     const razorpay = new Razorpay({
// //       key_id:     process.env.RAZORPAY_KEY_ID!,
// //       key_secret: process.env.RAZORPAY_KEY_SECRET!,
// //     });

// //     // Create a simple one-time order for ₹200
// //     const order = await razorpay.orders.create({
// //       amount:   20000,   // ₹200 in paise
// //       currency: 'INR',
// //       receipt: `tchr_${teacherId.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
// //       notes: {
// //         teacherId,
// //         teacherName:  user?.name  ?? '',
// //         teacherEmail: token.email ?? '',
// //         purpose:      'Teacher Onboarding Fee',
// //       },
// //     });

// //     // Save pending record
// //     await Subscription.findOneAndUpdate(
// //       { teacherId },
// //       {
// //         teacherId,
// //         razorpaySubscriptionId: order.id,   // storing orderId here
// //         planId:  'one-time',
// //         status:  'pending',
// //         trialEndsAt: new Date(),
// //       },
// //       { upsert: true, new: true }
// //     );

// //     return NextResponse.json({
// //       orderId:     order.id,
// //       amount:      order.amount,
// //       currency:    order.currency,
// //       keyId:       process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
// //       teacherName:  user?.name  ?? '',
// //       teacherEmail: token.email ?? '',
// //     });

// //   } catch (err: any) {
// //     console.error('[PAYMENT_CREATE] Error:', err);
// //     return NextResponse.json(
// //       { error: err?.error?.description ?? err?.message ?? 'Failed to create payment.' },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import connectDB from '@/lib/db';
// import Subscription from '@/models/Subscription';
// import User from '@/models/User';
// import { getRazorpay } from '@/lib/razorpay';

// export async function POST(req: NextRequest) {
//   try {
//     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
//     if (!token || token.role !== 'teacher') {
//       return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
//     }

//     const { autopay } = await req.json();

//     await connectDB();

//     const teacherId = (token.id ?? token.sub) as string;

//     // Already active?
//     const existing = await Subscription.findOne({ teacherId });
//     if (existing && existing.isActive) {
//       return NextResponse.json({ alreadyActive: true });
//     }

//     const user = await User.findById(teacherId).lean() as any;
//     if (!user) {
//       return NextResponse.json({ error: 'User not found.' }, { status: 404 });
//     }

//     if (!autopay) {
//       // If not autopay, maybe we still activate trial? 
//       // The prompt says "integrate a payment step... receive one free month and then automatically charged"
//       // This implies the autopay is mandatory for the trial.
//       return NextResponse.json({ error: 'Autopay is required for the 30-day trial.' }, { status: 400 });
//     }

//     const razorpay = getRazorpay();
//     let planId = process.env.RAZORPAY_PLAN_ID?.trim();
    
//     // If planId is missing or looks like a placeholder (doesn't start with 'plan_')
//     if (!planId || !planId.startsWith('plan_')) {
//       console.warn('[SUBSCRIPTION_CREATE] RAZORPAY_PLAN_ID missing or invalid. Attempting to fetch or create plan.');
      
//       const { TEACHER_PLAN } = await import('@/lib/razorpay');
      
//       // Try to fetch existing plans to find a match
//       try {
//         console.log('[SUBSCRIPTION_CREATE] Fetching existing plans...');
//         const plans = await razorpay.plans.all() as any;
//         const existing = plans.items?.find((p: any) => 
//           p.item.name === TEACHER_PLAN.name && 
//           p.item.amount === TEACHER_PLAN.amount
//         );
//         if (existing) {
//           planId = existing.id;
//           console.log('[SUBSCRIPTION_CREATE] Found existing plan match:', planId);
//         }
//       } catch (err: any) {
//         console.error('[SUBSCRIPTION_CREATE] plans.all() failed:', err?.error?.description ?? err.message ?? err);
//       }

//       // If still no valid planId, create it
//       if (!planId || !planId.startsWith('plan_')) {
//         try {
//           console.log('[SUBSCRIPTION_CREATE] Creating new plan: ', TEACHER_PLAN.name);
//           // const newPlan = await razorpay.plans.create({
//           //   period:   TEACHER_PLAN.period as any,
//           //   interval: TEACHER_PLAN.interval,
//           //   item: {
//           //     name:        TEACHER_PLAN.name,
//           //     amount:      TEACHER_PLAN.amount,
//           //     currency:    TEACHER_PLAN.currency,
//           //     description: TEACHER_PLAN.description,
//           //   },
//           // });
//           const newPlan = await razorpay.plans.create({
//             period:            TEACHER_PLAN.period as any,
//             interval:          TEACHER_PLAN.interval,
//             trial_period_days: TEACHER_PLAN.trial_period_days,  // ← ADD THIS
//             item: {
//               name:        TEACHER_PLAN.name,
//               amount:      TEACHER_PLAN.amount,
//               currency:    TEACHER_PLAN.currency,
//               description: TEACHER_PLAN.description,
//             },
//           } as any);
//           planId = newPlan.id;
//           console.log('[SUBSCRIPTION_CREATE] Successfully created new plan:', planId);
//         } catch (err: any) {
//           console.error('[SUBSCRIPTION_CREATE] plans.create() failed:', err?.error?.description ?? err.message ?? err);
//           return NextResponse.json({ 
//             error: 'Failed to configure subscription plan automatically.',
//             details: err?.error?.description ?? err.message ?? 'Unknown error'
//           }, { status: 500 });
//         }
//       }
//     }

//     if (!planId || !planId.startsWith('plan_')) {
//        return NextResponse.json({ error: 'No valid Razorpay Plan ID available.' }, { status: 500 });
//     }

//     // Create Razorpay Subscription with 1-month trial
//     try {
//       console.log('[SUBSCRIPTION_CREATE] Creating subscription for plan:', planId);
//       // const subscription = await razorpay.subscriptions.create({
//       //   plan_id: planId,
//       //   total_count: 60, // 5 years
//       //   quantity: 1,
//       //   customer_notify: 1,
//       //   // start_at: Math.floor(Date.now() / 1000), // Optional if status is created/authenticated
//       //   trial_period_days: 30,
//       //   notes: {
//       //     teacherId,
//       //     teacherName: user.name,
//       //     teacherEmail: user.email,
//       //   },
//       // } as any);
//       const subscription = await razorpay.subscriptions.create({
//   plan_id: planId,
//   total_count: 60,
//   quantity: 1,
//   customer_notify: 1,
//   notes: {
//     teacherId,
//     teacherName: user.name,
//     teacherEmail: user.email,
//   },
// } as any);

//       // Save pending record
//       await Subscription.findOneAndUpdate(
//         { teacherId },
//         {
//           teacherId,
//           razorpaySubscriptionId: subscription.id,
//           planId: planId,
//           status: 'pending',
//           isActive: false,
//           trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         },
//         { upsert: true, new: true }
//       );

//       return NextResponse.json({
//         subscriptionId: subscription.id,
//         razorpayKeyId: process.env.RAZORPAY_KEY_ID!,
//         teacherName: user.name,
//         teacherEmail: user.email,
//       });
//     } catch (err: any) {
//       console.error('[SUBSCRIPTION_CREATE] subscriptions.create() failed:', err?.error?.description ?? err.message ?? err);
//       throw err; // caught by outer block
//     }

//   } catch (err: any) {
//     console.error('[SUBSCRIPTION_CREATE] Error:', err);
//     return NextResponse.json(
//       { error: err?.error?.description ?? err?.message ?? 'Failed to create subscription.' },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// // import { authOptions } from '@/lib/auth';
// import { authOptions } from '@/lib/auth.config';
// import { getRazorpay, getOrCreatePlan } from '@/lib/razorpay';
// // import dbConnect from '@/lib/db';
// import connectDB from '@/lib/db';
// import Subscription from '@/models/Subscription';

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();

//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await req.json();
//     const { teacherId, teacherEmail, teacherName } = body;

//     if (!teacherId || !teacherEmail) {
//       return NextResponse.json({ error: 'Missing teacherId or teacherEmail' }, { status: 400 });
//     }

//     // Check if subscription already exists
//     const existing = await Subscription.findOne({ teacherId });
//     if (existing?.razorpaySubscriptionId) {
//       return NextResponse.json({
//         subscriptionId: existing.razorpaySubscriptionId,
//         razorpayKeyId: process.env.RAZORPAY_KEY_ID,
//         alreadyExists: true,
//       });
//     }

//     // Get or auto-create the ₹200/month plan
//     const planId = await getOrCreatePlan();

//     // Create Razorpay subscription with 30-day free trial
//     const razorpay = getRazorpay();
//     const trialStart = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

//     const subscription = await razorpay.subscriptions.create({
//       plan_id: planId,
//       total_count: 12, // 12 months, change to 0 for indefinite
//       customer_notify: 1,
//       start_at: trialStart,
//       addons: [],
//       notes: {
//         teacherId,
//         teacherEmail,
//         teacherName: teacherName || '',
//       },
//     });

//     // Save to DB
//     await Subscription.findOneAndUpdate(
//       { teacherId },
//       {
//         teacherId,
//         teacherEmail,
//         razorpaySubscriptionId: subscription.id,
//         planId,
//         status: 'created',
//         trialEndsAt: new Date(trialStart * 1000),
//         isActive: false,
//       },
//       // { upsert: true, new: true }
//       { upsert: true, returnDocument: 'after' }
//     );

//     return NextResponse.json({
//       subscriptionId: subscription.id,
//       razorpayKeyId: process.env.RAZORPAY_KEY_ID,
//     });

//   } catch (error: any) {
//     console.error('Subscription create error:', error);
//     return NextResponse.json(
//       { error: error?.message || 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth.config';
import Razorpay             from 'razorpay';
import Subscription         from '@/models/Subscription';
import connectDB            from '@/lib/db'; // ← your actual db file

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // ── Already has a subscription → return it ───────────────
    const existing = await Subscription.findOne({ teacherId: session.user.id });

    if (existing?.razorpaySubscriptionId) {
      // If already active/trial, skip checkout entirely
      if (existing.status === 'active' || existing.status === 'trial') {
        return NextResponse.json({ alreadyActive: true });
      }
      // Pending subscription exists — return it to reopen checkout
      return NextResponse.json({
        subscriptionId: existing.razorpaySubscriptionId,
        razorpayKeyId:  process.env.RAZORPAY_KEY_ID,
      });
    }

    // ── Calculate trial end = exactly 30 days from now ───────
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    // CRITICAL: start_at must be a Unix timestamp in SECONDS
    // This tells Razorpay: "do NOT charge until this date"
    // Today = ₹0 charged. After 30 days = ₹200 auto-charged.
    const startAt = Math.floor(trialEndsAt.getTime() / 1000);

    // ── Create subscription on Razorpay ───────────────────────
    const rzpSub = await razorpay.subscriptions.create({
      plan_id:         process.env.RAZORPAY_PLAN_ID!,
      total_count:     12,      // 12 monthly cycles after trial
      quantity:        1,
      start_at:        startAt, // ← FREE TRIAL: first charge 30 days later
      customer_notify: 1,       // Razorpay sends reminder emails
      notes: {
        teacherId: session.user.id,
        email:     session.user.email ?? '',
      },
    });

    // ── Save to DB ────────────────────────────────────────────
    await Subscription.findOneAndUpdate(
      { teacherId: session.user.id },
      {
        teacherId:              session.user.id,
        razorpaySubscriptionId: rzpSub.id,
        planId:                 process.env.RAZORPAY_PLAN_ID!,
        status:                 'trial',
        isActive:               true,
        trialEndsAt,
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({
      subscriptionId: rzpSub.id,
      razorpayKeyId:  process.env.RAZORPAY_KEY_ID,
    });

  } catch (err: any) {
    console.error('[subscription/create ERROR]', JSON.stringify(err, null, 2));
    return NextResponse.json(
      { error: err?.error?.description ?? err?.message ?? 'Failed to create subscription' },
      { status: 500 }
    );
  }
}