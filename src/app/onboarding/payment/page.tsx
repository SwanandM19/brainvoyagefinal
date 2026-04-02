import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import User from '@/models/User';
import TeacherSubscriptionClient from '@/components/teacher/TeacherSubscriptionClient';

export default async function OnboardingPaymentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'teacher') {
    redirect('/unauthorized');
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean() as any;

  if (!user || !user.onboardingCompleted) {
    redirect('/onboarding');
  }

  // If already active, move forward
  if (user.teacherStatus === 'active') {
    redirect('/teacher/dashboard');
  }

  return (
    <TeacherSubscriptionClient
      teacher={{
        name:  user.name || '',
        email: user.email || '',
      }}
    />
  );
}
