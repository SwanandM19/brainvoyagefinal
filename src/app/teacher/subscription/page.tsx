// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth.config';
// import { redirect } from 'next/navigation';
// import connectDB from '@/lib/db';
// import Subscription from '@/models/Subscription';
// import User from '@/models/User';
// import TeacherSubscriptionClient from '@/components/teacher/TeacherSubscriptionClient';

// export default async function TeacherSubscriptionPage() {
//   const session = await getServerSession(authOptions);
//   if (!session?.user)                  redirect('/auth/login');
//   if (session.user.role !== 'teacher') redirect('/unauthorized');

//   await connectDB();

//   const user = await User.findOne({ email: session.user.email }).lean() as any;

//   // If onboarding not done, go back
//   if (!user?.onboardingCompleted) redirect('/teacher/onboarding');

//   const sub = await Subscription.findOne({ teacherId: user._id }).lean() as any;

//   // Already active or on trial — go to dashboard
//   if (sub && ['active', 'trial'].includes(sub.status)) {
//     redirect('/teacher/dashboard');
//   }

//   return (
//     <TeacherSubscriptionClient
//       teacher={{
//         name:  user.name,
//         email: user.email,
//       }}
//     />
//   );
// }

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';

export default async function TeacherSubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user)                  redirect('/auth/login');
  if (session.user.role !== 'teacher') redirect('/unauthorized');

  // Free onboarding — skip subscription entirely
  redirect('/teacher/feed');
}
