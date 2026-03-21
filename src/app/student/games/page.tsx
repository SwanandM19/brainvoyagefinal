'use client';

import { useState } from 'react';
import { Zap, Brain, Gamepad2, Trophy, Play, ChevronLeft } from 'lucide-react';
import BlitzGame from '@/components/games/BlitzGame';
import MemoryMatch from '@/components/games/MemoryMatch';
import DashGame from '@/components/games/DashGame';
import GameLeaderboard from '@/components/games/GameLeaderboard';
import Logo from '@/components/layout/Logo';

const SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology','English',
  'Hindi','History','Geography','Computer Science','Economics',
];

const SUBJECT_GRADIENTS: Record<string, string> = {
  Mathematics: 'from-blue-500 to-indigo-600',
  Physics:     'from-purple-500 to-violet-600',
  Chemistry:   'from-green-500 to-emerald-600',
  Biology:     'from-teal-500 to-cyan-600',
  English:     'from-rose-500 to-pink-600',
  Hindi:       'from-orange-500 to-amber-600',
  History:     'from-yellow-500 to-orange-500',
  Geography:   'from-lime-500 to-green-600',
  'Computer Science': 'from-sky-500 to-blue-600',
  Economics:   'from-violet-500 to-purple-600',
};

const GAMES = [
  {
    id:          'blitz' as const,
    name:        '⚡ Speed Blitz',
    tagline:     'Race the clock. Build combos. Destroy records.',
    description: '15 questions. 10 seconds each. Land streaks for a multiplier that explodes your score.',
    color:       'from-yellow-500 to-orange-500',
    iconBg:      'from-yellow-400 to-orange-500',
    softBg:      'bg-orange-50',
    softBorder:  'border-orange-200',
    textAccent:  'text-orange-500',
    badge:       '🔥 MOST PLAYED',
    badgeBg:     'bg-orange-100 text-orange-600',
    features:    ['10s per question', 'Up to 10× combo', 'Power-ups: 50/50 & Freeze'],
  },
  {
    id:          'memory' as const,
    name:        '🧩 Memory Match',
    tagline:     'Flip. Match. Conquer.',
    description: 'Flip cards to match academic terms with their definitions. Fewest flips + fastest time = highest score.',
    color:       'from-violet-500 to-purple-600',
    iconBg:      'from-violet-400 to-purple-600',
    softBg:      'bg-violet-50',
    softBorder:  'border-violet-200',
    textAccent:  'text-violet-600',
    badge:       '🧠 BRAIN BOOSTER',
    badgeBg:     'bg-violet-100 text-violet-600',
    features:    ['3-minute countdown', '8 pairs per round', 'Smooth 3D card flips'],
  },
  {
    id:          'dash' as const,
    name:        '🏃 Infinite Dash',
    tagline:     'Run. Answer. Survive.',
    description: 'Questions fly at you as barriers. Choose left or right. One wrong answer costs a life. 3 lives. Go.',
    color:       'from-emerald-500 to-teal-600',
    iconBg:      'from-emerald-400 to-teal-600',
    softBg:      'bg-emerald-50',
    softBorder:  'border-emerald-200',
    textAccent:  'text-emerald-600',
    badge:       '🚀 ADRENALINE RUSH',
    badgeBg:     'bg-emerald-100 text-emerald-600',
    features:    ['3 lives', 'Speed increases', 'Endless — how far can you go?'],
  },
];

