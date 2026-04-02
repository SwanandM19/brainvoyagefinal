require('dotenv').config({ path: '.env.local' });
const Razorpay = require('razorpay');

async function check() {
  const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
  });

  try {
    console.log('Testing Razorpay keys...');
    const orders = await razorpay.orders.all({ count: 1 });
    console.log('Successfully connected to Razorpay!');
    console.log('Orders found:', orders.items.length);
    
    console.log('Trying plans...');
    try {
      const plans = await razorpay.plans.all({ count: 1 });
      console.log('Plans found:', plans.items.length);
      if (plans.items.length > 0) {
        console.log('First Plan ID:', plans.items[0].id);
      }
    } catch (e) {
      console.error('Plans API failed:', e.error || e.message);
    }
  } catch (err) {
    console.error('Razorpay Error:', err.error || err.message);
  }
}

check();
