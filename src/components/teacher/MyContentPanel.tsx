'use client';

import { useState, useEffect } from 'react';
import {
    Video, Image as ImageIcon, FileText, Plus,
    Upload, Play, Eye, Star, Clock, Trash2,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────
export interface OwnVideo {
    id: string; title: string; subject: string; classes: string[];
    boards: string[]; views: number; rating: number; status: string;
    createdAt: string; thumbnail: string | null; videoUrl: string; description: string;
}
interface OwnPost {
    id: string; type: 'photo' | 'article';
    title?: string; body?: string;
    photoUrl?: string; caption?: string;
    subject: string; classes: string[]; boards: string[];
    status: string; createdAt: string;
}

const SUBJECT_GRADIENTS: Record<string, string> = {
    Mathematics: 'from-blue-500 to-indigo-600', Physics: 'from-purple-500 to-violet-600',
    Chemistry: 'from-green-500 to-emerald-600', Biology: 'from-teal-500 to-cyan-600',
    English: 'from-rose-500 to-pink-600', Hindi: 'from-orange-500 to-amber-600',
    History: 'from-yellow-500 to-orange-500', Geography: 'from-lime-500 to-green-600',
    'Computer Science': 'from-sky-500 to-blue-600', Economics: 'from-violet-500 to-purple-600',
    Accountancy: 'from-indigo-500 to-blue-500', 'Business Studies': 'from-amber-500 to-orange-500',
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

type SubTab = 'videos' | 'photos' | 'articles';

// ── Props ─────────────────────────────────────────────────
interface Props {
    ownVideos: OwnVideo[];
    onUploadVideo: () => void;
    onUploadPhoto: () => void;
    onWriteArticle: () => void;
    onDeleteVideo: (id: string) => void;
    onPreviewVideo: (v: OwnVideo) => void;
    // called after modal success to prepend new post live
    newPost?: OwnPost | null;
}

export default function MyContentPanel({
    ownVideos, onUploadVideo, onUploadPhoto, onWriteArticle,
    onDeleteVideo, onPreviewVideo, newPost,
}: Props) {
    const [subTab, setSubTab] = useState<SubTab>('videos');
    const [ownPosts, setOwnPosts] = useState<OwnPost[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch posts once on mount
    useEffect(() => {
        setLoading(true);
        fetch('/api/teacher/posts?limit=50')
            .then(r => r.json())
            .then(d => setOwnPosts(
                (d.posts ?? []).map((p: any) => ({
                    id:       p._id ?? p.id,
                    type:     p.type,
                    title:    p.title    ?? '',
                    body:     p.body     ?? '',
                    photoUrl: p.photoUrl ?? '',
                    caption:  p.caption  ?? '',
                    subject:  p.subject  ?? '',
                    classes:  p.classes  ?? [],
                    boards:   p.boards   ?? [],
                    status:   p.status   ?? 'active',
                    createdAt: p.createdAt,
                }))
            ))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Prepend new post when parent signals one
    useEffect(() => {
        if (!newPost) return;
        setOwnPosts(prev => [newPost, ...prev]);
        setSubTab(newPost.type === 'photo' ? 'photos' : 'articles');
    }, [newPost]);

    const photos   = ownPosts.filter(p => p.type === 'photo');
    const articles = ownPosts.filter(p => p.type === 'article');
    const total    = ownVideos.length + ownPosts.length;

    const tabs = [
        { id: 'videos'   as SubTab, label: 'Videos',   icon: <Video size={13} />,     count: ownVideos.length, active: 'border-[#f97316] text-[#f97316]',  badge: 'bg-orange-50 text-orange-600' },
        { id: 'photos'   as SubTab, label: 'Photos',   icon: <ImageIcon size={13} />, count: photos.length,    active: 'border-pink-500 text-pink-500',    badge: 'bg-pink-50 text-pink-600'     },
        { id: 'articles' as SubTab, label: 'Articles', icon: <FileText size={13} />,  count: articles.length,  active: 'border-blue-500 text-blue-500',    badge: 'bg-blue-50 text-blue-600'     },
    ];

    return (
        <div className="space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#9CA3AF]">
                    <span className="text-[#111827] font-extrabold">{total}</span> piece{total !== 1 ? 's' : ''} of content
                </p>
                <button onClick={() => {
                    if (subTab === 'videos')   onUploadVideo();
                    if (subTab === 'photos')   onUploadPhoto();
                    if (subTab === 'articles') onWriteArticle();
                }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm shadow-orange-100 hover:brightness-105 transition-all">
                    <Plus size={13} /> Create New
                </button>
            </div>

            {/* Card with sub-tabs */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">

                {/* Sub-tab bar */}
                <div className="flex border-b border-[#F3F4F6]">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setSubTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 flex-1 justify-center transition-all ${subTab === t.id ? t.active : 'border-transparent text-[#6B7280] hover:text-[#111827]'}`}>
                            {t.icon} {t.label}
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${subTab === t.id ? t.badge : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── VIDEOS ─────────────────────────────────── */}
                {subTab === 'videos' && (
                    <div className="p-4">
                        {ownVideos.length === 0 ? (
                            <EmptyState
                                icon={<Video size={24} className="text-orange-200" />}
                                bg="bg-orange-50"
                                title="No videos yet"
                                sub="Upload your first teaching video"
                                btnLabel="Upload Video"
                                btnClass="from-orange-500 to-amber-500 shadow-orange-200"
                                onAction={onUploadVideo}
                            />
                        ) : (
                            <div className="space-y-3">
                                {ownVideos.map(v => {
                                    const grad = SUBJECT_GRADIENTS[v.subject] ?? 'from-orange-400 to-amber-500';
                                    return (
                                        <div key={v.id} className="flex items-center gap-4 p-3 rounded-xl border border-[#F3F4F6] hover:border-orange-100 hover:bg-orange-50/30 transition-all">
                                            {/* Thumbnail */}
                                            <div onClick={() => onPreviewVideo(v)}
                                                className={`w-20 h-14 rounded-xl bg-gradient-to-br ${grad} flex-shrink-0 flex items-center justify-center cursor-pointer group relative overflow-hidden`}>
                                                {v.thumbnail
                                                    ? <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                                                    : <Play size={18} className="text-white/80" fill="white" />}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                    <Play size={16} className="text-white opacity-0 group-hover:opacity-100 transition-all" fill="white" />
                                                </div>
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-[#111827] text-sm truncate mb-1">{v.title}</p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${grad}`}>{v.subject}</span>
                                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                                        v.status === 'active' || v.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200'
                                                        : v.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                        : 'bg-red-50 text-red-500 border-red-200'
                                                    }`}>{v.status}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#9CA3AF] font-semibold">
                                                    <span className="flex items-center gap-0.5"><Eye size={9} /> {v.views.toLocaleString('en-IN')}</span>
                                                    <span className="flex items-center gap-0.5"><Star size={9} className="text-yellow-400" fill="#facc15" /> {v.rating.toFixed(1)}</span>
                                                    <span className="flex items-center gap-0.5"><Clock size={9} /> {timeAgo(v.createdAt)}</span>
                                                </div>
                                            </div>
                                            {/* Delete */}
                                            <button onClick={() => onDeleteVideo(v.id)}
                                                className="p-2 rounded-xl text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── PHOTOS ─────────────────────────────────── */}
                {subTab === 'photos' && (
                    <div className="p-4">
                        {loading ? <GridSkeleton /> : photos.length === 0 ? (
                            <EmptyState
                                icon={<ImageIcon size={24} className="text-pink-200" />}
                                bg="bg-pink-50"
                                title="No photos yet"
                                sub="Share your first image post"
                                btnLabel="Upload Photo"
                                btnClass="from-pink-500 to-rose-500 shadow-pink-200"
                                onAction={onUploadPhoto}
                            />
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {photos.map(post => (
                                    <div key={post.id} className="group relative aspect-square rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F8F9FA]">
                                        {post.photoUrl
                                            ? <img src={post.photoUrl} alt={post.caption ?? 'Photo'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            : <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon size={24} className="text-[#D1D5DB]" />
                                              </div>}
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100">
                                            {post.caption && (
                                                <p className="text-white text-[11px] font-semibold line-clamp-2 leading-snug">{post.caption}</p>
                                            )}
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {post.subject && <span className="bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{post.subject}</span>}
                                                <span className="text-white/60 text-[9px] ml-auto">{timeAgo(post.createdAt)}</span>
                                            </div>
                                        </div>
                                        {/* Status dot */}
                                        <div className="absolute top-1.5 right-1.5">
                                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${post.status === 'active' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                {post.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ARTICLES ───────────────────────────────── */}
                {subTab === 'articles' && (
                    <div className="p-4">
                        {loading ? <ListSkeleton /> : articles.length === 0 ? (
                            <EmptyState
                                icon={<FileText size={24} className="text-blue-200" />}
                                bg="bg-blue-50"
                                title="No articles yet"
                                sub="Share your knowledge with students"
                                btnLabel="Write Article"
                                btnClass="from-blue-500 to-indigo-500 shadow-blue-200"
                                onAction={onWriteArticle}
                            />
                        ) : (
                            <div className="space-y-3">
                                {articles.map(post => {
                                    const grad = SUBJECT_GRADIENTS[post.subject] ?? 'from-blue-400 to-indigo-500';
                                    return (
                                        <div key={post.id} className="p-4 rounded-xl border border-[#E5E7EB] hover:border-blue-200 hover:bg-blue-50/20 transition-all group">
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    <FileText size={15} className="text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[#111827] text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                        {post.title || 'Untitled Article'}
                                                    </p>
                                                    {post.body && (
                                                        <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-2 leading-relaxed">{post.body}</p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        {post.subject && (
                                                            <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{post.subject}</span>
                                                        )}
                                                        {post.classes.slice(0, 2).map(c => (
                                                            <span key={c} className="bg-[#F3F4F6] text-[#6B7280] text-[10px] font-bold px-2 py-0.5 rounded-full">{c}</span>
                                                        ))}
                                                        <span className="ml-auto text-[10px] text-[#9CA3AF] font-semibold flex items-center gap-0.5">
                                                            <Clock size={9} /> {timeAgo(post.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0 ${post.status === 'active' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                                    {post.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Shared empty state ────────────────────────────────────
function EmptyState({ icon, bg, title, sub, btnLabel, btnClass, onAction }: {
    icon: React.ReactNode; bg: string; title: string; sub: string;
    btnLabel: string; btnClass: string; onAction: () => void;
}) {
    return (
        <div className="py-12 text-center">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3`}>{icon}</div>
            <p className="font-extrabold text-[#111827] text-sm">{title}</p>
            <p className="text-xs text-[#9CA3AF] mt-1 mb-4">{sub}</p>
            <button onClick={onAction}
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${btnClass} text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm hover:brightness-105 transition-all`}>
                <Upload size={13} /> {btnLabel}
            </button>
        </div>
    );
}

// ── Skeletons ─────────────────────────────────────────────
function GridSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-[#F3F4F6] animate-pulse" />)}
        </div>
    );
}
function ListSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-[#F3F4F6] animate-pulse" />)}
        </div>
    );
}
