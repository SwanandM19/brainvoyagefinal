

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Play, Trophy, Search, LogOut, Star, Eye, BookOpen, X, User, TrendingUp, Globe, ChevronLeft, Medal, Crown, Plus, Users, Video, FileText, Image as ImageIcon, Upload, Edit3, Save, Loader2, Trash2, Settings, CheckCircle, Clock, Award, HelpCircle, Menu, Share2, Gift, } from 'lucide-react'
import Logo from '@/components/layout/Logo';
import UploadVideoModal from './UploadVideoModal';
import TeacherLeaderboard from '@/components/leaderboard/TeacherLeaderboard';
import UploadPhotoModal from './UploadPhotoModal';
import WriteArticleModal from './WriteArticleModal';
import FeedVideoCard, { type FeedVideo } from '@/components/teacher/FeedVideoCard';
import FeedPhotoCard, { type FeedPhoto } from '@/components/teacher/FeedPhotoCard';
import FeedArticleCard, { type FeedArticle } from '@/components/teacher/FeedArticleCard';
import MyContentPanel, { type OwnVideo } from '@/components/teacher/MyContentPanel';
import TeacherTour, { isTourDone, resetTour } from '@/components/onboarding/TeacherTour';
import FeedLanguageSelector from '@/components/FeedLanguageSelector';
// import HelpModal from "@/components/HelpModal";
import HelpView from '@/components/HelpView'
import ReferralCard from '@/components/teacher/ReferralCard';


// ── Types ─────────────────────────────────────────────────
// type Tab = 'feed' | 'myvideos' | 'stats' | 'leaderboard' | 'profile';
type Tab = 'feed' | 'myvideos' | 'stats' | 'leaderboard' | 'profile' | 'help'
type FeedType = 'all' | 'video' | 'photo' | 'article';

interface CommunityPost {
    id: string; type: 'photo' | 'article';
    title?: string; body?: string;
    photoUrl?: string; caption?: string;
    subject: string; classes: string[]; boards: string[];
    createdAt: string;
    teacher: { id: string; name: string; image: string | null; subjects: string[] };
}
interface NewPost {
    id: string; type: 'photo' | 'article';
    title?: string; body?: string;
    photoUrl?: string; caption?: string;
    subject: string; classes: string[]; boards: string[];
    status: string; createdAt: string;
}
interface TeacherInfo {
    id: string; name: string; email: string; image: string | null;
    subjects: string[]; classes: string[]; boards: string[];
    bio: string; city: string; state: string; yearsOfExperience: number;freeMonthsEarned:  number;pendingFreeMonths: number;
}
interface Stats {
    totalVideos: number; totalViews: number; totalFollowers: number;
    totalLikes: number; avgRating: string;
}
interface SubInfo {
    status: string;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    currentPeriodStart: string | null;
}
interface Suggestion { type: 'teacher' | 'subject'; label: string; }
interface LeaderEntry {
    teacherId: string; name: string; image?: string | null;
    totalViews: number; videoCount: number; rank: number; followersCount: number;
}

// ── Constants ─────────────────────────────────────────────
const ALL_SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
    'History', 'Geography', 'Computer Science', 'Economics', 'Accountancy', 'Business Studies',
];
const ALL_CLASSES = [
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12', 'JEE', 'NEET', 'UPSC', 'CA',
];
const ALL_BOARDS = [
    'CBSE', 'ICSE', 'Maharashtra Board', 'UP Board', 'RBSE',
    'Tamil Nadu Board', 'Karnataka Board', 'Other',
];
const TRENDING = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

const SUBJECT_GRADIENTS: Record<string, string> = {
    Mathematics: 'from-blue-500 to-indigo-600', Physics: 'from-purple-500 to-violet-600',
    Chemistry: 'from-green-500 to-emerald-600', Biology: 'from-teal-500 to-cyan-600',
    English: 'from-rose-500 to-pink-600', Hindi: 'from-orange-500 to-amber-600',
    History: 'from-yellow-500 to-orange-500', Geography: 'from-lime-500 to-green-600',
    'Computer Science': 'from-sky-500 to-blue-600', Economics: 'from-violet-500 to-purple-600',
    Accountancy: 'from-indigo-500 to-blue-500', 'Business Studies': 'from-amber-500 to-orange-500',
};
const SUBJECT_EMOJI: Record<string, string> = {
    All: '🌐', Mathematics: '📐', Physics: '⚛️', Chemistry: '🧪', Biology: '🧬',
    English: '📖', Hindi: '📝', History: '🏛️', Geography: '🌍',
    'Computer Science': '💻', Economics: '📊', Accountancy: '🧾', 'Business Studies': '💼',
};
const LEADER_GRADS = [
    'from-orange-400 to-amber-500', 'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600', 'from-teal-500 to-cyan-600',
    'from-rose-500 to-pink-600', 'from-green-400 to-emerald-500',
    'from-sky-400 to-blue-500',
];

// ── Helpers ───────────────────────────────────────────────
const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

