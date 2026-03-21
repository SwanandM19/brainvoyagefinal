import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const db         = mongoose.connection.db!;
    const collection = db.collection('uploadlogs');

    // ── 1. List existing indexes so we can see what's there ──
    const before = await collection.indexes();
    console.log('[FIX-INDEX] Indexes BEFORE:', JSON.stringify(before, null, 2));

    // ── 2. Drop the broken compound index ──
    let dropResult = 'not found / already gone';
    try {
      await collection.dropIndex('teacherId_1_period_1_month_1');
      dropResult = 'dropped ✅';
    } catch (e: any) {
      dropResult = `skipped: ${e.message}`;
    }

    // ── 3. List indexes after drop ──
    const after = await collection.indexes();
    console.log('[FIX-INDEX] Indexes AFTER:', JSON.stringify(after, null, 2));

    return NextResponse.json({
      success:    true,
      dropResult,
      indexesBefore: before.map((i: any) => i.name),
      indexesAfter:  after.map((i: any)  => i.name),
    });

  } catch (err) {
    console.error('[FIX-INDEX]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
