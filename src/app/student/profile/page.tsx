import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import User from '@/models/User';
import StudentProfileClient from '@/components/student/StudentProfileClient';

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user)                  redirect('/auth/login');
  if (session.user.role !== 'student') redirect('/unauthorized');

  await connectDB();
  const student = await User.findOne({ email: session.user.email })
    .select('name email studentClass studentBoard school city state phone bio points')
    .lean() as any;

  return (
    <StudentProfileClient student={{
      name:         student?.name         ?? '',
      email:        session.user.email    ?? '',
      studentClass: student?.studentClass ?? '',
      studentBoard: student?.studentBoard ?? '',
      school:       student?.school       ?? '',
      city:         student?.city         ?? '',
      state:        student?.state        ?? '',
      phone:        student?.phone        ?? '',
      bio:          student?.bio          ?? '',
      points:       student?.points       ?? 0,
    }} />
  );
}
