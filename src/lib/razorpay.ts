// import Razorpay from 'razorpay';

// let razorpayInstance: Razorpay | null = null;

// export function getRazorpay(): Razorpay {
//   if (!razorpayInstance) {
//     const key_id = process.env.RAZORPAY_KEY_ID?.trim();
//     const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    
//     if (!key_id || !key_secret) {
//       throw new Error('Razorpay credentials missing in environment.');
//     }

//     razorpayInstance = new Razorpay({
//       key_id,
//       key_secret,
//     });
//   }
//   return razorpayInstance;
// }

// // Plan details — edit here when going live
// // export const TEACHER_PLAN = {
// //   amount:       20000,        // ₹200 in paise
// //   currency:     'INR',
// //   period:       'monthly',
// //   interval:     1,
// //   name:         'VidyaSangrah Teacher Plan',
// //   description:  '₹200/month — Unlimited video uploads & student reach',
// //   TRIAL_DAYS:   30,           // First month free
// // };
// export const TEACHER_PLAN = {
//   name:        'VidyaSangrah Teacher Plan',
//   amount:      20000,        // ₹200 in paise
//   currency:    'INR',
//   period:      'monthly',
//   interval:    1,
//   description: 'Monthly teacher subscription',
//   trial_period_days: 30,     // ← ADD THIS
// }

// import Razorpay from 'razorpay';

// let razorpayInstance: Razorpay | null = null;

// export function getRazorpay() {
//   if (!razorpayInstance) {
//     razorpayInstance = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID!,
//       key_secret: process.env.RAZORPAY_KEY_SECRET!,
//     });
//   }
//   return razorpayInstance;
// }

// export async function getOrCreatePlan(): Promise<string> {
//   // If plan ID already in .env, use it directly
//   if (process.env.RAZORPAY_PLAN_ID) {
//     return process.env.RAZORPAY_PLAN_ID;
//   }

//   // Otherwise auto-create the plan
//   const razorpay = getRazorpay();
//   const plan = await razorpay.plans.create({
//     period: 'monthly',
//     interval: 1,
//     item: {
//       name: 'Teacher Subscription',
//       amount: 20000, // ₹200 in paise
//       currency: 'INR',
//       description: 'Monthly teacher subscription - first month free',
//     },
//   });

//   // Log the plan ID so you can copy it into .env
//   console.log('✅ Razorpay Plan Created! Add this to your .env:');
//   console.log(`RAZORPAY_PLAN_ID=${plan.id}`);

//   return plan.id;
// }

import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in .env.local');
}

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;