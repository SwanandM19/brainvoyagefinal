'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { X, Trophy, Loader2 } from 'lucide-react';
import GameLeaderboard from './GameLeaderboard';

interface Question { _id: string; question: string; options: string[]; correctIndex: number; }
interface Props { subject: string; onClose: () => void; }

const MAX_LIVES = 3;
const BASE_SPEED = 3500;

export default function DashGame({ subject, onClose }: Props) {
  const [phase, setPhase] = useState<'loading' | 'intro' | 'playing' | 'result'>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gateFlash, setGateFlash] = useState<'left' | 'right' | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [showLB, setShowLB] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  const [speed, setSpeed] = useState(BASE_SPEED);
  const [bgOffset, setBgOffset] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const bgRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTs = useRef(0);
  const answering = useRef(false);

  useEffect(() => {
    fetch(`/api/games/questions?subject=${encodeURIComponent(subject)}&count=30&gameType=dash`)
      .then(r => r.json())
      .then(d => { setQuestions(d.questions ?? []); setPhase('intro'); })
      .catch(() => setPhase('intro'));
  }, [subject]);

  const endGame = useCallback(async (finalLives: number, finalScore: number, finalCorrect: number, totalAnswered: number) => {
    clearInterval(timerRef.current);
    clearInterval(bgRef.current);
    setPhase('result');
    const timeTaken = Math.round((Date.now() - startTs.current) / 1000);
    try {
      const res = await fetch('/api/games/score', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'dash', subject,
          score: finalScore, streak: 0,
          questionsTotal: totalAnswered, questionsCorrect: finalCorrect,
          timeTaken,
        }),
      });
      const data = await res.json();
      if (res.ok) setRank(data.rank);
    } catch { /* silent */ }
  }, [subject]);

  const handleAnswer = useCallback((choiceIndex: number,
    curLives: number, curScore: number, curCorrect: number, curAnswered: number, curQIndex: number
  ) => {
    if (answering.current) return;
    answering.current = true;
    clearInterval(timerRef.current);

    const q = questions[curQIndex];
    const selectedOptionIndex = choiceIndex === 0 ? 0 : 1;
    const isCorrect = selectedOptionIndex === q.correctIndex;
    const newAnswered = curAnswered + 1;

    setGateFlash(choiceIndex === 0 ? 'left' : 'right');
    setFeedback(isCorrect ? 'correct' : 'wrong');

    let newLives = curLives;
    let newScore = curScore;
    let newCorrect = curCorrect;

    if (isCorrect) {
      newScore = curScore + 100 + Math.floor(speed / 100);
      newCorrect = curCorrect + 1;
    } else {
      newLives = curLives - 1;
    }

    setScore(newScore);
    setLives(newLives);
    setCorrect(newCorrect);
    setAnswered(newAnswered);
    setSpeed(s => Math.max(1000, s - (isCorrect ? 100 : 0)));

    setTimeout(() => {
      setFeedback(null);
      setGateFlash(null);
      answering.current = false;
      if (newLives <= 0 || curQIndex + 1 >= questions.length) {
        endGame(newLives, newScore, newCorrect, newAnswered);
      } else {
        setQIndex(curQIndex + 1);
        setTimeLeft(100);
        startTimer(newLives, newScore, newCorrect, newAnswered, curQIndex + 1);
      }
    }, 700);
  }, [questions, speed, endGame]);

  function startTimer(livesV: number, scoreV: number, correctV: number, answeredV: number, qIdxV: number) {
    clearInterval(timerRef.current);
    const step = 100 / (speed / 100);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0) {
          clearInterval(timerRef.current);
          handleAnswer(Math.random() > 0.5 ? 0 : 1, livesV, scoreV, correctV, answeredV, qIdxV);
          return 0;
        }
        return t - step;
      });
    }, 100);
  }

  function startGame() {
    startTs.current = Date.now();
    bgRef.current = setInterval(() => setBgOffset(o => (o + 3) % 100), 30);
    setPhase('playing');
    setTimeLeft(100);
    startTimer(MAX_LIVES, 0, 0, 0, 0);
  }

  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleAnswer(0, lives, score, correct, answered, qIndex);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleAnswer(1, lives, score, correct, answered, qIndex);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, lives, score, correct, answered, qIndex, handleAnswer]);

  const q = questions[qIndex];

  // ── LOADING ──
  if (phase === 'loading') return (
    <Overlay onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 size={40} className="animate-spin text-emerald-500" />
        <p className="text-[#6B7280] text-sm font-semibold">Loading questions…</p>
      </div>
    </Overlay>
  );

  // ── INTRO ──
  if (phase === 'intro') return (
    <Overlay onClose={onClose}>
      <div className="text-center space-y-5 w-full">
        <div className="text-6xl">🏃</div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">Infinite Dash</h2>
          <p className="text-emerald-600 font-bold text-sm mt-1">{subject}</p>
        </div>
        <div className="bg-[#F8F9FA] rounded-2xl p-4 text-left space-y-2.5 border border-[#E5E7EB]">
          {[
            'Questions appear as LEFT or RIGHT gates',
            'Press ← / → arrow keys or A / D to choose',
            'Wrong answer costs 1 life — you have 3',
            'Speed increases as you score more',
            'Last as long as possible!',
          ].map(r => (
            <div key={r} className="flex items-start gap-2 text-sm text-[#6B7280]">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0">▸</span>{r}
            </div>
          ))}
        </div>
        {questions.length === 0 && (
          <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3 border border-red-200">
            No questions found for {subject}.
          </p>
        )}
        <button
          disabled={questions.length === 0}
          onClick={startGame}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-2xl text-base hover:brightness-105 transition shadow-md shadow-emerald-200 disabled:opacity-30">
          Run! 🏃
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
          <div className="text-5xl">{lives > 0 ? '🏆' : '💀'}</div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#111827]">
              {lives > 0 ? `Finished! ${lives} lives left` : 'Wiped Out!'}
            </h2>
            <p className="text-[#9CA3AF] text-sm mt-1">Infinite Dash · {subject}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Score', value: score.toLocaleString(), icon: '⚡', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600' },
              { label: 'Answered', value: answered, icon: '❓', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-600' },
              { label: 'Accuracy', value: `${answered > 0 ? Math.round((correct / answered) * 100) : 0}%`, icon: '🎯', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-500' },
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
              className="flex-1 py-3 bg-white border-2 border-[#E5E7EB] rounded-xl text-[#111827] font-bold text-sm hover:border-emerald-200 hover:bg-emerald-50 transition flex items-center justify-center gap-1.5">
              <Trophy size={14} className="text-emerald-500" /> Leaderboard
            </button>
            <button onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white font-extrabold text-sm hover:brightness-105 transition shadow-sm shadow-emerald-200">
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
          <GameLeaderboard gameType="dash" defaultSubject={subject} compact />
        </div>
      )}
    </Overlay>
  );

  // ── PLAYING — full screen light ──
  const timerColor = timeLeft > 50 ? 'bg-emerald-400' : timeLeft > 20 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F9FA] overflow-hidden flex flex-col">

      {/* Scrolling track */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 60px, #111827 60px, #111827 62px)`,
          backgroundPositionX: `-${bgOffset}%`,
        }}
      />

      {/* Top HUD */}
      <div className="relative flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[#111827] font-extrabold text-lg">{score.toLocaleString()}</span>
          <span className="text-[#9CA3AF] text-xs font-semibold">pts</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span key={i} className={`text-xl transition-all ${i < lives ? 'opacity-100 scale-110' : 'opacity-20 grayscale'}`}>❤️</span>
          ))}
        </div>
        <button onClick={() => { clearInterval(timerRef.current); onClose(); }}
          className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition">
          <X size={16} />
        </button>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-[#E5E7EB]">
        <div
          className={`h-full transition-none ${timerColor}`}
          style={{ width: `${Math.max(0, timeLeft)}%` }}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 relative">

        {/* Feedback overlay */}
        {feedback && (
          <div className={`absolute inset-0 pointer-events-none transition-all flex items-center justify-center ${feedback === 'correct' ? 'bg-emerald-500/8' : 'bg-red-500/8'
            }`}>
            <span className="text-6xl animate-bounce">
              {feedback === 'correct' ? '✅' : '❌'}
            </span>
          </div>
        )}

        {/* Question card */}
        <div className="relative bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 max-w-lg w-full text-center shadow-sm">
          <p className="text-[#9CA3AF] text-xs font-extrabold uppercase tracking-widest mb-2">
            Question {answered + 1}
          </p>
          <p className="text-[#111827] font-bold text-base sm:text-lg leading-relaxed">{q?.question}</p>
        </div>

        {/* Runner */}
        <div className={`text-5xl select-none transition-all ${feedback === 'correct' ? 'translate-x-4 scale-110' :
            feedback === 'wrong' ? '-translate-x-2 opacity-50' :
              'animate-bounce'
          }`}>
          🏃
        </div>

        {/* Gates */}
        <div className="flex gap-4 w-full max-w-lg">
          {[0, 1].map((side) => {
            const isLeft = side === 0;
            const opt = q?.options[side];
            const isFlash = gateFlash === (isLeft ? 'left' : 'right');
            const isCorrect = isFlash && feedback === 'correct';
            const isWrong = isFlash && feedback === 'wrong';
            return (
              <button key={side}
                onClick={() => handleAnswer(side, lives, score, correct, answered, qIndex)}
                disabled={!!feedback}
                className={`flex-1 relative py-6 rounded-2xl border-2 font-bold text-base transition-all active:scale-95 ${isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-700 scale-105' :
                    isWrong ? 'bg-red-50 border-red-400 text-red-600 animate-shake' :
                      'bg-white border-[#E5E7EB] text-[#111827] hover:border-emerald-300 hover:bg-emerald-50 shadow-sm'
                  }`}>
                <div className="text-2xl mb-1">{isLeft ? '◀' : '▶'}</div>
                <div className="text-xs text-[#9CA3AF] font-bold mb-2">{isLeft ? '← Left' : 'Right →'}</div>
                <div className="text-sm px-2">{opt}</div>
              </button>
            );
          })}
        </div>

        {/* Keyboard hint */}
        <p className="text-[#9CA3AF] text-xs">
          Press{' '}
          <kbd className="bg-[#F3F4F6] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[10px] font-mono text-[#374151]">←</kbd>
          {' '}or{' '}
          <kbd className="bg-[#F3F4F6] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[10px] font-mono text-[#374151]">→</kbd>
          {' '}to answer
        </p>
      </div>

      {/* Progress */}
      <div className="px-6 py-3 border-t border-[#E5E7EB] bg-white">
        <div className="flex justify-between text-xs text-[#9CA3AF] font-semibold mb-1.5">
          <span>Progress</span>
          <span>{answered} answered</span>
        </div>
        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
            style={{ width: `${(qIndex / questions.length) * 100}%` }} />
        </div>
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
