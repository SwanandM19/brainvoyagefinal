'use client';

import { signOut } from 'next-auth/react';
import Logo from '@/components/layout/Logo';
import { LogOut, BookOpen, Trophy, Zap, Users, Play } from 'lucide-react';

export default function StudentFeedPlaceholder({
  studentName, studentEmail,
}: {
  studentName: string; studentEmail: string;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center px-6 sticky top-0 z-50">
        <Logo size="sm" />
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-[#111827]">{studentName}</p>
            <p className="text-xs text-[#6B7280]">{studentEmail}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-[#f97316] font-bold text-sm">
            {studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Play size={36} className="text-[#f97316]" />
        </div>

        <h1 className="text-3xl font-extrabold text-[#111827] mb-3">
          Welcome, {studentName.split(' ')[0]}! 🎉
        </h1>
        <p className="text-[#6B7280] text-lg mb-10 max-w-lg mx-auto">
          Your student dashboard is being built. The full learning feed with videos,
          leaderboards, and games is coming in the next step!
        </p>

        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { icon: <BookOpen size={22} className="text-[#f97316]" />, label: 'Video Feed',   desc: 'Coming next' },
            { icon: <Trophy size={22} className="text-yellow-500" />,  label: 'Leaderboard',  desc: 'Coming soon' },
            { icon: <Zap size={22} className="text-blue-500" />,       label: 'Games',        desc: 'Coming soon' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-[#E5E7EB] p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <p className="font-bold text-[#111827] text-sm">{item.label}</p>
              <p className="text-xs text-[#6B7280] mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
