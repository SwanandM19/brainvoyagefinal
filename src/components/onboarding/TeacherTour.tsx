'use client';


import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, ChevronRight, ChevronLeft, Play, Trophy, BarChart2,
  Upload, Search, User, BookOpen, Video, Sparkles, CheckCircle,
  HelpCircle,
} from 'lucide-react';


type StepLocation = 'navbar' | 'left-sidebar' | 'right-sidebar';

export const TOUR_STEPS = [
  {
    id: 'feed',
    target: 'tour-feed',
    title: '📡 Community Feed',
    body: 'This is your home! See what teachers across India are posting — videos, articles, and photos. Scroll through and get inspired.',
    position: 'right' as const,
    mobilePosition: 'bottom' as const,
    location: 'left-sidebar' as StepLocation,
  },
  {
    id: 'start-posting',
    target: 'tour-start-posting',
    title: '🚀 Start Posting',
    body: 'This is your most important button! Click here to upload a teaching video, write an article, or share a photo post with students and teachers nationwide.',
    position: 'bottom' as const,
    mobilePosition: 'bottom' as const,
    location: 'navbar' as StepLocation,
  },
  {
    id: 'search',
    target: 'tour-search',
    title: '🔍 Search Anything',
    body: 'Search for any subject, teacher name, or topic. You can also filter by subject using the Subjects button next to the search bar.',
    position: 'bottom' as const,
    mobilePosition: 'bottom' as const,
    location: 'navbar' as StepLocation,
  },
  {
    id: 'myvideos',
    target: 'tour-myvideos',
    title: '🎬 My Videos',
    body: 'All your uploaded videos live here. You can preview, manage, and delete them. Once you upload videos, your views and followers will start growing!',
    position: 'right' as const,
    mobilePosition: 'bottom' as const,
    location: 'left-sidebar' as StepLocation,
  },
  {
    id: 'stats',
    target: 'tour-stats',
    title: '📊 Your Stats',
    body: 'Track your total views, followers, likes, and average rating. Your national rank is also shown here — the more you upload, the higher you climb!',
    position: 'right' as const,
    mobilePosition: 'bottom' as const,
    location: 'left-sidebar' as StepLocation,
  },
  {
    id: 'leaderboard',
    target: 'tour-leaderboard',
    title: '🏆 Leaderboard',
    body: 'See where you rank among all teachers on VidyaSangam. The top teachers get the most student followers. Compete and grow!',
    position: 'right' as const,
    mobilePosition: 'bottom' as const,
    location: 'left-sidebar' as StepLocation,
  },
  {
    id: 'profile',
    target: 'tour-profile',
    title: '⚙️ Your Profile',
    body: 'Edit your bio, subjects, classes, and boards here. A complete profile builds trust with students and helps them find you faster.',
    position: 'right' as const,
    mobilePosition: 'bottom' as const,
    location: 'left-sidebar' as StepLocation,
  },
  {
    id: 'mini-leaderboard',
    target: 'tour-mini-leaderboard',
    title: '👑 Top Teachers',
    body: 'This sidebar shows the top 7 teachers by views. Your goal — get to the top! Upload more quality videos to climb the ranks.',
    position: 'left' as const,
    mobilePosition: 'bottom' as const,
    location: 'right-sidebar' as StepLocation,
  },
];


const STORAGE_KEY = 'vs_teacher_tour_done';


interface TooltipPos {
  top: number;
  left: number;
  spotX: number;
  spotY: number;
  spotW: number;
  spotH: number;
}


interface Props {
  teacherName: string;
  isReplay?: boolean;
  onEnd: () => void;
  onUploadVideo?: () => void;
  onGoToProfile?: () => void;
  onGoToFeed?: () => void;
  isMobile?: boolean;
  onMobileDrawer?: (drawer: 'left' | 'right' | 'none') => void;
}


