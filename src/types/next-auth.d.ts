import 'next-auth';
import 'next-auth/jwt';
import type { UserRole, TeacherStatus } from '@/models/User';

declare module 'next-auth' {
  interface Session {
    user: {
      id:                  string;
      name:                string;
      email:               string;
      image?:              string;
      role:                UserRole;
      teacherStatus?:      TeacherStatus;
      onboardingCompleted: boolean;
    };
  }

  interface User {
    id:                  string;
    role:                UserRole;
    teacherStatus?:      TeacherStatus;
    onboardingCompleted: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:                  string;
    mongoId:             string; // ✅ alias of id — used by all API routes
    role:                UserRole;
    teacherStatus?:      TeacherStatus;
    onboardingCompleted: boolean;
  }
}
