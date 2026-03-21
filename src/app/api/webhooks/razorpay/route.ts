import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function POST(req: NextRequest) {
  try {
    const body      = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';

    // ── Verify webhook signature ─────────────────────
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
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
      case 'subscription.charged':
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subId },
          {
            status:             'active',
            currentPeriodStart: new Date(event.payload.subscription.entity.current_start * 1000),
            currentPeriodEnd:   new Date(event.payload.subscription.entity.current_end   * 1000),
          }
        );
        break;

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
