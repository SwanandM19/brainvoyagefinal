'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, RotateCcw, RotateCw,
  ThumbsUp, ThumbsDown, BookmarkPlus, Share2,
  Send, ChevronDown, ChevronUp, PenLine, Trash2,
  Loader2, MessageSquare, UserPlus, UserCheck,
  Copy, Check, Link,
} from 'lucide-react';

interface Video {
  id: string; title: string; description: string;
  videoUrl: string; thumbnail: string | null;
  subject: string; classes: string[]; boards: string[];
  views: number; rating: number; duration: number;
  teacher: { id: string; name: string; subjects: string[]; followers: number } | null;
}
interface Props { video: Video; onClose: () => void; }
interface Comment {
  id: string; userName: string; userInitials: string;
  text: string; likes: number; liked?: boolean; createdAt: string;
}
interface Note { id: string; text: string; ts: string; time: number; }
type PanelTab = 'comments' | 'about' | 'notes';

const SUBJECT_GRADIENTS: Record<string, string> = {
  Mathematics: 'from-blue-600 to-indigo-700',
  Physics: 'from-purple-600 to-violet-700',
  Chemistry: 'from-green-600 to-emerald-700',
  Biology: 'from-teal-500 to-cyan-700',
  English: 'from-rose-500 to-pink-700',
  Hindi: 'from-orange-500 to-amber-600',
  History: 'from-yellow-600 to-orange-600',
  Geography: 'from-lime-600 to-green-700',
  'Computer Science': 'from-sky-500 to-blue-700',
  Economics: 'from-violet-600 to-purple-700',
  Accountancy: 'from-indigo-500 to-blue-600',
  'Business Studies': 'from-amber-500 to-orange-600',
};

const SUBJECT_EMOJI: Record<string, string> = {
  Mathematics: '📐', Physics: '⚛️', Chemistry: '🧪', Biology: '🧬',
  English: '📖', Hindi: '📝', History: '🏛️', Geography: '🌍',
  'Computer Science': '💻', Economics: '📊', Accountancy: '🧾',
  'Business Studies': '💼',
};

