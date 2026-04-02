require('dotenv').config({ path: '.env.local' });
const Razorpay = require('razorpay');

async function testCreatePlan() {
  const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
  });

  try {
    console.log('Trying to create a plan...');
    const plan = await razorpay.plans.create({
      period:   'monthly',
      interval: 1,
      item: {
        name:        'VidyaSangrah Teacher Plan',
        amount:      20000,
        currency:    'INR',
        description: '₹200/month subscription',
      },
    });
    console.log('Successfully created plan:', plan.id);
  } catch (err) {
    console.error('Plan creation failed:', err.error || err.message || err);
  }
}

testCreatePlan();
