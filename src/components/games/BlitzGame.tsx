'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Divide, Clock, Loader2, Trophy } from 'lucide-react';
import GameLeaderboard from './GameLeaderboard';

interface Question { _id: string; question: string; options: string[]; correctIndex: number; subject: string; }
interface Props { subject: string; onClose: () => void; }

const TOTAL_Q = 15;
const TIME_EACH = 10;
const COMBO_THRESHOLDS = [1, 1, 2, 2, 3, 3, 5, 5, 5, 10];

function comboMult(streak: number) {
  return COMBO_THRESHOLDS[Math.min(streak, COMBO_THRESHOLDS.length - 1)];
}

export default function BlitzGame({ subject, onClose }: Props) {
  const [phase, setPhase] = useState<'loading' | 'intro' | 'playing' | 'result'>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_EACH);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [floatPts, setFloatPts] = useState<{ val: number; id: number }[]>([]);
  const [powerups, setPowerups] = useState({ halve: 2, freeze: 1 });
  const [frozen, setFrozen] = useState(false);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [showLB, setShowLB] = useState(false);
  const [comboLabel, setComboLabel] = useState('');
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const ptId = useRef(0);
  const startTs = useRef(0);

  useEffect(() => {
    fetch(`/api/games/questions?subject=${encodeURIComponent(subject)}&count=${TOTAL_Q}&gameType=blitz`)
      .then(r => r.json())
      .then(d => { setQuestions(d.questions ?? []); setPhase('intro'); })
      .catch(() => setPhase('intro'));
  }, [subject]);

  const endGame = useCallback(async (finalScore: number, finalStreak: number, finalCorrect: number) => {
    setPhase('result');
    const timeTaken = Math.round((Date.now() - startTs.current) / 1000);
    try {
      const res = await fetch('/api/games/score', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'blitz', subject,
          score: finalScore, streak: finalStreak,
          questionsTotal: TOTAL_Q, questionsCorrect: finalCorrect,
          timeTaken,
        }),
      });
      const data = await res.json();
      if (res.ok) setRank(data.rank);
    } catch { /* silent */ }
  }, [subject]);

  const nextQuestion = useCallback((newScore: number, newStreak: number, newCorrect: number, nextIdx: number) => {
    setChosen(null); setFlash(null); setEliminated([]); setFrozen(false);
    if (nextIdx >= questions.length) {
      endGame(newScore, newStreak, newCorrect);
    } else {
      setQIndex(nextIdx);
      setTimeLeft(TIME_EACH);
    }
  }, [questions.length, endGame]);

  const handleAnswer = useCallback((idx: number, curScore: number, curStreak: number, curCorrect: number) => {
    if (chosen !== null) return;
    clearInterval(timerRef.current);
    setChosen(idx);
    const q = questions[qIndex];
    if (idx === q.correctIndex) {
      const mult = comboMult(curStreak + 1);
      const pts = 100 * mult;
      const ns = curScore + pts;
      const nst = curStreak + 1;
      const nc = curCorrect + 1;
      setScore(ns); setStreak(nst); setCorrect(nc);
      setMaxStreak(m => Math.max(m, nst));
      setFlash('correct');
      ptId.current++;
      const pid = ptId.current;
      setFloatPts(p => [...p, { val: pts, id: pid }]);
      setTimeout(() => setFloatPts(p => p.filter(x => x.id !== pid)), 900);
      if (nst >= 10) setComboLabel('🔥 LEGENDARY!');
      else if (nst >= 5) setComboLabel('⚡ ON FIRE!');
      else if (nst >= 3) setComboLabel('💥 COMBO!');
      else setComboLabel('');
      setTimeout(() => nextQuestion(ns, nst, nc, qIndex + 1), 600);
    } else {
      setFlash('wrong');
      setStreak(0);
      setComboLabel('');
      setTimeout(() => nextQuestion(curScore, 0, curCorrect, qIndex + 1), 900);
    }
  }, [chosen, qIndex, questions, nextQuestion]);

  useEffect(() => {
    if (phase !== 'playing' || chosen !== null || frozen) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1, score, streak, correct);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIndex, chosen, frozen, handleAnswer, score, streak, correct]);

  function usePowerup(type: 'halve' | 'freeze') {
    if (type === 'halve' && powerups.halve > 0) {
      const q = questions[qIndex];
      const wrongs = [0, 1, 2, 3].filter(i => i !== q.correctIndex);
      const remove = [wrongs[Math.floor(Math.random() * wrongs.length)], wrongs[Math.floor(Math.random() * 2) + 1]].slice(0, 2);
      setEliminated(remove);
      setPowerups(p => ({ ...p, halve: p.halve - 1 }));
    }
    if (type === 'freeze' && powerups.freeze > 0) {
      setFrozen(true);
      clearInterval(timerRef.current);
      setPowerups(p => ({ ...p, freeze: p.freeze - 1 }));
      setTimeout(() => setFrozen(false), 3000);
    }
  }

  const q = questions[qIndex];
  const timerPct = (timeLeft / TIME_EACH) * 100;
  const timerColor = timeLeft > 6 ? 'bg-emerald-400' : timeLeft > 3 ? 'bg-yellow-400' : 'bg-red-500';

  // ── LOADING ──
  if (phase === 'loading') return (
    <Overlay onClose={onClose}>   {/* ← this wraps in white card */}
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 size={40} className="animate-spin text-orange-400" />
        <p className="text-[#6B7280] text-sm font-semibold">Loading questions…</p>
      </div>
    </Overlay>
  );

  // ── INTRO ──
  if (phase === 'intro') return (
    <Overlay onClose={onClose}>
      <div className="text-center space-y-5 max-w-sm w-full">
        <div className="text-6xl">⚡</div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">Speed Blitz</h2>
          <p className="text-orange-500 font-bold text-sm mt-1">{subject}</p>
        </div>

        <div className="bg-[#F8F9FA] rounded-2xl p-4 text-left space-y-2.5 border border-[#E5E7EB]">
          {[
            '15 questions, 10 seconds each',
            'Correct answers build your combo multiplier',
            "Use power-ups wisely — they're limited",
            'Wrong answer resets your combo',
          ].map(r => (
            <div key={r} className="flex items-start gap-2 text-sm text-[#6B7280]">
              <span className="text-orange-400 mt-0.5 flex-shrink-0">▸</span>{r}
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3 border border-red-200">
            No questions found for {subject}. Try Mathematics or Physics.
          </p>
        )}

        <button
          disabled={questions.length === 0}
          onClick={() => { startTs.current = Date.now(); setPhase('playing'); }}
          className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-extrabold rounded-2xl text-base hover:brightness-105 transition shadow-md shadow-orange-200 disabled:opacity-30">
          Start Game! ⚡
        </button>
        <button onClick={onClose} className="text-[#9CA3AF] text-sm hover:text-[#111827] transition">
          Cancel
        </button>
      </div>
    </Overlay>
  );

  // ── RESULT ──
  if (phase === 'result') return (
    <Overlay onClose={onClose}>
      {!showLB ? (
        <div className="text-center space-y-5 max-w-sm w-full">
          <div className="text-5xl">{score >= 1000 ? '🏆' : score >= 500 ? '🥈' : '🥉'}</div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#111827]">
              {score >= 1000 ? 'Legendary!' : score >= 500 ? 'Great job!' : 'Good effort!'}
            </h2>
            <p className="text-[#9CA3AF] text-sm mt-1">Speed Blitz · {subject}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Score', value: score.toLocaleString('en-IN'), icon: '⚡', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-500' },
              { label: 'Accuracy', value: `${Math.round((correct / TOTAL_Q) * 100)}%`, icon: '🎯', bg: 'bg-green-50 border-green-200', text: 'text-green-600' },
              { label: 'Max Combo', value: `${maxStreak}×`, icon: '🔥', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-600' },
              { label: 'Rank', value: rank ? `#${rank}` : '…', icon: '🏅', bg: 'bg-violet-50 border-violet-200', text: 'text-violet-600' },
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
              className="flex-1 py-3 bg-white border-2 border-[#E5E7EB] rounded-xl text-[#111827] font-bold text-sm hover:border-orange-200 hover:bg-orange-50 transition flex items-center justify-center gap-1.5">
              <Trophy size={14} className="text-orange-400" /> Leaderboard
            </button>
            <button onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white font-extrabold text-sm hover:brightness-105 transition shadow-sm shadow-orange-200">
              Done ✓
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <button onClick={() => setShowLB(false)}
            className="text-[#9CA3AF] hover:text-[#111827] text-sm mb-4 flex items-center gap-1 transition">
            ← Back to results
          </button>
          <GameLeaderboard gameType="blitz" defaultSubject={subject} compact />
        </div>
      )}
    </Overlay>
  );

  // ── PLAYING ──
  return (
    <Overlay onClose={onClose} noClose>
      <div className="w-full max-w-xl space-y-4">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#6B7280] text-xs font-bold bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1 rounded-lg">
              {qIndex + 1} / {TOTAL_Q}
            </span>
            {comboLabel && (
              <span className="text-xs font-extrabold text-orange-500 animate-bounce bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                {comboLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-orange-500 font-extrabold text-lg leading-none">{score.toLocaleString()}</p>
              <p className="text-[#9CA3AF] text-[10px]">score</p>
            </div>
            {streak >= 2 && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                {comboMult(streak)}× COMBO
              </div>
            )}
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Timer bar */}
        <div className="relative h-2.5 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 ${timerColor} rounded-full transition-all duration-1000`}
            style={{ width: `${timerPct}%` }}
          />
          {frozen && (
            <div className="absolute inset-0 bg-sky-200/70 flex items-center justify-center">
              <span className="text-[10px] text-sky-700 font-bold">❄️ FROZEN</span>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-[#9CA3AF]">
          <span>{timeLeft}s remaining</span>
          <span>Streak: {streak} 🔥</span>
        </div>

        {/* Question card */}
        <div className={`relative bg-white border-2 rounded-2xl p-6 text-center min-h-[100px] flex items-center justify-center transition-all shadow-sm ${flash === 'correct' ? 'border-emerald-400 bg-emerald-50' :
          flash === 'wrong' ? 'border-red-400 bg-red-50 animate-shake' :
            'border-[#E5E7EB]'
          }`}>
          {floatPts.map(fp => (
            <div key={fp.id}
              className="absolute top-2 right-4 text-emerald-500 font-extrabold text-lg animate-float-up pointer-events-none">
              +{fp.val}
            </div>
          ))}
          <p className="text-[#111827] font-bold text-base leading-relaxed">{q?.question}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {q?.options.map((opt, i) => {
            const isElim = eliminated.includes(i);
            const isChosen = chosen === i;
            const isCorrect = chosen !== null && i === q.correctIndex;
            const isWrong = isChosen && i !== q.correctIndex;
            return (
              <button key={i}
                disabled={chosen !== null || isElim}
                onClick={() => handleAnswer(i, score, streak, correct)}
                className={`relative p-4 rounded-xl text-sm font-semibold border-2 transition-all text-left ${isElim ? 'opacity-25 bg-[#F8F9FA] border-[#E5E7EB] cursor-not-allowed' :
                  isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-700' :
                    isWrong ? 'bg-red-50 border-red-400 text-red-600' :
                      chosen !== null ? 'bg-[#F8F9FA] border-[#E5E7EB] text-[#9CA3AF]' :
                        'bg-white border-[#E5E7EB] text-[#111827] hover:border-orange-300 hover:bg-orange-50 active:scale-95'
                  }`}>
                <span className="text-[#9CA3AF] mr-2 text-xs font-mono">{['A', 'B', 'C', 'D'][i]}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Power-ups */}
        <div className="flex items-center gap-3 justify-center pt-1">
          <p className="text-[#9CA3AF] text-xs font-semibold">Power-ups:</p>
          <button
            disabled={powerups.halve === 0 || chosen !== null}
            onClick={() => usePowerup('halve')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${powerups.halve > 0
              ? 'bg-violet-50 border-violet-300 text-violet-600 hover:bg-violet-100'
              : 'opacity-30 bg-[#F8F9FA] border-[#E5E7EB] text-[#9CA3AF]'
              }`}>
            <Divide size={12} /> 50/50 ×{powerups.halve}
          </button>
          <button
            disabled={powerups.freeze === 0 || frozen || chosen !== null}
            onClick={() => usePowerup('freeze')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${powerups.freeze > 0
              ? 'bg-sky-50 border-sky-300 text-sky-600 hover:bg-sky-100'
              : 'opacity-30 bg-[#F8F9FA] border-[#E5E7EB] text-[#9CA3AF]'
              }`}>
            <Clock size={12} /> Freeze ×{powerups.freeze}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Overlay — light frosted glass ────────────────────────
function Overlay({ children, onClose, noClose }: {
  children: React.ReactNode;
  onClose: () => void;
  noClose?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-white/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={noClose ? undefined : onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] p-6 overflow-y-auto max-h-[90vh] flex flex-col items-center w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

