import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();

  const allowed = ['name','studentClass','studentBoard','school','city','state','phone','bio'];
  const update: any = {};
  allowed.forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });

  await User.findOneAndUpdate({ email: token.email }, { $set: update });
  return NextResponse.json({ ok: true });
}
