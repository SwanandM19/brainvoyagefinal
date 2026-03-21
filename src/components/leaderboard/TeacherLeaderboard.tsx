'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import {
  Trophy, Heart, Users, Star,
  Eye, Video, ChevronUp, ChevronDown, Loader2, Zap,
} from 'lucide-react';

interface TeacherEntry {
  teacherId: string;
  name: string;
  image?: string;
  subjects: string[];
  followersCount: number;
  totalViews: number;
  videoCount: number;
  totalLikes: number;
  avgRating: number;
  engagementRate: number;
  rank: number;
}
interface MyStats {
  rank: number | null;
  totalViews: number;
  totalLikes: number;
  videoCount: number;
  followersCount: number;
  engagementRate: number;
  avgRating: number;
}
interface Meta {
  totalTeachers: number;
  totalStudents: number;
  totalViews: number;
  subject: string;
  sortBy: string;
}

const SUBJECTS = [
  'all', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Hindi', 'History', 'Geography', 'Computer Science', 'Economics',
  'Accountancy', 'Business Studies',
];

const SORT_OPTIONS = [
  { id: 'views', label: 'Views', emoji: '👁', icon: Eye },
  { id: 'likes', label: 'Likes', emoji: '❤️', icon: Heart },
  { id: 'followers', label: 'Followers', emoji: '👥', icon: Users },
  { id: 'rating', label: 'Rating', emoji: '⭐', icon: Star },
  { id: 'engagement', label: 'Engagement', emoji: '⚡', icon: Zap },
  { id: 'videos', label: 'Videos', emoji: '🎬', icon: Video },
];

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'from-blue-500 to-indigo-600',
  Physics: 'from-purple-500 to-violet-600',
  Chemistry: 'from-green-500 to-emerald-600',
  Biology: 'from-teal-500 to-cyan-600',
  English: 'from-rose-500 to-pink-600',
  Hindi: 'from-orange-500 to-amber-600',
  History: 'from-yellow-500 to-orange-500',
  Geography: 'from-lime-500 to-green-600',
  'Computer Science': 'from-sky-500 to-blue-600',
  Economics: 'from-violet-500 to-purple-600',
  Accountancy: 'from-indigo-500 to-blue-500',
  'Business Studies': 'from-amber-500 to-orange-500',
};