type ActiveGame = 'blitz' | 'memory' | 'dash' | null;
type ActiveTab  = 'games' | 'leaderboard';

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [subject,    setSubject]    = useState('Mathematics');
  const [tab,        setTab]        = useState<ActiveTab>('games');
  const [lbGame,     setLbGame]     = useState<'blitz'|'memory'|'dash'>('blitz');

  return (
    <div className="min-h-screen bg-[#F8F9FA]">

      {/* ── Header ───────────────────────────────────────── */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] sticky top-0 z-40 flex items-center px-4 sm:px-6 gap-3">
        <div className="flex items-center gap-3">
          <a href="/student/feed"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#f97316] hover:border-orange-200 hover:bg-orange-50 transition-all group text-xs font-bold flex-shrink-0">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:block">Back</span>
          </a>
          <div className="h-5 w-px bg-[#E5E7EB]" />
          <Logo size="sm" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 px-3 py-1.5 rounded-full">
            <Gamepad2 size={13} className="text-orange-500" />
            <span className="text-xs font-extrabold text-[#f97316]">Game Zone</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Hero Banner ──────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-6 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-orange-500/10" />
          <div className="absolute right-16 -bottom-6 w-28 h-28 rounded-full bg-amber-400/10" />
          <div className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/5" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-wider">
                  🎮 Game Zone
                </span>
              </div>
              <h1 className="text-white font-extrabold text-2xl mb-1">
                Learn. Play. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Dominate.</span>
              </h1>
              <p className="text-white/50 text-sm max-w-md">
                3 insanely fun games. Real leaderboards. Every point earned goes to your profile score.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Gamepad2 size={30} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-orange-400">3 Games</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white border border-[#E5E7EB] p-1 rounded-xl w-fit shadow-sm">
          {[
            { id: 'games',       label: '🎮 Play Games' },
            { id: 'leaderboard', label: '🏆 Rankings'   },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as ActiveTab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FA]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── GAMES TAB ────────────────────────────────────── */}
        {tab === 'games' && (
          <>
            {/* Subject selector */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4">
              <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3">
                Choose Subject
              </p>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button key={s} onClick={() => setSubject(s)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      subject === s
                        ? `bg-gradient-to-r ${SUBJECT_GRADIENTS[s] ?? 'from-orange-500 to-amber-500'} border-transparent text-white shadow-sm`
                        : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280] hover:border-orange-200 hover:text-orange-500'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Game cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6">
              {GAMES.map((game) => (
                <div key={game.id}
                  className={`relative ${game.softBg} border ${game.softBorder} rounded-2xl p-5 flex flex-col gap-4 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden bg-white`}>

                  {/* Subtle glow top-right */}
                  <div className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br ${game.color} opacity-10 blur-2xl rounded-full group-hover:opacity-20 transition-opacity`} />

                  {/* Badge */}
                  <div className="relative flex items-start justify-between">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${game.badgeBg}`}>
                      {game.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <h3 className="font-extrabold text-[#111827] text-lg leading-tight mb-1">{game.name}</h3>
                    <p className={`text-xs font-bold ${game.textAccent} mb-2`}>{game.tagline}</p>
                    <p className="text-[#6B7280] text-xs leading-relaxed">{game.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1.5 relative">
                    {game.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[#6B7280] text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${game.color} flex-shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => setActiveGame(game.id)}
                    className={`relative mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r ${game.color} text-white shadow-md hover:brightness-105 transition-all`}>
                    <Play size={14} fill="white" /> Play Now
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── LEADERBOARD TAB ──────────────────────────────── */}
        {tab === 'leaderboard' && (
          <div className="pb-6 space-y-4">

            {/* Game selector */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4">
              <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3">
                Select Game
              </p>
              <div className="flex gap-2 flex-wrap">
                {GAMES.map((g) => (
                  <button key={g.id} onClick={() => setLbGame(g.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      lbGame === g.id
                        ? `bg-gradient-to-r ${g.color} border-transparent text-white shadow-sm`
                        : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280] hover:border-orange-200 hover:text-orange-500'
                    }`}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            <GameLeaderboard gameType={lbGame} />
          </div>
        )}
      </div>

      {/* ── Game Overlays ────────────────────────────────── */}
      {activeGame === 'blitz'  && <BlitzGame  subject={subject} onClose={() => setActiveGame(null)} />}
      {activeGame === 'memory' && <MemoryMatch subject={subject} onClose={() => setActiveGame(null)} />}
      {activeGame === 'dash'   && <DashGame   subject={subject} onClose={() => setActiveGame(null)} />}
    </div>
  );
}
