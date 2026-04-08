const { MongoClient } = require('mongodb');

const URI = "mongodb+srv://pranavkad2023comp_db_user:g9LNW6Vz5fieL8L8@cluster0.pancu0p.mongodb.net/vidyasangam?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  const client = new MongoClient(URI);
  await client.connect();
  console.log('✅ Connected to MongoDB\n');

  const db  = client.db('vidyasangam');
  const col = db.collection('subscriptions');

  // Find all bad docs: trialEndsAt is null AND currentPeriodEnd is 2099
  const badDocs = await col.find({
    trialEndsAt: null,
    currentPeriodEnd: { $gt: new Date("2050-01-01") }
  }).toArray();

  console.log(`🔍 Found ${badDocs.length} documents to fix\n`);

  let fixed = 0;
  for (const doc of badDocs) {
    // Get creation time from MongoDB ObjectId (accurate to the second)
    const createdAt   = doc._id.getTimestamp();
    const trialEndsAt = new Date(createdAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    console.log(`  teacherId    : ${doc.teacherId}`);
    console.log(`  Created      : ${createdAt.toDateString()}`);
    console.log(`  trialEndsAt  : ${trialEndsAt.toDateString()}`);
    console.log('');

    await col.updateOne(
      { _id: doc._id },
      { $set: { trialEndsAt, currentPeriodEnd: trialEndsAt } }
    );
    fixed++;
  }

  console.log(`✅ Fixed ${fixed} documents successfully`);
  await client.close();
  console.log('🔌 Disconnected.');
}

main().catch(console.error);