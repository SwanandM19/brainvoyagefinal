'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, GraduationCap, BookOpen, ChevronRight, LogOut } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import StudentOnboardingForm from '@/components/onboarding/StudentOnboardingForm';
import TeacherOnboardingForm from '@/components/onboarding/TeacherOnboardingForm';

type OnboardingStep = 'role' | 'student-form' | 'teacher-form';

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('role');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
    if (status === 'authenticated' && session?.user?.onboardingCompleted) {
      const role = session.user.role;
      if (role === 'admin')        router.replace('/admin/dashboard');
      else if (role === 'teacher') router.replace('/teacher/pending');  // ← unchanged: already-onboarded teachers
      else                         router.replace('/student/feed');
    }
  }, [status, session, router]);

  async function handleSubmit(role: 'student' | 'teacher', data: Record<string, any>) {
    try {
      const res = await fetch('/api/onboarding', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role, ...data }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Failed to save profile.');
        return;
      }

      // Refresh JWT session with new role + onboarding status
      await update({
        onboardingCompleted: true,
        role,
        teacherStatus: json.teacherStatus ?? undefined,
      });

      toast.success(
  role === 'student'
    ? '🎉 Welcome to VidyaSangrah!'
    : '🎉 Welcome to VidyaSangrah! Your teacher account is ready.'  // ✅ CHANGED
);

      if (role === 'teacher') {
  router.replace('/teacher/feed');  // ✅ CHANGED from /teacher/subscription
} else {
  router.replace('/student/feed');
}
    } catch {
      toast.error('Network error. Please try again.');
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 size={32} className="animate-spin text-[#f97316]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Top bar */}
      <header className="h-[100px] bg-white border-b border-[#E5E7EB] flex items-center px-6">
        <Logo size="sm" />
        <div className="ml-auto flex items-center gap-4">
          {session?.user?.email && (
            <span className="text-sm text-[#6B7280] font-medium hidden sm:block">
              {session.user.email}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-red-500 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Choose Role', 'Complete Profile'].map((label, i) => {
            const isActive = (i === 0 && step === 'role') || (i === 1 && step !== 'role');
            const isDone   = i === 0 && step !== 'role';
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 ${i > 0 ? '' : ''}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-[#f97316] text-white'
                        : 'bg-[#E5E7EB] text-[#6B7280]'
                    }`}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm font-semibold ${isActive ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
                    {label}
                  </span>
                </div>
                {i === 0 && (
                  <div className={`w-16 h-0.5 mx-1 rounded ${step !== 'role' ? 'bg-[#f97316]' : 'bg-[#E5E7EB]'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── STEP: ROLE SELECTION ── */}
        {step === 'role' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-[#111827] mb-2">
                Welcome! How will you use VidyaSangrah?
              </h1>
              <p className="text-[#6B7280]">Choose your role to get started. You can't change this later.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Student card */}
              <button
                onClick={() => setStep('student-form')}
                className="group bg-white border-2 border-[#E5E7EB] rounded-2xl p-7 text-left hover:border-[#f97316] hover:shadow-lg transition-all duration-200"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors">
                  <GraduationCap size={28} className="text-[#f97316]" />
                </div>
                <h2 className="text-lg font-extrabold text-[#111827] mb-2">I'm a Student</h2>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-5">
                  Discover top teachers, watch board-filtered videos, play academic games, and compete nationally.
                </p>
                <ul className="space-y-2 text-sm text-[#6B7280]">
                  {['Free forever', 'Filtered by board & class', 'National leaderboard'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-[10px]">✓</span>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-1.5 text-[#f97316] font-bold text-sm">
                  Get started <ChevronRight size={16} />
                </div>
              </button>

              {/* Teacher card */}
              <button
                onClick={() => setStep('teacher-form')}
                className="group bg-white border-2 border-[#E5E7EB] rounded-2xl p-7 text-left hover:border-[#f97316] hover:shadow-lg transition-all duration-200"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors">
                  <BookOpen size={28} className="text-[#f97316]" />
                </div>
                <h2 className="text-lg font-extrabold text-[#111827] mb-2">I'm a Teacher</h2>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-5">
                  Upload teaching videos, build your channel, gain national followers, and rank on India's teacher board.
                </p>
                <ul className="space-y-2 text-sm text-[#6B7280]">
                  {['Verified profile', 'National teacher ranking', 'Build your audience'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-[10px]">✓</span>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-1.5 text-[#f97316] font-bold text-sm">
                  Apply now <ChevronRight size={16} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: STUDENT FORM ── */}
        {step === 'student-form' && (
          <StudentOnboardingForm
            email={session?.user?.email ?? ''}
            defaultName={session?.user?.name ?? ''}
            onBack={() => setStep('role')}
            onSubmit={(data) => handleSubmit('student', data)}
          />
        )}

        {/* ── STEP: TEACHER FORM ── */}
        {step === 'teacher-form' && (
          <TeacherOnboardingForm
            email={session?.user?.email ?? ''}
            defaultName={session?.user?.name ?? ''}
            onBack={() => setStep('role')}
            onSubmit={(data) => handleSubmit('teacher', data)}
          />
        )}
      </div>
    </div>
  );
}
