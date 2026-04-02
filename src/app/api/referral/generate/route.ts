import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth.config';
import connectDB            from '@/lib/db';
import Teacher              from '@/models/Teacher';
import Referral             from '@/models/Referral';
import crypto               from 'crypto';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // let teacher = await Teacher.findOne({ userId: session.user.id });
    // if (!teacher) {
    //   return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    // }
    let teacher = await Teacher.findOne({ userId: session.user.id });
if (!teacher) {
  // Auto-create a minimal Teacher doc for existing users
  teacher = await Teacher.create({
    userId:   session.user.id,
    name:     session.user.name ?? '',
    email:    session.user.email ?? '',
  });
}

    if (!teacher.referralCode) {
      teacher.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      await teacher.save();
    }

    const totalReferrals = await Referral.countDocuments({
      referrerId: session.user.id,
      status: 'credited',
    });

    return NextResponse.json({
      referralCode:     teacher.referralCode,
      referralPoints:   teacher.referralPoints  ?? 0,
      freeMonthsEarned: teacher.freeMonthsEarned ?? 0,
      totalReferrals,
      pointsToNextFree: Math.max(0, 100 - ((teacher.referralPoints ?? 0) % 100)),
    });
  } catch (err: any) {
    console.error('[referral/generate]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}