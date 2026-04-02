require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  teacherId: mongoose.Schema.Types.ObjectId,
  planId: String,
  status: String,
});

async function check() {
  await mongoose.connect(process.env.DATABASE_URL);
  const Subscription = mongoose.model('Subscription', SubscriptionSchema);
  const subs = await Subscription.find({});
  console.log('Existing Plan IDs in DB:', subs.map(s => s.planId));
  process.exit(0);
}

check();
