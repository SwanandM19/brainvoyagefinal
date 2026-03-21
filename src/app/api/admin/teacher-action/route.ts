import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { userId, action, rejectionNote } = await req.json();

    if (!userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    await connectDB();

    const updateData: Record<string, any> = {
      teacherStatus: action === 'approve' ? 'approved' : 'rejected',
    };

    if (action === 'reject' && rejectionNote) {
      updateData.teacherRejectionNote = rejectionNote;
    }

    const result = await User.updateOne(
      { _id: userId, role: 'teacher' },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error('[TEACHER_ACTION_ERROR]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