// ── SubjectDropdown ───────────────────────────────────────
function SubjectDropdown({ activeSubject, onSelect }: {
    activeSubject: string; onSelect: (s: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const isActive = ALL_SUBJECTS.includes(activeSubject);

    useEffect(() => {
        function h(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        if (open) document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    return (
        <div ref={ref} className="relative flex-shrink-0">
            <button
                onClick={() => setOpen(p => !p)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${isActive || open
                    ? 'border-[#f97316] text-[#f97316]'
                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                    }`}>
                {isActive
                    ? <><span>{SUBJECT_EMOJI[activeSubject] ?? '📚'}</span><span className="hidden sm:inline">{activeSubject}</span></>
                    : <><BookOpen size={14} /><span>Subjects</span></>}
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
                            {ALL_SUBJECTS.map(s => {
                                const grad = SUBJECT_GRADIENTS[s] ?? 'from-orange-400 to-amber-500';
                                const sel = activeSubject === s;
                                return (
                                    <button key={s} onClick={() => { onSelect(s); setOpen(false); }}
                                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-center transition-all group ${sel ? 'bg-orange-50 border-2 border-orange-200' : 'border-2 border-transparent hover:bg-[#F8F9FA] hover:border-[#E5E7EB]'}`}>
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-lg shadow-sm transition-transform ${sel ? 'scale-110 shadow-md shadow-orange-100' : 'group-hover:scale-105'}`}>
                                            {SUBJECT_EMOJI[s] ?? '📚'}
                                        </div>
                                        <span className={`text-[10px] font-bold leading-tight ${sel ? 'text-[#f97316]' : 'text-[#6B7280] group-hover:text-[#111827]'}`}>{s}</span>
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

// ── VideoPlayerModal ──────────────────────────────────────
function VideoPlayerModal({ video, onClose }: {
    video: { title: string; teacherName: string; subject: string; videoUrl: string; views: number; rating: number; classes: string[]; boards: string[] };
    onClose: () => void;
}) {
    const isYT = video.videoUrl?.includes('youtube.com') || video.videoUrl?.includes('youtu.be');
    function ytEmbed(url: string) {
        const m = url.match(/^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        const id = m?.[2]?.length === 11 ? m[2] : null;
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
    }
    const grad = SUBJECT_GRADIENTS[video.subject] ?? 'from-orange-400 to-amber-500';
    const [copied, setCopied] = useState(false);
    function handleShare() {
        const shareUrl = `${window.location.origin}/teacher/feed?video=${encodeURIComponent(video.videoUrl)}`;
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Watch "${video.title}" by ${video.teacherName} on VidyaSangrah`,
                url: shareUrl,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => { });
        }
    }
    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F3F4F6]">
                    <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${grad} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                        <p className="text-[#111827] font-bold text-sm truncate">{video.title}</p>
                        <p className="text-[#9CA3AF] text-xs">{video.teacherName} · {video.subject}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F8F9FA] transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                    {video.videoUrl
                        ? isYT
                            ? <iframe src={ytEmbed(video.videoUrl)} className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                            : <video src={video.videoUrl} controls autoPlay className="w-full h-full object-contain" playsInline />
                        : <div className="w-full h-full flex items-center justify-center"><p className="text-white/50 text-sm">Video not available</p></div>}
                </div>
                <div className="px-4 py-3 flex items-center gap-4 text-xs text-[#9CA3AF] font-semibold">
                    <span className="flex items-center gap-1"><Eye size={11} /><span>{video.views.toLocaleString('en-IN')} views</span></span>
                    <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400 fill-[#facc15]" />{video.rating.toFixed(1)}</span>
                    <button
                        onClick={handleShare}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 active:scale-95 transition-all font-bold text-xs border border-orange-200">
                        <Share2 size={11} />{copied ? '✓ Copied!' : 'Share'}
                    </button>
                    <div className="flex gap-1.5 flex-wrap">
                        {video.classes.slice(0, 2).map(c => <span key={c} className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{c}</span>)}
                        {video.boards.slice(0, 1).map(b => <span key={b} className="bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{b}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── StartPostingModal ─────────────────────────────────────
function StartPostingModal({ onClose, onUploadVideo, onUploadPhoto, onWriteArticle }: {
    onClose: () => void; onUploadVideo: () => void;
    onUploadPhoto: () => void; onWriteArticle: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#E5E7EB]" onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-[#111827] text-sm">Start Posting</h3>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">What would you like to share?</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F8F9FA] transition-colors"><X size={16} /></button>
                </div>
                <div className="p-3 space-y-2">
                    <button onClick={() => { onClose(); onUploadVideo(); }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-orange-300 hover:bg-orange-50 transition-all group text-left">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-200 group-hover:scale-110 transition-transform">
                            <Video size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-[#111827] group-hover:text-[#f97316] transition-colors">Upload Video</p>
                            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Share a teaching video</p>
                        </div>
                    </button>
                    <button onClick={() => { onClose(); onWriteArticle(); }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-blue-300 hover:bg-blue-50 transition-all group text-left">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
                            <FileText size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-[#111827] group-hover:text-blue-500 transition-colors">Write Article</p>
                            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Share tips, study notes & more</p>
                        </div>
                    </button>
                    <button onClick={() => { onClose(); onUploadPhoto(); }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-pink-300 hover:bg-pink-50 transition-all group text-left">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-200 group-hover:scale-110 transition-transform">
                            <ImageIcon size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-[#111827] group-hover:text-pink-500 transition-colors">Create Post</p>
                            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Share an image or announcement</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function TeacherFeedClient({
    teacher: initialTeacher, stats, ownVideos: initialOwnVideos,
    subscription, communityVideos, communityPosts: initialCommunityPosts,
}: {
    teacher: TeacherInfo; stats: Stats; ownVideos: OwnVideo[];
    subscription: SubInfo; communityVideos: FeedVideo[];
    communityPosts?: CommunityPost[];
}) {
    const searchParams = useSearchParams();

    // ── Tab & Feed State ─────────────────────────────────
    const [activeTab, setActiveTab] = useState<Tab>('feed');
    const [feedType, setFeedType] = useState<FeedType>('all');
    const [search, setSearch] = useState('');
    const [activeSubject, setActiveSubject] = useState('All');
    const [focused, setFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [playingVideo, setPlayingVideo] = useState<{
        title: string; teacherName: string; subject: string; videoUrl: string;
        views: number; rating: number; classes: string[]; boards: string[];
    } | null>(null);

    // ── Content State ────────────────────────────────────
    const [ownVideos, setOwnVideos] = useState<OwnVideo[]>(initialOwnVideos);
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialCommunityPosts ?? []);
    const [newPost, setNewPost] = useState<NewPost | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [previewOwnVideo, setPreviewOwnVideo] = useState<OwnVideo | null>(null);

    // ── Profile State ────────────────────────────────────
    const [teacher, setTeacher] = useState<TeacherInfo>(initialTeacher);
    const [profileForm, setProfileForm] = useState<TeacherInfo>(initialTeacher);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [subInfo, setSubInfo] = useState<SubInfo>(subscription);
    const [referralKey, setReferralKey] = useState(0);

    // ── Modal State ──────────────────────────────────────
    const [showUpload, setShowUpload] = useState(false);
    const [showPosting, setShowPosting] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showPhoto, setShowPhoto] = useState(false);
    const [showArticle, setShowArticle] = useState(false);

    // ── Leaderboard State ────────────────────────────────
    const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
    const [lbLoading, setLbLoading] = useState(true);
    const [myRank, setMyRank] = useState<number | null>(null);

    // ── MOBILE STATE — JS-based, 100% reliable ───────────
    const [isMobile, setIsMobile] = useState(false);
    const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
    const [mobileRightOpen, setMobileRightOpen] = useState(false);

    const [showTour, setShowTour] = useState(false);
    // const [showHelp, setShowHelp] = useState(false);
    const [tourControllingDrawer, setTourControllingDrawer] = useState(false);

    const handleTourDrawer = useCallback((drawer: 'left' | 'right' | 'none') => {
        setTourControllingDrawer(drawer !== 'none');
        setMobileLeftOpen(drawer === 'left');
        setMobileRightOpen(drawer === 'right');
    }, []);

    const profileDropRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debouncer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const initials = getInitials(teacher.name);

    // ── Effects ───────────────────────────────────────────
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        document.body.style.overflow = (mobileLeftOpen || mobileRightOpen) ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileLeftOpen, mobileRightOpen]);

    const mobileNavigate = useCallback((tab: Tab) => {
        setActiveTab(tab);
        setMobileLeftOpen(false);
        setMobileRightOpen(false);
    }, []);

    useEffect(() => {
        const vid = searchParams.get('video');
        if (!vid) return;
        const found = communityVideos.find(v => v.id === vid);
        if (found) setPlayingVideo({
            title: found.title, teacherName: found.teacher.name,
            subject: found.subject, videoUrl: found.videoUrl,
            views: found.views, rating: found.rating,
            classes: found.classes, boards: found.boards,
        });
    }, [searchParams, communityVideos]);

    useEffect(() => {
        function h(e: MouseEvent) {
            if (profileDropRef.current && !profileDropRef.current.contains(e.target as Node)) setShowProfile(false);
        }
        if (showProfile) document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [showProfile]);

    useEffect(() => {
        clearTimeout(debouncer.current);
        debouncer.current = setTimeout(() => {
            if (search.length < 2) { setSuggestions([]); return; }
            const q = search.toLowerCase();
            const tNames = new Set<string>(); const sNames = new Set<string>();
            communityVideos.forEach(v => {
                if (v.teacher.name.toLowerCase().includes(q)) tNames.add(v.teacher.name);
                if (v.subject.toLowerCase().includes(q)) sNames.add(v.subject);
            });
            communityPosts.forEach(p => {
                if (p.teacher.name.toLowerCase().includes(q)) tNames.add(p.teacher.name);
                if (p.subject.toLowerCase().includes(q)) sNames.add(p.subject);
            });
            setSuggestions([
                ...Array.from(tNames).slice(0, 4).map(l => ({ type: 'teacher' as const, label: l })),
                ...Array.from(sNames).slice(0, 3).map(l => ({ type: 'subject' as const, label: l })),
            ]);
        }, 200);
        return () => clearTimeout(debouncer.current);
    }, [search, communityVideos, communityPosts]);

    useEffect(() => {
        setLbLoading(true);
        fetch('/api/leaderboard/teachers?limit=7&sortBy=views')
            .then(r => r.json())
            .then(data => { setLeaders(data.teachers ?? []); setMyRank(data.myStats?.rank ?? null); })
            .catch(() => setLeaders([]))
            .finally(() => setLbLoading(false));
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            if (!isMobile && !isTourDone()) setShowTour(true);
        }, 800);
        return () => clearTimeout(t);
    }, [isMobile]);

    // ── Feed Computation ──────────────────────────────────
    type FeedItem =
        | { itemType: 'video'; data: FeedVideo }
        | { itemType: 'photo'; data: CommunityPost }
        | { itemType: 'article'; data: CommunityPost };

    const allCommunityPosts = newPost
        ? [newPost as unknown as CommunityPost, ...communityPosts]
        : communityPosts;

    const allFeedItems: FeedItem[] = [
        ...communityVideos.map(v => ({ itemType: 'video' as const, data: v })),
        ...communityPosts.filter(p => p.type === 'photo').map(p => ({ itemType: 'photo' as const, data: p })),
        ...communityPosts.filter(p => p.type === 'article').map(p => ({ itemType: 'article' as const, data: p })),
    ].sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());

    const filteredFeed = allFeedItems.filter(item => {
        const q = search.toLowerCase();
        const matchType = feedType === 'all' || item.itemType === feedType;
        const matchSubject = activeSubject === 'All' || item.data.subject === activeSubject;
        const searchable = [
            item.itemType === 'video'
                ? (item.data as FeedVideo).title
                : ((item.data as CommunityPost).title ?? (item.data as CommunityPost).caption ?? ''),
            item.data.teacher.name,
            item.data.subject,
        ].join(' ').toLowerCase();
        const matchSearch = !search || searchable.includes(q);
        return matchType && matchSubject && matchSearch;
    });

    const videoCount = allFeedItems.filter(i => i.itemType === 'video').length;
    const photoCount = allFeedItems.filter(i => i.itemType === 'photo').length;
    const articleCount = allFeedItems.filter(i => i.itemType === 'article').length;
    const showDropdown = focused && (search.length === 0 || suggestions.length > 0);

    // ── Handlers ──────────────────────────────────────────
    async function handleDeleteVideo(id: string | null) {
        if (!id) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) { alert(data.error ?? 'Failed to delete.'); return; }
            setOwnVideos(prev => prev.filter(v => v.id !== id));
            setConfirmDeleteId(null);
        } catch { alert('Network error. Try again.'); }
        finally { setDeleting(false); }
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
            } else setSaveError('Failed to save. Please try again.');
        } catch { setSaveError('Network error.'); }
        finally { setSaving(false); }
    }

    function toggleArray(arr: string[], item: string) {
        return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
    }

    // ── MiniLeaderboard ───────────────────────────────────
    function MiniLeaderboard({ onFullLB }: { onFullLB?: () => void }) {
        return (
            <div id="tour-mini-leaderboard" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-500" />
                <div className="px-4 pt-4 pb-3 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-1.5 text-orange-500 text-[10px] font-extrabold uppercase tracking-widest mb-1">
                        <Trophy size={11} /><span>Teacher Rankings</span>
                    </div>
                    <h4 className="font-black text-[#111827] text-sm">
                        Who's{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Dominating?</span>
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
                        <Trophy size={20} className="text-orange-200 mx-auto mb-2" />
                        <p className="text-xs font-bold text-[#9CA3AF]">No data yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#F8F9FA]">
                        {leaders.map((leader, idx) => {
                            const isMe = leader.teacherId === teacher.id;
                            const lInitials = getInitials(leader.name);
                            return (
                                <div key={leader.teacherId}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${isMe ? 'bg-orange-50' : 'hover:bg-[#FAFAFA]'}`}>
                                    <div className="w-5 flex-shrink-0 text-center">
                                        {leader.rank === 1 ? <Crown size={13} className="text-yellow-500 mx-auto" />
                                            : leader.rank === 2 ? <Medal size={13} className="text-slate-400 mx-auto" />
                                                : leader.rank === 3 ? <Medal size={13} className="text-amber-600 mx-auto" />
                                                    : <span className={`text-[11px] font-extrabold ${isMe ? 'text-orange-500' : 'text-[#9CA3AF]'}`}>{leader.rank}</span>}
                                    </div>
                                    {leader.image
                                        ? <img src={leader.image} alt={leader.name}
                                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB]"
                                            onError={e => {
                                                e.currentTarget.style.display = 'none';
                                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                            }} />
                                        : null}
                                    <div
                                        style={{ display: leader.image ? 'none' : 'flex' }}
                                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${isMe ? 'from-orange-400 to-amber-500' : LEADER_GRADS[idx % LEADER_GRADS.length]} items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0`}>
                                        {lInitials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate ${isMe ? 'text-[#f97316]' : 'text-[#111827]'}`}>
                                            {isMe ? 'You' : leader.name.split(' ')[0]}
                                        </p>
                                        <p className="text-[10px] text-[#9CA3AF] font-semibold flex items-center gap-0.5">
                                            <Eye size={9} className="text-orange-300" /><span>{leader.totalViews.toLocaleString('en-IN')}</span>
                                        </p>
                                    </div>
                                    {isMe && (
                                        <span className="text-[9px] font-extrabold text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full flex-shrink-0">You</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="p-3 border-t border-[#F3F4F6]">
                    <button
                        onClick={onFullLB ?? (() => setActiveTab('leaderboard'))}
                        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-[#E5E7EB] text-[11px] font-extrabold text-[#6B7280] hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all">
                        <Trophy size={11} /><span>Full Leaderboard →</span>
                    </button>
                </div>
            </div>
        );
    }

    // ── StatsPanel ────────────────────────────────────────
    function StatsPanel() {
        const statCards = [
            { label: 'Total Videos', value: stats.totalVideos, icon: <Video size={18} className="text-white" />, grad: 'from-orange-400 to-amber-500', note: 'Uploaded videos' },
            { label: 'Total Views', value: stats.totalViews.toLocaleString('en-IN'), icon: <Eye size={18} className="text-white" />, grad: 'from-blue-400 to-indigo-500', note: 'Across all videos' },
            { label: 'Followers', value: stats.totalFollowers, icon: <Users size={18} className="text-white" />, grad: 'from-violet-400 to-purple-500', note: 'Students following you' },
            { label: 'Total Likes', value: stats.totalLikes, icon: <Star size={18} className="text-white" />, grad: 'from-rose-400 to-pink-500', note: 'Across all videos' },
            { label: 'Avg Rating', value: stats.avgRating, icon: <Award size={18} className="text-white" />, grad: 'from-yellow-400 to-orange-400', note: 'Out of 5.0' },
            { label: 'National Rank', value: myRank ? `#${myRank}` : '—', icon: <Trophy size={18} className="text-white" />, grad: 'from-green-400 to-emerald-500', note: 'By total views' },
        ];
        return (
            <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {statCards.map(card => (
                        <div key={card.label}
                            className="relative bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${card.grad} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.grad} flex items-center justify-center mb-3 shadow-sm`}>{card.icon}</div>
                            <p className="text-2xl font-extrabold text-[#111827] tabular-nums">{card.value}</p>
                            <p className="text-xs font-semibold text-[#6B7280] mt-0.5">{card.label}</p>
                            {card.note && <p className="text-[10px] text-[#9CA3AF] mt-1">{card.note}</p>}
                        </div>
                    ))}
                </div>
                {(() => {
                    function addMonths(date: Date, months: number): Date {
                        const d = new Date(date);
                        d.setMonth(d.getMonth() + months);
                        return d;
                    }

                    const fmt = (d: Date) =>
                        d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                    // For trial: base = trialEndsAt (first charge date)
                    // For active: base = currentPeriodEnd (next renewal date)
                    const trialBase = subInfo.trialEndsAt ? new Date(subInfo.trialEndsAt) : null;
                    const activeBase = subInfo.currentPeriodEnd ? new Date(subInfo.currentPeriodEnd) : null;

                    const firstCharge = subInfo.status === 'trial' ? trialBase : activeBase;

                    const upcomingDates: Date[] = [];
                    if (firstCharge) {
                        const now = new Date();
                        // For active: next charge is firstCharge itself, then +1, +2 months
                        // For trial: first charge is trialEndsAt, then +1, +2 months
                        for (let i = 0; i < 12 && upcomingDates.length < 3; i++) {
                            const d = subInfo.status === 'active'
                                ? addMonths(firstCharge, i)   // active: from currentPeriodEnd forward
                                : addMonths(firstCharge, i);  // trial: from trialEndsAt forward
                            if (d > now) upcomingDates.push(d);
                        }
                    }

                    // Autopay ends = 12th month from trial start
                    // For active: estimate from currentPeriodEnd going forward to fill 12 cycles
                    const autopayEndsDate = activeBase
                        ? addMonths(activeBase, 11)
                        : trialBase
                            ? addMonths(trialBase, 11)
                            : null;

                    const statusColor =
                        subInfo.status === 'active' ? 'bg-green-500' :
                            subInfo.status === 'trial' ? 'bg-blue-500' :
                                subInfo.status === 'cancelled' ? 'bg-red-400' : 'bg-amber-500';

                    const statusLabel =
                        subInfo.status === 'trial' ? 'Trial (Active)' :
                            subInfo.status === 'active' ? 'Active' :
                                subInfo.status === 'cancelled' ? 'Cancelled' :
                                    subInfo.status === 'created' ? 'Payment Pending' :
                                        subInfo.status === 'pending' ? 'Payment Pending' :
                                            subInfo.status;
                    return (
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                            <div className="p-5">
                                <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3">
                                    Subscription
                                </p>

                                {/* Status + next renewal */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor}`} />
                                    <span className="text-sm font-extrabold text-[#111827]">{statusLabel}</span>
                                    {upcomingDates[0] && (subInfo.status === 'active' || subInfo.status === 'trial') && (
                                        <span className="ml-auto text-[11px] font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-lg">
                                            Next: {fmt(upcomingDates[0])}
                                        </span>
                                    )}
                                </div>

                                {/* Free trial banner */}
                                {subInfo.status === 'trial' && firstCharge && (
                                    <div className="mb-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-blue-600">🎉 Free until</span>
                                        <span className="text-[11px] font-extrabold text-blue-700">{fmt(firstCharge)}</span>
                                    </div>
                                )}
                                {/* Referral free month pending banner */}
                                {teacher.freeMonthsEarned > 0 && upcomingDates[0] && (subInfo.status === 'active' || subInfo.status === 'trial') && (
                                    <div className="mb-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
                                        <span className="text-lg">🎁</span>
                                        <div>
                                            <p className="text-[11px] font-extrabold text-green-700">Free Month Applied!</p>
                                            <p className="text-[10px] text-green-600">
                                                Your charge on {fmt(upcomingDates[0])} will be skipped automatically.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Upcoming ₹200 charge dates */}
                                {upcomingDates.length > 0 && (subInfo.status === 'active' || subInfo.status === 'trial') && (
                                    <div className="mb-3 bg-orange-50 border border-orange-100 rounded-xl p-3">
                                        <p className="text-[10px] font-extrabold text-[#f97316] uppercase tracking-wider mb-2 flex items-center gap-1">
                                            Upcoming ₹200 Charges
                                        </p>
                                        <div className="space-y-1.5">
                                            {upcomingDates.map((d, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <span className="text-[11px] font-semibold text-[#6B7280]">
                                                        {i === 0 ? '🔔 Next charge' : i === 1 ? '2nd charge' : '3rd charge'}
                                                    </span>
                                                    <span className="text-[11px] font-extrabold text-[#111827]">{fmt(d)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Autopay end date */}
                                {autopayEndsDate && (subInfo.status === 'active' || subInfo.status === 'trial') && (
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-[#9CA3AF]">Autopay ends after</span>
                                        <span className="text-[11px] font-extrabold text-[#111827]">{fmt(autopayEndsDate)}</span>
                                    </div>
                                )}

                                {/* Plan */}
                                <div className="mb-3 flex items-center justify-between border-t border-[#F3F4F6] pt-3">
                                    <span className="text-[11px] font-semibold text-[#9CA3AF]">Plan</span>
                                    <span className="text-[11px] font-extrabold text-[#111827]">₹200/month · 12 cycles</span>
                                </div>

                                {/* Cancel Autopay */}
                                {(subInfo.status === 'active' || subInfo.status === 'trial') && (
                                    <div className="pt-1 border-t border-[#F3F4F6]">
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Are you sure you want to cancel autopay? Your access will continue until the current period ends.')) return;
                                                try {
                                                    const res = await fetch('/api/subscription/cancel', { method: 'POST' });
                                                    const data = await res.json();
                                                    if (res.ok) setSubInfo((prev) => ({ ...prev, status: 'cancelled' }));
                                                    else alert(data.error ?? 'Failed to cancel. Please contact support.');
                                                } catch { alert('Network error. Please try again.'); }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-[#FEE2E2] text-red-500 text-xs font-extrabold hover:bg-red-50 hover:border-red-300 transition-all"
                                        >
                                            <X size={12} /> Cancel Autopay
                                        </button>
                                        <p className="text-[10px] text-[#9CA3AF] text-center mt-1.5">Access continues till period ends</p>
                                    </div>
                                )}

                                {/* Renew */}
                                {/* Complete Payment — mid-flow refresh recovery */}
                                {(subInfo.status === 'created' || subInfo.status === 'pending') && (
                                    <div className="pt-3 border-t border-[#F3F4F6]">
                                        <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                                            <span className="text-lg">⏳</span>
                                            <div>
                                                <p className="text-[11px] font-extrabold text-amber-700">Payment Incomplete</p>
                                                <p className="text-[10px] text-amber-600">Your payment was not completed. Click below to finish.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch('/api/subscription/create', { method: 'POST' });
                                                    const data = await res.json();
                                                    if (!res.ok) { alert(data.error ?? 'Failed. Please contact support.'); return; }
                                                    if (data.alreadyActive) {
                                                        setSubInfo((prev) => ({ ...prev, status: 'active' }));
                                                        return;
                                                    }
                                                    const rzp = new (window as any).Razorpay({
                                                        key: data.razorpayKeyId,
                                                        subscription_id: data.subscriptionId,
                                                        name: 'VidyaSangrah',
                                                        description: '₹200/month Teacher Subscription',
                                                        handler: async (response: any) => {
                                                            const verifyRes = await fetch('/api/subscription/verify', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    razorpay_subscription_id: response.razorpay_subscription_id,
                                                                    razorpay_payment_id: response.razorpay_payment_id,
                                                                    razorpay_signature: response.razorpay_signature,
                                                                }),
                                                            });
                                                            if (verifyRes.ok) {
                                                                setSubInfo((prev) => ({ ...prev, status: 'trial', isActive: true }));
                                                                alert('Subscription activated successfully!');
                                                            } else {
                                                                alert('Payment verification failed. Contact support.');
                                                            }
                                                        },
                                                        theme: { color: '#f97316' },
                                                    });
                                                    rzp.open();
                                                } catch { alert('Network error. Please try again.'); }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-amber-200 text-amber-600 text-xs font-extrabold hover:bg-amber-50 hover:border-amber-300 transition-all"
                                        >
                                            <CheckCircle size={12} /> Complete Payment
                                        </button>
                                        <p className="text-[10px] text-[#9CA3AF] text-center mt-1.5">Resume your pending subscription</p>
                                    </div>
                                )}

                                {/* Renew */}
                                {subInfo.status === 'cancelled' && (
                                    <div className="pt-3 border-t border-[#F3F4F6]">
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Reactivate your subscription? You will be charged ₹200/month.')) return;
                                                try {
                                                    const res = await fetch('/api/subscription/reactivate', { method: 'POST' });
                                                    const data = await res.json();
                                                    if (!res.ok) { alert(data.error ?? 'Failed. Please contact support.'); return; }
                                                    const rzp = new (window as any).Razorpay({
                                                        key: data.razorpayKeyId,
                                                        subscription_id: data.subscriptionId,
                                                        name: 'VidyaSangrah',
                                                        description: '₹200/month Teacher Subscription',
                                                        handler: async (response: any) => {
                                                            const verifyRes = await fetch('/api/subscription/verify', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    razorpay_subscription_id: response.razorpay_subscription_id,
                                                                    razorpay_payment_id: response.razorpay_payment_id,
                                                                    razorpay_signature: response.razorpay_signature,
                                                                    isReactivation: true,
                                                                }),
                                                            });
                                                            if (verifyRes.ok) {
                                                                setSubInfo((prev) => ({ ...prev, status: 'active' }));
                                                                alert('Subscription reactivated successfully!');
                                                            } else {
                                                                alert('Payment verification failed. Contact support.');
                                                            }
                                                        },
                                                        theme: { color: '#f97316' },
                                                    });
                                                    rzp.open();
                                                } catch { alert('Network error. Please try again.'); }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-green-200 text-green-600 text-xs font-extrabold hover:bg-green-50 hover:border-green-300 transition-all"
                                        >
                                            <CheckCircle size={12} /> Renew Autopay
                                        </button>
                                        <p className="text-[10px] text-[#9CA3AF] text-center mt-1.5">Resume your subscription</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* ReferralCard ADD THIS LINE */}
                {/* <ReferralCard />  ← ADD THIS LINE */}
                {/* <ReferralCard key={referralKey} onRedeemed={() => setReferralKey(k => k + 1)} /> */}
                <ReferralCard key={referralKey} onRedeemed={() => setReferralKey(k => k + 1)} subStatus={subInfo.status} />
            </div>
        );
    }

    // ── ProfilePanel ──────────────────────────────────────
    function ProfilePanel() {
        return (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-500" />
                <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-orange-200">
                                {initials}
                            </div>
                            <div>
                                <p className="font-extrabold text-[#111827] text-base">{teacher.name}</p>
                                <p className="text-xs text-[#9CA3AF]">{teacher.email}</p>
                            </div>
                        </div>
                        {!editing
                            ? <button onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#E5E7EB] text-[#6B7280] text-xs font-bold hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all">
                                <Edit3 size={13} /><span>Edit</span>
                            </button>
                            : <div className="flex items-center gap-2">
                                <button onClick={() => { setEditing(false); setProfileForm(teacher); setSaveError(''); }}
                                    className="px-4 py-2 rounded-xl border-2 border-[#E5E7EB] text-[#6B7280] text-xs font-bold hover:bg-[#F8F9FA] transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSaveProfile} disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold shadow-sm shadow-orange-200 hover:brightness-105 transition-all">
                                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                    <span>{saving ? 'Saving…' : 'Save'}</span>
                                </button>
                            </div>}
                    </div>
                    {saveSuccess && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-green-700 text-sm font-semibold">
                            <CheckCircle size={15} /><span>Profile saved successfully!</span>
                        </div>
                    )}
                    {saveError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-red-600 text-sm font-semibold">{saveError}</div>
                    )}
                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider mb-1.5 block">Full Name</label>
                            {editing
                                ? <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full border-2 border-[#E5E7EB] focus:border-orange-400 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#111827] outline-none transition-colors" />
                                : <p className="text-sm font-semibold text-[#111827] px-4 py-2.5 bg-[#F8F9FA] rounded-xl">{teacher.name}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider mb-1.5 block">Bio</label>
                            {editing
                                ? <textarea value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                                    className="w-full border-2 border-[#E5E7EB] focus:border-orange-400 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#111827] outline-none transition-colors resize-none" />
                                : <p className="text-sm text-[#6B7280] px-4 py-2.5 bg-[#F8F9FA] rounded-xl min-h-[70px]">{teacher.bio || 'Not set'}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { key: 'city', label: 'City', type: 'text' },
                                { key: 'state', label: 'State', type: 'text' },
                                { key: 'yearsOfExperience', label: 'Years Exp.', type: 'number' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider mb-1.5 block">{field.label}</label>
                                    {editing
                                        ? <input type={field.type}
                                            value={(profileForm as any)[field.key]}
                                            onChange={e => setProfileForm(p => ({ ...p, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                                            className="w-full border-2 border-[#E5E7EB] focus:border-orange-400 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#111827] outline-none transition-colors" />
                                        : <p className="text-sm font-semibold text-[#111827] px-3 py-2.5 bg-[#F8F9FA] rounded-xl">{(teacher as any)[field.key] || '—'}</p>}
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider mb-2 block">Subjects</label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_SUBJECTS.map(s => {
                                    const active = profileForm.subjects.includes(s);
                                    const grad = SUBJECT_GRADIENTS[s] ?? 'from-orange-400 to-amber-500';
                                    return editing
                                        ? <button key={s} type="button" onClick={() => setProfileForm(p => ({ ...p, subjects: toggleArray(p.subjects, s) }))}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${active ? `bg-gradient-to-r ${grad} text-white border-transparent` : 'border-[#E5E7EB] text-[#6B7280] hover:border-orange-300'}`}>{s}</button>
                                        : teacher.subjects.includes(s)
                                            ? <span key={s} className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${grad} text-white`}>{s}</span>
                                            : null;
                                })}
                                {!editing && teacher.subjects.length === 0 && <p className="text-sm text-[#9CA3AF]">Not set</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider mb-2 block">Classes</label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_CLASSES.map(c => {
                                    const active = profileForm.classes.includes(c);
                                    return editing
                                        ? <button key={c} type="button" onClick={() => setProfileForm(p => ({ ...p, classes: toggleArray(p.classes, c) }))}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${active ? 'bg-blue-500 text-white border-transparent' : 'border-[#E5E7EB] text-[#6B7280] hover:border-blue-300'}`}>{c}</button>
                                        : teacher.classes.includes(c)
                                            ? <span key={c} className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500 text-white">{c}</span>
                                            : null;
                                })}
                                {!editing && teacher.classes.length === 0 && <p className="text-sm text-[#9CA3AF]">Not set</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider mb-2 block">Boards</label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_BOARDS.map(b => {
                                    const active = profileForm.boards.includes(b);
                                    return editing
                                        ? <button key={b} type="button" onClick={() => setProfileForm(p => ({ ...p, boards: toggleArray(p.boards, b) }))}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${active ? 'bg-purple-500 text-white border-transparent' : 'border-[#E5E7EB] text-[#6B7280] hover:border-purple-300'}`}>{b}</button>
                                        : teacher.boards.includes(b)
                                            ? <span key={b} className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-500 text-white">{b}</span>
                                            : null;
                                })}
                                {!editing && teacher.boards.length === 0 && <p className="text-sm text-[#9CA3AF]">Not set</p>}
                            </div>
                        </div>
                        <div className="pt-2 border-t border-[#F3F4F6]">
                            <button onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group border border-[#E5E7EB] hover:border-red-200 w-full">
                                <div className="w-8 h-8 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0"><LogOut size={14} className="text-red-400" /></div>
                                <div className="text-left"><p className="text-sm font-bold text-red-500">Sign Out</p><p className="text-[10px] text-[#9CA3AF]">See you next time!</p></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Left Sidebar Content (shared between desktop & mobile overlay) ──
    // const LeftSidebarContent = ({ onNavigate, onHelp }: { onNavigate: (t: Tab) => void; onHelp?: () => void }) => (
    const LeftSidebarContent = ({ onNavigate, activeTab }: { onNavigate: (t: Tab) => void; activeTab: Tab }) => (
        <>
            {/* Teacher profile card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
                <div className="p-4">
                    <div className="flex flex-col items-center text-center mb-3">
                        {teacher.image
                            ? <img src={teacher.image} alt={teacher.name} className="w-12 h-12 rounded-xl object-cover mb-2 border-2 border-orange-100 shadow-md" />
                            : <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-base mb-2 shadow-md shadow-orange-200">{initials}</div>}
                        <p className="font-extrabold text-[#111827] text-sm">{teacher.name}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5 line-clamp-1">
                            {teacher.subjects.slice(0, 2).join(', ') || 'Teacher'}
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mb-3">
                        {[
                            { label: 'Videos', value: stats.totalVideos },
                            { label: 'Views', value: stats.totalViews > 999 ? `${(stats.totalViews / 1000).toFixed(1)}k` : stats.totalViews },
                            { label: 'Followers', value: stats.totalFollowers },
                        ].map(s => (
                            <div key={s.label} className="bg-orange-50 border border-orange-100 rounded-xl p-1.5 text-center">
                                <p className="text-xs font-extrabold text-[#f97316]">{s.value}</p>
                                <p className="text-[8px] font-bold text-[#9CA3AF] uppercase leading-tight">{s.label}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setShowPosting(true)}
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-extrabold shadow-sm shadow-orange-200 hover:brightness-105 transition-all">
                        <Plus size={12} /><span>Start Posting</span>
                    </button>
                </div>
            </div>

            {/* Nav links */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="p-2 space-y-0.5">
                    {([
                        { id: 'feed', icon: '📡', label: 'Community Feed' },
                        { id: 'myvideos', icon: '🎬', label: 'My Content' },
                        { id: 'stats', icon: '📊', label: 'Stats' },
                        { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
                    ] as { id: Tab; icon: string; label: string }[]).map(item => (
                        <button key={item.id}
                            id={`tour-${item.id}`}
                            onClick={() => onNavigate(item.id)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left ${activeTab === item.id ? 'bg-orange-50 text-[#f97316]' : 'text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111827]'}`}>
                            <span className="text-base">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.id === 'myvideos' && ownVideos.length > 0 && (
                                <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === item.id ? 'bg-orange-100 text-orange-600' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
                                    {ownVideos.length}
                                </span>
                            )}
                            {activeTab === item.id && item.id !== 'myvideos' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
                        </button>
                    ))}

                    {/* ── Divider ───────────────────────────────── */}
                    <div className="h-px bg-[#F3F4F6] mx-1 my-1" />

                    {/* ── Help & Tutorials button ───────────────── */}
                    <button
                        id="tour-help"
                        onClick={() => onNavigate('help')}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left ${activeTab === 'help'
                            ? 'bg-orange-50 text-[#f97316]'
                            : 'text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111827]'
                            }`}>
                        <span className="text-base">❓</span>
                        <span>Help & Tutorials</span>
                        {activeTab === 'help' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
                    </button>

                    <button
                        onClick={() => onNavigate('stats')}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#f97316]"
                    >
                        <Gift size={16} className="flex-shrink-0 text-[#f97316]" />
                        <span>Refer &amp; Earn</span>
                        <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                            NEW
                        </span>
                    </button>

                    {/* ── Profile button ────────────────────────── */}
                    <button
                        id="tour-profile"
                        onClick={() => onNavigate('profile')}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left ${activeTab === 'profile' ? 'bg-orange-50 text-[#f97316]' : 'text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111827]'}`}>
                        <span className="text-base">⚙️</span>
                        <span>Profile</span>
                        {activeTab === 'profile' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
                    </button>
                </div>
            </div>

            {/* Tour button for mobile — always visible in menu */}
            {isMobile && (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <div className="p-3">
                        <button onClick={() => { resetTour(); setMobileLeftOpen(false); setShowTour(true); }}
                            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-extrabold shadow-sm shadow-orange-200 hover:brightness-105 transition-all">
                            <HelpCircle size={14} />
                            <span>Take a Tour</span>
                        </button>
                    </div>
                </div>
            )}

            {/* My rank badge */}
            {myRank && (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
                    <div className="p-4">
                        <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Trophy size={10} className="text-yellow-500" /><span>Your Rank</span>
                        </p>
                        <div className="space-y-2">
                            {[
                                { label: 'National Rank', value: `#${myRank}`, color: 'text-yellow-500' },
                                { label: 'Total Views', value: stats.totalViews.toLocaleString('en-IN'), color: 'text-orange-500' },
                                { label: 'Followers', value: stats.totalFollowers.toString(), color: 'text-violet-500' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <span className="text-[11px] text-[#6B7280] font-semibold">{s.label}</span>
                                    <span className={`text-[11px] font-extrabold ${s.color}`}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Upload CTA */}
            <button onClick={() => setShowPosting(true)}
                className="block bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-2xl p-4 hover:brightness-110 transition-all overflow-hidden relative text-left w-full">
                <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-orange-500/10" />
                <div className="relative flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <Upload size={15} className="text-orange-400" />
                    </div>
                    <h4 className="font-extrabold text-white text-sm">📹 Upload Video</h4>
                </div>
                <p className="relative text-white/40 text-xs mb-3">Reach students nationwide!</p>
                <div className="relative inline-flex items-center gap-1.5 bg-orange-500 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full">
                    <span>Start Now</span><Plus size={10} />
                </div>
            </button>
        </>
    );

    // ── Right Sidebar Content (shared between desktop & mobile overlay) ──
    const RightSidebarContent = ({ onFullLB }: { onFullLB?: () => void }) => (
        <>
            <MiniLeaderboard onFullLB={onFullLB} />

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
                <div className="px-4 pt-4 pb-3 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-extrabold uppercase tracking-widest mb-1">
                        <TrendingUp size={11} /><span>Your Stats</span>
                    </div>
                    <h4 className="font-black text-[#111827] text-sm">How are you doing?</h4>
                </div>
                <div className="divide-y divide-[#F8F9FA]">
                    {[
                        { icon: <Video size={12} className="text-orange-400" />, label: 'Videos', value: stats.totalVideos },
                        { icon: <Eye size={12} className="text-blue-400" />, label: 'Total Views', value: stats.totalViews.toLocaleString('en-IN') },
                        { icon: <Users size={12} className="text-violet-400" />, label: 'Followers', value: stats.totalFollowers },
                        { icon: <Star size={12} className="text-yellow-400" />, label: 'Avg Rating', value: stats.avgRating },
                    ].map(s => (
                        <div key={s.label} className="flex items-center gap-2.5 px-4 py-2.5">
                            <div className="w-6 h-6 rounded-lg bg-[#F8F9FA] flex items-center justify-center flex-shrink-0">{s.icon}</div>
                            <div className="flex-1 min-w-0"><span className="text-xs text-[#6B7280] font-semibold">{s.label}</span></div>
                            <span className="text-xs font-extrabold text-[#111827]">{s.value}</span>
                        </div>
                    ))}
                </div>
                <div className="p-3 border-t border-[#F3F4F6]">
                    <button onClick={() => setActiveTab('stats')}
                        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-[#E5E7EB] text-[11px] font-extrabold text-[#6B7280] hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all">
                        <TrendingUp size={11} /><span>Full Stats →</span>
                    </button>
                </div>
            </div>

            {/* Trending subjects */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-pink-400 to-rose-500" />
                <div className="px-4 py-3 border-b border-[#F3F4F6]">
                    <div className="flex items-center gap-1.5 text-pink-500 text-[10px] font-extrabold uppercase tracking-widest">
                        <TrendingUp size={11} /><span>Trending</span>
                    </div>
                </div>
                <div className="p-3 flex flex-wrap gap-1.5">
                    {TRENDING.map(t => (
                        <button key={t}
                            onClick={() => { setActiveSubject(t); setActiveTab('feed'); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r ${SUBJECT_GRADIENTS[t] ?? 'from-orange-400 to-amber-500'} text-white hover:brightness-110 transition-all`}>
                            {SUBJECT_EMOJI[t]} {t}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );

    // ══════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-[#F3F4F6]">
            {/* {showTour && <TeacherTour teacherName={teacher.name} onEnd={() => setShowTour(false)} />} */}
            {showTour && (
                <TeacherTour
                    teacherName={teacher.name}
                    onEnd={() => { setShowTour(false); setTourControllingDrawer(false); setMobileLeftOpen(false); setMobileRightOpen(false); }}
                    onUploadVideo={() => { setShowTour(false); setTourControllingDrawer(false); setMobileLeftOpen(false); setMobileRightOpen(false); setShowUpload(true); }}
                    onGoToProfile={() => { setShowTour(false); setTourControllingDrawer(false); setMobileLeftOpen(false); setMobileRightOpen(false); setActiveTab('profile'); }}
                    onGoToFeed={() => { setShowTour(false); setTourControllingDrawer(false); setMobileLeftOpen(false); setMobileRightOpen(false); setActiveTab('feed'); }}
                    isMobile={isMobile}
                    onMobileDrawer={handleTourDrawer}
                />
            )}

            {/* ── Global Modals ─────────────────────────── */}
            {playingVideo && <VideoPlayerModal video={playingVideo} onClose={() => setPlayingVideo(null)} />}
            {showPosting && (
                <StartPostingModal
                    onClose={() => setShowPosting(false)}
                    onUploadVideo={() => setShowUpload(true)}
                    onUploadPhoto={() => { setShowPosting(false); setShowPhoto(true); }}
                    onWriteArticle={() => { setShowPosting(false); setShowArticle(true); }}
                />
            )}
            {showUpload && (
                <UploadVideoModal
                    onClose={() => setShowUpload(false)}
                    onSuccess={(v: any) => { setOwnVideos(prev => [v, ...prev]); setShowUpload(false); }}
                />
            )}
            {showPhoto && (
                <UploadPhotoModal
                    onClose={() => setShowPhoto(false)}
                    onSuccess={(post: any) => {
                        const newItem = {
                            ...post, type: 'photo' as const,
                            status: 'active', createdAt: new Date().toISOString(),
                            teacher: { id: teacher.id, name: teacher.name, image: teacher.image, subjects: teacher.subjects },
                        };
                        setNewPost(newItem as any);
                        setCommunityPosts(prev => [newItem as unknown as CommunityPost, ...prev]);
                        setShowPhoto(false);
                    }}
                />
            )}
            {showArticle && (
                <WriteArticleModal
                    onClose={() => setShowArticle(false)}
                    onSuccess={(post: any) => {
                        const newItem = {
                            ...post, type: 'article' as const,
                            status: 'active', createdAt: new Date().toISOString(),
                            teacher: { id: teacher.id, name: teacher.name, image: teacher.image, subjects: teacher.subjects },
                        };
                        setNewPost(newItem as any);
                        setCommunityPosts(prev => [newItem as unknown as CommunityPost, ...prev]);
                        setShowArticle(false);
                    }}
                />
            )}

            {previewOwnVideo && (
                <VideoPlayerModal
                    video={{ title: previewOwnVideo.title, teacherName: teacher.name, subject: previewOwnVideo.subject, videoUrl: previewOwnVideo.videoUrl, views: previewOwnVideo.views, rating: previewOwnVideo.rating, classes: previewOwnVideo.classes, boards: previewOwnVideo.boards }}
                    onClose={() => setPreviewOwnVideo(null)}
                />
            )}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <h3 className="font-extrabold text-[#111827] text-base mb-1">Delete Video?</h3>
                        <p className="text-sm text-[#6B7280] mb-5">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDeleteId(null)} disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F8F9FA] transition-colors">Cancel</button>
                            <button onClick={() => handleDeleteVideo(confirmDeleteId)} disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                <span>{deleting ? 'Deleting…' : 'Delete'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ NAVBAR ═══════════════════════════════════ */}
            <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">

                {/* Row 1 */}
                <div className="flex items-center px-4 sm:px-6 h-[100px] gap-4">
                    <div className="flex items-center gap-2.5 flex-1">
                        <a href="/"
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#f97316] hover:border-orange-200 hover:bg-orange-50 transition-all">
                            <ChevronLeft size={15} />
                        </a>
                        <div className="h-5 w-px bg-[#E5E7EB]" />
                        <Logo size="sm" />
                    </div>

                    {!isMobile && (
                        <div className="absolute left-138 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none select-none">
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] via-[#f59e0b] to-[#ea580c] whitespace-nowrap tracking-tight">
                                India's 1st EdTech Community
                            </span>
                        </div>
                    )}


                    <div className="ml-auto flex items-center gap-2.5">
                        <div className="hidden sm:flex items-center gap-3 bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-1.5 rounded-full">
                            <span className="flex items-center gap-1 text-xs font-extrabold text-[#6B7280]">
                                <Eye size={11} className="text-orange-400" /><span>{stats.totalViews.toLocaleString('en-IN')}</span>
                            </span>
                            <div className="w-px h-3 bg-[#E5E7EB]" />
                            <span className="flex items-center gap-1 text-xs font-extrabold text-[#6B7280]">
                                <Users size={11} className="text-violet-400" /><span>{stats.totalFollowers.toLocaleString('en-IN')}</span>
                            </span>
                        </div>
                        <button onClick={() => setShowPosting(true)}
                            id="tour-start-posting"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold shadow-sm shadow-orange-200 hover:brightness-105 transition-all">
                            <Plus size={14} />
                            <span className="hidden sm:block">Start Posting</span>
                            <span className="sm:hidden">Post</span>
                        </button>
                        <div ref={profileDropRef} className="relative">
                            <button onClick={() => setShowProfile(p => !p)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all border-2 flex-shrink-0 ${showProfile ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white border-orange-400' : 'bg-gradient-to-br from-orange-100 to-amber-100 text-[#f97316] border-orange-200 hover:border-orange-400'}`}>
                                {initials}
                            </button>
                            {showProfile && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] z-[60] overflow-hidden">
                                    <div className="bg-gradient-to-r from-[#f97316] to-[#ea580c] p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">{initials}</div>
                                            <div className="min-w-0">
                                                <p className="font-extrabold text-white text-sm truncate">{teacher.name}</p>
                                                <p className="text-white/70 text-xs truncate">{teacher.email}</p>
                                                <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">Teacher</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-px bg-[#E5E7EB]">
                                        {[
                                            { label: 'Videos', value: stats.totalVideos },
                                            { label: 'Views', value: stats.totalViews > 999 ? `${(stats.totalViews / 1000).toFixed(1)}k` : stats.totalViews },
                                            { label: 'Followers', value: stats.totalFollowers },
                                        ].map(s => (
                                            <div key={s.label} className="bg-white py-3 text-center">
                                                <p className="font-extrabold text-[#f97316] text-sm">{s.value}</p>
                                                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 space-y-1">
                                        <button onClick={() => { setActiveTab('profile'); setShowProfile(false); }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors group w-full">
                                            <div className="w-8 h-8 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center flex-shrink-0"><Settings size={14} className="text-orange-400" /></div>
                                            <div><p className="text-sm font-bold text-[#111827]">Profile Settings</p><p className="text-[10px] text-[#9CA3AF]">Edit your info</p></div>
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

                {/* Row 2 — FIXED: overflow-x-auto + flex justify-center prevents horizontal scroll on mobile */}
                <div className="border-t border-[#F3F4F6]">
                    {activeTab === 'feed' ? (
                        <div className="flex items-center w-full px-2 sm:px-6 sm:justify-center">
                            <button
                                onClick={() => { setActiveSubject('All'); setFeedType('all'); }}
                                className={`flex items-center gap-1.5 px-2 sm:px-4 py-3 text-sm font-bold border-b-2 transition-all flex-shrink-0 ${activeSubject === 'All' && feedType === 'all'
                                    ? 'border-[#f97316] text-[#f97316]'
                                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                                    }`}
                            >
                                <Globe size={14} />
                                <span>All</span>
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${activeSubject === 'All' && feedType === 'all'
                                    ? 'bg-orange-50 text-[#f97316]'
                                    : 'bg-[#F3F4F6] text-[#9CA3AF]'
                                    }`}>
                                    {allFeedItems.length}
                                </span>
                            </button>

                            <div className="h-5 w-px bg-[#E5E7EB] mx-1 sm:mx-2 flex-shrink-0 hidden sm:block" />

                            <SubjectDropdown activeSubject={activeSubject} onSelect={setActiveSubject} />

                            <div className="h-5 w-px bg-[#E5E7EB] mx-1 sm:mx-2 flex-shrink-0 hidden sm:block" />

                            {/* ✅ Icon-only on mobile, icon + text on desktop */}
                            <button
                                onClick={() => setShowPosting(true)}
                                className="flex items-center gap-1.5 px-2 sm:px-4 py-3 text-sm font-bold border-b-2 border-transparent text-[#6B7280] hover:text-[#f97316] transition-all flex-shrink-0"
                            >
                                <Upload size={14} className="text-orange-400" />
                                <span className="hidden sm:inline">Upload</span>
                            </button>

                            <div className="h-5 w-px bg-[#E5E7EB] mx-1 sm:mx-2 flex-shrink-0 hidden sm:block" />

                            <FeedLanguageSelector />
                        </div>
                    ) : (
                        <div className="flex items-center h-[48px] gap-2 w-full px-4 sm:px-6">
                            <button
                                onClick={() => setActiveTab('feed')}
                                className="text-xs font-bold text-[#9CA3AF] hover:text-[#f97316] transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft size={12} /><span>Feed</span>
                            </button>
                            <span className="text-[#D1D5DB]">/</span>
                            <span className="text-xs font-extrabold text-[#111827]">
                                {{ myvideos: 'My Content', stats: 'Stats', leaderboard: 'Leaderboard', profile: 'Profile', help: 'Help' }[activeTab]}
                            </span>
                        </div>
                    )}
                </div>

                {/* Row 3 — Search */}
                <div className="border-t border-[#F3F4F6] px-4 sm:px-6 py-2.5 flex items-center justify-center min-h-[49px]">
                    {activeTab === 'feed' ? (
                        <div id="tour-search" className="w-full max-w-2xl relative">
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
                                    : <kbd className="hidden sm:flex items-center text-[10px] font-bold text-[#CBD5E1] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded-md flex-shrink-0">⌘K</kbd>}
                            </div>
                            {showDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[60] overflow-hidden">
                                    {search.length === 0 && (
                                        <div className="p-4">
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <TrendingUp size={12} className="text-orange-400" />
                                                <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">Trending</p>
                                            </div>
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
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#111827]">{s.label}</p>
                                                        <p className="text-[10px] text-[#9CA3AF] capitalize">{s.type}</p>
                                                    </div>
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
                    ) : (
                        <div className="w-full max-w-2xl h-[42px]" />
                    )}
                </div>
            </header>

            {/* ══ PAGE BODY ══════════════════════════════════════ */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5" style={{ paddingBottom: isMobile ? '96px' : '20px' }}>
                <div className="flex gap-5 items-start">

                    {/* ── LEFT SIDEBAR — desktop only (JS-controlled) ── */}
                    {!isMobile && (
                        <aside className="flex flex-col w-72 flex-shrink-0 gap-4 sticky top-[153px] self-start">
                            {/* <LeftSidebarContent onNavigate={setActiveTab} /> */}
                            {/* <LeftSidebarContent onNavigate={setActiveTab} onHelp={() => setShowHelp(true)} /> */}
                            <LeftSidebarContent onNavigate={setActiveTab} activeTab={activeTab} />
                        </aside>
                    )}

                    {/* ── MAIN CONTENT ── */}
                    <div className="flex-1 min-w-0 space-y-4">

                        {/* ══ FEED TAB ══════════════════════════════ */}
                        {activeTab === 'feed' && (
                            <>
                                {/* Welcome Banner + Composer */}
                                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                    <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-gray-100 pointer-events-none" />
                                    <div className="absolute right-24 -bottom-8 w-32 h-32 rounded-full bg-gray-50 pointer-events-none" />
                                    <div className="absolute left-1/2 -top-6 w-24 h-24 rounded-full bg-gray-50/50 pointer-events-none" />
                                    <div className="relative px-6 pt-5 pb-4">
                                        <div className="flex flex-col items-center text-center mb-5">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-extrabold px-3 py-1 rounded-full border border-gray-200 uppercase tracking-wider mb-2">
                                                ✦ Teacher Community
                                            </span>
                                            <h2 className="text-gray-800 font-extrabold text-xl">
                                                Welcome back, {teacher.name.split(' ')[0]}! 👋
                                            </h2>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                                            <div className="flex items-center gap-3 px-4 py-3">
                                                {teacher.image
                                                    ? <img src={teacher.image} alt={teacher.name}
                                                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-300 flex-shrink-0" />
                                                    : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-md">
                                                        {initials}
                                                    </div>}
                                                <button onClick={() => setShowPosting(true)}
                                                    className="flex-1 text-left px-5 py-2.5 rounded-full border border-gray-300 text-gray-400 text-sm font-medium hover:bg-gray-100 hover:border-gray-400 hover:text-gray-600 transition-all">
                                                    Start a post...
                                                </button>
                                            </div>
                                            <div className="h-px bg-gray-200" />
                                            <div className="grid grid-cols-3 divide-x divide-gray-200 px-2 py-1">
                                                <button onClick={() => setShowUpload(true)}
                                                    className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all group">
                                                    <div className="w-7 h-7 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                                        <Play size={13} className="text-green-600" fill="#16a34a" />
                                                    </div>
                                                    <span>Video</span>
                                                </button>
                                                <button onClick={() => setShowPhoto(true)}
                                                    className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all group">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                                        <ImageIcon size={13} className="text-blue-600" />
                                                    </div>
                                                    <span>Photo</span>
                                                </button>
                                                <button onClick={() => setShowArticle(true)}
                                                    className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all group">
                                                    <div className="w-7 h-7 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                                        <FileText size={13} className="text-orange-600" />
                                                    </div>
                                                    <span>Write Article</span>
                                                </button>
                                            </div>
                                        </div>
                                        {myRank && (
                                            <div className="flex justify-end mt-2.5">
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                                    <Trophy size={9} /><span>National Rank #{myRank}</span>
                                                </span>
                                            </div>
                                        )}
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
                                            <span>{chip.emoji}</span>
                                            <span>{chip.label}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${feedType === chip.id ? 'bg-white/20 text-white' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
                                                {chip.count}
                                            </span>
                                        </button>
                                    ))}
                                    {(search || activeSubject !== 'All') && (
                                        <button onClick={() => { setSearch(''); setActiveSubject('All'); }}
                                            className="ml-auto flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-600 transition-colors">
                                            <X size={11} /><span>Clear filters</span>
                                        </button>
                                    )}
                                </div>

                                {/* Result count */}
                                <p key={`count-${feedType}-${activeSubject}-${search}`} className="text-xs font-semibold text-[#9CA3AF]">
                                    <span className="text-[#111827] font-extrabold">{filteredFeed.length}</span> post{filteredFeed.length !== 1 ? 's' : ''}
                                    {activeSubject !== 'All' && <> in <span className="text-[#f97316] font-extrabold">{activeSubject}</span></>}
                                    {feedType !== 'all' && <> · <span className="capitalize">{feedType}s only</span></>}
                                </p>

                                {filteredFeed.length === 0 ? (
                                    <div key={`empty-${feedType}-${activeSubject}-${search}`}
                                        className="bg-white rounded-2xl border border-[#E5E7EB] py-20 text-center shadow-sm">
                                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                                            <Globe size={28} className="text-orange-200" />
                                        </div>
                                        <p className="font-extrabold text-[#111827] text-base">Nothing here yet</p>
                                        <p className="text-sm text-[#9CA3AF] mt-2 mb-5">
                                            {search ? `No results for "${search}"` : 'Be the first to post something!'}
                                        </p>
                                        <button onClick={() => setShowPosting(true)}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-sm shadow-orange-200 hover:brightness-105 transition-all">
                                            <Plus size={15} /><span>Start Posting</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div key={`grid-${feedType}-${activeSubject}-${search}`} className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                                        {filteredFeed.map(item => {
                                            if (item.itemType === 'video') {
                                                const v = item.data as FeedVideo;
                                                return (
                                                    <FeedVideoCard key={`video-${v.id}`} video={v}
                                                        onPlay={() => setPlayingVideo({
                                                            title: v.title, teacherName: v.teacher.name,
                                                            subject: v.subject, videoUrl: v.videoUrl,
                                                            views: v.views, rating: v.rating,
                                                            classes: v.classes, boards: v.boards,
                                                        })}
                                                    />
                                                );
                                            }
                                            if (item.itemType === 'photo') {
                                                const p = item.data as CommunityPost;
                                                return (
                                                    <FeedPhotoCard key={`photo-${p.id}`}
                                                        photo={{
                                                            id: p.id, photoUrl: p.photoUrl ?? '',
                                                            caption: p.caption ?? '', subject: p.subject,
                                                            classes: p.classes, boards: p.boards,
                                                            createdAt: p.createdAt, teacher: p.teacher,
                                                            likesCount: (p as any).likesCount ?? 0,
                                                        }}
                                                        currentTeacherId={teacher.id}
                                                    />
                                                );
                                            }
                                            if (item.itemType === 'article') {
                                                const p = item.data as CommunityPost;
                                                return (
                                                    <FeedArticleCard key={`article-${p.id}`}
                                                        article={{
                                                            id: p.id, title: p.title ?? '',
                                                            body: p.body ?? '', subject: p.subject,
                                                            classes: p.classes, boards: p.boards,
                                                            createdAt: p.createdAt, teacher: p.teacher,
                                                            likesCount: (p as any).likesCount ?? 0,
                                                        }}
                                                        currentTeacherId={teacher.id}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'myvideos' && (
                            <MyContentPanel
                                ownVideos={ownVideos}

                                onUploadVideo={() => setShowUpload(true)}
                                onUploadPhoto={() => setShowPhoto(true)}
                                onWriteArticle={() => setShowArticle(true)}
                                onPreviewVideo={setPreviewOwnVideo}
                                onDeleteVideo={setConfirmDeleteId}
                            />
                        )}
                        {activeTab === 'stats' && <StatsPanel />}
                        {activeTab === 'leaderboard' && <TeacherLeaderboard currentTeacherId={teacher.id} />}
                        {activeTab === 'profile' && <ProfilePanel />}
                        {activeTab === 'help' && (
                            <HelpView onReplayTour={() => { resetTour(); setShowTour(true); }} />
                        )}
                    </div>

                    {/* ── RIGHT SIDEBAR — desktop only (JS-controlled) ── */}
                    {!isMobile && (
                        <aside className="flex flex-col w-72 flex-shrink-0 gap-4 sticky top-[153px] self-start">
                            <RightSidebarContent />
                        </aside>
                    )}

                </div>
            </div>

            {/* ══ FLOATING TOUR BUTTON — always visible, raised on mobile ══ */}
            {!isMobile && (
                <div
                    className="fixed z-[100] flex flex-col items-end gap-2"
                    style={{ bottom: isMobile ? '80px' : '24px', right: isMobile ? '50px' : '24px' }}
                >
                    <div className="bg-[#111827] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                        👋 New here? Take a tour!
                    </div>
                    <button
                        onClick={() => { resetTour(); setShowTour(true); }}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-300 hover:brightness-110 hover:scale-110 transition-all flex items-center justify-center">
                        <HelpCircle size={22} />
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════════════════
                MOBILE OVERLAY — Left (Menu/Nav)
            ══════════════════════════════════════════════════ */}
            {isMobile && (
                <div style={{
                    position: 'fixed', inset: 0,
                    zIndex: tourControllingDrawer ? 250 : 200,
                    transition: 'opacity 0.3s',
                    opacity: mobileLeftOpen ? 1 : 0,
                    pointerEvents: (mobileLeftOpen && !tourControllingDrawer) ? 'auto' : 'none',
                }}>
                    {/* Backdrop — hidden when tour is controlling the drawer */}
                    {!tourControllingDrawer && (
                        <div
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setMobileLeftOpen(false)}
                        />
                    )}
                    {/* Panel */}
                    <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: 'min(320px, 85vw)',
                        background: '#F3F4F6',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '4px 0 32px rgba(0,0,0,0.25)',
                        transition: 'transform 0.3s ease',
                        transform: mobileLeftOpen ? 'translateX(0)' : 'translateX(-100%)',
                        pointerEvents: 'auto',
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', background: 'white',
                            borderBottom: '1px solid #E5E7EB', flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: 'linear-gradient(135deg, #f97316, #f59e0b)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Menu size={14} color="white" />
                                </div>
                                <span style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>Menu</span>
                            </div>
                            {!tourControllingDrawer && (
                                <button
                                    onClick={() => setMobileLeftOpen(false)}
                                    style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280',
                                    }}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        {/* Scrollable content */}
                        <div style={{
                            flex: 1, overflowY: 'auto', padding: 16,
                            display: 'flex', flexDirection: 'column', gap: 12,
                        }}>
                            {/* <LeftSidebarContent onNavigate={mobileNavigate} /> */}
                            {/* <LeftSidebarContent onNavigate={mobileNavigate} onHelp={() => { setShowHelp(true); setMobileLeftOpen(false); }} /> */}
                            <LeftSidebarContent onNavigate={mobileNavigate} activeTab={activeTab} />
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════
                MOBILE OVERLAY — Right (Rankings & Stats)
            ══════════════════════════════════════════════════ */}
            {isMobile && (
                <div style={{
                    position: 'fixed', inset: 0,
                    zIndex: tourControllingDrawer ? 250 : 200,
                    transition: 'opacity 0.3s',
                    opacity: mobileRightOpen ? 1 : 0,
                    pointerEvents: (mobileRightOpen && !tourControllingDrawer) ? 'auto' : 'none',
                }}>
                    {/* Backdrop — hidden when tour is controlling the drawer */}
                    {!tourControllingDrawer && (
                        <div
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setMobileRightOpen(false)}
                        />
                    )}
                    {/* Panel */}
                    <div style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0,
                        width: 'min(320px, 85vw)',
                        background: '#F3F4F6',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
                        transition: 'transform 0.3s ease',
                        transform: mobileRightOpen ? 'translateX(0)' : 'translateX(100%)',
                        pointerEvents: 'auto',
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', background: 'white',
                            borderBottom: '1px solid #E5E7EB', flexShrink: 0,
                        }}>
                            {!tourControllingDrawer && (
                                <button
                                    onClick={() => setMobileRightOpen(false)}
                                    style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280',
                                    }}>
                                    <X size={16} />
                                </button>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>Rankings & Stats</span>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: 'linear-gradient(135deg, #f97316, #f59e0b)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Trophy size={14} color="white" />
                                </div>
                            </div>
                        </div>
                        {/* Scrollable content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                            <RightSidebarContent onFullLB={() => mobileNavigate('leaderboard')} />
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
                            padding: '12px 18px', borderRadius: 50,
                            background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                            color: 'white', fontWeight: 800, fontSize: 13,
                            border: 'none', cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        }}>
                        <Menu size={16} />
                        <span>Menu</span>
                    </button>

                    {/* Right FAB — Rankings */}
                    <button
                        onClick={() => { setMobileRightOpen(true); setMobileLeftOpen(false); }}
                        style={{
                            position: 'fixed', bottom: 24, right: 50, zIndex: 150,
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '12px 18px', borderRadius: 50,
                            background: 'linear-gradient(135deg, #f97316, #f59e0b)',
                            color: 'white', fontWeight: 800, fontSize: 13,
                            border: 'none', cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
                        }}>
                        <span>Rankings</span>
                        <Trophy size={16} />
                    </button>
                </>
            )}

        </div>
    );
}
