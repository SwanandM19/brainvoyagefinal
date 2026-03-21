// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth.config';
// import { redirect } from 'next/navigation';
// import connectDB from '@/lib/db';
// import User from '@/models/User';
// import Video from '@/models/Video';
// import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

// export default async function AdminDashboardPage() {
//   const session = await getServerSession(authOptions);
//   if (!session?.user)                redirect('/auth/login');
//   if (session.user.role !== 'admin') redirect('/unauthorized');

//   await connectDB();

//   const [
//     totalStudents, totalTeachers, pendingTeachers, pendingVideos, recentUsers,
//   ] = await Promise.all([
//     User.countDocuments({ role: 'student' }),
//     User.countDocuments({ role: 'teacher' }),
//     User.countDocuments({ role: 'teacher', teacherStatus: 'pending' }),
//     Video.countDocuments({ status: 'pending' }),
//     User.find({}).sort({ createdAt: -1 }).limit(10)
//       .select('name email role teacherStatus createdAt').lean(),
//   ]);

//   const pendingVideoList = await Video.find({ status: 'pending' })
//     .sort({ createdAt: -1 }).limit(20)
//     .populate('teacherId', 'name email').lean();

//   const stats = { totalStudents, totalTeachers, pendingTeachers, pendingVideos };

//   const users = recentUsers.map((u) => ({
//     id:            u._id.toString(),
//     name:          u.name,
//     email:         u.email,
//     role:          u.role,
//     teacherStatus: u.teacherStatus ?? null,
//     createdAt:     u.createdAt.toISOString(),
//   }));

//   const videos = pendingVideoList.map((v) => ({
//     id:        v._id.toString(),
//     title:     v.title,
//     subject:   v.subject,
//     classes:   v.classes,
//     boards:    v.boards,
//     videoUrl:  v.videoUrl,
//     createdAt: v.createdAt.toISOString(),
//     teacher:   v.teacherId && typeof v.teacherId === 'object'
//       ? { name: (v.teacherId as any).name, email: (v.teacherId as any).email }
//       : { name: 'Unknown', email: '' },
//   }));

//   return (
//     <AdminDashboardClient
//       adminName={session.user.name ?? 'Admin'}
//       adminEmail={session.user.email ?? ''}
//       stats={stats}
//       recentUsers={users}
//       pendingVideos={videos}
//     />
//   );
// }

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import User from '@/models/User';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user)                redirect('/auth/login');
  if (session.user.role !== 'admin') redirect('/unauthorized');

  await connectDB();

  const [totalStudents, totalTeachers, pendingTeachers, recentUsers] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'teacher', teacherStatus: 'pending' }),
      User.find({}).sort({ createdAt: -1 }).limit(10)
        .select('name email role teacherStatus createdAt').lean(),
    ]);

  const stats = { totalStudents, totalTeachers, pendingTeachers };

  const users = recentUsers.map((u) => ({
    id:            u._id.toString(),
    name:          u.name,
    email:         u.email,
    role:          u.role,
    teacherStatus: u.teacherStatus ?? null,
    createdAt:     u.createdAt.toISOString(),
  }));

  return (
    <AdminDashboardClient
      adminName={session.user.name ?? 'Admin'}
      adminEmail={session.user.email ?? ''}
      stats={stats}
      recentUsers={users}
    />
  );
}
