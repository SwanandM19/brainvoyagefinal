import mongoose from 'mongoose';
import Subscription from '../src/models/Subscription';

async function check() {
  await mongoose.connect('mongodb+srv://pranavkad2023comp_db_user:g9LNW6Vz5fieL8L8@cluster0.pancu0p.mongodb.net/vidyasangam?retryWrites=true&w=majority&appName=Cluster0');
  const subs = await Subscription.find({});
  console.log('Subscriptions:', JSON.stringify(subs, null, 2));
  process.exit(0);
}

check();
