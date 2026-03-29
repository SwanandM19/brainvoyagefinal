'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import {
  Play, Users, Star, Eye, BarChart3, Upload,
  LogOut, Settings, ChevronRight, ChevronLeft,
  Clock, CheckCircle, PlusCircle, Trophy,
  X, Edit3, Save, Loader2, Trash2,
  TrendingUp, Video, Award, Zap, Sparkles,
} from 'lucide-react';
import Logo from '@/components/layout/Logo';
import UploadVideoModal from './UploadVideoModal';
import TeacherLeaderboard from '@/components/leaderboard/TeacherLeaderboard';

// ── Interfaces ────────────────────────────────────────────
interface VideoItem {
  id: string; title: string; subject: string;
  views: number; rating: number; status: string;
  createdAt: string; thumbnail: string | null;
  videoUrl?: string; description?: string;
}
interface CommunityVideo {
  id: string; title: string; subject: string;
  classes: string[]; boards: string[]; videoUrl: string;
  createdAt: string;
  teacher: { id: string; name: string; email: string };
}
interface Teacher {
  name: string; email: string; subjects: string[];
  classes: string[]; boards: string[]; city: string;
  state: string; bio: string; yearsOfExperience: number;
  phone?: string;
}
interface Stats {
  totalVideos: number; totalViews: number;
  totalFollowers: number; avgRating: string;
  totalLikes?: number;
}

// ── Constants ─────────────────────────────────────────────
const ALL_SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology','English','Hindi',
  'History','Geography','Computer Science','Economics','Accountancy','Business Studies',
];
const ALL_CLASSES = [
  'Class 6','Class 7','Class 8','Class 9','Class 10',
  'Class 11','Class 12','JEE','NEET','UPSC','CA',
];
const ALL_BOARDS = [
  'CBSE','ICSE','Maharashtra Board','UP Board','RBSE',
  'Tamil Nadu Board','Karnataka Board','Other',
];

const SUBJECT_COLORS: Record<string, string> = {
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
  Accountancy: 'from-indigo-500 to-blue-500',
  'Business Studies': 'from-amber-500 to-orange-500',
};

const SUBJECT_PILL: Record<string, { bg: string; text: string; dot: string }> = {
  Mathematics:        { bg: 'rgba(59,130,246,0.1)',  text: '#3b82f6', dot: '#3b82f6'  },
  Physics:            { bg: 'rgba(168,85,247,0.1)',  text: '#a855f7', dot: '#a855f7'  },
  Chemistry:          { bg: 'rgba(34,197,94,0.1)',   text: '#22c55e', dot: '#22c55e'  },
  Biology:            { bg: 'rgba(20,184,166,0.1)',  text: '#14b8a6', dot: '#14b8a6'  },
  English:            { bg: 'rgba(236,72,153,0.1)',  text: '#ec4899', dot: '#ec4899'  },
  Hindi:              { bg: 'rgba(249,115,22,0.1)',  text: '#f97316', dot: '#f97316'  },
  'Computer Science': { bg: 'rgba(14,165,233,0.1)',  text: '#0ea5e9', dot: '#0ea5e9'  },
  Economics:          { bg: 'rgba(139,92,246,0.1)',  text: '#8b5cf6', dot: '#8b5cf6'  },
  History:            { bg: 'rgba(234,179,8,0.1)',   text: '#eab308', dot: '#eab308'  },
  Geography:          { bg: 'rgba(132,204,22,0.1)',  text: '#84cc16', dot: '#84cc16'  },
};

type Tab = 'overview' | 'videos' | 'community' | 'leaderboard' | 'profile';

// ── Helpers ───────────────────────────────────────────────
function communityInitials(name: string) {
  return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}
