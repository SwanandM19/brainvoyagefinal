'use client';

import { Image as ImageIcon, Clock, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const SUBJECT_GRADIENTS: Record<string, string> = {
    Mathematics: 'from-blue-500 to-indigo-600', Physics: 'from-purple-500 to-violet-600',
    Chemistry: 'from-green-500 to-emerald-600', Biology: 'from-teal-500 to-cyan-600',
    English: 'from-rose-500 to-pink-600', Hindi: 'from-orange-500 to-amber-600',
    History: 'from-yellow-500 to-orange-500', Geography: 'from-lime-500 to-green-600',
    'Computer Science': 'from-sky-500 to-blue-600', Economics: 'from-violet-500 to-purple-600',
    Accountancy: 'from-indigo-500 to-blue-500', 'Business Studies': 'from-amber-500 to-orange-500',
};

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

export interface FeedPhoto {
    id: string;
    photoUrl: string;
    caption: string;
    subject: string;
    classes: string[];
    boards: string[];
    createdAt: string;
    likesCount: number;   // ← NEW
    teacher: { id: string; name: string; image: string | null; subjects: string[] };
}

interface Props {
    photo: FeedPhoto;
    currentTeacherId?: string;
    onDeleted?: (id: string) => void;
}

export default function FeedPhotoCard({ photo, currentTeacherId, onDeleted }: Props) {
    const grad     = SUBJECT_GRADIENTS[photo.subject] ?? 'from-pink-400 to-rose-500';
    const initials = getInitials(photo.teacher.name);
    const isOwner  = currentTeacherId && currentTeacherId === photo.teacher.id;

    const [deleting,   setDeleting]   = useState(false);
    const [confirmDel, setConfirmDel] = useState(false);

    async function handleDelete() {
        setDeleting(true);
        try {
            const res = await fetch(`/api/teacher/posts/${photo.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const d = await res.json();
                toast.error(d.error ?? 'Failed to delete.');
                return;
            }
            toast.success('Photo deleted.');
            onDeleted?.(photo.id);
        } catch {
            toast.error('Network error. Try again.');
        } finally {
            setDeleting(false);
            setConfirmDel(false);
        }
    }

    return (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 hover:border-pink-200 transition-all duration-200 group">

            {/* Image */}
            <div className="relative overflow-hidden bg-[#F8F9FA]" style={{ aspectRatio: '16/9' }}>
                {photo.photoUrl ? (
                    <img
                        src={photo.photoUrl}
                        alt={photo.caption || 'Photo post'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                        <ImageIcon size={28} className="text-white/60" />
                    </div>
                )}

                {/* Subject badge */}
                {photo.subject && (
                    <div className="absolute bottom-1.5 left-1.5">
                        <span className="bg-black/50 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                            {photo.subject}
                        </span>
                    </div>
                )}

                {/* Class badge */}
                {photo.classes.length > 0 && (
                    <div className="absolute top-1.5 left-1.5">
                        <span className="bg-pink-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                            {photo.classes[0]}
                        </span>
                    </div>
                )}

                {/* Type badge */}
                <div className="absolute top-1.5 right-1.5">
                    <span className="bg-white/90 text-pink-500 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border border-pink-100">
                        📸 Photo
                    </span>
                </div>

                {/* Delete button (owner only) */}
                {isOwner && (
                    <div className="absolute bottom-1.5 right-1.5">
                        {confirmDel ? (
                            <div className="flex items-center gap-1 bg-white rounded-full shadow-lg px-2 py-1 border border-red-200">
                                <span className="text-[9px] font-bold text-red-500">Delete?</span>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="text-[9px] font-extrabold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50">
                                    {deleting ? <Loader2 size={9} className="animate-spin" /> : 'Yes'}
                                </button>
                                <button onClick={() => setConfirmDel(false)}
                                    className="text-[9px] font-extrabold text-[#6B7280] hover:text-[#111827] px-1.5 py-0.5 rounded-full transition-colors">
                                    No
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setConfirmDel(true)}
                                className="w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={11} className="text-white" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-3">
                {photo.caption && (
                    <p className="text-xs font-semibold text-[#111827] line-clamp-2 leading-snug mb-2">
                        {photo.caption}
                    </p>
                )}

                {/* Teacher row */}
                <div className="flex items-center gap-2 mb-2">
                    {photo.teacher.image
                        ? <img src={photo.teacher.image} alt={photo.teacher.name}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB]"
                            onError={e => { e.currentTarget.style.display = 'none'; }} />
                        : <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0`}>
                            {initials}
                          </div>}
                    <p className="text-[11px] font-bold text-[#111827] truncate flex-1">{photo.teacher.name}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6] text-[9px] text-[#9CA3AF] font-semibold">
                    <div className="flex items-center gap-2.5">
                        {/* Time */}
                        <span className="flex items-center gap-0.5">
                            <Clock size={9} /><span>{timeAgo(photo.createdAt)}</span>
                        </span>
                        {/* ── Likes counter ── */}
                        <span className="flex items-center gap-0.5 text-pink-400 font-bold">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                                <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" fill="currentColor" />
                            </svg>
                            <span>{photo.likesCount ?? 0}</span>
                        </span>
                    </div>
                    <div className="flex gap-1">
                        {photo.boards.slice(0, 1).map(b => (
                            <span key={b} className="bg-purple-50 text-purple-600 border border-purple-100 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                                {b}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
