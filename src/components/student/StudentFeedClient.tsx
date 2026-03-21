'use client';

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import {
  Play, Trophy, Zap, Search, LogOut,
  Star, Eye, BookOpen, X, User,
  TrendingUp, Users, Globe, UserPlus, UserCheck,
  Edit3, ChevronLeft, Medal, Crown, Target,
  CheckCircle, Clock, Award, BarChart2, Save,
  Menu,
} from 'lucide-react';
import Logo from '@/components/layout/Logo';
import VideoPlayer from './VideoPlayer';

// ── Interfaces ────────────────────────────────────────────
interface Video {
  id: string; title: string; description: string;
  videoUrl: string; thumbnail: string | null;
  subject: string; classes: string[]; boards: string[];
  views: number; rating: number; duration: number;
  createdAt: string; isFollowed: boolean; sameClass: boolean;
  teacher: { id: string; name: string; subjects: string[]; followers: number } | null;
}
interface Student {
  name: string; email: string; studentClass: string;
  studentBoard: string; points: number; rank: number;
  followingCount: number; school?: string; city?: string;
}
interface Suggestion { type: 'teacher' | 'subject'; label: string; }
interface Leader {
  id: string; name: string; image?: string | null;
  points: number; rank: number; isMe?: boolean;
}
interface CommunityPost {
  id: string; type: 'photo' | 'article';
  title: string; body: string;
  photoUrl: string; caption: string;
  subject: string; classes: string[]; boards: string[];
  createdAt: string;
  liked: boolean;
  likesCount: number;
  isFollowed: boolean;
  teacher: { id: string; name: string; image: string | null; subjects: string[] } | null;
}

type ActivePage = 'feed' | 'gamezone' | 'leaderboard' | 'profile';
type FeedType = 'all' | 'video' | 'photo' | 'article';

// ── Constants ─────────────────────────────────────────────
const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Computer Science'];
const TRENDING = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

const SUBJECT_GRADIENTS: Record<string, string> = {
  Mathematics: 'from-blue-500 to-indigo-600',
  Physics: 'from-purple-500 to-violet-600',
  Chemistry: 'from-green-500 to-emerald-600',
  Biology: 'from-teal-500 to-cyan-600',
  English: 'from-rose-500 to-pink-600',
  Hindi: 'from-orange-500 to-amber-600',
  History: 'from-yellow-500 to-orange-500',
  Geography: 'from-lime-500 to-green-600',
  'Computer Science': 'from-sky-500 to-blue-600',
};

const SUBJECT_EMOJI: Record<string, string> = {
  All: '🌐', Mathematics: '📐', Physics: '⚛️', Chemistry: '🧪',
  Biology: '🧬', English: '📖', Hindi: '📝', History: '🏛️',
  'Computer Science': '💻',
};

const LB_GRADS = [
  'from-orange-400 to-amber-500', 'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600', 'from-teal-500 to-cyan-600',
  'from-rose-500 to-pink-600', 'from-green-400 to-emerald-500',
  'from-sky-400 to-blue-500',
];

// ── Helpers ───────────────────────────────────────────────
function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── SubjectDropdown ───────────────────────────────────────
function SubjectDropdown({ subjects, activeSubject, onSelect }: {
  subjects: string[]; activeSubject: string; onSelect: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = subjects.includes(activeSubject);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${isActive || open ? 'border-[#f97316] text-[#f97316]' : 'border-transparent text-[#6B7280] hover:text-[#111827]'}`}>
        {isActive ? (
          <><span>{SUBJECT_EMOJI[activeSubject] ?? '📚'}</span><span key={activeSubject}>{activeSubject}</span></>
        ) : (
          <><BookOpen size={14} /><span>Subjects</span></>
        )}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
          className={`transition-transform duration-200 opacity-50 ${open ? 'rotate-180' : ''}`}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed z-[999] w-[300px]"
          style={{
            top: ref.current ? ref.current.getBoundingClientRect().bottom + 4 : 0,
            left: ref.current ? Math.min(ref.current.getBoundingClientRect().left, window.innerWidth - 308) : 0,
          }}>
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 pt-3.5 pb-2.5 border-b border-[#F3F4F6] flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">Browse by Subject</p>
              {isActive && (
                <button onClick={() => { onSelect('All'); setOpen(false); }}
                  className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors">
                  <X size={10} /><span>Clear</span>
                </button>
              )}
            </div>
            <div className="p-2 grid grid-cols-3 gap-1">
              {subjects.map(s => {
                const grad = SUBJECT_GRADIENTS[s] ?? 'from-orange-400 to-amber-500';
                const isSelected = activeSubject === s;
                return (
                  <button key={s} onClick={() => { onSelect(s); setOpen(false); }}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-center transition-all group ${isSelected ? 'bg-orange-50 border-2 border-orange-200' : 'border-2 border-transparent hover:bg-[#F8F9FA] hover:border-[#E5E7EB]'}`}>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-lg shadow-sm transition-transform ${isSelected ? 'scale-110 shadow-md shadow-orange-100' : 'group-hover:scale-105'}`}>
                      {SUBJECT_EMOJI[s] ?? '📚'}
                    </div>
                    <span className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-[#f97316]' : 'text-[#6B7280] group-hover:text-[#111827]'}`}>{s}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── VideoCard ─────────────────────────────────────────────
