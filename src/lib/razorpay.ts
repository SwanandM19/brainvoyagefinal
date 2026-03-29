import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpayInstance;
}

// Plan details — edit here when going live
export const TEACHER_PLAN = {
  amount:       20000,        // ₹200 in paise
  currency:     'INR',
  period:       'monthly',
  interval:     1,
  name:         'VidyaSangrah Teacher Plan',
  description:  '₹200/month — Unlimited video uploads & student reach',
  TRIAL_DAYS:   30,           // First month free
};