function ArrowIndicator({ position }: { position: string }) {
  const base = 'absolute w-3 h-3 bg-white rotate-45 border border-[#E5E7EB]';
  if (position === 'bottom') return <div className={`${base} -top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0`} />;
  if (position === 'top') return <div className={`${base} -bottom-1.5 left-1/2 -translate-x-1/2 border-t-0 border-l-0`} />;
  if (position === 'right') return <div className={`${base} top-6 -left-1.5 -translate-y-1/2 border-r-0 border-t-0`} />;
  if (position === 'left') return <div className={`${base} top-6 -right-1.5 -translate-y-1/2 border-l-0 border-b-0`} />;
  return null;
}


export default function TeacherTour({ teacherName, isReplay = false, onEnd, onUploadVideo, onGoToProfile, onGoToFeed, isMobile = false, onMobileDrawer }: Props) {
  const [phase, setPhase] = useState<'welcome' | 'tour' | 'done'>('welcome');
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const [visible, setVisible] = useState(false);


  const isScrolling = useRef(false);
  const rafRef = useRef<number | undefined>(undefined);
  const TOOLTIP_W = isMobile ? Math.min(290, (typeof window !== 'undefined' ? window.innerWidth : 375) - 32) : 320;
  const TOOLTIP_H = 210;
  const currentStep = TOUR_STEPS[step];

  // Z-index constants — raised above mobile drawer (z-200) when on mobile
  const Z_OVERLAY = isMobile ? 300 : 190;
  const Z_SVG = isMobile ? 301 : 191;
  const Z_SPOTLIGHT = isMobile ? 302 : 192;
  const Z_TOOLTIP = isMobile ? 303 : 193;


  function finish() {
    // Close any open drawers when tour ends
    if (isMobile && onMobileDrawer) onMobileDrawer('none');
    localStorage.setItem(STORAGE_KEY, 'true');
    onEnd();
  }


  const measure = useCallback(() => {
    if (isScrolling.current) return;
    const el = document.getElementById(currentStep?.target ?? '');
    if (!el) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setPos({
        top: vh / 2 - TOOLTIP_H / 2,
        left: vw / 2 - TOOLTIP_W / 2,
        spotX: 0, spotY: 0, spotW: 0, spotH: 0,
      });
      return;
    }


    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const GAP = 16;

    // On mobile, use mobilePosition; on desktop, use position
    const p: string = isMobile ? currentStep.mobilePosition : currentStep.position;


    let top: number, left: number;
    if (p === 'bottom') {
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    } else if (p === 'top') {
      top = rect.top - TOOLTIP_H - GAP;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    } else if (p === 'right') {
      top = rect.top;
      left = rect.right + GAP;
    } else {
      top = rect.top;
      left = rect.left - TOOLTIP_W - GAP;
    }


    left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));
    top = Math.max(12, Math.min(top, vh - TOOLTIP_H - 12));


    setPos({
      top, left,
      spotX: rect.left - 8,
      spotY: rect.top - 8,
      spotW: rect.width + 16,
      spotH: rect.height + 16,
    });
  }, [currentStep, isMobile, TOOLTIP_W]);


  const innerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase !== 'tour') return;
    setVisible(false);
    setPos(null);

    // On mobile, open/close the appropriate drawer before measuring
    if (isMobile && onMobileDrawer) {
      const loc = currentStep?.location;
      if (loc === 'left-sidebar') {
        onMobileDrawer('left');
      } else if (loc === 'right-sidebar') {
        onMobileDrawer('right');
      } else {
        onMobileDrawer('none');
      }
    }

    // Wait for drawer animation (450ms on mobile) then measure
    const drawerDelay = isMobile ? 450 : 0;

    const t = setTimeout(() => {
      const el = document.getElementById(currentStep?.target ?? '');
      if (!el) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        setPos({
          top: vh / 2 - TOOLTIP_H / 2,
          left: vw / 2 - TOOLTIP_W / 2,
          spotX: 0, spotY: 0, spotW: 0, spotH: 0,
        });
        setVisible(true);
        return;
      }

      isScrolling.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

      innerTimeoutRef.current = setTimeout(() => {
        isScrolling.current = false;
        measure();
        setVisible(true);
      }, 500);
    }, drawerDelay);

    return () => {
      clearTimeout(t);
      if (innerTimeoutRef.current) clearTimeout(innerTimeoutRef.current);
    };
  }, [phase, step]); // eslint-disable-line


  useEffect(() => {
    if (phase !== 'tour') return;
    function onResize() {
      cancelAnimationFrame(rafRef.current!);
      rafRef.current = requestAnimationFrame(measure);
    }
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current!);
    };
  }, [phase, measure]);


  function startTour() { setPhase('tour'); setStep(0); }


  function next() {
    if (step < TOUR_STEPS.length - 1) {
      setVisible(false);
      setTimeout(() => setStep(s => s + 1), 150);
    } else {
      setPhase('done');
      // Close drawers when tour finishes
      if (isMobile && onMobileDrawer) onMobileDrawer('none');
    }
  }


  function prev() {
    if (step > 0) {
      setVisible(false);
      setTimeout(() => setStep(s => s - 1), 150);
    }
  }


  // ════════════════════════════════════════════════════════
  // WELCOME MODAL
  // ════════════════════════════════════════════════════════
  if (phase === 'welcome') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-8 pt-8 pb-6 text-center relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-orange-500/10" />
            <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-amber-400/10" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 translate="no" className="text-2xl font-extrabold text-white mb-1">
                <span>Welcome, </span><span>{teacherName.split(' ')[0]}</span><span>! 👋</span>
              </h2>
              <p className="text-white/60 text-sm">You're now part of India's teacher community</p>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest text-center mb-4">Here's what you can do</p>
            <div className="space-y-3">
              {[
                { icon: <Video size={16} className="text-orange-400" />, bg: 'bg-orange-50', title: 'Upload Teaching Videos', body: 'Share your knowledge with students across India' },
                { icon: <Trophy size={16} className="text-yellow-500" />, bg: 'bg-yellow-50', title: 'Rank on National Board', body: 'Get more views & followers to climb the leaderboard' },
                { icon: <BarChart2 size={16} className="text-blue-500" />, bg: 'bg-blue-50', title: 'Track Your Growth', body: 'See your views, likes, and follower stats live' },
                { icon: <BookOpen size={16} className="text-green-500" />, bg: 'bg-green-50', title: 'Share Articles & Posts', body: 'Write tips, notes, and announcements for students' },
              ].map(f => (
                <div key={f.title} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F9FA] transition-colors">
                  <div className={`w-8 h-8 ${f.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{f.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{f.title}</p>
                    <p className="text-xs text-[#9CA3AF]">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 pb-6 space-y-2.5">
            <button onClick={startTour}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-md shadow-orange-200 hover:brightness-105 transition-all flex items-center justify-center gap-2">
              <Play size={15} fill="white" />
              <span>Take a Quick Tour (2 min)</span>
            </button>
            <button onClick={finish}
              className="w-full py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[#6B7280] font-bold text-sm hover:bg-[#F8F9FA] transition-colors">
              <span>Skip for now</span>
            </button>
          </div>
        </div>
      </div>
    );
  }


  // ════════════════════════════════════════════════════════
  // DONE MODAL
  // ════════════════════════════════════════════════════════
  if (phase === 'done') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={finish}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}>
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">
              <span>You're all set! 🎉</span>
            </h2>
            <p className="text-white/70 text-sm">Now go make an impact on students across India</p>
          </div>
          <div className="px-6 py-5 space-y-2.5">
            <p className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest text-center mb-3">What's next?</p>
            {[
              { emoji: '📹', label: 'Upload your first video', action: () => { finish(); onUploadVideo?.(); } },
              { emoji: '✏️', label: 'Complete your profile', action: () => { finish(); onGoToProfile?.(); } },
              { emoji: '🌐', label: 'Explore the community feed', action: () => { finish(); onGoToFeed?.(); } },
            ].map(a => (
              <button key={a.label} onClick={a.action}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#E5E7EB] hover:border-orange-300 hover:bg-orange-50 transition-all text-left group">
                <span className="text-xl">{a.emoji}</span>
                <span className="text-sm font-bold text-[#111827] group-hover:text-[#f97316] transition-colors">{a.label}</span>
                <ChevronRight size={14} className="ml-auto text-[#9CA3AF] group-hover:text-[#f97316]" />
              </button>
            ))}
            <button onClick={finish}
              className="w-full py-3 mt-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-md shadow-orange-200 hover:brightness-105 transition-all">
              <span>Go to My Feed 🚀</span>
            </button>
          </div>
        </div>
      </div>
    );
  }


  // ════════════════════════════════════════════════════════
  // SPOTLIGHT TOUR
  // ════════════════════════════════════════════════════════

  // Determine the effective position for the arrow
  const effectivePosition = isMobile ? currentStep.mobilePosition : currentStep.position;

  return (
    <>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.72)', willChange: 'transform', zIndex: Z_OVERLAY }}
      />


      {pos && pos.spotW > 0 && (
        <svg
          className="fixed inset-0 pointer-events-none"
          style={{ width: '100vw', height: '100vh', willChange: 'transform', zIndex: Z_SVG }}
        >
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={pos.spotX} y={pos.spotY}
                width={pos.spotW} height={pos.spotH}
                rx="12" ry="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="transparent" mask="url(#tour-mask)" />
        </svg>
      )}


      {pos && pos.spotW > 0 && (
        <div
          className="fixed pointer-events-none rounded-xl transition-all duration-300"
          style={{
            top: pos.spotY,
            left: pos.spotX,
            width: pos.spotW,
            height: pos.spotH,
            boxShadow: '0 0 0 3px #f97316, 0 0 20px rgba(249,115,22,0.4)',
            willChange: 'transform',
            zIndex: Z_SPOTLIGHT,
          }}
        />
      )}


      <div className="fixed inset-0" style={{ zIndex: Z_SPOTLIGHT }} onClick={finish} />


      {pos && (
        <div
          key={currentStep.id}
          className="fixed transition-all duration-200"
          style={{
            top: pos.top,
            left: pos.left,
            width: TOOLTIP_W,
            opacity: visible ? 1 : 0,
            transform: `translateY(${visible ? '0px' : '6px'})`,
            willChange: 'transform, opacity',
            zIndex: Z_TOOLTIP,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-visible relative">
            <ArrowIndicator position={effectivePosition} />
            <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-t-2xl" />


            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div key={i}
                    className={`rounded-full transition-all duration-300 ${i === step
                      ? 'w-5 h-1.5 bg-[#f97316]'
                      : i < step
                        ? 'w-1.5 h-1.5 bg-orange-300'
                        : 'w-1.5 h-1.5 bg-[#E5E7EB]'
                      }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#9CA3AF]">
                  <span>{step + 1}</span><span> / </span><span>{TOUR_STEPS.length}</span>
                </span>
                <button onClick={finish}
                  className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F8F9FA] transition-colors">
                  <X size={13} />
                </button>
              </div>
            </div>


            <div className="px-4 pb-2 pt-1">
              <h3 className="font-extrabold text-[#111827] text-sm mb-1">{currentStep.title}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">{currentStep.body}</p>
            </div>


            <div className="flex items-center gap-2 px-4 pb-4 pt-2">
              {step > 0 && (
                <button onClick={prev}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-[#E5E7EB] text-[#6B7280] text-xs font-bold hover:bg-[#F8F9FA] transition-colors">
                  <ChevronLeft size={12} /> <span>Prev</span>
                </button>
              )}
              <button onClick={next}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold hover:brightness-105 transition-all shadow-sm shadow-orange-200">
                {step === TOUR_STEPS.length - 1
                  ? <><CheckCircle size={12} /> <span>Finish Tour</span></>
                  : <><span>{step === 0 ? "Let's go!" : 'Next'}</span> <ChevronRight size={12} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export function isTourDone(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}


export function resetTour(): void {
  localStorage.removeItem(STORAGE_KEY);
}
