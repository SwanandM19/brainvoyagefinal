// 'use client';

// import { useState } from 'react';
// import { Eye, Heart, Star, Play, UserPlus, UserCheck, BookOpen } from 'lucide-react';

// interface VideoCardProps {
//   video: {
//     id: string; title: string; subject: string;
//     class?: string; board?: string;
//     views: number; likeCount: number; rating: number;
//     thumbnail: string | null; duration: string | null;
//     createdAt: string; isFollowed: boolean; sameClass: boolean;
//     teacher: { id: string; name: string; image: string | null; followersCount: number };
//   };
//   onFollow?: (teacherId: string, following: boolean) => void;
//   onClick?:  (videoId: string) => void;
// }

// function fmtNum(n: number) {
//   if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
//   if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
//   return n.toString();
// }

// function initials(name: string) {
//   return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
// }

// function avatarColor(name: string) {
//   const COLORS = ['from-rose-400 to-pink-500','from-blue-400 to-indigo-500',
//     'from-emerald-400 to-teal-500','from-violet-400 to-purple-500','from-amber-400 to-orange-500'];
//   let h = 0;
//   for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
//   return COLORS[Math.abs(h) % COLORS.length];
// }

// export default function VideoCard({ video, onFollow, onClick }: VideoCardProps) {
//   const [followed,  setFollowed]  = useState(video.isFollowed);
//   const [following, setFollowing] = useState(false);

//   async function handleFollow(e: React.MouseEvent) {
//     e.stopPropagation();
//     setFollowing(true);
//     try {
//       const res = await fetch(`/api/teachers/${video.teacher.id}/follow`, { method: 'POST' });
//       if (res.ok) {
//         const newState = !followed;
//         setFollowed(newState);
//         onFollow?.(video.teacher.id, newState);
//       }
//     } finally {
//       setFollowing(false);
//     }
//   }

//   return (
//     <div
//       onClick={() => onClick?.(video.id)}
//       className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
//     >
//       {/* Thumbnail */}
//       <div className="relative aspect-video bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
//         {video.thumbnail ? (
//           <img src={video.thumbnail} alt={video.title}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center">
//             <Play size={32} className="text-orange-200" fill="#fed7aa" />
//           </div>
//         )}

//         {/* Duration badge */}
//         {video.duration && (
//           <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
//             {video.duration}
//           </span>
//         )}

//         {/* Recommendation badges */}
//         <div className="absolute top-2 left-2 flex gap-1">
//           {video.isFollowed && (
//             <span className="bg-orange-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
//               ✓ Following
//             </span>
//           )}
//           {video.sameClass && !video.isFollowed && (
//             <span className="bg-blue-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
//               Your Class
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Card body */}
//       <div className="p-4">

//         {/* Subject + class tags */}
//         <div className="flex gap-1.5 mb-2 flex-wrap">
//           <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
//             {video.subject}
//           </span>
//           {video.class && (
//             <span className="text-[10px] font-bold text-[#6B7280] bg-gray-50 border border-[#E5E7EB] px-2 py-0.5 rounded-full">
//               {video.class}
//             </span>
//           )}
//         </div>

//         {/* Title */}
//         <h3 className="text-sm font-extrabold text-[#111827] leading-snug line-clamp-2 mb-3">
//           {video.title}
//         </h3>

//         {/* Teacher row */}
//         <div className="flex items-center gap-2 mb-3">
//           <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColor(video.teacher.name)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
//             {initials(video.teacher.name)}
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-xs font-bold text-[#111827] truncate">{video.teacher.name}</p>
//             <p className="text-[10px] text-[#9CA3AF]">{fmtNum(video.teacher.followersCount)} followers</p>
//           </div>
//           <button
//             onClick={handleFollow}
//             disabled={following}
//             className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all flex-shrink-0 ${
//               followed
//                 ? 'bg-orange-50 text-orange-500 border-orange-200'
//                 : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-orange-300 hover:text-orange-500'
//             }`}>
//             {followed
//               ? <><UserCheck size={11} /> Following</>
//               : <><UserPlus  size={11} /> Follow</>
//             }
//           </button>
//         </div>

//         {/* Stats */}
//         <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF] font-semibold border-t border-[#F3F4F6] pt-2.5">
//           <span className="flex items-center gap-1"><Eye  size={11} /> {fmtNum(video.views)}</span>
//           <span className="flex items-center gap-1"><Heart size={11} /> {fmtNum(video.likeCount)}</span>
//           <span className="flex items-center gap-1"><Star  size={11} className="text-yellow-400" /> {video.rating.toFixed(1)}</span>
//           <span className="ml-auto">
//             {new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