const COMMENT_COLORS = [
  'bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-pink-500', 'bg-amber-500', 'bg-sky-500', 'bg-teal-500',
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COMMENT_COLORS[Math.abs(h) % COMMENT_COLORS.length];
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function fmtTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(d / 60000), hrs = Math.floor(d / 3600000), days = Math.floor(d / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

export default function VideoPlayer({ video, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const pollTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const shareRef = useRef<HTMLDivElement>(null);

  const viewCounted = useRef(false);
  const watchTime = useRef(0);
  const lastTimestamp = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showCtrl, setShowCtrl] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const [liked, setLiked] = useState<'up' | 'down' | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(video.teacher?.followers ?? 0);
  const [followLoading, setFollowLoading] = useState(false);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [descOpen, setDescOpen] = useState(false);

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [tab, setTab] = useState<PanelTab>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingCmt, setLoadingCmt] = useState(true);
  const [postingCmt, setPostingCmt] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isPortrait, setIsPortrait] = useState(false);

  const isYT = video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be');
  const thumbUrl = video.thumbnail?.trim() || null;
  const showThumb = !!(thumbUrl && !imgError && !playing);
  const gradient = SUBJECT_GRADIENTS[video.subject] ?? 'from-orange-500 to-amber-600';
  const subjectEmoji = SUBJECT_EMOJI[video.subject] ?? '📚';
  const teacherInit = video.teacher?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'VS';

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/student/feed?video=${video.id}`
    : `https://vidyasangrah.vercel.app/student/feed?video=${video.id}`;

  function ytEmbed(url: string) {
    const m = url.match(/^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    const id = m?.[2]?.length === 11 ? m[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    }
    if (showShareMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => { setLinkCopied(false); setShowShareMenu(false); }, 2000);
    });
  }

  function handleWhatsApp() {
    const text = `Check out "${video.title}" on VidyaSangrah! 🎓\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  }

  function handleTwitter() {
    const text = `"${video.title}" — Great lesson on VidyaSangrah! 📚`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
    setShowShareMenu(false);
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title: video.title, text: `Watch "${video.title}" on VidyaSangrah`, url: shareUrl });
    } catch { /* user cancelled */ }
    setShowShareMenu(false);
  }

  const countView = useCallback(async () => {
    if (viewCounted.current) return;
    viewCounted.current = true;
    try { await fetch(`/api/videos/${video.id}/view`, { method: 'POST' }); } catch { /* silent */ }
  }, [video.id]);

  useEffect(() => {
    fetch(`/api/videos/${video.id}/my-state`)
      .then(r => r.json())
      .then(d => {
        if (d.liked !== undefined) setLiked(d.liked ? 'up' : null);
        if (d.following !== undefined) setFollowing(d.following);
        if (d.likes !== undefined) setLikeCount(d.likes);
        setStateLoaded(true);
      })
      .catch(() => setStateLoaded(true));
  }, [video.id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/videos/${video.id}/comments`);
      const data = await res.json();
      if (res.ok) setComments(data.comments);
    } catch { /* silent */ }
    finally { setLoadingCmt(false); }
  }, [video.id]);

  useEffect(() => {
    fetchComments();
    pollTimer.current = setInterval(fetchComments, 5000);
    return () => clearInterval(pollTimer.current);
  }, [fetchComments]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowRight') skip(10);
      if (e.key === 'ArrowLeft') skip(-10);
      if (e.key === 'm') toggleMute();
      if (e.key === 'f') toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  function togglePlay() {
    const v = videoRef.current; if (!v) return;
    v.paused ? v.play() : v.pause();
  }
  function toggleMute() {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  }
  function skip(s: number) {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.min(Math.max(v.currentTime + s, 0), v.duration);
  }

  function onTimeUpdate() {
    const v = videoRef.current; if (!v || !v.duration) return;
    setCurrent(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
    if (v.buffered.length)
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    if (!v.paused) {
      const delta = v.currentTime - lastTimestamp.current;
      if (delta > 0 && delta < 2) {
        watchTime.current += delta;
        if (watchTime.current >= 10) countView();
      }
    }
    lastTimestamp.current = v.currentTime;
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current; if (!v) return;
    const val = Number(e.target.value);
    v.currentTime = (val / 100) * v.duration; setProgress(val);
  }
  function onVolChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current; const val = Number(e.target.value);
    if (!v) return; v.volume = val; setVolume(val); setMuted(val === 0);
  }
  function toggleFullscreen() {
    if (!document.fullscreenElement) playerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  }
  function showCtrlTemp() {
    setShowCtrl(true); clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => { if (playing) setShowCtrl(false); }, 3000);
  }

  function onLoadedMetadata() {
    const v = videoRef.current; if (!v) return;
    setDuration(v.duration);
    setIsPortrait(v.videoHeight > v.videoWidth);
  }

  async function handleLike(type: 'up' | 'down') {
    if (!stateLoaded) return;
    if (type === 'down') {
      setLiked(prev => prev === 'down' ? null : 'down');
      return;
    }
    const wasLiked = liked === 'up';
    setLiked(wasLiked ? null : 'up');
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      const res = await fetch(`/api/videos/${video.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLikeCount(data.likes);
        setLiked(data.liked ? 'up' : null);
      } else {
        setLiked(wasLiked ? 'up' : null);
        setLikeCount(c => wasLiked ? c + 1 : c - 1);
      }
    } catch {
      setLiked(wasLiked ? 'up' : null);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
    }
  }

  async function handleFollow() {
    if (!video.teacher || followLoading) return;
    setFollowLoading(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setFollowerCount(c => wasFollowing ? c - 1 : c + 1);
    try {
      const res = await fetch(`/api/teacher/follow/${video.teacher.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data.isFollowing);
        setFollowerCount(data.followers);
      } else {
        setFollowing(wasFollowing);
        setFollowerCount(c => wasFollowing ? c + 1 : c - 1);
      }
    } catch {
      setFollowing(wasFollowing);
      setFollowerCount(c => wasFollowing ? c + 1 : c - 1);
    } finally {
      setFollowLoading(false);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || postingCmt) return;
    setPostingCmt(true);
    try {
      const res = await fetch(`/api/videos/${video.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const data = await res.json();
      if (res.ok) { setComments(prev => [data.comment, ...prev]); setCommentText(''); }
    } catch { /* silent */ }
    finally { setPostingCmt(false); }
  }

  async function likeComment(id: string) {
    // ✅ Optimistic update — always update both liked and likes together
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));
    try {
      const res = await fetch(`/api/videos/${video.id}/comments/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => prev.map(c =>
          c.id === id ? { ...c, liked: data.liked, likes: data.likes } : c
        ));
      } else {
        // rollback
        setComments(prev => prev.map(c =>
          c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
        ));
      }
    } catch { /* silent */ }
  }

  function addNote(e: React.FormEvent) {
    e.preventDefault(); if (!noteText.trim()) return;
    setNotes(prev => [{
      id: Date.now().toString(),
      text: noteText.trim(),
      ts: fmtTime(videoRef.current?.currentTime ?? 0),
      time: videoRef.current?.currentTime ?? 0,
    }, ...prev]);
    setNoteText('');
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#18181b] w-full max-w-6xl max-h-[95vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/5">

        {/* ══ TOP BAR ══════════════════════════════════ */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/8 flex-shrink-0">
          <div className={`bg-gradient-to-r ${gradient} text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex-shrink-0`}>
            {video.subject}
          </div>
          <p className="text-white/80 font-semibold text-sm truncate flex-1 min-w-0">{video.title}</p>
          <span className="text-white/20 text-[10px] hidden sm:block flex-shrink-0">Esc to close</span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* ══ BODY ════════════════════════════════════ */}
        <div className="flex flex-col-reverse lg:flex-row flex-1 overflow-hidden min-h-0">

          {/* ══ LEFT — Panel ══════════════════════════ */}
          <div className="w-full lg:w-[360px] xl:w-[380px] bg-[#111113] border-t lg:border-t-0 lg:border-r border-white/8 flex flex-col flex-shrink-0 overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-white/8 flex-shrink-0">
              {([
                { id: 'comments', label: `💬 Comments${comments.length > 0 ? ` (${comments.length})` : ''}` },
                { id: 'about', label: '📋 About' },
                { id: 'notes', label: `📝 Notes${notes.length > 0 ? ` (${notes.length})` : ''}` },
              ] as { id: PanelTab; label: string }[]).map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 py-3 text-[11px] font-bold transition-all border-b-2 ${tab === t.id ? 'text-white border-[#f97316]' : 'text-white/30 border-transparent hover:text-white/60'
                    }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── COMMENTS ──────────────────────────── */}
            {tab === 'comments' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <form onSubmit={submitComment} className="p-3 border-b border-white/8 flex-shrink-0">
                  <div className="flex gap-2.5">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-[10px] flex-shrink-0`}>
                      You
                    </div>
                    <div className="flex-1 flex gap-2 min-w-0">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Ask a doubt or share a tip…"
                        rows={1}
                        onFocus={(e) => { e.target.rows = 2; }}
                        onBlur={(e) => { if (!commentText) e.target.rows = 1; }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(e as any); } }}
                        className="flex-1 min-w-0 bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:border-white/30 transition-colors"
                      />
                      <button type="submit" disabled={!commentText.trim() || postingCmt}
                        className={`self-end p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white disabled:opacity-25 transition-opacity flex-shrink-0`}>
                        {postingCmt ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                  {loadingCmt ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={22} className="animate-spin text-white/30" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare size={32} className="text-white/10 mx-auto mb-3" />
                      <p className="text-white/30 text-sm font-semibold">No comments yet</p>
                      <p className="text-white/20 text-xs mt-1">Be the first to ask a question!</p>
                    </div>
                  ) : comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5 px-3 py-3 hover:bg-white/3 transition-colors group">
                      <div className={`w-8 h-8 rounded-full ${colorFor(c.userName)} flex items-center justify-center text-white font-extrabold text-[10px] flex-shrink-0`}>
                        {c.userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-xs font-bold truncate">{c.userName}</span>
                          <span className="text-white/25 text-[10px] flex-shrink-0">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-white/65 text-sm leading-relaxed">{c.text}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {/* ✅ Fix: likes always rendered in a <span> so GT mutation is stable */}
                          <button onClick={() => likeComment(c.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${c.liked ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
                            <ThumbsUp size={11} fill={c.liked ? 'currentColor' : 'none'} />
                            {/* ✅ Always render span — no conditional insertion, GT stays stable */}
                            <span>{c.likes > 0 ? c.likes : ''}</span>
                          </button>
                          <button className="text-white/20 hover:text-white/50 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ABOUT ─────────────────────────────── */}
            {tab === 'about' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Views', value: fmtViews(video.views), icon: '👁' },
                    { label: 'Rating', value: `★ ${video.rating.toFixed(1)}`, icon: '⭐' },
                    { label: 'Likes', value: likeCount.toLocaleString('en-IN'), icon: '👍' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                      <div className="text-base mb-0.5">{s.icon}</div>
                      <p className="text-white font-extrabold text-sm">{s.value}</p>
                      <p className="text-white/30 text-[10px] font-semibold">{s.label}</p>
                    </div>
                  ))}
                </div>

                {video.teacher && (
                  <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className="relative flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                        {teacherInit}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-extrabold text-sm">{video.teacher.name}</p>
                        <p className="text-white/70 text-xs truncate">{video.teacher.subjects.join(', ')}</p>
                        {/* ✅ Fix: followerCount wrapped in span so GT mutation on "followers" word is stable */}
                        <p className="text-white/50 text-[10px] mt-0.5">
                          🎓 <span>{fmtViews(followerCount)}</span> <span>followers</span>
                        </p>
                      </div>
                      <button onClick={handleFollow} disabled={followLoading}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-extrabold transition-all flex-shrink-0 ${following
                            ? 'bg-white/20 text-white hover:bg-white/10'
                            : 'bg-white text-gray-900 hover:bg-white/90'
                          }`}>
                        {/* ✅ Fix: text after icon wrapped in <span> */}
                        {followLoading
                          ? <Loader2 size={12} className="animate-spin" />
                          : following
                            ? <><UserCheck size={12} /><span>Following</span></>
                            : <><UserPlus size={12} /><span>Follow</span></>}
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                  <p className="text-white/30 text-[10px] font-extrabold uppercase tracking-widest mb-2">Description</p>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                    {video.description?.trim() || <span className="italic text-white/20">No description provided.</span>}
                  </p>
                </div>

                {(video.classes.length > 0 || video.boards.length > 0) && (
                  <div>
                    <p className="text-white/30 text-[10px] font-extrabold uppercase tracking-widest mb-2">Covers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {video.classes.map((c) => (
                        <span key={c} className="text-xs font-semibold bg-white/8 text-white/60 border border-white/10 px-2.5 py-1 rounded-full">{c}</span>
                      ))}
                      {video.boards.map((b) => (
                        <span key={b} className={`text-xs font-semibold bg-gradient-to-r ${gradient} text-white px-2.5 py-1 rounded-full opacity-80`}>{b}</span>
                      ))}
                    </div>
                  </div>
                )}

                {!isYT && (
                  <div className="bg-white/4 rounded-xl p-3 border border-white/8">
                    <p className="text-white/30 text-[10px] font-extrabold uppercase tracking-widest mb-2.5">Keyboard Shortcuts</p>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                      {[['Space', 'Play/Pause'], ['← →', 'Skip 10s'], ['M', 'Mute'], ['F', 'Fullscreen'], ['Esc', 'Close']].map(([k, l]) => (
                        <div key={k} className="flex items-center gap-2">
                          <kbd className="bg-white/10 text-white/50 text-[10px] font-mono px-1.5 py-0.5 rounded">{k}</kbd>
                          <span className="text-white/30 text-[10px]">{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── NOTES ─────────────────────────────── */}
            {tab === 'notes' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <form onSubmit={addNote} className="p-3 border-b border-white/8 flex-shrink-0 space-y-2">
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">
                    📌 Note at {fmtTime(current)}
                    {playing && <span className="ml-2 text-green-400 animate-pulse">● Live</span>}
                  </p>
                  <div className="flex gap-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Jot down a key point at this timestamp…"
                      rows={2}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(e as any); } }}
                      className="flex-1 bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <button type="submit" disabled={!noteText.trim()}
                      className={`self-end p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white disabled:opacity-25 flex-shrink-0 transition-opacity`}>
                      <PenLine size={14} />
                    </button>
                  </div>
                  <p className="text-white/20 text-[10px]">Enter to save · Shift+Enter for new line</p>
                </form>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {notes.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-3xl mb-2">📝</p>
                      <p className="text-white/30 text-sm font-semibold">No notes yet</p>
                      <p className="text-white/20 text-xs mt-1">Pause the video and write key points!</p>
                    </div>
                  ) : notes.map((n) => (
                    <div key={n.id} className="bg-white/5 border border-white/8 rounded-xl p-3 group">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <button type="button"
                            onClick={() => { const v = videoRef.current; if (v) { v.currentTime = n.time; v.play(); } }}
                            className={`text-[10px] font-extrabold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1.5 hover:opacity-70 transition-opacity`}>
                            ▶ Jump to {n.ts}
                          </button>
                          <p className="text-white/65 text-sm leading-relaxed">{n.text}</p>
                        </div>
                        <button type="button"
                          onClick={() => setNotes(p => p.filter(x => x.id !== n.id))}
                          className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══ RIGHT — Video + Info ═══════════════════ */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

            <div
              ref={playerRef}
              className="relative bg-black flex-shrink-0 w-full"
              style={{ aspectRatio: isPortrait ? '9/16' : '16/9', maxHeight: '65vh' }}
              onMouseMove={showCtrlTemp}
              onMouseLeave={() => { if (playing) setShowCtrl(false); }}
            >
              {isYT ? (
                <iframe src={ytEmbed(video.videoUrl)} className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen />
              ) : (
                <>
                  {showThumb ? (
                    <img src={thumbUrl!} alt={video.title} onError={() => setImgError(true)}
                      className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none" />
                  ) : !playing && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} z-10 pointer-events-none flex flex-col items-center justify-center gap-3`}>
                      <div className="text-6xl opacity-60">{subjectEmoji}</div>
                      <p className="text-white/50 font-extrabold text-sm uppercase tracking-widest">{video.subject}</p>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    src={video.videoUrl}
                    preload={video.duration > 600 ? 'none' : 'metadata'}
                    className="w-full h-full object-contain"
                    onTimeUpdate={onTimeUpdate}
                    onLoadedMetadata={onLoadedMetadata}
                    onPlay={() => { setPlaying(true); setBuffering(false); }}
                    onPause={() => { setPlaying(false); setBuffering(false); }}
                    onEnded={() => { setPlaying(false); setShowCtrl(true); }}
                    onWaiting={() => setBuffering(true)}
                    onCanPlay={() => setBuffering(false)}
                    onPlaying={() => setBuffering(false)}
                    onClick={togglePlay}
                    playsInline
                  />

                  {buffering && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                      <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-white" />
                      </div>
                    </div>
                  )}

                  {!playing && !buffering && (
                    <button type="button" onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center z-20">
                      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform`}>
                        <Play size={26} fill="white" className="text-white ml-1" />
                      </div>
                    </button>
                  )}

                  <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-200 ${showCtrl || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pt-8 pb-2">
                      <div className="relative h-5 flex items-center mb-1 group/seek">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                          <div className="h-1 group-hover/seek:h-1.5 bg-white/20 rounded-full transition-all relative">
                            <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${buffered}%` }} />
                            <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} rounded-full`} style={{ width: `${progress}%` }} />
                          </div>
                          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity pointer-events-none"
                            style={{ left: `calc(${progress}% - 6px)` }} />
                        </div>
                        <input type="range" min={0} max={100} step={0.1} value={progress}
                          onChange={onSeek} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                      </div>

                      <div className="flex items-center gap-1 text-white">
                        <button type="button" onClick={() => skip(-10)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                          <RotateCcw size={16} />
                        </button>
                        <button type="button" onClick={togglePlay}
                          className={`p-2 rounded-full bg-gradient-to-br ${gradient} text-white shadow-lg hover:scale-105 transition-transform mx-0.5`}>
                          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <button type="button" onClick={() => skip(10)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                          <RotateCw size={16} />
                        </button>

                        <div className="flex items-center gap-1 group/vol ml-1">
                          <button type="button" onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                            {muted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                          </button>
                          <div className="w-0 overflow-hidden group-hover/vol:w-16 transition-all duration-200">
                            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                              onChange={onVolChange} className="w-16 h-1 accent-white cursor-pointer" />
                          </div>
                        </div>

                        <span className="text-xs font-mono text-white/60 ml-1 tabular-nums">
                          {fmtTime(current)}<span className="mx-0.5 text-white/25">/</span>{fmtTime(duration)}
                        </span>
                        <div className="flex-1" />
                        <button type="button" onClick={toggleFullscreen} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                          {fullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Below video ──────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 bg-[#0f0f0f]">

              <div>
                <h1 className="text-white font-extrabold text-base leading-snug">{video.title}</h1>
                <p className="text-white/35 text-xs mt-1">{fmtViews(video.views)} views · ★ {video.rating.toFixed(1)}</p>
              </div>

              {/* ── Action buttons ───────────────────── */}
              <div className="flex items-center gap-2 flex-wrap">

                {/* Like / Dislike */}
                <div className="flex items-center bg-white/8 rounded-full overflow-hidden border border-white/10">
                  <button type="button" onClick={() => handleLike('up')}
                    disabled={!stateLoaded}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-r border-white/10 disabled:opacity-50 ${liked === 'up'
                        ? `bg-gradient-to-r ${gradient} text-white`
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}>
                    <ThumbsUp size={13} fill={liked === 'up' ? 'currentColor' : 'none'} />
                    {/* ✅ Fix: like count always in a <span> — GT can mutate it, React still finds it */}
                    <span>{stateLoaded ? likeCount.toLocaleString('en-IN') : '…'}</span>
                  </button>
                  <button type="button" onClick={() => handleLike('down')}
                    disabled={!stateLoaded}
                    className={`px-3 py-2 transition-all disabled:opacity-50 ${liked === 'down' ? 'text-white bg-white/15' : 'text-white/40 hover:bg-white/10 hover:text-white'
                      }`}>
                    <ThumbsDown size={13} fill={liked === 'down' ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Save */}
                {/* ✅ Fix: text after icon wrapped in <span> */}
                <button type="button" onClick={() => setSaved(s => !s)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${saved
                      ? `bg-gradient-to-r ${gradient} text-white border-transparent`
                      : 'bg-white/8 border-white/10 text-white/60 hover:bg-white/15 hover:text-white'
                    }`}>
                  <BookmarkPlus size={13} fill={saved ? 'currentColor' : 'none'} />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>

                {/* Share */}
                <div ref={shareRef} className="relative">
                  {/* ✅ Fix: "Share" text wrapped in <span> */}
                  <button type="button" onClick={() => setShowShareMenu(prev => !prev)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${showShareMenu
                        ? `bg-gradient-to-r ${gradient} text-white border-transparent`
                        : 'bg-white/8 border-white/10 text-white/60 hover:bg-white/15 hover:text-white'
                      }`}>
                    <Share2 size={13} /><span>Share</span>
                  </button>

                  {showShareMenu && (
                    <div className="absolute bottom-full mb-2 left-0 bg-[#1c1c1f] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden w-56">
                      <button type="button" onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/8 text-sm font-semibold text-white/80 hover:text-white transition-colors border-b border-white/8">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                          {linkCopied
                            ? <Check size={14} className="text-green-400" />
                            : <Copy size={14} className="text-white/60" />}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold">{linkCopied ? 'Link Copied! ✓' : 'Copy Link'}</p>
                          <p className="text-[10px] text-white/30">Share the video URL</p>
                        </div>
                      </button>

                      <button type="button" onClick={handleWhatsApp}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/8 text-sm font-semibold text-white/80 hover:text-white transition-colors border-b border-white/8">
                        <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-base leading-none">📱</span>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold">WhatsApp</p>
                          <p className="text-[10px] text-white/30">Share to your contacts</p>
                        </div>
                      </button>

                      <button type="button" onClick={handleTwitter}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/8 text-sm font-semibold text-white/80 hover:text-white transition-colors border-b border-white/8">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-base leading-none">🐦</span>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold">Twitter / X</p>
                          <p className="text-[10px] text-white/30">Post on Twitter</p>
                        </div>
                      </button>

                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <button type="button" onClick={handleNativeShare}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/8 text-sm font-semibold text-white/80 hover:text-white transition-colors">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <Link size={14} className="text-orange-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold">More options</p>
                            <p className="text-[10px] text-white/30">Open share sheet</p>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-white/8" />

              {/* Teacher row */}
              {video.teacher && (
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0`}>
                    {teacherInit}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{video.teacher.name}</p>
                    {/* ✅ Fix: followerCount in <span>, "followers" in <span> — GT translates the word
                        but React reconciles the expression node separately */}
                    <p className="text-white/40 text-xs">
                      <span>{stateLoaded ? fmtViews(followerCount) : '…'}</span>
                      {' '}<span>followers</span>
                    </p>
                  </div>
                  {/* ✅ Fix: text after icon wrapped in <span> — both occurrences */}
                  <button type="button" onClick={handleFollow} disabled={followLoading || !stateLoaded}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all flex-shrink-0 disabled:opacity-50 ${following
                        ? 'bg-white/10 text-white/70 border border-white/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                        : `bg-gradient-to-r ${gradient} text-white hover:opacity-90 shadow-lg`
                      }`}>
                    {followLoading
                      ? <Loader2 size={12} className="animate-spin" />
                      : following
                        ? <><UserCheck size={12} /><span>Following</span></>
                        : <><UserPlus size={12} /><span>Follow</span></>}
                  </button>
                </div>
              )}

              {/* Description */}
              {/* ✅ Fix: translate="no" on the collapsing div — line-clamp className change crashes GT */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/8 cursor-pointer hover:bg-white/8 transition-colors"
                onClick={() => setDescOpen(o => !o)}>
                <div translate="no"
                  className={`text-white/55 text-sm leading-relaxed ${!descOpen ? 'line-clamp-2' : ''} whitespace-pre-wrap`}>
                  {video.description?.trim() || <span className="italic text-white/20">No description</span>}
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-white/40">
                  {descOpen
                    ? <><ChevronUp size={12} /><span className="text-xs font-bold">Show less</span></>
                    : <><ChevronDown size={12} /><span className="text-xs font-bold">Show more</span></>}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
