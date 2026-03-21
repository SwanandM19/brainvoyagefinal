'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { X, Trophy, Loader2 } from 'lucide-react';
import GameLeaderboard from './GameLeaderboard';

interface MemCard { id: number; pairId: number; front: string; back: string; }
interface Props { subject: string; onClose: () => void; }

const TOTAL_TIME = 180;

function buildCards(questions: any[]): MemCard[] {
  const pairs = questions.slice(0, 8);
  const cards: MemCard[] = [];
  pairs.forEach((q, i) => {
    cards.push({ id: i * 2, pairId: i, front: '❓', back: q.question });
    cards.push({ id: i * 2 + 1, pairId: i, front: '📖', back: q.options[q.correctIndex] });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryMatch({ subject, onClose }: Props) {
  const [phase, setPhase] = useState<'loading' | 'intro' | 'playing' | 'result'>('loading');
  const [cards, setCards] = useState<MemCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [flips, setFlips] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [shake, setShake] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [showLB, setShowLB] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTs = useRef(0);

  useEffect(() => {
    fetch(`/api/games/questions?subject=${encodeURIComponent(subject)}&count=8&gameType=memory`)
      .then(r => r.json())
      .then(d => {
        if (d.questions?.length >= 4) { setCards(buildCards(d.questions)); }
        setPhase('intro');
      })
      .catch(() => setPhase('intro'));
  }, [subject]);

  const endGame = useCallback(async (won: boolean, timeUsed: number, totalFlips: number) => {
    clearInterval(timerRef.current);
    setPhase('result');
    const finalScore = won ? Math.max(0, 1000 - (totalFlips - 8) * 15 - timeUsed * 2) : 0;
    setScore(finalScore);
    try {
      const res = await fetch('/api/games/score', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'memory', subject,
          score: finalScore, streak: 0,
          questionsTotal: 8, questionsCorrect: won ? 8 : Math.floor(matched.length / 2),
          timeTaken: timeUsed,
        }),
      });
      const data = await res.json();
      if (res.ok) setRank(data.rank);
    } catch { /* silent */ }
  }, [subject, matched]);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { endGame(false, TOTAL_TIME, flips); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, endGame, flips]);

  function handleFlip(cardId: number) {
    if (disabled || flipped.includes(cardId) || matched.includes(cardId)) return;
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    setFlips(f => f + 1);
    if (newFlipped.length === 2) {
      setDisabled(true);
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id)!);
      if (a.pairId === b.pairId) {
        const newMatched = [...matched, a.id, b.id];
        setMatched(newMatched);
        setFlipped([]);
        setDisabled(false);
        if (newMatched.length === cards.length) endGame(true, TOTAL_TIME - timeLeft, flips + 1);
      } else {
        setShake([a.id, b.id]);
        setTimeout(() => { setFlipped([]); setShake([]); setDisabled(false); }, 900);
      }
    }
  }

  const timePct = (timeLeft / TOTAL_TIME) * 100;
  const timeColor = timeLeft > 90 ? 'bg-emerald-400' : timeLeft > 30 ? 'bg-yellow-400' : 'bg-red-500';
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // ── LOADING ──
  if (phase === 'loading') return (
    <Overlay onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 size={40} className="animate-spin text-violet-500" />
        <p className="text-[#6B7280] text-sm font-semibold">Loading questions…</p>
      </div>
    </Overlay>
  );

  // ── INTRO ──
  if (phase === 'intro') return (
    <Overlay onClose={onClose}>
      <div className="text-center space-y-5 w-full">
        <div className="text-6xl">🧩</div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">Memory Match</h2>
          <p className="text-violet-600 font-bold text-sm mt-1">{subject}</p>
        </div>
        <div className="bg-[#F8F9FA] rounded-2xl p-4 text-left space-y-2.5 border border-[#E5E7EB]">
          {[
            'Flip two cards — match term with definition',
            'Matched pairs stay revealed',
            'Fewer flips + faster time = higher score',
            'You have 3 minutes',
          ].map(r => (
            <div key={r} className="flex items-start gap-2 text-sm text-[#6B7280]">
              <span className="text-violet-500 mt-0.5 flex-shrink-0">▸</span>{r}
            </div>
          ))}
        </div>
        {cards.length === 0 && (
          <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3 border border-red-200">
            No memory pairs found for {subject}. Try Mathematics or Physics.
          </p>
        )}
        <button
          disabled={cards.length === 0}
          onClick={() => { startTs.current = Date.now(); setPhase('playing'); }}
          className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-extrabold rounded-2xl text-base hover:brightness-105 transition shadow-md shadow-violet-200 disabled:opacity-30">
          Flip It! 🧩
        </button>
        <button onClick={onClose} className="text-[#9CA3AF] text-sm hover:text-[#111827] transition">Cancel</button>
      </div>
    </Overlay>
  );

  // ── RESULT ──
  if (phase === 'result') return (
    <Overlay onClose={onClose}>
      {!showLB ? (
        <div className="text-center space-y-5 w-full">
          <div className="text-5xl">{score >= 700 ? '🏆' : score >= 300 ? '🥈' : matched.length === cards.length ? '🥉' : '💀'}</div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#111827]">
              {matched.length === cards.length ? 'All Matched!' : "Time's Up!"}
            </h2>
            <p className="text-[#9CA3AF] text-sm mt-1">Memory Match · {subject}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Score', value: score.toLocaleString(), icon: '✨', bg: 'bg-violet-50 border-violet-200', text: 'text-violet-600' },
              { label: 'Pairs', value: `${matched.length / 2} / ${cards.length / 2}`, icon: '🧩', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-600' },
              { label: 'Flips', value: flips, icon: '🔄', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-500' },
              { label: 'Rank', value: rank ? `#${rank}` : '…', icon: '🏅', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-600' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
                <div className="text-xl mb-1">{s.icon}</div>
                <p className={`font-extrabold text-xl ${s.text}`}>{s.value}</p>
                <p className="text-[#9CA3AF] text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowLB(true)}
              className="flex-1 py-3 bg-white border-2 border-[#E5E7EB] rounded-xl text-[#111827] font-bold text-sm hover:border-violet-200 hover:bg-violet-50 transition flex items-center justify-center gap-1.5">
              <Trophy size={14} className="text-violet-500" /> Leaderboard
            </button>
            <button onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white font-extrabold text-sm hover:brightness-105 transition shadow-sm shadow-violet-200">
              Done ✓
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <button onClick={() => setShowLB(false)}
            className="text-[#9CA3AF] hover:text-[#111827] text-sm mb-4 flex items-center gap-1 transition">
            ← Back to results
          </button>
          <GameLeaderboard gameType="memory" defaultSubject={subject} compact />
        </div>
      )}
    </Overlay>
  );

  // ── PLAYING — full screen light ──
  return (
    <div className="fixed inset-0 z-50 bg-[#F8F9FA] overflow-hidden flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-violet-600 font-extrabold text-sm">🧩 Memory Match</span>
          <span className="text-[#9CA3AF] text-xs bg-[#F8F9FA] border border-[#E5E7EB] px-2 py-0.5 rounded-lg">
            {matched.length / 2}/{cards.length / 2} pairs
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-mono font-bold text-sm ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-[#374151]'}`}>
            {minutes}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[#9CA3AF] text-xs">Flips: {flips}</span>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-[#E5E7EB]">
        <div className={`h-full ${timeColor} transition-all duration-1000`} style={{ width: `${timePct}%` }} />
      </div>

      {/* Card grid */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <div className="grid grid-cols-4 gap-3 w-full max-w-2xl">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            const isMatched = matched.includes(card.id);
            const isShaking = shake.includes(card.id);
            return (
              <button key={card.id}
                onClick={() => handleFlip(card.id)}
                disabled={disabled || isMatched}
                className={`aspect-square relative [perspective:500px] ${isShaking ? 'animate-shake' : ''}`}>
                <div className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  {/* Front */}
                  <div className={`absolute inset-0 [backface-visibility:hidden] rounded-xl border-2 flex items-center justify-center cursor-pointer transition-colors ${isMatched
                      ? 'bg-violet-50 border-violet-300'
                      : 'bg-white border-[#E5E7EB] hover:border-violet-300 hover:bg-violet-50 shadow-sm'
                    }`}>
                    <span className="text-2xl">{card.front}</span>
                  </div>
                  {/* Back */}
                  <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl border-2 p-2 flex items-center justify-center ${isMatched
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-indigo-50 border-indigo-300'
                    }`}>
                    <p className="text-[#111827] text-[10px] font-semibold text-center leading-tight line-clamp-4">
                      {card.back}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[#9CA3AF] text-xs">Match each term with its definition</p>
      </div>
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E5E7EB] p-6 overflow-y-auto max-h-[90vh] flex flex-col items-center"
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
