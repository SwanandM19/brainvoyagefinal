// 'use client';

// import { Users, Globe } from 'lucide-react';

// const SUBJECTS = [
//   'all','Mathematics','Physics','Chemistry','Biology',
//   'English','Hindi','History','Geography','Computer Science',
//   'Economics','Accountancy','Business Studies',
// ];

// const CLASSES = [
//   'all','Class 6','Class 7','Class 8','Class 9',
//   'Class 10','Class 11','Class 12',
//   'JEE','NEET','UPSC','CA',
// ];

// interface Props {
//   subject:        string;
//   classFilter:    string;
//   feed:           'all' | 'following';
//   followingCount: number;
//   onSubject:      (v: string) => void;
//   onClass:        (v: string) => void;
//   onFeed:         (v: 'all' | 'following') => void;
// }

// export default function FeedFilters({
//   subject, classFilter, feed, followingCount,
//   onSubject, onClass, onFeed,
// }: Props) {
//   return (
//     <div className="space-y-3">

//       {/* Feed toggle */}
//       <div className="flex gap-2">
//         <button onClick={() => onFeed('all')}
//           className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold border transition-all ${
//             feed === 'all'
//               ? 'bg-[#111827] text-white border-[#111827]'
//               : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#111827] hover:text-[#111827]'
//           }`}>
//           <Globe size={13} /> All Videos
//         </button>
//         <button onClick={() => onFeed('following')}
//           className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold border transition-all ${
//             feed === 'following'
//               ? 'bg-orange-500 text-white border-orange-500'
//               : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-orange-400 hover:text-orange-500'
//           }`}>
//           <Users size={13} />
//           Following
//           {followingCount > 0 && (
//             <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
//               feed === 'following' ? 'bg-white/25 text-white' : 'bg-orange-50 text-orange-500'
//             }`}>
//               {followingCount}
//             </span>
//           )}
//         </button>
//       </div>

//       {/* Subject chips */}
//       <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
//         {SUBJECTS.map(s => (
//           <button key={s} onClick={() => onSubject(s)}
//             className={`px-3 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap flex-shrink-0 transition-all ${
//               subject === s
//                 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm'
//                 : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-orange-300 hover:text-orange-500'
//             }`}>
//             {s === 'all' ? '🌐 All Subjects' : s}
//           </button>
//         ))}
//       </div>

//       {/* Class chips */}
//       <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
//         {CLASSES.map(c => (
//           <button key={c} onClick={() => onClass(c)}
//             className={`px-3 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap flex-shrink-0 transition-all ${
//               classFilter === c
//                 ? 'bg-[#111827] text-white border-transparent'
//                 : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-gray-400 hover:text-[#111827]'
//             }`}>
//             {c === 'all' ? '📚 All Classes' : c}
//           </button>
//         ))}
//       </div>

//     </div>
//   );
// }
