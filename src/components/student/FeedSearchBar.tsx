// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { Search, X, User, BookOpen, TrendingUp } from 'lucide-react';

// interface Suggestion {
//   type:  'teacher' | 'subject';
//   label: string;
//   value: string;
// }

// interface Props {
//   value:       string;
//   onChange:    (val: string) => void;
//   onClear:     () => void;
//   placeholder?: string;
// }

// const TRENDING = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

// export default function FeedSearchBar({ value, onChange, onClear, placeholder }: Props) {
//   const [focused,     setFocused]     = useState(false);
//   const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
//   const [loading,     setLoading]     = useState(false);
//   const inputRef  = useRef<HTMLInputElement>(null);
//   const debouncer = useRef<ReturnType<typeof setTimeout>>();

//   const fetchSuggestions = useCallback((q: string) => {
//     if (q.length < 2) { setSuggestions([]); return; }
//     setLoading(true);
//     clearTimeout(debouncer.current);
//     debouncer.current = setTimeout(() => {
//       fetch(`/api/student/feed?search=${encodeURIComponent(q)}&limit=1`)
//         .then(r => r.json())
//         .then(d => setSuggestions(d.suggestions ?? []))
//         .finally(() => setLoading(false));
//     }, 300); // 300ms debounce — no lag
//   }, []);

//   useEffect(() => {
//     fetchSuggestions(value);
//     return () => clearTimeout(debouncer.current);
//   }, [value, fetchSuggestions]);

//   function handleKey(e: React.KeyboardEvent) {
//     if (e.key === 'Escape') { inputRef.current?.blur(); setFocused(false); }
//   }

//   const showDropdown = focused && (value.length === 0 || suggestions.length > 0 || loading);

//   return (
//     <div className="relative w-full max-w-2xl mx-auto">

//       {/* Search input */}
//       <div className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3 transition-all shadow-sm ${
//         focused ? 'border-orange-400 shadow-orange-100 shadow-md' : 'border-[#E5E7EB] hover:border-orange-200'
//       }`}>
//         <Search size={18} className={`flex-shrink-0 transition-colors ${focused ? 'text-orange-400' : 'text-[#9CA3AF]'}`} />
//         <input
//           ref={inputRef}
//           type="text"
//           value={value}
//           onChange={e => onChange(e.target.value)}
//           onFocus={() => setFocused(true)}
//           onBlur={() => setTimeout(() => setFocused(false), 150)}
//           onKeyDown={handleKey}
//           placeholder={placeholder ?? 'Search videos, teachers, subjects...'}
//           className="flex-1 bg-transparent text-[#111827] text-sm font-medium placeholder:text-[#9CA3AF] outline-none"
//         />
//         {loading && (
//           <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
//         )}
//         {value && !loading && (
//           <button onClick={onClear} className="flex-shrink-0 text-[#9CA3AF] hover:text-[#111827] transition-colors">
//             <X size={16} />
//           </button>
//         )}
//       </div>

//       {/* Dropdown */}
//       {showDropdown && (
//         <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-50 overflow-hidden">

//           {/* Trending — shown when empty */}
//           {value.length === 0 && (
//             <div className="p-3">
//               <div className="flex items-center gap-2 px-2 mb-2">
//                 <TrendingUp size={13} className="text-orange-400" />
//                 <p className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">Trending Subjects</p>
//               </div>
//               <div className="flex flex-wrap gap-2 px-2">
//                 {TRENDING.map(t => (
//                   <button key={t}
//                     onMouseDown={() => onChange(t)}
//                     className="px-3 py-1.5 bg-orange-50 text-[#f97316] text-xs font-bold rounded-full border border-orange-100 hover:bg-orange-100 transition-colors">
//                     {t}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Suggestions */}
//           {suggestions.length > 0 && (
//             <div className="border-t border-[#E5E7EB]">
//               {suggestions.map((s, i) => (
//                 <button key={i}
//                   onMouseDown={() => { onChange(s.value); setFocused(false); }}
//                   className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8F9FA] transition-colors">
//                   <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
//                     s.type === 'teacher' ? 'bg-blue-50' : 'bg-orange-50'
//                   }`}>
//                     {s.type === 'teacher'
//                       ? <User size={14} className="text-blue-500" />
//                       : <BookOpen size={14} className="text-orange-400" />
//                     }
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold text-[#111827]">{s.label}</p>
//                     <p className="text-[10px] text-[#9CA3AF] capitalize">{s.type}</p>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}

//           {/* No results */}
//           {value.length >= 2 && !loading && suggestions.length === 0 && (
//             <div className="px-4 py-6 text-center">
//               <p className="text-sm text-[#9CA3AF]">No results for "<span className="font-semibold text-[#111827]">{value}</span>"</p>
//               <p className="text-xs text-[#9CA3AF] mt-1">Try a different keyword or teacher name</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
