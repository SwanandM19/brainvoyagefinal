'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trophy, Star, Eye, Heart, Users, X, Video, TrendingUp, ChevronRight } from 'lucide-react';

interface StudentEntry {
  _id:          string;
  userName:     string;
  userInitials: string;
  avatarColor:  string;
  score:        number;
  streak:       number;
  accuracy:     number;
  gamesPlayed:  number;
  rank:         number;
}

interface TeacherEntry {
  teacherId:      string;
  name:           string;
  subjects:       string[];
  totalViews:     number;
  videoCount:     number;
  totalLikes:     number;
  avgRating:      number;
  followersCount: number;
  rank:           number;
  isFollowing?:   boolean;
}

interface TeacherProfile {
  teacherId:         string;
  name:              string;
  email:             string;
  bio?:              string;
  subjects:          string[];
  boards:            string[];
  classes:           string[];
  yearsOfExperience: number;
  totalViews:        number;
  videoCount:        number;
  totalLikes:        number;
  avgRating:         number;
  followersCount:    number;
  isFollowing?:      boolean;
}

interface MyStats {
  score:       number;
  rank:        number;
  streak:      number;
  accuracy:    number;
  gamesPlayed: number;
}

interface Props {
  gameType:        'blitz' | 'memory' | 'dash';
  defaultSubject?: string;
  compact?:        boolean;
}

const SUBJECTS = [
  'all', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'History', 'Geography', 'Computer Science', 'Economics',
];

const GAME_LABELS: Record<string, string> = {
  blitz:  '⚡ Speed Blitz',
  memory: '🧩 Memory Match',
  dash:   '🏃 Infinite Dash',
};

const GAME_COLOR: Record<string, string> = {
  blitz:  'from-yellow-500 to-orange-500',
  memory: 'from-violet-500 to-purple-600',
  dash:   'from-emerald-500 to-teal-600',
};

const GAME_ACCENT: Record<string, string> = {
  blitz:  'text-orange-500',
  memory: 'text-violet-600',
  dash:   'text-emerald-600',
};

const GAME_SOFT: Record<string, string> = {
  blitz:  'bg-orange-50 border-orange-200',
  memory: 'bg-violet-50 border-violet-200',
  dash:   'bg-emerald-50 border-emerald-200',
};

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics:        'from-blue-500 to-indigo-600',
  Physics:            'from-purple-500 to-violet-600',
  Chemistry:          'from-green-500 to-emerald-600',
  Biology:            'from-teal-500 to-cyan-600',
  English:            'from-rose-500 to-pink-600',
  Hindi:              'from-orange-500 to-amber-600',
  History:            'from-yellow-500 to-orange-500',
  Geography:          'from-lime-500 to-green-600',
  'Computer Science': 'from-sky-500 to-blue-600',
  Economics:          'from-violet-500 to-purple-600',
};

