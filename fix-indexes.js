const { MongoClient } = require('mongodb');

const URI = 'mongodb+srv://pranavkad2023comp_db_user:g9LNW6Vz5fieL8L8@cluster0.pancu0p.mongodb.net/vidyasangam?retryWrites=true&w=majority&appName=Cluster0';

async function fix() {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const col = client.db('vidyasangam').collection('videos');

    const indexes = await col.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(idx => console.log(' -', idx.name));

    const badIndexNames = [
      'boards_1_classes_1',
      'classes_1_boards_1',
      'classes_1',
      'boards_1',
    ];

    for (const name of badIndexNames) {
      try {
        await col.dropIndex(name);
        console.log(`✅ Dropped: ${name}`);
      } catch {
        console.log(`ℹ️  Not found (ok): ${name}`);
      }
    }

    const after = await col.indexes();
    console.log('\nIndexes after fix:');
    after.forEach(idx => console.log(' -', idx.name));

    console.log('\n✅ All done! Try uploading a video now.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.close();
  }
}

fix();
