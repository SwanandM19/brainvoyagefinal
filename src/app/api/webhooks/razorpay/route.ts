// import { NextRequest, NextResponse } from 'next/server';
// import crypto from 'crypto';
// import connectDB from '@/lib/db';
// import Subscription from '@/models/Subscription';

// export async function POST(req: NextRequest) {
//   try {
//     const body      = await req.text();
//     const signature = req.headers.get('x-razorpay-signature') ?? '';

//     // ── Verify webhook signature ─────────────────────
//     const expected = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
//       .update(body)
//       .digest('hex');

//     if (expected !== signature) {
//       console.error('[WEBHOOK] Invalid signature');
//       return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
//     }

//     const event = JSON.parse(body);
//     await connectDB();

//     const subId = event?.payload?.subscription?.entity?.id;
//     if (!subId) return NextResponse.json({ ok: true });

//     switch (event.event) {

//       case 'subscription.activated':
//       case 'subscription.charged':
//         await Subscription.findOneAndUpdate(
//           { razorpaySubscriptionId: subId },
//           {
//             status:             'active',
//             isActive:           true,
//             currentPeriodStart: new Date(event.payload.subscription.entity.current_start * 1000),
//             currentPeriodEnd:   new Date(event.payload.subscription.entity.current_end   * 1000),
//           }
//         );
//         break;

//       case 'subscription.halted':
//       case 'subscription.pending':
//         await Subscription.findOneAndUpdate(
//           { razorpaySubscriptionId: subId },
//           { status: 'past_due' }
//         );
//         break;

//       case 'subscription.cancelled':
//         await Subscription.findOneAndUpdate(
//           { razorpaySubscriptionId: subId },
//           { status: 'cancelled', cancelledAt: new Date() }
//         );
//         break;
//     }

//     return NextResponse.json({ ok: true });

//   } catch (err) {
//     console.error('[WEBHOOK]', err);
//     return NextResponse.json({ error: 'Webhook failed.' }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';
import Razorpay from 'razorpay';         // ✅ NEW
import mongoose from 'mongoose';         // ✅ NEW

// ✅ NEW
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ✅ NEW — safe model access
const Teacher = mongoose.models.Teacher ??
  require('@/models/Teacher').default;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';

    // ── Verify webhook signature ─────────────────────
    // const expected = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    //   .update(body)
    //   .digest('hex');
    // ✅ Correct — use webhook secret
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expected !== signature) {
      console.error('[WEBHOOK] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    const event = JSON.parse(body);
    await connectDB();

    const subId = event?.payload?.subscription?.entity?.id;
    if (!subId) return NextResponse.json({ ok: true });

    switch (event.event) {

      case 'subscription.activated':
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subId },
          {
            status: 'active',
            isActive: true,
            currentPeriodStart: new Date(event.payload.subscription.entity.current_start * 1000),
            currentPeriodEnd: new Date(event.payload.subscription.entity.current_end * 1000),
          }
        );
        break;

      case 'subscription.charged': {
        // ── Update subscription dates ─────────────────
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subId },
          {
            status: 'active',
            isActive: true,
            currentPeriodStart: new Date(event.payload.subscription.entity.current_start * 1000),
            currentPeriodEnd: new Date(event.payload.subscription.entity.current_end * 1000),
          }
        );

        // ✅ NEW — Auto-refund if teacher has pending free months
        const paymentId = event?.payload?.payment?.entity?.id;
        const amount = event?.payload?.payment?.entity?.amount; // paise

        if (paymentId && amount) {
          const sub = await Subscription.findOne({ razorpaySubscriptionId: subId });
          if (sub) {
            const teacher = await Teacher.findOne({ userId: sub.teacherId });
            if (teacher && (teacher.pendingFreeMonths ?? 0) > 0) {
              try {
                await (razorpay.payments as any).refund(paymentId, {
                  amount,
                  notes: { reason: 'Referral free month redemption' },
                });
                teacher.pendingFreeMonths = (teacher.pendingFreeMonths ?? 1) - 1;
                await teacher.save();
                console.log(`[webhook] Refunded ₹${amount / 100} for teacher ${teacher.userId}`);
              } catch (refundErr: any) {
                console.error('[webhook] Refund failed:', refundErr?.error ?? refundErr);
              }
            }
          }
        }
        break;
      }

      case 'subscription.halted':
      case 'subscription.pending':
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subId },
          { status: 'past_due' }
        );
        break;

      case 'subscription.cancelled':
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subId },
          { status: 'cancelled', cancelledAt: new Date() }
        );
        break;
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('[WEBHOOK]', err);
    return NextResponse.json({ error: 'Webhook failed.' }, { status: 500 });
  }
}