const RANK_ICONS = ['🥇', '🥈', '🥉'];
const RANK_ROW: Record<number, string> = {
  1: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  2: 'bg-slate-50  border-slate-200  hover:bg-slate-100',
  3: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
};
const RANK_SCORE: Record<number, string> = {
  1: 'text-yellow-600',
  2: 'text-slate-500',
  3: 'text-orange-500',
};
const AVATAR_COLORS: Record<string, string> = {
  'from-rose-500 to-pink-606':     'from-rose-500 to-pink-600',
  'from-blue-500 to-indigo-600':   'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600':  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600': 'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600':  'from-amber-500 to-orange-600',
  'from-sky-500 to-cyan-600':      'from-sky-500 to-cyan-600',
};

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function getInitials(name: string) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function avatarGradient(name: string) {
  if (!name) return 'from-orange-500 to-amber-600';
  const COLORS = [
    'from-rose-500 to-pink-600',    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600', 'from-sky-500 to-cyan-600',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function GameLeaderboard({ gameType, defaultSubject = 'all', compact = false }: Props) {
  const [tab,           setTab]           = useState<'students' | 'teachers'>('students');
  const [subject,       setSubject]       = useState(defaultSubject);
  const [entries,       setEntries]       = useState<StudentEntry[]>([]);
  const [teachers,      setTeachers]      = useState<TeacherEntry[]>([]);
  const [myStats,       setMyStats]       = useState<MyStats | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [following,     setFollowing]     = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [drawerTeacher, setDrawerTeacher] = useState<TeacherProfile | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // ── THE FIX: separate fetch logic for each tab ──────────
  useEffect(() => {
    setLoading(true);

    if (tab === 'students') {
      // ✅ Fetch student leaderboard → setEntries + setMyStats
      fetch(`/api/games/leaderboard/${gameType}?subject=${encodeURIComponent(subject)}`)
        .then(r => r.json())
        .then(d => {
          setEntries(d.leaderboard ?? []);
          setMyStats(d.myStats    ?? null);
        })
        .catch(() => {
          setEntries([]);
          setMyStats(null);
        })
        .finally(() => setLoading(false));

    } else {
      // ✅ Fetch teacher leaderboard → setTeachers + seed following state
      fetch('/api/leaderboard/teachers')
        .then(r => r.json())
        .then(d => {
          const t = (d.teachers ?? []).map((teacher: any) => ({
            ...teacher,
            name:      teacher.name      ?? 'Unknown',
            teacherId: teacher.teacherId ?? teacher._id?.toString() ?? '',
          }));
          setTeachers(t);
          const map: Record<string, boolean> = {};
          t.forEach((teacher: TeacherEntry) => {
            map[teacher.teacherId] = teacher.isFollowing === true;
          });
          setFollowing(map);
        })
        .catch(() => setTeachers([]))
        .finally(() => setLoading(false));
    }
  }, [gameType, subject, tab]);

  async function openTeacherProfile(teacherId: string) {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerTeacher(null);
    try {
      const res  = await fetch(`/api/teachers/${teacherId}/profile`);
      const data = await res.json();
      setDrawerTeacher(data.teacher ?? data ?? null);
    } catch {
      setDrawerTeacher(null);
    } finally {
      setDrawerLoading(false);
    }
  }

  async function toggleFollow(teacherId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setFollowLoading(prev => ({ ...prev, [teacherId]: true }));
    const isNowFollowing = !following[teacherId];
    setFollowing(prev => ({ ...prev, [teacherId]: isNowFollowing }));
    try {
      const res  = await fetch(`/api/teachers/${teacherId}/follow`, {
        method:  isNowFollowing ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      if (data.followersCount !== undefined) {
        setTeachers(prev => prev.map(t =>
          t.teacherId === teacherId ? { ...t, followersCount: data.followersCount } : t
        ));
        if (drawerTeacher?.teacherId === teacherId) {
          setDrawerTeacher(prev => prev
            ? { ...prev, isFollowing: isNowFollowing, followersCount: data.followersCount }
            : prev
          );
        }
      }
    } catch {
      setFollowing(prev => ({ ...prev, [teacherId]: !isNowFollowing }));
      if (drawerTeacher?.teacherId === teacherId) {
        setDrawerTeacher(prev => prev ? { ...prev, isFollowing: !isNowFollowing } : prev);
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [teacherId]: false }));
    }
  }

  return (
    <>
      <div className="space-y-4">

        {/* ── Header ────────────────────────────────── */}
        {!compact && (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GAME_COLOR[gameType]} flex items-center justify-center shadow-sm flex-shrink-0`}>
              <span className="text-lg">{gameType === 'blitz' ? '⚡' : gameType === 'memory' ? '🧩' : '🏃'}</span>
            </div>
            <div>
              <h2 className="text-[#111827] font-extrabold text-lg leading-tight">
                {GAME_LABELS[gameType]} Rankings
              </h2>
              <p className="text-[#9CA3AF] text-xs">Best score per player · Updates in real time</p>
            </div>
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────── */}
        {!compact && (
          <div className="flex gap-1 bg-white border border-[#E5E7EB] p-1 rounded-xl w-fit shadow-sm">
            {([
              { id: 'students', label: '🎮 Students' },
              { id: 'teachers', label: '👨‍🏫 Teachers' },
            ] as { id: 'students' | 'teachers'; label: string }[]).map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setLoading(true); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === t.id
                    ? `bg-gradient-to-r ${GAME_COLOR[gameType]} text-white shadow-sm`
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FA]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ══ STUDENTS TAB ════════════════════════════ */}
        {tab === 'students' && (
          <>
            <div className="flex gap-1.5 flex-wrap">
              {SUBJECTS.map((s) => (
                <button key={s} onClick={() => setSubject(s)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    subject === s
                      ? `bg-gradient-to-r ${GAME_COLOR[gameType]} border-transparent text-white shadow-sm`
                      : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280] hover:border-orange-200 hover:text-orange-500'
                  }`}>
                  {s === 'all' ? '🌐 All Subjects' : s}
                </button>
              ))}
            </div>

            {myStats && (
              <div className={`${GAME_SOFT[gameType]} border rounded-2xl p-4`}>
                <p className={`text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${GAME_ACCENT[gameType]}`}>
                  ⭐ Your Personal Best
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Rank',     value: `#${myStats.rank}`,                    highlight: true },
                    { label: 'Score',    value: myStats.score.toLocaleString('en-IN')               },
                    { label: 'Accuracy', value: `${myStats.accuracy}%`                              },
                    { label: 'Played',   value: myStats.gamesPlayed                                 },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className={`font-extrabold text-sm ${s.highlight ? GAME_ACCENT[gameType] : 'text-[#111827]'}`}>
                        {s.value}
                      </p>
                      <p className="text-[#9CA3AF] text-[10px] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-[#D1D5DB]" />
              </div>
            ) : entries.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl text-center py-12 shadow-sm">
                <Trophy size={32} className="text-orange-200 mx-auto mb-3" />
                <p className="text-[#111827] font-bold text-sm">No scores yet</p>
                <p className="text-[#9CA3AF] text-xs mt-1">Be the first to play and claim #1!</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-[#F3F4F6]">
                  {entries.map((e) => (
                    <div key={e._id}
                      className={`flex items-center gap-3 px-4 py-3.5 transition-all ${
                        RANK_ROW[e.rank] ?? 'hover:bg-[#F8F9FA]'
                      }`}>
                      <div className="w-8 text-center flex-shrink-0">
                        {e.rank <= 3
                          ? <span className="text-xl">{RANK_ICONS[e.rank - 1]}</span>
                          : <span className="text-[#9CA3AF] text-sm font-extrabold">#{e.rank}</span>
                        }
                      </div>
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                        AVATAR_COLORS[e.avatarColor] ?? 'from-orange-500 to-amber-600'
                      } flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 shadow-sm`}>
                        {e.userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#111827] font-bold text-sm truncate">{e.userName}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[#9CA3AF] text-[10px]">{e.accuracy}% accuracy</span>
                          <span className="text-[#D1D5DB] text-[10px]">{e.gamesPlayed} games</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-extrabold text-sm ${RANK_SCORE[e.rank] ?? 'text-[#111827]'}`}>
                          {e.score.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[#9CA3AF] text-[10px]">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ TEACHERS TAB ════════════════════════════ */}
        {tab === 'teachers' && (
          <>
            <p className="text-[#9CA3AF] text-xs">
              Ranked by total video views · Tap a teacher to view their profile
            </p>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-[#D1D5DB]" />
              </div>
            ) : teachers.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl text-center py-12 shadow-sm">
                <Users size={32} className="text-orange-200 mx-auto mb-3" />
                <p className="text-[#111827] font-bold text-sm">No teachers yet</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-[#F3F4F6]">
                  {teachers.map((t) => (
                    <div key={t.teacherId}
                      onClick={() => openTeacherProfile(t.teacherId)}
                      className={`flex items-center gap-3 px-4 py-3.5 transition-all cursor-pointer group ${
                        RANK_ROW[t.rank] ?? 'hover:bg-[#F8F9FA]'
                      }`}>
                      <div className="w-8 text-center flex-shrink-0">
                        {t.rank <= 3
                          ? <span className="text-xl">{RANK_ICONS[t.rank - 1]}</span>
                          : <span className="text-[#9CA3AF] text-sm font-extrabold">#{t.rank}</span>
                        }
                      </div>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(t.name)} flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 shadow-sm ring-2 ring-white group-hover:ring-blue-100 transition-all`}>
                        {getInitials(t.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[#111827] font-bold text-sm truncate group-hover:text-blue-600 transition-colors">
                            {t.name}
                          </p>
                          <span className="text-[#D1D5DB] text-[10px]">·</span>
                          <span className="text-[#9CA3AF] text-[10px] flex items-center gap-0.5">
                            <Users size={9} className="inline" /> {fmtNum(t.followersCount)}
                          </span>
                        </div>
                        <p className="text-[#9CA3AF] text-[10px] truncate mt-0.5">
                          {t.subjects?.slice(0, 2).join(', ') ?? 'Teacher'}
                          {t.subjects?.length > 2 ? ` +${t.subjects.length - 2}` : ''}
                        </p>
                      </div>
                      <div className="items-center gap-3 flex-shrink-0 hidden sm:flex">
                        <div className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Eye size={10} className="text-sky-400" />
                            <span className="text-xs font-bold text-[#374151]">{fmtNum(t.totalViews)}</span>
                          </div>
                          <p className="text-[#9CA3AF] text-[10px]">views</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Star size={10} className="text-amber-400" />
                            <span className="text-xs font-bold text-[#374151]">{t.avgRating?.toFixed(1) ?? '0.0'}</span>
                          </div>
                          <p className="text-[#9CA3AF] text-[10px]">rating</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => toggleFollow(t.teacherId, e)}
                        disabled={followLoading[t.teacherId]}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all ${
                          following[t.teacherId]
                            ? 'bg-blue-50 border-blue-300 text-blue-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500'
                            : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                        }`}>
                        {followLoading[t.teacherId]
                          ? <Loader2 size={11} className="animate-spin" />
                          : following[t.teacherId] ? '✓ Following' : '+ Follow'
                        }
                      </button>
                      <ChevronRight size={14} className="text-[#D1D5DB] group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ TEACHER PROFILE MODAL ═══════════════════════════ */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-white/60 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] flex-shrink-0">
              <p className="text-[#111827] font-extrabold text-sm">Teacher Profile</p>
              <button onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-xl text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {drawerLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 size={28} className="animate-spin text-[#D1D5DB]" />
                  <p className="text-[#9CA3AF] text-sm">Loading profile…</p>
                </div>
              ) : !drawerTeacher ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <span className="text-3xl">😕</span>
                  <p className="text-[#111827] font-bold text-sm">Could not load profile</p>
                  <p className="text-[#9CA3AF] text-xs">Check your API route</p>
                </div>
              ) : (
                <div>
                  <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-5 pt-8 pb-6 text-center overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-orange-500/10" />
                    <div className="relative flex flex-col items-center gap-3">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient(drawerTeacher.name)} flex items-center justify-center text-white font-extrabold text-2xl shadow-lg`}>
                        {getInitials(drawerTeacher.name)}
                      </div>
                      <div>
                        <h3 className="text-white font-extrabold text-lg">{drawerTeacher.name}</h3>
                        <p className="text-white/50 text-xs mt-0.5">{drawerTeacher.email}</p>
                        {drawerTeacher.bio && (
                          <p className="text-white/60 text-xs mt-2 leading-relaxed">{drawerTeacher.bio}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => toggleFollow(drawerTeacher.teacherId, e)}
                        disabled={followLoading[drawerTeacher.teacherId]}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-extrabold border-2 transition-all ${
                          following[drawerTeacher.teacherId]
                            ? 'bg-blue-500 border-blue-500 text-white hover:bg-red-500 hover:border-red-500'
                            : 'bg-white border-white text-[#111827] hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                        }`}>
                        {followLoading[drawerTeacher.teacherId]
                          ? <Loader2 size={13} className="animate-spin" />
                          : following[drawerTeacher.teacherId] ? '✓ Following' : '+ Follow'
                        }
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[#F3F4F6] border-b border-[#F3F4F6]">
                    {[
                      { icon: '👥', value: fmtNum(drawerTeacher.followersCount),       label: 'Followers' },
                      { icon: '👁',  value: fmtNum(drawerTeacher.totalViews),           label: 'Views'     },
                      { icon: '⭐', value: drawerTeacher.avgRating?.toFixed(1) ?? '—', label: 'Rating'    },
                    ].map(s => (
                      <div key={s.label} className="py-4 text-center">
                        <div className="text-base mb-0.5">{s.icon}</div>
                        <p className="text-[#111827] font-extrabold text-sm">{s.value}</p>
                        <p className="text-[#9CA3AF] text-[10px]">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[#F3F4F6] border-b border-[#F3F4F6]">
                    {[
                      { icon: '🎬', value: drawerTeacher.videoCount,                       label: 'Videos' },
                      { icon: '❤️',  value: fmtNum(drawerTeacher.totalLikes),               label: 'Likes'  },
                      { icon: '⏳', value: `${drawerTeacher.yearsOfExperience ?? 0}+ yrs`, label: 'Exp.'   },
                    ].map(s => (
                      <div key={s.label} className="py-4 text-center">
                        <div className="text-base mb-0.5">{s.icon}</div>
                        <p className="text-[#111827] font-extrabold text-sm">{s.value}</p>
                        <p className="text-[#9CA3AF] text-[10px]">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {drawerTeacher.subjects?.length > 0 && (
                    <div className="px-5 py-4 border-b border-[#F3F4F6]">
                      <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3">Subjects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {drawerTeacher.subjects.map((s: string) => (
                          <span key={s} className={`text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full bg-gradient-to-r ${SUBJECT_COLORS[s] ?? 'from-gray-400 to-gray-500'}`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 divide-x divide-[#F3F4F6] border-b border-[#F3F4F6]">
                    {[
                      { label: 'Classes', icon: '🏫', items: drawerTeacher.classes ?? [] },
                      { label: 'Boards',  icon: '📋', items: drawerTeacher.boards  ?? [] },
                    ].map(section => (
                      <div key={section.label} className="px-4 py-4">
                        <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2">
                          {section.icon} {section.label}
                        </p>
                        {section.items.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {section.items.map((item: string) => (
                              <span key={item} className="text-[10px] font-bold text-[#374151] bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[#D1D5DB] text-xs">—</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="px-5 py-5">
                    <a href={`/student/feed?teacher=${drawerTeacher.teacherId}`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-orange-100 hover:brightness-105 transition-all">
                      <Video size={15} />
                      Watch {drawerTeacher.name.split(' ')[0]}'s Videos
                      <TrendingUp size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
