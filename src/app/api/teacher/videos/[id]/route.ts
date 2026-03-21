import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  // Only allow teacher to delete their own video
  const video = await Video.findOne({ _id: id, teacherId: token.sub });
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await Video.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
