'use client';

import { useState } from 'react';
import { Trophy, Gamepad2, GraduationCap } from 'lucide-react';
import TeacherLeaderboard from '@/components/leaderboard/TeacherLeaderboard';
import GameLeaderboard from '@/components/games/GameLeaderboard';

type Tab = 'teachers' | 'blitz' | 'memory' | 'dash';

const TABS = [
  { id: 'teachers' as Tab, label: '👨‍🏫 Top Teachers', icon: GraduationCap },
  { id: 'blitz'    as Tab, label: '⚡ Speed Blitz',    icon: Gamepad2     },
  { id: 'memory'   as Tab, label: '🧩 Memory Match',   icon: Gamepad2     },
  { id: 'dash'     as Tab, label: '🏃 Infinite Dash',  icon: Gamepad2     },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('teachers');

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827]">

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#E5E7EB] bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-orange-500 text-xs font-extrabold uppercase tracking-widest mb-3">
            <Trophy size={14} /> National Rankings
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111827] mb-2">
            Who's{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              Dominating?
            </span>
          </h1>
          <p className="text-[#6B7280] text-sm max-w-lg">
            Real-time leaderboards. Teacher rankings by views, likes, followers & engagement. Student rankings by game scores.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB] sticky top-0 bg-white/95 backdrop-blur-md z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-1.5 overflow-x-auto py-3 scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex-shrink-0 ${
                  tab === t.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-orange-50 hover:text-orange-500 border border-[#E5E7EB]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-16">
        {tab === 'teachers' && <TeacherLeaderboard />}
        {(tab === 'blitz' || tab === 'memory' || tab === 'dash') && (
          <GameLeaderboard gameType={tab} />
        )}
      </div>
    </div>
  );
}