function avatarGradient(name: string) {
  const GRADS = [
    'linear-gradient(135deg,#f97316,#ef4444)',
    'linear-gradient(135deg,#a855f7,#6366f1)',
    'linear-gradient(135deg,#22c55e,#14b8a6)',
    'linear-gradient(135deg,#3b82f6,#a855f7)',
    'linear-gradient(135deg,#ec4899,#f97316)',
    'linear-gradient(135deg,#eab308,#f97316)',
  ];
  let h = 0;
  for (let i = 0; i < (name?.length ?? 0); i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return GRADS[Math.abs(h) % GRADS.length];
}
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── StatCard ──────────────────────────────────────────────
function StatCard({ icon, label, value, gradient, note }: {
  icon: React.ReactNode; label: string;
  value: string | number; gradient: string; note?: string;
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-sm`}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-[#111827] tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-[#6B7280] mt-0.5">{label}</p>
      {note && <p className="text-[10px] text-[#9CA3AF] mt-1">{note}</p>}
    </div>
  );
}

// ── Video Preview Modal ───────────────────────────────────
function VideoPreviewModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const isYT = video.videoUrl?.includes('youtube.com') || video.videoUrl?.includes('youtu.be');
  function ytEmbed(url: string) {
    const m = url.match(/^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    const id = m?.[2]?.length === 11 ? m[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
  }
  const grad = SUBJECT_COLORS[video.subject] ?? 'from-orange-500 to-amber-600';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-[#E5E7EB]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F3F4F6]">
          <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${grad} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-[#111827] font-bold text-sm truncate">{video.title}</p>
            <p className="text-[#9CA3AF] text-xs">{video.subject}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F8F9FA] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          {video.videoUrl ? (
            isYT ? (
              <iframe src={ytEmbed(video.videoUrl)} className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <video src={video.videoUrl} controls autoPlay className="w-full h-full object-contain" playsInline />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                <Play size={28} className="text-white ml-1" />
              </div>
              <p className="text-white/50 text-sm">Video URL not available</p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 flex items-center gap-4 text-xs text-[#9CA3AF] font-semibold">
          <span className="flex items-center gap-1"><Eye size={11} /> {video.views.toLocaleString('en-IN')} views</span>
          <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400" fill="#facc15" /> {video.rating.toFixed(1)}</span>
          <span className="flex items-center gap-1"><Clock size={11} />
            {new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className={`ml-auto px-2 py-0.5 rounded-full border font-bold text-[10px] ${
            video.status === 'active'  ? 'bg-green-50 text-green-600 border-green-200' :
            video.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                         'bg-red-50 text-red-500 border-red-200'
          }`}>{video.status}</span>
        </div>
        {video.description && (
          <div className="px-4 pb-4">
            <p className="text-[#6B7280] text-xs leading-relaxed line-clamp-3">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Community Feed (inline) ───────────────────────────────
function CommunityFeed({ initialVideos }: { initialVideos: CommunityVideo[] }) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const videos = initialVideos;
  const subjects = [...new Set(videos.map(v => v.subject))].filter(Boolean);

  const teacherStats = videos.reduce<Record<string, { name: string; count: number }>>((acc, v) => {
    if (!acc[v.teacher.id]) acc[v.teacher.id] = { name: v.teacher.name, count: 0 };
    acc[v.teacher.id].count++;
    return acc;
  }, {});
  const topTeachers = Object.entries(teacherStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const subjectDist = videos.reduce<Record<string, number>>((acc, v) => {
    acc[v.subject] = (acc[v.subject] || 0) + 1;
    return acc;
  }, {});

  const filtered = activeSubject ? videos.filter(v => v.subject === activeSubject) : videos;

  if (videos.length === 0) return (
    <div style={{ textAlign: 'center', padding: '64px 0' }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Video size={28} color="#f97316" />
      </div>
      <p style={{ fontWeight: 900, fontSize: 16, color: '#111827', margin: '0 0 8px' }}>No community videos yet</p>
      <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Be the first to upload! Your colleagues are watching 👀</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

      {/* ── Main Feed ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Feed header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#f97316,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={17} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#111827' }}>Teacher Community Feed</p>
              <p style={{ margin: 0, fontSize: 11, color: '#6B7280' }}>{videos.length} videos from {Object.keys(teacherStats).length} fellow teachers</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'cfblink 1.4s ease infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>Live updates</span>
          </div>
        </div>

        {/* Subject filter pills */}
        {subjects.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
            <button onClick={() => setActiveSubject(null)} style={{ padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 800, cursor: 'pointer', border: 'none', flexShrink: 0, background: !activeSubject ? 'linear-gradient(135deg,#f97316,#a855f7)' : '#F3F4F6', color: !activeSubject ? '#fff' : '#6B7280', transition: 'all 0.2s' }}>
              All
            </button>
            {subjects.map(sub => {
              const col = SUBJECT_PILL[sub] ?? { bg: 'rgba(107,114,128,0.1)', text: '#6B7280', dot: '#6B7280' };
              return (
                <button key={sub} onClick={() => setActiveSubject(activeSubject === sub ? null : sub)}
                  style={{ padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 800, cursor: 'pointer', border: `1px solid ${activeSubject === sub ? col.dot : 'transparent'}`, flexShrink: 0, background: activeSubject === sub ? col.bg : '#F3F4F6', color: activeSubject === sub ? col.text : '#6B7280', transition: 'all 0.2s' }}>
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((video, idx) => {
            const col = SUBJECT_PILL[video.subject] ?? { bg: 'rgba(249,115,22,0.08)', text: '#f97316', dot: '#f97316' };
            const isPreview = previewId === video.id;
            return (
              <div key={video.id}
                style={{ background: '#fff', borderRadius: 18, border: isPreview ? '1.5px solid #f97316' : '1px solid #E5E7EB', overflow: 'hidden', transition: 'box-shadow 0.2s,transform 0.2s', boxShadow: isPreview ? '0 8px 30px rgba(249,115,22,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { if (!isPreview) { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; } }}
                onMouseLeave={e => { if (!isPreview) { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; } }}>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <button onClick={() => setPreviewId(isPreview ? null : video.id)}
                    style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: isPreview ? 'linear-gradient(135deg,#f97316,#a855f7)' : col.bg }}>
                    <Play size={16} fill={isPreview ? '#fff' : col.text} color={isPreview ? '#fff' : col.text} style={{ marginLeft: 2 }} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 900, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: avatarGradient(video.teacher.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                        {communityInitials(video.teacher.name)}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{video.teacher.name}</span>
                      <span style={{ fontSize: 10, color: '#9CA3AF' }}>·</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={9} /> {timeAgo(video.createdAt)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 99, background: col.bg, color: col.text }}>{video.subject}</span>
                      {video.classes.slice(0, 2).map(c => (
                        <span key={c} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#F3F4F6', color: '#374151' }}>{c}</span>
                      ))}
                      {video.boards.slice(0, 1).map(b => (
                        <span key={b} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>{b}</span>
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#9CA3AF', flexShrink: 0, paddingTop: 2 }}>#{idx + 1}</span>
                </div>
                {isPreview && (
                  <div style={{ margin: '0 16px 14px', borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                    <video src={video.videoUrl} controls autoPlay style={{ width: '100%', display: 'block', background: '#000', maxHeight: 260, objectFit: 'contain' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div style={{ width: 232, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Community pulse */}
        <div style={{ background: 'linear-gradient(135deg,#0a0a1a,#1a0a35)', borderRadius: 18, padding: 18 }}>
          <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>Community Pulse</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: <Video size={13} />, label: 'Total Videos',    value: videos.length,                          color: '#f97316' },
              { icon: <Users size={13} />, label: 'Active Teachers', value: Object.keys(teacherStats).length,       color: '#a855f7' },
              { icon: <BarChart3 size={13} />, label: 'Subjects',    value: subjects.length,                        color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top contributors */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Award size={14} color="#f97316" />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: '#111827' }}>Top Contributors</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topTeachers.map(([id, t], i) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarGradient(t.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                  {communityInitials(t.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF' }}>{t.count} video{t.count > 1 ? 's' : ''}</p>
                </div>
                {i === 0 && <span style={{ fontSize: 14 }}>🥇</span>}
                {i === 1 && <span style={{ fontSize: 14 }}>🥈</span>}
                {i === 2 && <span style={{ fontSize: 14 }}>🥉</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Subject distribution */}
        {Object.keys(subjectDist).length > 0 && (
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <TrendingUp size={14} color="#a855f7" />
              <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: '#111827' }}>By Subject</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(subjectDist).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([sub, cnt]) => {
                const col = SUBJECT_PILL[sub] ?? { bg: 'rgba(107,114,128,0.1)', text: '#6B7280', dot: '#6B7280' };
                const pct = Math.round((cnt / videos.length) * 100);
                return (
                  <div key={sub}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{sub}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: col.text }}>{cnt}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: '#F3F4F6', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: col.dot, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload CTA */}
        <div style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.08),rgba(168,85,247,0.08))', borderRadius: 18, border: '1px solid rgba(249,115,22,0.2)', padding: 16, textAlign: 'center' }}>
          <Sparkles size={20} color="#f97316" style={{ marginBottom: 8 }} />
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 900, color: '#111827' }}>Inspire your colleagues!</p>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#6B7280', lineHeight: 1.6 }}>Upload a video and contribute to the community.</p>
          <a href="/teacher/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#f97316,#a855f7)', color: '#fff', fontSize: 11, fontWeight: 900, padding: '8px 16px', borderRadius: 10, textDecoration: 'none' }}>
            Upload Video <ChevronRight size={11} />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes cfblink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function TeacherDashboardClient({
  teacher: initialTeacher, stats, videos: initialVideos,
  subscription, communityVideos = [],
}: {
  teacher: Teacher; stats: Stats; videos: VideoItem[];
  subscription?: { status: string; trialEndsAt: string | null; currentPeriodEnd: string | null };
  communityVideos?: CommunityVideo[];
}) {
  const [showUpload,      setShowUpload]      = useState(false);
  const [activeTab,       setActiveTab]       = useState<Tab>('overview');
  const [previewVideo,    setPreviewVideo]    = useState<VideoItem | null>(null);
  const [videos,          setVideos]          = useState<VideoItem[]>(initialVideos);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting,        setDeleting]        = useState(false);
  const [teacher,         setTeacher]         = useState<Teacher>(initialTeacher);
  const [editing,         setEditing]         = useState(false);
  const [profileForm,     setProfileForm]     = useState<Teacher>(initialTeacher);
  const [saving,          setSaving]          = useState(false);
  const [saveSuccess,     setSaveSuccess]     = useState(false);
  const [saveError,       setSaveError]       = useState('');
  const [showProfileDrop, setShowProfileDrop] = useState(false);
  const profileDropRef = useRef<HTMLDivElement>(null);

  const initials = teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const NAV_ITEMS: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'overview',    icon: <BarChart3 size={17} />, label: 'Overview'    },
    { id: 'videos',      icon: <Play      size={17} />, label: 'My Videos'   },
    { id: 'community',   icon: <Users     size={17} />, label: 'Community'   },
    { id: 'leaderboard', icon: <Trophy    size={17} />, label: 'Leaderboard' },
    { id: 'profile',     icon: <Settings  size={17} />, label: 'Profile'     },
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileDropRef.current && !profileDropRef.current.contains(e.target as Node)) {
        setShowProfileDrop(false);
      }
    }
    if (showProfileDrop) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfileDrop]);

  async function handleDeleteVideo(id: string | null) {
    if (!id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? 'Failed to delete video.'); return; }
      setVideos(prev => prev.filter(v => v.id !== id));
      setConfirmDeleteId(null);
      if (previewVideo?.id === id) setPreviewVideo(null);
    } catch (err) {
      console.error('[delete error]', err);
      alert('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveProfile() {
    if (!profileForm.name.trim()) { setSaveError('Name is required'); return; }
    setSaving(true); setSaveError('');
    try {
      const res = await fetch('/api/teacher/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        setTeacher(profileForm); setEditing(false);
        setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      } else { setSaveError('Failed to save. Please try again.'); }
    } catch { setSaveError('Network error. Please try again.'); }
    finally { setSaving(false); }
  }

  function toggleArrayItem(arr: string[], item: string) {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
  }
  function setField(field: keyof Teacher, value: any) {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E5E7EB] flex-shrink-0 h-screen sticky top-0">
        <div className="h-[100px] flex items-center px-5 border-b border-[#E5E7EB] gap-3">
          <a href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#f97316] hover:border-orange-200 hover:bg-orange-50 transition-all group text-xs font-bold flex-shrink-0">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Home</span>
          </a>
          <div className="h-5 w-px bg-[#E5E7EB]" />
          <Logo size="sm" />
        </div>

        <nav className="px-3 py-5 flex-1 space-y-1">
          <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest px-3 mb-3">Menu</p>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-200'
                  : 'text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111827]'
              }`}>
              <span className={activeTab === item.id ? 'text-white' : 'text-[#9CA3AF]'}>{item.icon}</span>
              {item.label}
              {item.id === 'videos' && videos.length > 0 && (
                <span className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === item.id ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-500'
                }`}>{videos.length}</span>
              )}
              {item.id === 'community' && communityVideos.length > 0 && (
                <span className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === item.id ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-500'
                }`}>{communityVideos.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-3">
          <button onClick={() => setShowUpload(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-sm shadow-orange-200 hover:brightness-105 transition-all">
            <Upload size={15} /> Upload Video
          </button>
        </div>

        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-[#F8F9FA] transition-colors cursor-pointer"
            onClick={() => setActiveTab('profile')}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#111827] truncate">{teacher.name}</p>
              <p className="text-xs text-[#9CA3AF] truncate">{teacher.email}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border border-red-100 transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Top bar */}
        <header className="h-[100px] bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] flex items-center px-6 gap-4 sticky top-0 z-40">
          <div className="lg:hidden flex items-center gap-2">
            <a href="/"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#f97316] hover:border-orange-200 hover:bg-orange-50 transition-all group text-xs font-bold">
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </a>
            <Logo size="sm" />
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              {activeTab === 'overview'    && <BarChart3 size={15} className="text-white" />}
              {activeTab === 'videos'      && <Play      size={15} className="text-white" />}
              {activeTab === 'community'   && <Users     size={15} className="text-white" />}
              {activeTab === 'leaderboard' && <Trophy    size={15} className="text-white" />}
              {activeTab === 'profile'     && <Settings  size={15} className="text-white" />}
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-[#111827] capitalize">{activeTab}</h1>
              <p className="text-[10px] text-[#9CA3AF]">Welcome back, {teacher.name.split(' ')[0]}!</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-sm shadow-orange-100 hover:brightness-105 transition-all">
              <Upload size={15} />
              <span className="hidden sm:block">Upload Video</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <div ref={profileDropRef} className="relative">
              <button onClick={() => setShowProfileDrop(prev => !prev)}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 flex-shrink-0 ${
                  showProfileDrop
                    ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white border-orange-400'
                    : 'bg-gradient-to-br from-orange-100 to-amber-100 text-[#f97316] border-orange-100 hover:border-orange-400'
                }`}>
                {initials}
              </button>
              {showProfileDrop && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] z-50 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#f97316] to-[#ea580c] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-extrabold text-xs truncate">{teacher.name}</p>
                        <p className="text-white/60 text-[10px] truncate">{teacher.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={() => { setActiveTab('profile'); setShowProfileDrop(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Settings size={13} className="text-orange-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-[#111827]">Profile Settings</p>
                        <p className="text-[10px] text-[#9CA3AF]">Edit your info</p>
                      </div>
                    </button>
                    <div className="border-t border-[#F3F4F6] my-1" />
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors">
                        <LogOut size={13} className="text-red-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-red-500">Sign Out</p>
                        <p className="text-[10px] text-[#9CA3AF]">See you next time!</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile tab bar */}
        <div className="lg:hidden flex overflow-x-auto scrollbar-hide bg-white border-b border-[#E5E7EB] px-3 gap-1 py-2 sticky top-16 z-30">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-[#6B7280] hover:bg-[#F8F9FA]'
              }`}>
              {item.icon}{item.label}
            </button>
          ))}
        </div>

        {/* ── Content ─────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">

          {/* ── OVERVIEW ──────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              {/* Welcome Banner */}
              <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-6 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-orange-500/10" />
                <div className="absolute right-16 -bottom-6 w-24 h-24 rounded-full bg-amber-400/10" />
                <div className="absolute right-4 top-4 w-12 h-12 rounded-full bg-white/5" />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-wider">
                        ✦ Teacher Dashboard
                      </span>
                    </div>
                    <h2 className="text-white font-extrabold text-xl mb-1">
                      Hey, {teacher.name.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-white/50 text-sm mb-4">
                      {stats.totalVideos > 0
                        ? `${stats.totalVideos} video${stats.totalVideos > 1 ? 's' : ''} · ${stats.totalViews.toLocaleString('en-IN')} views · ${stats.totalFollowers} followers`
                        : 'Start uploading to reach students nationwide'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setActiveTab('leaderboard')}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-all group">
                        <Trophy size={13} className="text-yellow-400" />
                        View Leaderboard
                        <ChevronRight size={12} className="text-white/50 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                      <button onClick={() => setActiveTab('community')}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-all group">
                        <Users size={13} className="text-purple-400" />
                        Community Feed
                        <ChevronRight size={12} className="text-white/50 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-orange-500/20">
                      {initials}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-400">
                      <CheckCircle size={10} /> Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: <Play  size={18} className="text-white" />, label: 'Total Videos',  value: stats.totalVideos,                          gradient: 'from-orange-400 to-amber-500',  bg: 'from-orange-50 to-amber-50',   border: 'border-orange-100', text: 'text-orange-500',  note: stats.totalVideos > 0 ? 'Keep uploading!' : 'Upload your first' },
                  { icon: <Eye   size={18} className="text-white" />, label: 'Total Views',   value: stats.totalViews.toLocaleString('en-IN'),    gradient: 'from-blue-400 to-indigo-500',   bg: 'from-blue-50 to-indigo-50',    border: 'border-blue-100',   text: 'text-blue-500',    note: 'Across all videos' },
                  { icon: <Users size={18} className="text-white" />, label: 'Followers',     value: stats.totalFollowers.toLocaleString('en-IN'),gradient: 'from-green-400 to-emerald-500', bg: 'from-green-50 to-emerald-50',  border: 'border-green-100',  text: 'text-green-600',   note: 'Students following you' },
                  { icon: <Star  size={18} className="text-white" />, label: 'Avg Rating',    value: `${stats.avgRating} ★`,                     gradient: 'from-yellow-400 to-orange-400', bg: 'from-yellow-50 to-orange-50',  border: 'border-yellow-100', text: 'text-yellow-600',  note: 'Based on all videos' },
                ].map(s => (
                  <div key={s.label}
                    className={`relative bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl p-4 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-sm`}>{s.icon}</div>
                    <p className={`text-2xl font-extrabold ${s.text} tabular-nums`}>{s.value}</p>
                    <p className="text-xs font-bold text-[#374151] mt-0.5">{s.label}</p>
                    {s.note && <p className="text-[10px] text-[#9CA3AF] mt-1">{s.note}</p>}
                  </div>
                ))}
              </div>

              {/* Profile summary card */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-base flex-shrink-0 shadow-md shadow-orange-200">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-extrabold text-[#111827]">{teacher.name}</h2>
                        <span className="bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle size={9} /> Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] truncate">{teacher.email}</p>
                      {teacher.bio && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">{teacher.bio}</p>}
                    </div>
                    <button onClick={() => { setActiveTab('profile'); setEditing(true); }}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-dashed border-orange-200 text-xs font-bold text-orange-400 hover:border-orange-400 hover:bg-orange-50 transition-all">
                      <Edit3 size={11} /> Edit
                    </button>
                  </div>
                  <div className="border-t border-[#F3F4F6] my-3" />
                  <div className="flex items-center gap-3 flex-wrap justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {teacher.subjects.slice(0, 3).map(s => (
                        <span key={s} className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full bg-gradient-to-r ${SUBJECT_COLORS[s] ?? 'from-gray-400 to-gray-500'}`}>{s}</span>
                      ))}
                      {teacher.subjects.length > 3 && <span className="text-[10px] text-[#9CA3AF] font-semibold">+{teacher.subjects.length - 3}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[14px] text-[#9CA3AF] font-semibold flex-shrink-0">
                      <span className="flex items-center gap-1"><span className="text-base">⏳</span><span className="text-[#111827] font-bold">{teacher.yearsOfExperience}+</span> yrs</span>
                      <div className="w-px h-3 bg-[#E5E7EB]" />
                      <span className="flex items-center gap-1"><span className="text-base">🏫</span><span className="text-[#111827] font-bold">{teacher.classes.length}</span> classes</span>
                      <div className="w-px h-3 bg-[#E5E7EB]" />
                      <span className="flex items-center gap-1"><span className="text-base">🎓</span><span className="text-[#111827] font-bold">{teacher.boards.length}</span> boards</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent videos */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Play size={13} className="text-orange-500" fill="#f97316" />
                    </div>
                    <h3 className="font-extrabold text-[#111827] text-sm">Recent Videos</h3>
                  </div>
                  <button onClick={() => setActiveTab('videos')} className="text-xs font-bold text-[#f97316] flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ChevronRight size={13} />
                  </button>
                </div>
                {videos.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4"><Upload size={28} className="text-orange-300" /></div>
                    <p className="font-bold text-[#111827]">No videos yet</p>
                    <p className="text-sm text-[#9CA3AF] mt-1 mb-5">Upload your first teaching video to get started.</p>
                    <button onClick={() => setShowUpload(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-sm shadow-orange-200 hover:brightness-105 transition-all">
                      <PlusCircle size={15} /> Upload First Video
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {videos.slice(0, 5).map(video => (
                      <VideoRow key={video.id} video={video}
                        onPreview={() => setPreviewVideo(video)}
                        onDelete={id => setConfirmDeleteId(id)} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── VIDEOS TAB ──────────────────────────────── */}
          {activeTab === 'videos' && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-[#111827]">My Videos</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {videos.length > 0 ? `${videos.length} video${videos.length > 1 ? 's' : ''} uploaded` : 'No videos yet'}
                  </p>
                </div>
                <button onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-sm shadow-orange-100 hover:brightness-105 transition-all">
                  <Upload size={14} /> Upload New
                </button>
              </div>
              {videos.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-dashed border-orange-200 flex items-center justify-center mx-auto mb-5">
                    <Play size={36} className="text-orange-300" />
                  </div>
                  <p className="font-extrabold text-[#111827] text-lg">No videos yet</p>
                  <p className="text-sm text-[#9CA3AF] mt-2 mb-6 max-w-sm mx-auto leading-relaxed">
                    Share your knowledge with students nationwide. Upload your first video to get started.
                  </p>
                  <button onClick={() => setShowUpload(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md shadow-orange-200 hover:brightness-105 transition-all">
                    <Upload size={16} /> Upload Your First Video
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#F3F4F6]">
                  {videos.map(video => (
                    <VideoRow key={video.id} video={video} showDate
                      onPreview={() => setPreviewVideo(video)}
                      onDelete={id => setConfirmDeleteId(id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── COMMUNITY TAB ───────────────────────────── */}
          {activeTab === 'community' && (
            <div className="space-y-5">
              {/* Header banner */}
              <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-6 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-purple-500/10" />
                <div className="absolute right-16 -bottom-6 w-24 h-24 rounded-full bg-pink-400/10" />
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                    <Users size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-purple-500/20 text-purple-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-purple-500/20 uppercase tracking-wider">
                        👥 Live Community
                      </span>
                    </div>
                    <h2 className="text-white font-extrabold text-lg">Teacher Community Feed</h2>
                    <p className="text-white/50 text-xs mt-0.5">Watch what your fellow teachers are uploading — stay inspired & connected</p>
                  </div>
                </div>
              </div>
              <CommunityFeed initialVideos={communityVideos} />
            </div>
          )}

          {/* ── LEADERBOARD TAB ─────────────────────────── */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-5">
              <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-6 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-violet-500/10" />
                <div className="absolute right-16 -bottom-6 w-24 h-24 rounded-full bg-purple-400/10" />
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
                    <Trophy size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-yellow-500/20 uppercase tracking-wider">
                        🏆 Live Rankings
                      </span>
                    </div>
                    <h2 className="text-white font-extrabold text-lg">National Teacher Leaderboard</h2>
                    <p className="text-white/50 text-xs mt-0.5">Live rankings based on views, likes, followers & engagement</p>
                  </div>
                </div>
              </div>
              <TeacherLeaderboard />
            </div>
          )}

          {/* ── PROFILE TAB ─────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-[#111827] text-lg">Your Profile</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{editing ? 'Make your changes then save' : 'View and edit your public profile'}</p>
                </div>
                {!editing ? (
                  <button onClick={() => { setEditing(true); setProfileForm(teacher); setSaveError(''); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-sm shadow-orange-200 hover:brightness-105 transition-all">
                    <Edit3 size={14} /> Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditing(false); setProfileForm(teacher); setSaveError(''); }}
                      className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F8F9FA] transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-sm shadow-orange-200 hover:brightness-105 disabled:opacity-60 transition-all">
                      {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
                    </button>
                  </div>
                )}
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-xl">
                  <CheckCircle size={15} /> Profile saved successfully!
                </div>
              )}
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">{saveError}</div>
              )}

              <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-2xl p-6 overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-orange-500/10" />
                <div className="absolute right-12 -bottom-4 w-16 h-16 rounded-full bg-amber-500/10" />
                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0 shadow-lg shadow-orange-500/20">
                    {(editing ? profileForm.name : teacher.name).split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-lg">{editing ? (profileForm.name || 'Your Name') : teacher.name}</p>
                    <p className="text-white/50 text-sm">{teacher.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 bg-green-500/15 text-green-400 border border-green-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <CheckCircle size={9} /> Verified Teacher
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 space-y-4">
                <h3 className="font-extrabold text-[#111827] text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center"><Edit3 size={12} className="text-orange-400" /></span>
                  Basic Info
                </h3>
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-1.5 block">Full Name <span className="text-red-400">*</span></label>
                  {editing ? (
                    <input value={profileForm.name} onChange={e => setField('name', e.target.value)}
                      className="w-full border-2 border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] font-medium focus:outline-none focus:border-orange-400 transition-colors bg-white" />
                  ) : (
                    <p className="text-sm font-semibold text-[#374151]">{teacher.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-1.5 block">Bio</label>
                  {editing ? (
                    <textarea value={profileForm.bio} onChange={e => setField('bio', e.target.value)}
                      rows={3} placeholder="Tell students about yourself..."
                      className="w-full border-2 border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors resize-none bg-white" />
                  ) : (
                    <p className="text-sm text-[#6B7280] leading-relaxed">{teacher.bio || <span className="italic text-[#D1D5DB]">Not set</span>}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-1.5 block">Years of Experience</label>
                  {editing ? (
                    <input type="number" min={0} max={60} value={profileForm.yearsOfExperience}
                      onChange={e => setField('yearsOfExperience', Number(e.target.value))}
                      className="w-full border-2 border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors bg-white" />
                  ) : (
                    <p className="text-sm font-semibold text-[#374151]">{teacher.yearsOfExperience} years</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 space-y-4">
                <h3 className="font-extrabold text-[#111827] text-sm flex items-center gap-2"><span className="text-base">📍</span> Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(['city', 'state'] as const).map(field => (
                    <div key={field}>
                      <label className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-1.5 block capitalize">{field}</label>
                      {editing ? (
                        <input value={profileForm[field]} onChange={e => setField(field, e.target.value)} placeholder={`Your ${field}`}
                          className="w-full border-2 border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors bg-white" />
                      ) : (
                        <p className="text-sm font-semibold text-[#374151]">{teacher[field] || <span className="italic text-[#D1D5DB] font-normal">Not set</span>}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 space-y-3">
                <h3 className="font-extrabold text-[#111827] text-sm flex items-center gap-2"><span className="text-base">📚</span> Subjects</h3>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {ALL_SUBJECTS.map(s => (
                      <button key={s} type="button" onClick={() => setField('subjects', toggleArrayItem(profileForm.subjects, s))}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          profileForm.subjects.includes(s)
                            ? `bg-gradient-to-r ${SUBJECT_COLORS[s] ?? 'from-orange-500 to-amber-500'} text-white border-transparent shadow-sm`
                            : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-orange-200 hover:text-orange-500'
                        }`}>{s}</button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.length > 0
                      ? teacher.subjects.map(s => (
                          <span key={s} className={`text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full bg-gradient-to-r ${SUBJECT_COLORS[s] ?? 'from-gray-400 to-gray-500'}`}>{s}</span>
                        ))
                      : <span className="text-sm italic text-[#D1D5DB]">No subjects set</span>}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 space-y-3">
                <h3 className="font-extrabold text-[#111827] text-sm flex items-center gap-2"><span className="text-base">🏫</span> Classes</h3>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {ALL_CLASSES.map(c => (
                      <button key={c} type="button" onClick={() => setField('classes', toggleArrayItem(profileForm.classes, c))}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          profileForm.classes.includes(c)
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-sm'
                            : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-blue-200 hover:text-blue-500'
                        }`}>{c}</button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teacher.classes.length > 0
                      ? teacher.classes.map(c => <span key={c} className="px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200">{c}</span>)
                      : <span className="text-sm italic text-[#D1D5DB]">No classes set</span>}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 space-y-3">
                <h3 className="font-extrabold text-[#111827] text-sm flex items-center gap-2"><span className="text-base">🎓</span> Boards / Exams</h3>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {ALL_BOARDS.map(b => (
                      <button key={b} type="button" onClick={() => setField('boards', toggleArrayItem(profileForm.boards, b))}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          profileForm.boards.includes(b)
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-transparent shadow-sm'
                            : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-violet-200 hover:text-violet-500'
                        }`}>{b}</button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teacher.boards.length > 0
                      ? teacher.boards.map(b => <span key={b} className="px-3 py-1 rounded-full text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200">{b}</span>)
                      : <span className="text-sm italic text-[#D1D5DB]">No boards set</span>}
                  </div>
                )}
              </div>

              {editing && (
                <button onClick={handleSaveProfile} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold py-3.5 rounded-2xl shadow-md shadow-orange-200 hover:brightness-105 transition-all disabled:opacity-60 text-sm">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                </button>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      {showUpload && <UploadVideoModal onClose={() => setShowUpload(false)} />}
      {previewVideo && <VideoPreviewModal video={previewVideo} onClose={() => setPreviewVideo(null)} />}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !deleting && setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="font-extrabold text-[#111827] text-center text-base mb-1">Delete Video?</h3>
            <p className="text-sm text-[#6B7280] text-center mb-6 leading-relaxed">
              This will permanently delete{' '}
              <span className="font-bold text-[#111827]">&quot;{videos.find(v => v.id === confirmDeleteId)?.title}&quot;</span>.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => handleDeleteVideo(confirmDeleteId)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold shadow-sm shadow-red-200 hover:brightness-105 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : <><Trash2 size={14} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── VideoRow ──────────────────────────────────────────────
function VideoRow({ video, showDate, onPreview, onDelete }: {
  video: VideoItem; showDate?: boolean;
  onPreview: () => void; onDelete: (id: string) => void;
}) {
  const grad = SUBJECT_COLORS[video.subject] ?? 'from-orange-400 to-amber-500';
  const statusMap: Record<string, { label: string; cls: string }> = {
    active:   { label: 'Live',     cls: 'bg-green-50 text-green-700 border-green-200'  },
    pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-200'  },
    rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border-red-200'        },
  };
  const status = statusMap[video.status] ?? statusMap.pending;

  return (
    <div className="px-4 sm:px-6 py-3.5 flex items-center gap-3 sm:gap-4 hover:bg-[#FAFAFA] transition-colors group cursor-pointer"
      onClick={onPreview}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
        <Play size={16} className="text-white ml-0.5" fill="white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#111827] text-sm truncate group-hover:text-[#f97316] transition-colors">{video.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded bg-gradient-to-r ${grad}`}>{video.subject}</span>
          {showDate && (
            <span className="text-[10px] text-[#9CA3AF] flex items-center gap-0.5">
              <Clock size={9} />
              {new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-xs text-[#9CA3AF] font-semibold flex-shrink-0">
        <span className="flex items-center gap-1"><Eye size={11} /> {video.views.toLocaleString('en-IN')}</span>
        <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400" fill="#facc15" /> {video.rating.toFixed(1)}</span>
      </div>
      <button type="button" onClick={e => { e.stopPropagation(); onDelete(video.id); }}
        className="p-1.5 rounded-lg text-[#D1D5DB] hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
        title="Delete video">
        <Trash2 size={14} />
      </button>
      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex-shrink-0 ${status.cls}`}>{status.label}</span>
    </div>
  );
}