const VideoCard = memo(function VideoCard({ video, onPlay, onFollowChange }: {
  video: Video;
  onPlay: (v: Video) => void;
  onFollowChange: (teacherId: string, following: boolean) => void;
}) {
  const [followed, setFollowed] = useState(video.isFollowed);
  const [following, setFollowing] = useState(false);
  const grad = SUBJECT_GRADIENTS[video.subject] ?? 'from-orange-400 to-amber-500';
  const initials = video.teacher?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'VS';

  async function handleFollow(e: React.MouseEvent) {
    e.stopPropagation();
    if (!video.teacher) return;
    setFollowing(true);
    try {
      const res = await fetch(`/api/teachers/${video.teacher.id}/follow`, { method: 'POST' });
      if (res.ok) { const next = !followed; setFollowed(next); onFollowChange(video.teacher.id, next); }
    } finally { setFollowing(false); }
  }

  return (
    <div onClick={() => onPlay(video)}
      className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 hover:border-orange-200 transition-all duration-200 group cursor-pointer">
      <div className={`relative bg-gradient-to-br ${grad} overflow-hidden`} style={{ aspectRatio: '16/9' }}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="relative flex flex-col items-center justify-center h-full gap-1.5">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Play size={18} className="text-white ml-0.5" fill="white" />
              </div>
              <span className="text-white/60 text-[9px] font-extrabold uppercase tracking-widest">{video.subject}</span>
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-200 flex items-center justify-center">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
            <Play size={16} className="text-[#f97316] ml-0.5" fill="#f97316" />
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          {followed && <span className="bg-orange-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">✓ Following</span>}
          {video.sameClass && !followed && <span className="bg-blue-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">Your Class</span>}
        </div>
        {video.duration > 0 && (
          <div className="absolute bottom-1.5 right-1.5">
            <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
            </span>
          </div>
        )}
        <div className="absolute bottom-1.5 left-1.5">
          <span className="bg-black/50 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">{video.subject}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-[#111827] text-xs line-clamp-2 leading-snug mb-2 group-hover:text-[#f97316] transition-colors">{video.title}</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0`}>{initials}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#111827] truncate">{video.teacher?.name ?? 'Unknown'}</p>
          </div>
          {video.teacher && (
            <button onClick={handleFollow} disabled={following}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-extrabold border transition-all flex-shrink-0 ${followed ? 'bg-orange-50 text-orange-500 border-orange-200' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-orange-300 hover:text-orange-500'}`}>
              {followed ? <><UserCheck size={9} /><span>Following</span></> : <><UserPlus size={9} /><span>Follow</span></>}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6] text-[9px] text-[#9CA3AF] font-semibold">
          <span className="flex items-center gap-0.5"><Eye size={10} /><span>{video.views.toLocaleString('en-IN')}</span></span>
          <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400" fill="#facc15" /><span>{video.rating.toFixed(1)}</span></span>
          <span>{new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>
    </div>
  );
});

// ── PhotoCard ─────────────────────────────────────────────
const PhotoCard = memo(function PhotoCard({ post }: { post: CommunityPost }) {
  const grad = SUBJECT_GRADIENTS[post.subject] ?? 'from-orange-400 to-amber-500';
  const initials = post.teacher?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'VS';
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [followed, setFollowed] = useState(post.isFollowed);
  const [followLoading, setFollowLoading] = useState(false);

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    const wasLiked = liked;
    setLiked(!wasLiked); setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { setLiked(data.liked); setLikeCount(data.likes); }
      else { setLiked(wasLiked); setLikeCount(c => wasLiked ? c + 1 : c - 1); }
    } catch { setLiked(wasLiked); setLikeCount(c => wasLiked ? c + 1 : c - 1); }
  }

  async function handleFollow(e: React.MouseEvent) {
    e.stopPropagation();
    if (!post.teacher || followLoading) return;
    setFollowLoading(true);
    const was = followed; setFollowed(!was);
    try {
      const res = await fetch(`/api/teacher/follow/${post.teacher.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setFollowed(data.isFollowing); else setFollowed(was);
    } catch { setFollowed(was); }
    finally { setFollowLoading(false); }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 hover:border-pink-200 transition-all duration-200">
      {post.photoUrl && (
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img src={post.photoUrl} alt={post.caption || 'Post'} className="w-full h-full object-cover" />
          <div className="absolute top-1.5 left-1.5"><span className="bg-pink-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">📸 Photo</span></div>
          {post.subject && <div className="absolute bottom-1.5 left-1.5"><span className="bg-black/50 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">{post.subject}</span></div>}
        </div>
      )}
      <div className="p-3">
        {post.caption && <p className="text-xs font-semibold text-[#374151] line-clamp-2 mb-2">{post.caption}</p>}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0`}>{initials}</div>
          <div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-[#111827] truncate">{post.teacher?.name ?? 'Teacher'}</p></div>
          <span className="text-[9px] text-[#9CA3AF] font-semibold flex-shrink-0">{timeAgo(post.createdAt)}</span>
        </div>
        {post.classes.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {post.classes.slice(0, 2).map(c => <span key={c} className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{c}</span>)}
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-2 border-t border-[#F3F4F6]">
          <button onClick={handleLike} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${liked ? `bg-gradient-to-r ${grad} text-white border-transparent` : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-pink-300 hover:text-pink-500'}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" /><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>
            <span>{likeCount > 0 ? likeCount : 'Like'}</span>
          </button>
          {post.teacher && (
            <button onClick={handleFollow} disabled={followLoading} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${followed ? 'bg-orange-50 text-orange-500 border-orange-200' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-orange-300 hover:text-orange-500'}`}>
              {followed ? <><UserCheck size={10} /><span>Following</span></> : <><UserPlus size={10} /><span>Follow</span></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ── ArticleCard ───────────────────────────────────────────
function ArticleCard({ post }: { post: CommunityPost }) {
  const grad = SUBJECT_GRADIENTS[post.subject] ?? 'from-orange-400 to-amber-500';
  const initials = post.teacher?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'VS';
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [followed, setFollowed] = useState(post.isFollowed);
  const [followLoading, setFollowLoading] = useState(false);

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    const wasLiked = liked;
    setLiked(!wasLiked); setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { setLiked(data.liked); setLikeCount(data.likes); }
      else { setLiked(wasLiked); setLikeCount(c => wasLiked ? c + 1 : c - 1); }
    } catch { setLiked(wasLiked); setLikeCount(c => wasLiked ? c + 1 : c - 1); }
  }

  async function handleFollow(e: React.MouseEvent) {
    e.stopPropagation();
    if (!post.teacher || followLoading) return;
    setFollowLoading(true);
    const was = followed; setFollowed(!was);
    try {
      const res = await fetch(`/api/teacher/follow/${post.teacher.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setFollowed(data.isFollowing); else setFollowed(was);
    } catch { setFollowed(was); }
    finally { setFollowLoading(false); }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-200">
      <div className={`h-1 bg-gradient-to-r ${grad}`} />
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">✍️ Article</span>
          {post.subject && <span className="bg-[#F3F4F6] text-[#6B7280] text-[9px] font-bold px-1.5 py-0.5 rounded-full">{post.subject}</span>}
        </div>
        {post.title && <h3 className="font-bold text-[#111827] text-xs line-clamp-2 leading-snug mb-1.5">{post.title}</h3>}
        {post.body && <p translate="no" className={`text-[11px] text-[#6B7280] leading-relaxed mb-2 ${expanded ? '' : 'line-clamp-3'}`}>{post.body}</p>}
        {post.body && post.body.length > 120 && (
          <button onClick={() => setExpanded(p => !p)} className="text-[10px] font-bold text-orange-500 hover:text-orange-600 mb-2 transition-colors">
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        )}
        <div className="flex items-center gap-2 pt-2 border-t border-[#F3F4F6] mb-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0`}>{initials}</div>
          <div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-[#111827] truncate">{post.teacher?.name ?? 'Teacher'}</p></div>
          <span className="text-[9px] text-[#9CA3AF] font-semibold flex-shrink-0">{timeAgo(post.createdAt)}</span>
        </div>
        {post.classes.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {post.classes.slice(0, 2).map(c => <span key={c} className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{c}</span>)}
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-2 border-t border-[#F3F4F6]">
          <button onClick={handleLike} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${liked ? `bg-gradient-to-r ${grad} text-white border-transparent` : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-blue-300 hover:text-blue-500'}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" /><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>
            <span>{likeCount > 0 ? likeCount : 'Like'}</span>
          </button>
          {post.teacher && (
            <button onClick={handleFollow} disabled={followLoading} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${followed ? 'bg-orange-50 text-orange-500 border-orange-200' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-orange-300 hover:text-orange-500'}`}>
              {followed ? <><UserCheck size={10} /><span>Following</span></> : <><UserPlus size={10} /><span>Follow</span></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── GameZonePanel ─────────────────────────────────────────
function GameZonePanel() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm" style={{ height: 'calc(100vh - 100px)' }}>
      <iframe src="/student/games" className="w-full h-full border-0" title="Game Zone" />
    </div>
  );
}

// ── LeaderboardPanel ──────────────────────────────────────
function LeaderboardPanel({ student, leaders, lbLoading }: {
  student: Student; leaders: Leader[]; lbLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-5 overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="relative">
          <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-2">🏆 Leaderboard</span>
          <h2 className="text-white font-extrabold text-xl mb-1">Who's Leading?</h2>
          <p className="text-white/60 text-sm">Top students ranked by points earned</p>
        </div>
      </div>
      {student.rank > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-base shadow-md flex-shrink-0">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-[#111827] text-sm">Your Position</p>
            <p className="text-[#9CA3AF] text-xs">{student.studentClass} · {student.studentBoard}</p>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-[#f97316] text-lg">#{student.rank}</p>
            <p className="text-[11px] font-bold text-[#9CA3AF]">{student.points.toLocaleString('en-IN')} pts</p>
          </div>
        </div>
      )}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
          <p className="font-extrabold text-[#111827] text-sm flex items-center gap-2">
            <BarChart2 size={14} className="text-violet-500" /><span>Full Rankings</span>
          </p>
          <span className="text-[10px] text-[#9CA3AF] font-bold">{leaders.length} students</span>
        </div>
        {lbLoading ? (
          <div className="divide-y divide-[#F8F9FA]">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-6 h-5 bg-[#F3F4F6] rounded animate-pulse" />
                <div className="w-9 h-9 bg-[#F3F4F6] rounded-full animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#F3F4F6] rounded animate-pulse w-1/2" />
                  <div className="h-2 bg-[#F3F4F6] rounded animate-pulse w-1/4" />
                </div>
                <div className="w-14 h-5 bg-[#F3F4F6] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[#F8F9FA]">
            {leaders.map((leader, idx) => {
              const isMe = leader.isMe || leader.name === student.name;
              const initials = leader.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={leader.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${isMe ? 'bg-orange-50' : 'hover:bg-[#FAFAFA]'}`}>
                  <div className="w-7 flex-shrink-0 text-center">
                    {leader.rank === 1 ? <Crown size={16} className="text-yellow-500 mx-auto" />
                      : leader.rank === 2 ? <Medal size={16} className="text-slate-400 mx-auto" />
                        : leader.rank === 3 ? <Medal size={16} className="text-amber-600 mx-auto" />
                          : <span className={`text-sm font-extrabold ${isMe ? 'text-orange-500' : 'text-[#9CA3AF]'}`}>{leader.rank}</span>}
                  </div>
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${isMe ? 'from-orange-400 to-amber-500' : LB_GRADS[idx % LB_GRADS.length]} flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isMe ? 'text-[#f97316]' : 'text-[#111827]'}`}>
                      {isMe ? `${leader.name.split(' ')[0]} (You)` : leader.name.split(' ')[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Trophy size={11} className="text-yellow-400" />
                    <span className={`text-sm font-extrabold ${isMe ? 'text-[#f97316]' : 'text-[#111827]'}`}>{leader.points.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-[#9CA3AF] font-semibold">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ProfilePanel ──────────────────────────────────────────
function ProfilePanel({ student }: { student: Student }) {
  const [name, setName] = useState(student.name);
  const [school, setSchool] = useState(student.school ?? '');
  const [city, setCity] = useState(student.city ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/student/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, school, city }) });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-gradient-to-r from-[#f97316] to-[#ea580c] rounded-2xl p-5 overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-extrabold text-xl shadow-lg flex-shrink-0">{initials}</div>
          <div>
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-1">👤 My Profile</span>
            <h2 className="text-white font-extrabold text-xl">{student.name}</h2>
            <p className="text-white/60 text-sm">{student.email}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Points', value: student.points.toLocaleString('en-IN'), icon: '🏆', color: 'bg-amber-50 border-amber-100' },
          { label: 'Class', value: student.studentClass, icon: '🎓', color: 'bg-purple-50 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-3 text-center`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <p className="font-extrabold text-[#111827] text-sm">{s.value}</p>
            <p className="text-[10px] text-[#9CA3AF] font-bold">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F3F4F6]">
          <p className="font-extrabold text-[#111827] text-sm flex items-center gap-2"><Edit3 size={14} className="text-orange-400" /><span>Edit Details</span></p>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: 'Full Name', value: name, onChange: setName, icon: '👤', placeholder: 'Your full name' },
            { label: 'School', value: school, onChange: setSchool, icon: '🏫', placeholder: 'Your school name' },
            { label: 'City', value: city, onChange: setCity, icon: '📍', placeholder: 'Your city' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-1 block">{f.icon} {f.label}</label>
              <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                className="w-full border-2 border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#111827] font-medium focus:border-orange-400 focus:outline-none transition-colors" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: '🎓 Board', value: student.studentBoard }, { label: '📚 Class', value: student.studentClass }].map(f => (
              <div key={f.label}>
                <label className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-1 block">{f.label}</label>
                <div className="border-2 border-[#F3F4F6] bg-[#F8F9FA] rounded-xl px-3 py-2.5 text-sm text-[#9CA3AF] font-medium">{f.value}</div>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving}
            className={`w-full py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white hover:brightness-110'}`}>
            {saved ? <><CheckCircle size={14} /><span>Saved!</span></> : saving ? <><Clock size={14} /><span>Saving...</span></> : <><Save size={14} /><span>Save Changes</span></>}
          </button>
        </div>
      </div>
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
        <p className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-3">Account</p>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group border border-[#E5E7EB] hover:border-red-200">
          <div className="w-8 h-8 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0"><LogOut size={14} className="text-red-400" /></div>
          <div className="text-left"><p className="text-sm font-bold text-red-500">Sign Out</p><p className="text-[10px] text-[#9CA3AF]">See you next time!</p></div>
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function StudentFeedClient({ student, videos: initialVideos, communityPosts = [] }: {
  student: Student; videos: Video[]; communityPosts?: CommunityPost[];
}) {
  const searchParams = useSearchParams();

  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [feedTab, setFeedTab] = useState<'all' | 'following'>('all');
  const [feedType, setFeedType] = useState<FeedType>('all');
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [followCount, setFollowCount] = useState(student.followingCount);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [activePage, setActivePage] = useState<ActivePage>('feed');

  // ─── MOBILE STATE — JS-based, 100% reliable ──────────
  const [isMobile, setIsMobile] = useState(false);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = (mobileLeftOpen || mobileRightOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileLeftOpen, mobileRightOpen]);

  // Navigate and close all mobile overlays
  const mobileNavigate = useCallback((page: ActivePage) => {
    setActivePage(page);
    setMobileLeftOpen(false);
    setMobileRightOpen(false);
  }, []);

  const profileRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const videoId = searchParams.get('video');
    if (!videoId || initialVideos.length === 0) return;
    const found = initialVideos.find(v => v.id === videoId);
    if (found) setPlayingVideo(found);
  }, [searchParams, initialVideos]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    if (showProfile) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfile]);

  useEffect(() => {
    clearTimeout(debouncer.current);
    debouncer.current = setTimeout(() => {
      if (search.length < 2) { setSuggestions([]); return; }
      const q = search.toLowerCase();
      const teacherNames = new Set<string>();
      const subjectNames = new Set<string>();
      initialVideos.forEach(v => {
        if (v.teacher?.name.toLowerCase().includes(q)) teacherNames.add(v.teacher.name);
        if (v.subject.toLowerCase().includes(q)) subjectNames.add(v.subject);
      });
      communityPosts.forEach(p => {
        if (p.teacher?.name.toLowerCase().includes(q)) teacherNames.add(p.teacher.name);
        if (p.subject.toLowerCase().includes(q)) subjectNames.add(p.subject);
      });
      setSuggestions([
        ...Array.from(teacherNames).slice(0, 4).map(l => ({ type: 'teacher' as const, label: l })),
        ...Array.from(subjectNames).slice(0, 3).map(l => ({ type: 'subject' as const, label: l })),
      ]);
    }, 200);
    return () => clearTimeout(debouncer.current);
  }, [search, initialVideos, communityPosts]);

  useEffect(() => {
    setLbLoading(true);
    fetch('/api/student/leaderboard')
      .then(r => r.json())
      .then(data => {
        const list: Leader[] = data.students ?? [];
        if (data.myEntry && !list.find(l => l.id === data.myEntry.id)) list.push(data.myEntry);
        setLeaders(list);
      })
      .catch(() => setLeaders([]))
      .finally(() => setLbLoading(false));
  }, []);

  const handleFollowChange = useCallback((teacherId: string, following: boolean) => {
    setVideos(prev => prev.map(v => v.teacher?.id === teacherId ? { ...v, isFollowed: following } : v));
    setFollowCount(c => following ? c + 1 : Math.max(0, c - 1));
  }, []);

  type FeedItem =
    | { itemType: 'video'; data: Video }
    | { itemType: 'photo'; data: CommunityPost }
    | { itemType: 'article'; data: CommunityPost };

  const allFeedItems: FeedItem[] = [
    ...videos.map(v => ({ itemType: 'video' as const, data: v })),
    ...communityPosts.filter(p => p.type === 'photo').map(p => ({ itemType: 'photo' as const, data: p })),
    ...communityPosts.filter(p => p.type === 'article').map(p => ({ itemType: 'article' as const, data: p })),
  ].sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());

  const filtered = allFeedItems.filter(item => {
    const q = search.toLowerCase();
    const matchType = feedType === 'all' || item.itemType === feedType;
    const matchSubject = activeSubject === 'All' || item.data.subject === activeSubject;
    const matchFollow = feedTab === 'all' || (item.itemType === 'video' && (item.data as Video).isFollowed);
    const searchable = item.itemType === 'video'
      ? [(item.data as Video).title, item.data.teacher?.name ?? '', item.data.subject].join(' ').toLowerCase()
      : [(item.data as CommunityPost).title, (item.data as CommunityPost).caption, item.data.teacher?.name ?? '', item.data.subject].join(' ').toLowerCase();
    return matchType && matchSubject && matchFollow && (!search || searchable.includes(q));
  });

  const videoCount = allFeedItems.filter(i => i.itemType === 'video').length;
  const photoCount = allFeedItems.filter(i => i.itemType === 'photo').length;
  const articleCount = allFeedItems.filter(i => i.itemType === 'article').length;
  const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const showDropdown = focused && (search.length === 0 || suggestions.length > 0);
  const feedKey = `${feedType}-${activeSubject}-${feedTab}-${search}`;

  const NAV_ITEMS = [
    { icon: '🎬', label: 'My Feed', page: 'feed' as ActivePage },
    { icon: '🎮', label: 'Game Zone', page: 'gamezone' as ActivePage },
    { icon: '🏆', label: 'Leaderboard', page: 'leaderboard' as ActivePage },
    { icon: '👤', label: 'Profile', page: 'profile' as ActivePage },
  ];

  // ── Shared leaderboard widget (desktop right sidebar + mobile overlay) ──
  const LeaderboardWidget = ({ onFullLB }: { onFullLB?: () => void }) => (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
      <div className="px-4 pt-4 pb-3 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-1.5 text-orange-500 text-[10px] font-extrabold uppercase tracking-widest mb-1">
          <Trophy size={11} /><span>Student Rankings</span>
        </div>
        <h4 className="font-black text-[#111827] text-sm">
          Who's <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Leading?</span>
        </h4>
      </div>
      {lbLoading ? (
        <div className="divide-y divide-[#F8F9FA]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-4 py-3">
              <div className="w-5 h-4 bg-[#F3F4F6] rounded animate-pulse flex-shrink-0" />
              <div className="w-7 h-7 bg-[#F3F4F6] rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-[#F3F4F6] rounded animate-pulse w-3/4" />
                <div className="h-2 bg-[#F3F4F6] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2"><Trophy size={18} className="text-orange-200" /></div>
          <p className="text-xs font-bold text-[#9CA3AF]">No students yet</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F8F9FA]">
          {leaders.map((leader, idx) => {
            const isMe = leader.isMe || leader.name === student.name;
            const isOutside = isMe && leader.rank > 7;
            const li = leader.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={leader.id}>
                {isOutside && <div className="border-t-2 border-dashed border-orange-200 mx-4" />}
                <div className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${isMe ? 'bg-orange-50' : 'hover:bg-[#FAFAFA]'}`}>
                  <div className="w-5 flex-shrink-0 text-center">
                    {leader.rank === 1 ? <Crown size={13} className="text-yellow-500 mx-auto" />
                      : leader.rank === 2 ? <Medal size={13} className="text-slate-400 mx-auto" />
                        : leader.rank === 3 ? <Medal size={13} className="text-amber-600 mx-auto" />
                          : <span className={`text-[11px] font-extrabold ${isMe ? 'text-orange-500' : 'text-[#9CA3AF]'}`}>{leader.rank}</span>}
                  </div>
                  {leader.image ? (
                    <img src={leader.image} alt={leader.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB]"
                      onError={e => { e.currentTarget.style.display = 'none'; const s = e.currentTarget.nextElementSibling as HTMLElement; if (s) s.style.display = 'flex'; }} />
                  ) : null}
                  <div style={{ display: leader.image ? 'none' : 'flex' }}
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${isMe ? 'from-orange-400 to-amber-500' : LB_GRADS[idx % LB_GRADS.length]} items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0`}>
                    {li}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isMe ? 'text-[#f97316]' : 'text-[#111827]'}`}>{isMe ? 'You' : leader.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-[#9CA3AF] font-semibold flex items-center gap-0.5">
                      <Trophy size={9} className="text-yellow-400" /><span>{leader.points.toLocaleString('en-IN')} pts</span>
                    </p>
                  </div>
                  {isMe && <span className="text-[9px] font-extrabold text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full flex-shrink-0">You</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="p-3 border-t border-[#F3F4F6]">
        <button onClick={onFullLB ?? (() => setActivePage('leaderboard'))}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-[#E5E7EB] text-[11px] font-extrabold text-[#6B7280] hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all">
          <Trophy size={11} /><span>Full Leaderboard →</span>
        </button>
      </div>
    </div>
  );

  // ── Shared left sidebar content ──────────────────────
  const LeftSidebarContent = ({ onNavigate }: { onNavigate: (p: ActivePage) => void }) => (
    <>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
        <div className="p-4">
          <div className="flex flex-col items-center text-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-base mb-2 shadow-md shadow-orange-200">
              {initials}
            </div>
            <p className="font-extrabold text-[#111827] text-sm">{student.name}</p>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5">{student.studentClass} · {student.studentBoard}</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-2 text-center">
              <p className="text-sm font-extrabold text-[#f97316]">{student.points.toLocaleString('en-IN')}</p>
              <p className="text-[9px] font-bold text-[#9CA3AF] uppercase">Points</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-2 text-center">
              <p className="text-sm font-extrabold text-[#f97316]">{student.rank > 0 ? `#${student.rank}` : '—'}</p>
              <p className="text-[9px] font-bold text-[#9CA3AF] uppercase">Rank</p>
            </div>
          </div>
          <button onClick={() => onNavigate('profile')}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl border-2 border-dashed border-orange-200 text-orange-400 text-[11px] font-bold hover:border-orange-400 hover:bg-orange-50 transition-all">
            <Edit3 size={11} /><span>Edit Profile</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-2 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button key={item.label} onClick={() => onNavigate(item.page)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left ${activePage === item.page ? 'bg-orange-50 text-[#f97316]' : 'text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111827]'}`}>
              <span className="text-base">{item.icon}</span><span>{item.label}</span>
              {activePage === item.page && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onNavigate('gamezone')}
        className="block bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-2xl p-4 hover:brightness-110 transition-all overflow-hidden relative w-full text-left">
        <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-orange-500/10" />
        <div className="relative flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0"><Zap size={15} className="text-orange-400" /></div>
          <h4 className="font-extrabold text-white text-sm">🎮 Game Zone</h4>
        </div>
        <p className="relative text-white/40 text-xs mb-3">Play quiz games & earn points!</p>
        <div className="relative inline-flex items-center gap-1.5 bg-orange-500 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full">
          <span>Play Now</span><Zap size={10} />
        </div>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6]">

      {playingVideo && <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />}

      {/* ══ NAVBAR ════════════════════════════════════════ */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">

        {/* Row 1 */}
        <div className="flex items-center px-4 sm:px-6 h-14 gap-4">
          <div className="flex items-center gap-2.5 flex-1">
            <a href="/" className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#f97316] hover:border-orange-200 hover:bg-orange-50 transition-all">
              <ChevronLeft size={15} />
            </a>
            <div className="h-5 w-px bg-[#E5E7EB]" />
            <Logo size="sm" />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            {student.points > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                <Trophy size={12} className="text-yellow-500" />
                <span className="text-xs font-extrabold text-amber-600">{student.points.toLocaleString('en-IN')} pts</span>
              </div>
            )}
            <button onClick={() => setActivePage('gamezone')}
              className="hidden sm:flex items-center gap-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all flex-shrink-0">
              <Zap size={12} className="text-orange-400" /><span>Game Zone</span>
            </button>
            <div ref={profileRef} className="relative">
              <button onClick={() => setShowProfile(prev => !prev)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all border-2 flex-shrink-0 ${showProfile ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white border-orange-400' : 'bg-gradient-to-br from-orange-100 to-amber-100 text-[#f97316] border-orange-200 hover:border-orange-400'}`}>
                {initials}
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] z-[60] overflow-hidden">
                  <div className="bg-gradient-to-r from-[#f97316] to-[#ea580c] p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-extrabold text-base flex-shrink-0">{initials}</div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-white text-sm truncate">{student.name}</p>
                        <p className="text-white/70 text-xs truncate">{student.email}</p>
                        <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">Student</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-[#E5E7EB]">
                    {[
                      { label: 'Points', value: student.points.toLocaleString('en-IN') },
                      { label: 'Rank', value: student.rank > 0 ? `#${student.rank}` : '—' },
                      { label: 'Class', value: student.studentClass || '—' },
                    ].map(s => (
                      <div key={s.label} className="bg-white py-3 text-center">
                        <p className="font-extrabold text-[#f97316] text-sm">{s.value}</p>
                        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 space-y-0.5">
                    {[
                      { icon: '🎓', label: 'Board', value: student.studentBoard || 'Not set' },
                      { icon: '🏫', label: 'School', value: student.school || 'Not set' },
                      { icon: '📍', label: 'City', value: student.city || 'Not set' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#F8F9FA]">
                        <span className="text-base w-6 text-center flex-shrink-0">{row.icon}</span>
                        <span className="text-xs text-[#9CA3AF] font-semibold w-12 flex-shrink-0">{row.label}</span>
                        <span className={`text-xs font-bold truncate ${row.value === 'Not set' ? 'text-[#D1D5DB] italic' : 'text-[#111827]'}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#E5E7EB] mx-3" />
                  <div className="p-3 space-y-1">
                    <button onClick={() => { setActivePage('profile'); setShowProfile(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors group w-full">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center flex-shrink-0"><Edit3 size={14} className="text-orange-400" /></div>
                      <div><p className="text-sm font-bold text-[#111827]">Edit Profile</p><p className="text-[10px] text-[#9CA3AF]">Update your info</p></div>
                    </button>
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group w-full">
                      <div className="w-8 h-8 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0"><LogOut size={14} className="text-red-400" /></div>
                      <div className="text-left"><p className="text-sm font-bold text-red-500">Sign Out</p><p className="text-[10px] text-[#9CA3AF]">See you next time!</p></div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Row 2: Tab bar — FIXED: overflow-x-auto prevents horizontal scroll ─── */}
        <div className="border-t border-[#F3F4F6] overflow-x-auto flex justify-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex items-center min-w-max px-4 sm:px-6">

            <button onClick={() => { setFeedTab('all'); setActivePage('feed'); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all flex-shrink-0 ${feedTab === 'all' && activePage === 'feed' ? 'border-[#f97316] text-[#f97316]' : 'border-transparent text-[#6B7280] hover:text-[#111827]'}`}>
              <Globe size={14} /><span>All</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${feedTab === 'all' && activePage === 'feed' ? 'bg-orange-50 text-[#f97316]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>{allFeedItems.length}</span>
            </button>
            <button onClick={() => { setFeedTab('following'); setActivePage('feed'); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all flex-shrink-0 ${feedTab === 'following' && activePage === 'feed' ? 'border-[#f97316] text-[#f97316]' : 'border-transparent text-[#6B7280] hover:text-[#111827]'}`}>
              <Users size={14} /><span>Following</span>
              {followCount > 0 && <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${feedTab === 'following' && activePage === 'feed' ? 'bg-orange-50 text-[#f97316]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>{followCount}</span>}
            </button>
            <div className="h-5 w-px bg-[#E5E7EB] mx-2 flex-shrink-0" />

            <SubjectDropdown subjects={SUBJECTS.filter(s => s !== 'All')} activeSubject={activeSubject} onSelect={s => { setActiveSubject(s); setActivePage('feed'); }} />
            <div className="h-5 w-px bg-[#E5E7EB] mx-2 flex-shrink-0" />

          </div>
        </div>

        {/* Row 3: Search */}
        {activePage === 'feed' && (
          <div className="border-t border-[#F3F4F6] px-4 sm:px-6 py-2.5 flex items-center justify-center">
            <div className="w-full max-w-2xl relative">
              <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-2.5 transition-all ${focused ? 'border-orange-400 bg-white shadow-md shadow-orange-100' : 'border-[#E2E8F0] bg-[#F1F5F9] hover:border-orange-300 hover:bg-white'}`}>
                <Search size={15} className={`flex-shrink-0 transition-colors ${focused ? 'text-orange-400' : 'text-[#94A3B8]'}`} />
                <input ref={inputRef} type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  onKeyDown={e => e.key === 'Escape' && inputRef.current?.blur()}
                  placeholder="Search videos, photos, articles, teachers..."
                  className="flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none font-medium min-w-0"
                />
                {search
                  ? <button onClick={() => setSearch('')} className="text-[#94A3B8] hover:text-[#6B7280] transition-colors flex-shrink-0"><X size={14} /></button>
                  : <kbd className="hidden sm:flex items-center text-[10px] font-bold text-[#CBD5E1] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded-md flex-shrink-0">⌘K</kbd>
                }
              </div>
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[60] overflow-hidden">
                  {search.length === 0 && (
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 mb-3"><TrendingUp size={12} className="text-orange-400" /><p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">Trending</p></div>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING.map(t => (
                          <button key={t} onMouseDown={() => setSearch(t)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r ${SUBJECT_GRADIENTS[t] ?? 'from-orange-400 to-amber-500'} text-white hover:brightness-110 transition-all`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <div className={search.length === 0 ? 'border-t border-[#F3F4F6]' : ''}>
                      {suggestions.map((s, i) => (
                        <button key={i} onMouseDown={() => { setSearch(s.label); setFocused(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F8F9FA] transition-colors">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${s.type === 'teacher' ? 'bg-blue-50' : `bg-gradient-to-br ${SUBJECT_GRADIENTS[s.label] ?? 'from-orange-400 to-amber-500'}`}`}>
                            {s.type === 'teacher' ? <User size={12} className="text-blue-500" /> : <BookOpen size={12} className="text-white" />}
                          </div>
                          <div><p className="text-sm font-semibold text-[#111827]">{s.label}</p><p className="text-[10px] text-[#9CA3AF] capitalize">{s.type}</p></div>
                        </button>
                      ))}
                    </div>
                  )}
                  {search.length >= 2 && suggestions.length === 0 && (
                    <div className="px-4 py-5 text-center">
                      <p className="text-sm text-[#9CA3AF]">No results for "<span className="font-semibold text-[#111827]">{search}</span>"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ══ PAGE BODY ══════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5" style={{ paddingBottom: isMobile ? '96px' : '20px' }}>
        <div className="flex gap-5 items-start">

          {/* ── LEFT SIDEBAR — desktop only (JS-controlled) ── */}
          {!isMobile && (
            <aside className="flex flex-col w-72 flex-shrink-0 gap-4 sticky top-[60px] self-start">
              <LeftSidebarContent onNavigate={setActivePage} />
            </aside>
          )}

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">
            {activePage === 'feed' && (
              <div className="space-y-4">
                {/* Welcome banner */}
                <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-5 overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-orange-500/10" />
                  <div className="absolute right-16 -bottom-6 w-20 h-20 rounded-full bg-amber-400/10" />
                  <div className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/5" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div>
                      <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-wider inline-block mb-2">✦ Student Feed</span>
                      <h2 className="text-white font-extrabold text-xl mb-1">Welcome back, {student.name.split(' ')[0]}! 👋</h2>
                      <p className="text-white/50 text-sm">{student.studentClass} • {student.studentBoard}{student.points > 0 && ` • ${student.points.toLocaleString('en-IN')} pts`}</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-orange-500/20">{initials}</div>
                      {student.rank > 0 && <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-0.5"><Trophy size={9} /><span>#{student.rank}</span></span>}
                    </div>
                  </div>
                </div>

                {/* Feed type filter chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {([
                    { id: 'all', label: 'All', emoji: '🌐', count: allFeedItems.length, active: 'bg-[#111827] text-white border-[#111827]' },
                    { id: 'video', label: 'Videos', emoji: '🎬', count: videoCount, active: 'bg-orange-500 text-white border-orange-500' },
                    { id: 'photo', label: 'Photos', emoji: '📸', count: photoCount, active: 'bg-pink-500 text-white border-pink-500' },
                    { id: 'article', label: 'Articles', emoji: '✍️', count: articleCount, active: 'bg-blue-500 text-white border-blue-500' },
                  ] as { id: FeedType; label: string; emoji: string; count: number; active: string }[]).map(chip => (
                    <button key={chip.id} onClick={() => setFeedType(chip.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border-2 transition-all ${feedType === chip.id ? chip.active : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#D1D5DB] hover:text-[#111827]'}`}>
                      <span>{chip.emoji}</span><span>{chip.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${feedType === chip.id ? 'bg-white/20 text-white' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>{chip.count}</span>
                    </button>
                  ))}
                  {(search || activeSubject !== 'All' || feedTab !== 'all') && (
                    <button onClick={() => { setSearch(''); setActiveSubject('All'); setFeedTab('all'); setFeedType('all'); }}
                      className="ml-auto text-xs font-bold text-orange-400 hover:text-orange-600 flex items-center gap-1 transition-colors">
                      <X size={11} /><span>Clear filters</span>
                    </button>
                  )}
                </div>

                {/* Results bar */}
                <div className="flex items-center justify-between">
                  <p key={feedKey} className="text-xs font-semibold text-[#9CA3AF]">
                    <span className="text-[#111827] font-extrabold">{filtered.length}</span>
                    <span> post{filtered.length !== 1 ? 's' : ''}</span>
                    {search && <span className="text-[#6B7280]"> for "<span className="text-[#111827]">{search}</span>"</span>}
                    {feedTab === 'following' && <span className="text-orange-500"> · following</span>}
                    {activeSubject !== 'All' && <span className="text-[#6B7280]"> · {activeSubject}</span>}
                    {feedType !== 'all' && <span className="text-[#6B7280]"> · {feedType}s only</span>}
                  </p>
                </div>

                {/* Feed grid */}
                {filtered.length === 0 ? (
                  <div key={`empty-${feedKey}`} className="bg-white rounded-2xl border border-[#E5E7EB] py-16 text-center shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3"><BookOpen size={24} className="text-orange-200" /></div>
                    <p className="font-extrabold text-[#111827]">{feedTab === 'following' && followCount === 0 ? 'Follow teachers to see their content here' : 'No results found'}</p>
                    <p className="text-sm text-[#9CA3AF] mt-1.5">
                      {feedTab === 'following' && followCount === 0
                        ? <button onClick={() => setFeedTab('all')} className="text-orange-500 font-bold hover:underline">Browse all posts</button>
                        : 'Try a different subject or search term'}
                    </p>
                  </div>
                ) : (
                  <div key={`grid-${feedKey}`} className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                    {filtered.map(item => {
                      if (item.itemType === 'video') return <VideoCard key={`v-${item.data.id}`} video={item.data as Video} onPlay={setPlayingVideo} onFollowChange={handleFollowChange} />;
                      if (item.itemType === 'photo') return <PhotoCard key={`p-${item.data.id}`} post={item.data as CommunityPost} />;
                      if (item.itemType === 'article') return <ArticleCard key={`a-${item.data.id}`} post={item.data as CommunityPost} />;
                      return null;
                    })}
                  </div>
                )}
              </div>
            )}
            {activePage === 'gamezone' && <GameZonePanel />}
            {activePage === 'leaderboard' && <LeaderboardPanel student={student} leaders={leaders} lbLoading={lbLoading} />}
            {activePage === 'profile' && <ProfilePanel student={student} />}
          </div>

          {/* ── RIGHT SIDEBAR — desktop only (JS-controlled) ── */}
          {!isMobile && (
            <aside className="flex flex-col w-72 flex-shrink-0 gap-4 sticky top-[60px] self-start">
              <LeaderboardWidget />
            </aside>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MOBILE OVERLAY — Left (Menu/Nav)
          Only rendered on mobile via JS state
      ══════════════════════════════════════════════════ */}
      {isMobile && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, transition: 'opacity 0.3s', opacity: mobileLeftOpen ? 1 : 0, pointerEvents: mobileLeftOpen ? 'auto' : 'none' }}
        >
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileLeftOpen(false)} />

          {/* Panel */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: 'min(320px, 85vw)',
            background: '#F3F4F6',
            display: 'flex', flexDirection: 'column',
            boxShadow: '4px 0 32px rgba(0,0,0,0.25)',
            transition: 'transform 0.3s ease',
            transform: mobileLeftOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Menu size={14} color="white" />
                </div>
                <span style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>Menu</span>
              </div>
              <button onClick={() => setMobileLeftOpen(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280' }}>
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <LeftSidebarContent onNavigate={mobileNavigate} />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MOBILE OVERLAY — Right (Rankings)
      ══════════════════════════════════════════════════ */}
      {isMobile && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, transition: 'opacity 0.3s', opacity: mobileRightOpen ? 1 : 0, pointerEvents: mobileRightOpen ? 'auto' : 'none' }}
        >
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileRightOpen(false)} />

          {/* Panel */}
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 'min(320px, 85vw)',
            background: '#F3F4F6',
            display: 'flex', flexDirection: 'column',
            boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
            transition: 'transform 0.3s ease',
            transform: mobileRightOpen ? 'translateX(0)' : 'translateX(100%)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
              <button onClick={() => setMobileRightOpen(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280' }}>
                <X size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>Rankings</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={14} color="white" />
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <LeaderboardWidget onFullLB={() => mobileNavigate('leaderboard')} />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MOBILE FAB BUTTONS — only when isMobile
      ══════════════════════════════════════════════════ */}
      {isMobile && (
        <>
          {/* Left FAB — Menu */}
          <button
            onClick={() => { setMobileLeftOpen(true); setMobileRightOpen(false); }}
            style={{
              position: 'fixed', bottom: 24, left: 50, zIndex: 150,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', borderRadius: 16,
              background: 'linear-gradient(135deg, #f97316, #f59e0b)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 13,
              boxShadow: '0 4px 20px rgba(249,115,22,0.45)',
              transform: mobileLeftOpen ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <Menu size={16} />
            <span>Menu</span>
          </button>

          {/* Right FAB — Rankings */}
          <button
            onClick={() => { setMobileRightOpen(true); setMobileLeftOpen(false); }}
            style={{
              position: 'fixed', bottom: 24, right: 50, zIndex: 150,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', borderRadius: 16,
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 13,
              boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
              transform: mobileRightOpen ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <Trophy size={16} />
            <span>Rankings</span>
          </button>
        </>
      )}

    </div>
  );
}