const PODIUM_RING = ['ring-yellow-400', 'ring-slate-300', 'ring-amber-600'];
const PODIUM_BG = ['bg-yellow-50 border-yellow-200', 'bg-slate-50 border-slate-200', 'bg-amber-50 border-amber-200'];
const PODIUM_VALUE = ['text-yellow-600', 'text-slate-500', 'text-amber-700'];
const RANK_ROW_BG = [
  'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  'bg-slate-50  border-slate-200  hover:bg-slate-100',
  'bg-amber-50  border-amber-200  hover:bg-amber-100',
];

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function avatarColor(name: string) {
  const COLORS = [
    'from-rose-500 to-pink-600', 'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600', 'from-sky-500 to-cyan-600',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

// ✅ FIX 1: Wrap in memo — prevents re-renders caused by Google Translate DOM mutations
const TeacherLeaderboard = memo(function TeacherLeaderboard({ currentTeacherId }: { currentTeacherId?: string }) {
  const [entries, setEntries] = useState<TeacherEntry[]>([]);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('all');
  const [sortBy, setSortBy] = useState('views');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/leaderboard/teachers?subject=${encodeURIComponent(subject)}&sortBy=${sortBy}&limit=50`)
      .then(r => r.json())
      .then(d => {
        setEntries(d.teachers ?? []);
        setMyStats(d.myStats ?? null);
        setMeta(d.meta ?? null);
      })
      .finally(() => setLoading(false));
  }, [subject, sortBy]);

  useEffect(() => { load(); }, [load]);

  function getSortValue(entry: TeacherEntry): string {
    switch (sortBy) {
      case 'likes': return fmtNum(entry.totalLikes);
      case 'followers': return fmtNum(entry.followersCount);
      case 'rating': return `★ ${entry.avgRating.toFixed(1)}`;
      case 'engagement': return `${entry.engagementRate.toFixed(1)}%`;
      case 'videos': return fmtNum(entry.videoCount);
      default: return fmtNum(entry.totalViews);
    }
  }

  function getSortLabel(): string {
    return SORT_OPTIONS.find(s => s.id === sortBy)?.label ?? 'Views';
  }

  return (
    <div className="space-y-5">

      {/* ── Platform Stats ──────────────────────────────── */}
      {meta && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Teachers', value: fmtNum(meta.totalTeachers), icon: '👨‍🏫', bg: 'bg-blue-50   border-blue-100', text: 'text-blue-600' },
            { label: 'Students', value: fmtNum(meta.totalStudents), icon: '🎓', bg: 'bg-green-50  border-green-100', text: 'text-green-600' },
            { label: 'Total Views', value: fmtNum(meta.totalViews), icon: '👁', bg: 'bg-orange-50 border-orange-100', text: 'text-orange-600' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-3.5 text-center`}>
              <div className="text-xl mb-1">{s.icon}</div>
              {/* ✅ FIX 2: translate="no" on all numeric values — Google Translate skips them */}
              <p className={`font-extrabold text-lg ${s.text}`} translate="no">{s.value}</p>
              <p className="text-[11px] text-[#9CA3AF] font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── My Standing ─────────────────────────────────── */}
      {/* {myStats && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-orange-500 text-[10px] font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span>📊</span> Your Standing
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: 'Rank',       value: myStats.rank ? `#${myStats.rank}` : '—',       highlight: true },
              { label: 'Views',      value: fmtNum(myStats.totalViews)                                      },
              { label: 'Likes',      value: fmtNum(myStats.totalLikes)                                      },
              { label: 'Followers',  value: fmtNum(myStats.followersCount)                                  },
              { label: 'Videos',     value: myStats.videoCount.toString()                                   },
              { label: 'Engagement', value: `${myStats.engagementRate.toFixed(1)}%`                        },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p
                  className={`font-extrabold text-sm ${s.highlight ? 'text-[#f97316]' : 'text-[#111827]'}`}
                  translate="no"
                >
                  {s.value}
                </p>
                <p className="text-[10px] text-[#9CA3AF] font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* ── Filters ─────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 shadow-sm">
        <div>
          <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2">Filter by Subject</p>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${subject === s
                    ? s === 'all'
                      ? 'bg-gradient-to-r from-[#111827] to-[#1f2937] text-white border-transparent shadow-sm'
                      : `bg-gradient-to-r ${SUBJECT_COLORS[s] ?? 'from-orange-400 to-amber-500'} text-white border-transparent shadow-sm`
                    : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280] hover:border-orange-200 hover:text-orange-500'
                  }`}>
                {s === 'all' ? '🌐 All' : s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-2">Rank by</p>
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setSortBy(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${sortBy === opt.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm'
                    : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280] hover:border-orange-200 hover:text-orange-500'
                  }`}>
                <opt.icon size={11} />
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top 3 Podium ────────────────────────────────── */}
      {!loading && entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {[
            { entry: entries[1], idx: 1 },
            { entry: entries[0], idx: 0 },
            { entry: entries[2], idx: 2 },
          ].map(({ entry: e, idx }) => {
            if (!e) return null;
            return (
              <div key={e.teacherId}
                className={`${PODIUM_BG[idx]} border rounded-2xl p-4 text-center flex flex-col items-center gap-2 transition-all ${idx === 0 ? 'scale-105 shadow-lg shadow-yellow-200' : 'mt-4 shadow-sm'
                  }`}>
                <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                <div className={`w-12 h-12 rounded-full ring-2 ${PODIUM_RING[idx]} bg-gradient-to-br ${avatarColor(e.name)} flex items-center justify-center text-white font-extrabold text-sm shadow-sm`}
                  translate="no">
                  {getInitials(e.name)}
                </div>
                <div className="min-w-0 w-full">
                  <p className="font-extrabold text-[#111827] text-xs truncate">{e.name}</p>
                  <p className="text-[#9CA3AF] text-[10px] truncate">{e.subjects?.[0] ?? 'Teacher'}</p>
                </div>
                <div>
                  <p className={`font-extrabold text-sm ${PODIUM_VALUE[idx]}`} translate="no">{getSortValue(e)}</p>
                  <p className="text-[#9CA3AF] text-[10px]">{getSortLabel()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full List ────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#D1D5DB]" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl py-16 text-center shadow-sm">
          <Trophy size={40} className="text-orange-200 mx-auto mb-3" />
          <p className="font-bold text-[#111827]">No teachers ranked yet</p>
          <p className="text-sm text-[#9CA3AF] mt-1">Teachers with approved videos will appear here</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-[#F3F4F6]">
            {entries.map((e) => (
              // ✅ FIX 3: stable key using teacherId — prevents row unmount/remount
              <div key={e.teacherId}>
                <div
                  onClick={() => setExpanded(prev => prev === e.teacherId ? null : e.teacherId)}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all ${e.rank <= 3
                      ? RANK_ROW_BG[e.rank - 1]
                      : 'hover:bg-[#F8F9FA]'
                    }`}>

                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0" translate="no">
                    {e.rank <= 3 ? (
                      <span className="text-lg">{e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : '🥉'}</span>
                    ) : (
                      <span className="text-[#9CA3AF] font-extrabold text-sm">#{e.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(e.name)} flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 shadow-sm`}
                    translate="no"
                  >
                    {getInitials(e.name)}
                  </div>

                  {/* Name + subjects */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#111827] text-sm truncate">{e.name}</p>
                    <p className="text-[#9CA3AF] text-xs truncate">
                      {e.subjects?.slice(0, 2).join(', ') || 'Teacher'}
                      {e.subjects?.length > 2 ? ` +${e.subjects.length - 2}` : ''}
                    </p>
                  </div>

                  {/* Primary metric */}
                  <div className="text-right flex-shrink-0" translate="no">
                    <p className="font-extrabold text-[#111827] text-sm">{getSortValue(e)}</p>
                    <p className="text-[#9CA3AF] text-[10px]">{getSortLabel()}</p>
                  </div>

                  {/* Expand */}
                  <div className="text-[#D1D5DB] flex-shrink-0">
                    {expanded === e.teacherId
                      ? <ChevronUp size={14} />
                      : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Expanded stats */}
                {expanded === e.teacherId && (
                  <div className="px-4 pb-4 pt-1 ml-11 mr-4">
                    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4">
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {[
                          { label: 'Views', value: fmtNum(e.totalViews), icon: '👁' },
                          { label: 'Likes', value: fmtNum(e.totalLikes), icon: '❤️' },
                          { label: 'Followers', value: fmtNum(e.followersCount), icon: '👥' },
                          { label: 'Videos', value: e.videoCount.toString(), icon: '🎬' },
                          { label: 'Avg Rating', value: `★ ${e.avgRating.toFixed(1)}`, icon: '⭐' },
                          { label: 'Engagement', value: `${e.engagementRate.toFixed(1)}%`, icon: '⚡' },
                        ].map(s => (
                          <div key={s.label} className="text-center">
                            <div className="text-base mb-0.5">{s.icon}</div>
                            <p className="font-extrabold text-[#111827] text-sm" translate="no">{s.value}</p>
                            <p className="text-[#9CA3AF] text-[10px]">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default TeacherLeaderboard;
