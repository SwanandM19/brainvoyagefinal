import mongoose from 'mongoose';

export async function fixUploadLogIndex() {
  try {
    const collection = mongoose.connection.collection('uploadlogs');
    const indexes = await collection.indexes();

    const broken = indexes.find(idx => idx.name === 'teacherId_1_period_1_month_1');
    if (broken) {
      await collection.dropIndex('teacherId_1_period_1_month_1');
      console.log('[MIGRATION] Dropped broken UploadLog index ✅');
    } else {
      console.log('[MIGRATION] Broken index already gone, skipping.');
    }
  } catch (err) {
    // Don't crash the app if migration fails
    console.warn('[MIGRATION] fixUploadLogIndex skipped:', err);
  }
}
