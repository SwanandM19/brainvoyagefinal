'use client';

import { Play, Eye, Star } from 'lucide-react';

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

export interface FeedVideo {
    id: string; title: string; description: string;
    videoUrl: string; thumbnail: string | null;
    subject: string; classes: string[]; boards: string[];
    views: number; rating: number; duration: number; createdAt: string;
    teacher: { id: string; name: string; image: string | null; subjects: string[] };
}

export default function FeedVideoCard({ video, onPlay }: { video: FeedVideo; onPlay: () => void }) {
    const grad = SUBJECT_GRADIENTS[video.subject] ?? 'from-orange-400 to-amber-500';
    const initials = getInitials(video.teacher.name);
    return (
        <div onClick={onPlay}
            className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 hover:border-orange-200 transition-all duration-200 group cursor-pointer">
            <div className={`relative bg-gradient-to-br ${grad} overflow-hidden`} style={{ aspectRatio: '16/9' }}>
                {video.thumbnail
                    ? <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    : (
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
                {video.classes.length > 0 && (
                    <div className="absolute top-1.5 left-1.5">
                        <span className="bg-blue-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">{video.classes[0]}</span>
                    </div>
                )}
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
                <h3 className="font-bold text-[#111827] text-xs line-clamp-2 leading-snug mb-2 group-hover:text-[#f97316] transition-colors">
                    {video.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                    {video.teacher.image
                        ? <img src={video.teacher.image} alt={video.teacher.name}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB]"
                            onError={e => { e.currentTarget.style.display = 'none'; }} />
                        : <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0`}>{initials}</div>}
                    <p className="text-[11px] font-bold text-[#111827] truncate flex-1">{video.teacher.name}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6] text-[9px] text-[#9CA3AF] font-semibold">
                    <span className="flex items-center gap-0.5"><Eye size={10} /> {video.views.toLocaleString('en-IN')}</span>
                    <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400" fill="#facc15" /> {video.rating.toFixed(1)}</span>
                    <span>{new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
            </div>
        </div>
    );
}
