"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen, Trophy, Users, Play, ArrowRight,
  CheckCircle, Zap, Shield, Globe, ChevronRight, Heart, Sun, Moon, Star, Menu, X,
} from "lucide-react";

import LanguageSelector from '@/components/FloatingLanguageSwitcher';
import Logo from '@/components/layout/Logo';
import Image from 'next/image'

/* ─── THEME ─────────────────────────────── */
function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

/* ─── SMOOTH CURSOR ─────────────────────── */
function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer:coarse)").matches) return;
    let mx = -200, my = -200, rx = -200, ry = -200, raf = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);
    const tick = () => {
      rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
      if (dot.current) dot.current.style.transform = `translate(${mx - 4}px,${my - 4}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx - 20}px,${ry - 20}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div ref={dot} className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#f97316] pointer-events-none z-[999] mix-blend-difference" style={{ transition: "opacity 0.2s" }} />
      <div ref={ring} className="fixed top-0 left-0 w-10 h-10 rounded-full border border-[#f97316]/40 pointer-events-none z-[998]" style={{ transition: "transform 0.08s" }} />
    </>
  );
}

/* ─── NOISE CANVAS ──────────────────────── */
function Grain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const draw = () => {
      c.width = 300; c.height = 300;
      const d = ctx.createImageData(300, 300);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255;
        d.data[i] = d.data[i+1] = d.data[i+2] = v;
        d.data[i+3] = 12;
      }
      ctx.putImageData(d, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={ref}
      className="fixed inset-0 w-full h-full pointer-events-none z-[2] opacity-[0.35]"
      style={{ imageRendering: "pixelated", mixBlendMode: "soft-light" }} />
  );
}

/* ─── FLOATING HEARTS ───────────────────── */
interface HItem { id: number; x: number; }
function FloatingHeart({ id, x, onDone }: { id: number; x: number; onDone: (id: number) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const colors = ["#f97316","#ef4444","#ec4899","#a855f7","#facc15"];
    const c = colors[id % colors.length];
    const dx = (Math.random() - 0.5) * 90;
    el.style.cssText = `position:absolute;bottom:65px;left:${x}%;font-size:${14+Math.random()*10}px;color:${c};pointer-events:none;will-change:transform,opacity;z-index:30;`;
    let raf = 0, t0: number|null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 2100, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.style.transform = `translate(${dx*e}px,${-210*e}px) scale(${1+e*0.4})`;
      el.style.opacity = p < 0.6 ? "1" : `${1-(p-0.6)/0.4}`;
      if (p < 1) raf = requestAnimationFrame(tick); else onDone(id);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span ref={ref}>❤️</span>;
}

/* ─── COMMENTS DATA ─────────────────────── */
const CMTS = [
  { u: "beta_tester", t: "Incredible pacing! 🔥", c: "#f97316" },
  { u: "neo_learn", t: "Can we get the notes?", c: "#a855f7" },
  { u: "alpha_mind", t: "Why divide by 0 😂", c: "#ec4899" },
  { u: "study_grind", t: "Unlocked my brain 🧠", c: "#3b82f6" },
  { u: "class10cbse", t: "Pls do thermodynamics next!", c: "#22c55e" },
  { u: "toppr_fan", t: "Better than coaching 💯", c: "#f97316" },
  { u: "maths_nerd", t: "Brain = expanded 🤯", c: "#a855f7" },
  { u: "priya_s", t: "Sharing with my class!", c: "#ec4899" },
  { u: "rank1", t: "Watching before boards 📚", c: "#3b82f6" },
  { u: "curious", t: "Slow down at 2:14 🙏", c: "#22c55e" },
  { u: "phy_lover", t: "Best explanation ever!", c: "#f97316" },
  { u: "topper_26", t: "Scored 98% because of this!", c: "#a855f7" },
  { u: "aarav_m", t: "Legend 🙌", c: "#ec4899" },
  { u: "diya_s", t: "FINALLY understand this!!", c: "#3b82f6" },
];

// ✅ FIX: Pre-compute EQ bar data OUTSIDE component so server & client produce identical values
// This prevents the hydration mismatch caused by floating-point precision differences
const EQ_BARS = Array.from({ length: 80 }).map((_, i) => ({
  height: `${(15 + Math.abs(Math.sin(i * 0.42) * 55 + Math.cos(i * 0.78) * 22)).toFixed(4)}%`,
  bg: i % 2 ? "rgba(168,85,247,0.55)" : "rgba(249,115,22,0.65)",
  anim: `eq ${0.42 + (i % 6) * 0.11}s ease-in-out ${(i * 0.033).toFixed(2)}s infinite alternate`,
}));

/* ─── LIVE CARD ─────────────────────────── */
function LiveCard({ dark }: { dark: boolean }) {
  const [cmts, setCmts] = useState(CMTS.slice(0, 5));
  const [hearts, setHearts] = useState<HItem[]>([]);
  const [likes, setLikes] = useState(1247);
  const [playing, setPlaying] = useState(true);
  const hid = useRef(0); const ci = useRef(5);

  useEffect(() => {
    const cInt = setInterval(() => { const n = CMTS[ci.current++ % CMTS.length]; setCmts((p) => [...p.slice(-6), n]); }, 1100);
    const hInt = setInterval(() => {
      if (Math.random() > 0.2) { const id = hid.current++; setHearts((h) => [...h.slice(-12), { id, x: 10 + Math.random() * 75 }]); setLikes((l) => l + Math.floor(Math.random() * 4 + 1)); }
    }, 650);
    return () => { clearInterval(cInt); clearInterval(hInt); };
  }, []);
  const removeHeart = useCallback((id: number) => setHearts((h) => h.filter((x) => x.id !== id)), []);
  const tapHeart = () => { const id = hid.current++; setHearts((h) => [...h, { id, x: 45 }]); setLikes((l) => l + 1); };

  const bg = dark ? "#0c0c18" : "#fff";
  const bd = dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const cmtBg = dark ? "rgba(255,255,255,0.025)" : "#f8f9fb";
  const tP = dark ? "#fff" : "#0a0a0a";
  const tM = dark ? "rgba(255,255,255,0.42)" : "#6b7280";

  return (
    <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${bd}`, background: bg, boxShadow: dark ? "0 0 100px rgba(249,115,22,0.15), 0 40px 80px rgba(0,0,0,0.6)" : "0 20px 60px rgba(0,0,0,0.1)" }}>
      {/* Video */}
      <div style={{ position: "relative", paddingBottom: "44%", overflow: "hidden", background: "linear-gradient(135deg,#0b0620 0%,#1a0a35 55%,#0f1825 100%)" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.28),rgba(168,85,247,0.22),transparent 68%)", filter: "blur(50px)" }} />
          {/* ✅ FIXED EQ Bars — uses pre-computed EQ_BARS constant */}
          <div style={{ position: "absolute", bottom: 58, left: 16, right: 16, display: "flex", alignItems: "flex-end", gap: 1.5, height: 52, overflow: "hidden" }}>
            {EQ_BARS.map((bar, i) => (
              <div key={i} style={{ flex: 1, borderRadius: 2, background: bar.bg, height: bar.height, animation: bar.anim }} />
            ))}
          </div>
          {/* Teacher badge */}
          <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", borderRadius: 12, padding: "8px 14px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#fff" }}>AK</div>
            <div>
              <p style={{ color: "#fff", fontSize: 12, fontWeight: 900, margin: 0 }}>Dr. Aryan Kapoor</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, margin: 0 }}>Physics · Class 12 CBSE</p>
            </div>
          </div>
          {/* Badges */}
          <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8 }}>
            <span style={{ background: "rgba(220,38,38,0.88)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "5px 10px", fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: "0.15em", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", animation: "blink 1s ease infinite" }} />LIVE
            </span>
            <span style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "5px 10px", fontSize: 10, fontWeight: 700, color: "#fff", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "blink 1.4s ease infinite" }} />1.2k
            </span>
          </div>
          {/* Play / Pause */}
          <button onClick={() => setPlaying((p) => !p)}
            style={{ position: "relative", zIndex: 20, width: 62, height: 62, borderRadius: "50%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.18s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
            {playing ? <><div style={{ width: 5, height: 22, background: "#fff", borderRadius: 2, marginRight: 4 }} /><div style={{ width: 5, height: 22, background: "#fff", borderRadius: 2 }} /></> : <Play size={20} fill="#fff" color="#fff" style={{ marginLeft: 3 }} />}
          </button>
          {/* Topic */}
          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, background: "rgba(0,0,0,0.68)", backdropFilter: "blur(14px)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "#fff", fontSize: 12, fontWeight: 900, margin: 0 }}>⚛ Quantum Thermodynamics — Ch. 3</p>
              <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 10, margin: 0 }}>Entropy & second law · 8.4 min</p>
            </div>
            <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map((s) => <Star key={s} size={9} fill="#facc15" color="#facc15" />)}</div>
          </div>
          {/* Hearts */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 30 }}>
            {hearts.map((h) => <FloatingHeart key={h.id} id={h.id} x={h.x} onDone={removeHeart} />)}
          </div>
        </div>
      </div>
      {/* Bottom row */}
      <div style={{ display: "flex", flexDirection: "row" }}>
        {/* Comments */}
        <div style={{ flex: 1, position: "relative", background: cmtBg, padding: "12px 14px", minHeight: 190, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 28, background: dark ? `linear-gradient(${bg},transparent)` : "linear-gradient(#f8f9fb,transparent)", zIndex: 5, pointerEvents: "none" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {cmts.map((c, i) => (
              <div key={`${c.u}${i}`} style={{ display: "flex", gap: 8, animation: i === cmts.length - 1 ? "slideUp 0.3s ease forwards" : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: c.c, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff" }}>{c.u[0].toUpperCase()}</div>
                <p style={{ fontSize: 12, lineHeight: 1.4, margin: 0 }}>
                  <span style={{ fontWeight: 900, color: c.c }}>[{c.u}]</span>{" "}
                  <span style={{ color: tM }}>{c.t}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Right */}
        <div style={{ width: 155, borderLeft: `1px solid ${bd}`, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 900, color: tM, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>Reactions</p>
            {[["🔥","2.4k"],["🤯","1.1k"],["💡","987"]].map(([e,v]) => (
              <div key={v} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 14 }}>{e}</span>
                <span style={{ fontSize: 11, fontWeight: 900, color: tM }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={tapHeart}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0", borderRadius: 14, background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", cursor: "pointer", transition: "transform 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
            <Heart size={18} fill="#f97316" color="#f97316" />
            <span style={{ fontSize: 13, fontWeight: 900, color: "#f97316" }}>{likes.toLocaleString()}</span>
            <span style={{ fontSize: 9, fontWeight: 900, color: tM, textTransform: "uppercase", letterSpacing: "0.12em" }}>React</span>
          </button>
        </div>
      </div>
      {/* Input */}
      <div style={{ display: "flex", gap: 10, padding: "10px 14px", borderTop: `1px solid ${bd}` }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff" }}>Y</div>
        <div style={{ flex: 1, borderRadius: 10, padding: "7px 12px", fontSize: 12, color: tM, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", cursor: "text" }}>Ask a question...</div>
        <button style={{ fontSize: 12, fontWeight: 900, color: "#fff", background: "linear-gradient(135deg,#f97316,#a855f7)", borderRadius: 10, padding: "7px 14px", cursor: "pointer", border: "none" }}>Send</button>
      </div>
      <style jsx>{`
        @keyframes eq { from{transform:scaleY(0.12)} to{transform:scaleY(1)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

/* ─── DYNAMIC LEADERBOARD ───────────────── */
interface LBEntry { rank: number; name: string; cls: string; pts: string; medal: string | null; }

function DynamicLeaderboard({ dark }: { dark: boolean }) {
  const [entries, setEntries] = useState<LBEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const tP  = dark ? "#ffffff" : "#08080f";
  const tM  = dark ? "rgba(255,255,255,0.4)" : "#6b7280";
  const cBg = dark ? "rgba(255,255,255,0.04)" : "#fff";
  const cBd = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    fetch("/api/public/leaderboard")
      .then((r) => r.json())
      .then((data: any[]) => {
        setEntries(data.map((s, i) => ({
          rank: i + 1,
          name: s.name,
          cls: s.studentClass ?? s.cls ?? "",
          pts: Number(s.points).toLocaleString("en-IN"),
          medal: i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null,
        })));
        setLoading(false);
      })
      .catch(() => {
        setEntries([
          { rank: 1, name: "Aarav Mehta",  cls: "Class 7",  pts: "12,450", medal: "🥇" },
          { rank: 2, name: "Diya Sharma",  cls: "Class 10", pts: "11,230", medal: "🥈" },
          { rank: 3, name: "Arjun Patel",  cls: "Class 8",  pts: "10,890", medal: "🥉" },
          { rank: 4, name: "Sneha Reddy",  cls: "Class 9",  pts: "9,640",  medal: null },
          { rank: 5, name: "Rohan Verma",  cls: "Class 6",  pts: "8,910",  medal: null },
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ height: 68, borderRadius: 18, background: cBg, border: `1px solid ${cBd}`, animation: "lbpulse 1.5s ease infinite", opacity: 0.6 }} />
      ))}
      <style jsx>{`@keyframes lbpulse { 0%,100%{opacity:0.6} 50%{opacity:0.3} }`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {entries.map((item) => (
        <div key={item.rank} className="lbr"
          style={{ display: "flex", alignItems: "center", gap: 14, borderRadius: 18, padding: "14px 18px",
            background: item.rank <= 3 ? (dark ? "rgba(249,115,22,0.07)" : "rgba(249,115,22,0.06)") : cBg,
            border: `1px solid ${item.rank <= 3 ? "rgba(249,115,22,0.2)" : cBd}`, transition: "box-shadow 0.2s, border-color 0.2s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(249,115,22,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(249,115,22,0.38)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.borderColor = item.rank <= 3 ? "rgba(249,115,22,0.2)" : cBd; }}>
          <div style={{ width: 30, textAlign: "center", fontSize: item.medal ? 20 : 13, fontWeight: 900, color: tM }}>{item.medal ?? `#${item.rank}`}</div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: "#fff", flexShrink: 0 }}>
            {item.name.split(" ").map((x) => x[0]).join("")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 900, fontSize: 14, color: tP, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
            <p style={{ fontSize: 11, color: tM, margin: 0 }}>{item.cls}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontWeight: 900, fontSize: 13, color: "#f97316", margin: 0 }}>{item.pts}</p>
            <p style={{ fontSize: 9, color: tM, textTransform: "uppercase", fontWeight: 900, letterSpacing: "0.1em", margin: 0 }}>pts</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN ──────────────────────────────── */
export default function LandingPage() {
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState<"student"|"teacher">("student");
  const [mobileMenu, setMobileMenu] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const kills: (() => void)[] = [];
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      gsap.to(progressRef.current, { scaleX: 1, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0.1 } });

      const htl = gsap.timeline({ delay: 0.1, defaults: { ease: "power4.out" } });
      htl
        .fromTo(".h-tag", { opacity: 0, y: 12, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 })
        .fromTo(".h-line", { y: "102%", opacity: 0 }, { y: "0%", opacity: 1, duration: 0.8, stagger: 0.1 }, "-=0.3")
        .fromTo(".h-sub", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
        .fromTo(".h-cta", { opacity: 0, y: 16, scale: 0.93 }, { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.55 }, "-=0.35")
        .fromTo(".h-trust", { opacity: 0, x: -12 }, { opacity: 1, x: 0, stagger: 0.07, duration: 0.5 }, "-=0.3")
        .fromTo(".h-stat", { opacity: 0, y: 20, scale: 0.87 }, { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.5 }, "-=0.4");

      gsap.to(".hb1", { y: -120, ease: "none", scrollTrigger: { trigger: ".hsec", start: "top top", end: "bottom top", scrub: 1.5 } });
      gsap.to(".hb2", { y: -70, x: 30, ease: "none", scrollTrigger: { trigger: ".hsec", start: "top top", end: "bottom top", scrub: 2 } });
      gsap.to(".hb3", { y: -40, ease: "none", scrollTrigger: { trigger: ".hsec", start: "top top", end: "bottom top", scrub: 2.5 } });
      gsap.to(".hcont", { y: -30, ease: "none", scrollTrigger: { trigger: ".hsec", start: "top top", end: "bottom top", scrub: 0.7 } });

      document.querySelectorAll(".swrev").forEach((el) => {
        const ws = el.querySelectorAll(".sw");
        if (!ws.length) return;
        const ctx = gsap.context(() => {
          gsap.fromTo(ws, { y: "105%", opacity: 0 }, { y: "0%", opacity: 1, duration: 0.65, stagger: 0.06, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" } });
        });
        kills.push(() => ctx.revert());
      });

      document.querySelectorAll(".sfade").forEach((el) => {
        const ctx = gsap.context(() => {
          gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 87%", toggleActions: "play none none reverse" } });
        });
        kills.push(() => ctx.revert());
      });

      const lCtx = gsap.context(() => {
        gsap.fromTo(".lcard", { opacity: 0, y: 80, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, ease: "power3.out",
          scrollTrigger: { trigger: ".lcard", start: "top 85%", end: "top 38%", scrub: 1.2, toggleActions: "play none none reverse" } });
      });
      kills.push(() => lCtx.revert());

      document.querySelectorAll(".fc").forEach((card) => {
        const el = card as HTMLElement;
        const ctx = gsap.context(() => {
          gsap.fromTo(el, { opacity: 0, y: 60, scale: 0.91 }, { opacity: 1, y: 0, scale: 1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 91%", end: "top 58%", scrub: 0.9, toggleActions: "play none none reverse" } });
        });
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(600px) rotateY(${x*14}deg) rotateX(${-y*14}deg) scale(1.03)`;
          const glare = el.querySelector(".glare") as HTMLElement|null;
          if (glare) { glare.style.opacity = "1"; glare.style.background = `radial-gradient(circle at ${(e.clientX - r.left).toFixed(0)}px ${(e.clientY - r.top).toFixed(0)}px, rgba(255,255,255,0.18) 0%, transparent 70%)`; }
        };
        const onLeave = () => { el.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)"; const glare = el.querySelector(".glare") as HTMLElement|null; if (glare) glare.style.opacity = "0"; };
        el.addEventListener("mousemove", onMove as any);
        el.addEventListener("mouseleave", onLeave);
        kills.push(() => { ctx.revert(); el.removeEventListener("mousemove", onMove as any); el.removeEventListener("mouseleave", onLeave); });
      });

      const sCtx = gsap.context(() => {
        gsap.fromTo(".snode", { opacity: 0, scale: 0, x: -15 }, { opacity: 1, scale: 1, x: 0, stagger: 0.14, ease: "back.out(1.6)",
          scrollTrigger: { trigger: ".stepswrap", start: "top 78%", end: "bottom 60%", scrub: 1, toggleActions: "play none none reverse" } });
        gsap.fromTo(".stxt", { opacity: 0, x: 28 }, { opacity: 1, x: 0, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: ".stepswrap", start: "top 75%", end: "bottom 58%", scrub: 1, toggleActions: "play none none reverse" } });
        gsap.fromTo(".sline", { scaleY: 0, transformOrigin: "top" }, { scaleY: 1, ease: "none",
          scrollTrigger: { trigger: ".stepswrap", start: "top 68%", end: "bottom 50%", scrub: 1.2 } });
      });
      kills.push(() => sCtx.revert());

      document.querySelectorAll(".lbr").forEach((row) => {
        const ctx = gsap.context(() => {
          gsap.fromTo(row, { opacity: 0, x: 55, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 89%", end: "top 56%", scrub: 0.8, toggleActions: "play none none reverse" } });
        });
        kills.push(() => ctx.revert());
      });

      document.querySelectorAll(".ctael").forEach((el, i) => {
        const ctx = gsap.context(() => {
          gsap.fromTo(el, { opacity: 0, y: 35, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, ease: "power3.out", delay: i * 0.1,
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" } });
        });
        kills.push(() => ctx.revert());
      });

      document.querySelectorAll(".bmag").forEach((btn) => {
        const el = btn as HTMLElement;
        const onM = (e: MouseEvent) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX-r.left-r.width/2)*0.27, y: (e.clientY-r.top-r.height/2)*0.27, duration: 0.22, ease: "power2.out" }); };
        const onL = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.38)" });
        el.addEventListener("mousemove", onM as any); el.addEventListener("mouseleave", onL);
        kills.push(() => { el.removeEventListener("mousemove", onM as any); el.removeEventListener("mouseleave", onL); });
      });

      ScrollTrigger.refresh();
    })();
    return () => kills.forEach((f) => f());
  }, []);

  const bg  = dark ? "#05050b" : "#f8f9fb";
  const tP  = dark ? "#ffffff" : "#08080f";
  const tM  = dark ? "rgba(255,255,255,0.4)" : "#6b7280";
  const cBg = dark ? "rgba(255,255,255,0.04)" : "#fff";
  const cBd = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const sBg = dark ? "rgba(255,255,255,0.022)" : "#fff";
  const sBd = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const T = tab === "student" ? {
    col: "#f97316", lbl: "For Students", head: "Learn smarter, not harder",
    desc: "Board-filtered micro-videos, national leaderboard, India's best teachers — curated for your class.",
    steps: [
      { icon: "👤", n: "01", t: "Create your profile", d: "Sign up free, select class and board. No credit card." },
      { icon: "🔍", n: "02", t: "Discover teachers", d: "Browse verified teachers by subject, board, class." },
      { icon: "🏆", n: "03", t: "Learn & compete", d: "Watch videos, earn badges, climb the national leaderboard." },
    ],
  } : {
    col: "#a855f7", lbl: "For Teachers", head: "Build your national presence",
    desc: "Upload 2–5 min videos, gain national followers, rank on India's first academic teacher leaderboard.",
    steps: [
      { icon: "✅", n: "01", t: "Apply & get verified", d: "Submit profile. Admin team verifies credentials." },
      { icon: "📹", n: "02", t: "Upload & tag content", d: "Share memory tricks tagged by class, board, subject." },
      { icon: "📈", n: "03", t: "Grow your audience", d: "Gain followers, earn national rankings by engagement." },
    ],
  };

  const W = ({ text, color }: { text: string; color?: string }) => (
    <>{text.split(" ").map((w, i) => (
      <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.22em" }}>
        <span className="sw" style={{ display: "inline-block", color }}>{w}</span>
      </span>
    ))}</>
  );

  const FEATURES = [
    { icon: <BookOpen size={22}/>, t: "Board-Filtered Content", d: "CBSE, ICSE, State Boards, 50+ categories. Zero irrelevant content.", glow: "#f97316", border: "rgba(249,115,22,0.25)" },
    { icon: <Trophy size={22}/>, t: "National Leaderboard", d: "Students compete by points & badges. Teachers rank by engagement.", glow: "#eab308", border: "rgba(234,179,8,0.25)" },
    { icon: <Zap size={22}/>, t: "Academic Games", d: "Memory challenges, quiz battles, speed-solving — earn XP.", glow: "#a855f7", border: "rgba(168,85,247,0.25)" },
    { icon: <Shield size={22}/>, t: "AI Moderation", d: "Every upload and comment AI-screened. Safe & academic.", glow: "#22c55e", border: "rgba(34,197,94,0.25)" },
    { icon: <Users size={22}/>, t: "Teacher Channels", d: "Follow teachers, get notifications, build your learning feed.", glow: "#3b82f6", border: "rgba(59,130,246,0.25)" },
    { icon: <Globe size={22}/>, t: "Tier II & III Focus", d: "Surface talented teachers from every corner of India.", glow: "#ec4899", border: "rgba(236,72,153,0.25)" },
  ];

  const FOOTER_PLATFORM: [string, string][] = [
    ["For Students",    "#students"],
    ["For Teachers",    "#students"],
    ["Leaderboard",     "#leaderboard"],
    ["Academic Games",  "/student/games"],
  ];
  const FOOTER_LEGAL: [string, string][] = [
    ["Privacy Policy",   "/privacy"],
    ["Terms of Service", "/terms"],
    ["Contact Us",       "mailto:team@servexai.in"],
    ["Help Centre",      "/help"],
  ];
  const SOCIAL: [string, string][] = [
    ["Twitter",   "https://twitter.com/vidyasangrah"],
    ["LinkedIn",  "https://linkedin.com/company/vidyasangrah"],
    ["Instagram", "https://instagram.com/vidyasangrah"],
    ["YouTube",   "https://youtube.com/@vidyasangrah"],
  ];

  const NAV_LINKS: [string, string][] = [
    ["Students",    "#students"],
    ["Teachers",    "#students"],
    ["Leaderboard", "#leaderboard"],
    ["About",       "#about"],
  ];

  return (
    <div style={{ background: bg, minHeight: "100vh", overflowX: "hidden", transition: "background 0.5s" }}>
      <Cursor />
      <Grain />

      {/* Progress */}
      <div ref={progressRef} style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#f97316,#a855f7,#ec4899)", transformOrigin: "left", transform: "scaleX(0)", zIndex: 500 }} />

      {/* ── NAV ── */}
     <nav
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    background: dark
      ? "rgba(5,5,11,0.85)"
      : "rgba(248,249,251,0.88)",
    backdropFilter: "blur(28px)",
    borderBottom: `1px solid ${sBd}`,
    transition: "all 0.5s"
  }}
>
  <div
    style={{
      maxWidth: 1200,
      margin: "0 auto",
      padding: "0 24px",
      height: 100, // ⬅ increased navbar height
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}
  >
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src="/mainlogo.png"
        alt="VidyaSangrah"
        style={{
          height: 400, // ⬅ increased logo size
          width: 200,
          objectFit: "contain"
        }}
      />
    </div>
    {/* <Logo size="sm" /> */}

    {/* Desktop Navigation Links */}
    <div
      className="nav-links"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 32 // slightly increased spacing
      }}
    >
      {NAV_LINKS.map(([label, href]) => (
        <a
          key={label}
          href={href}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: tM,
            textDecoration: "none",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "#f97316")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = tM)
          }
        >
          {label}
        </a>
      ))}
    </div>

    {/* Right Section */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12
      }}
    >
      {/* CTA Button */}
      <Link
        href="/auth/login"
        className="bmag nav-cta"
        style={{
          background: "#f97316",
          color: "#fff",
          fontSize: 14,
          fontWeight: 900,
          padding: "10px 24px", // ⬅ slightly larger button
          borderRadius: 99,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          textDecoration: "none",
          boxShadow: "0 0 24px rgba(249,115,22,0.38)",
          transition: "opacity 0.2s"
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as any).style.opacity = "0.85")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as any).style.opacity = "1")
        }
      >
        Get Started <ArrowRight size={14} />
      </Link>

      {/* Mobile Hamburger */}
      <button
        className="hamburger"
        onClick={() => setMobileMenu((v) => !v)}
        style={{
          display: "none",
          width: 38,
          height: 38,
          borderRadius: 8,
          border: `1px solid ${cBd}`,
          background: "transparent",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: tP
        }}
      >
        {mobileMenu ? <X size={18} /> : <Menu size={18} />}
      </button>
    </div>
  </div>

  {/* Mobile Menu */}
  {mobileMenu && (
    <div
      style={{
        background: dark
          ? "rgba(5,5,11,0.97)"
          : "rgba(248,249,251,0.97)",
        backdropFilter: "blur(28px)",
        borderTop: `1px solid ${sBd}`,
        padding: "16px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 4
      }}
    >
      {NAV_LINKS.map(([label, href]) => (
        <a
          key={label}
          href={href}
          onClick={() => setMobileMenu(false)}
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: tP,
            textDecoration: "none",
            padding: "12px 0",
            borderBottom: `1px solid ${sBd}`
          }}
        >
          {label}
        </a>
      ))}

      <Link
        href="/auth/login"
        onClick={() => setMobileMenu(false)}
        style={{
          marginTop: 12,
          background: "#f97316",
          color: "#fff",
          fontWeight: 900,
          fontSize: 14,
          padding: "14px 0",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          textDecoration: "none"
        }}
      >
        Get Started <ArrowRight size={14} />
      </Link>
    </div>
  )}
</nav>

      {/* ── HERO ── */}
      <section className="hsec" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingTop: 60 }}>
        <div className="hb1" style={{ position: "absolute", top: "-20%", right: "-12%", width: 750, height: 750, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.22) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div className="hb2" style={{ position: "absolute", bottom: "-25%", left: "-12%", width: 650, height: 650, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.18) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div className="hb3" style={{ position: "absolute", top: "30%", left: "40%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(${dark?"rgba(255,255,255,0.028)":"rgba(0,0,0,0.03)"} 1px,transparent 1px),linear-gradient(90deg,${dark?"rgba(255,255,255,0.028)":"rgba(0,0,0,0.03)"} 1px,transparent 1px)`, backgroundSize: "72px 72px" }} />

        <div className="hcont" style={{ position: "relative", zIndex: 10, maxWidth: 1050, margin: "0 auto", padding: "80px 28px", textAlign: "center", width: "100%" }}>
          {/* <div className="h-tag" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 99, border: `1px solid ${cBd}`, background: cBg, marginBottom: 32, fontSize: 12, fontWeight: 700, color: tM }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "blink 1.4s ease infinite" }} />
            India's #1 Academic Community · 250M+ Students
          </div> */}

          <h1 style={{ margin: "0 0 16px", padding: 0, lineHeight: 1.0, fontWeight: 900, letterSpacing: "-0.035em", fontSize: "clamp(1.8rem, 5.5vw, 4.5rem)", color: tP }}>
            <div style={{ overflow: "hidden" }}><span className="h-line" style={{ display: "inline-block" }}>Where India's</span></div>
            <div style={{ overflow: "hidden" }}><span className="h-line" style={{ display: "inline-block", color: "#f97316" }}>Best Teachers</span></div>
            <div style={{ overflow: "hidden" }}><span className="h-line" style={{ display: "inline-block" }}>Meet Brightest</span></div>
            <div style={{ overflow: "hidden" }}><span className="h-line" style={{ display: "inline-block", color: dark ? "#c084fc" : "#9333ea" }}>Students</span></div>
          </h1>

          <p className="h-sub" style={{ fontSize: "clamp(0.85rem, 1.5vw, 1rem)", color: tM, maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Discover top teachers, board-filtered micro-videos, national leaderboards — all in one structured community.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 44 }}>
            <Link href="/auth/login" className="h-cta bmag"
              style={{ background: "#f97316", color: "#fff", fontWeight: 900, fontSize: 15, padding: "15px 38px", borderRadius: 16, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", boxShadow: "0 0 55px rgba(249,115,22,0.5), 0 4px 22px rgba(249,115,22,0.3)" }}>
              Start Learning Free <ArrowRight size={17} />
            </Link>
            <Link href="/auth/login?role=teacher" className="h-cta bmag"
              style={{ border: `1px solid ${cBd}`, color: tP, fontWeight: 900, fontSize: 15, padding: "15px 38px", borderRadius: 16, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: cBg, transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as any).style.borderColor = "#f97316"; (e.currentTarget as any).style.color = "#f97316"; }}
              onMouseLeave={(e) => { (e.currentTarget as any).style.borderColor = cBd; (e.currentTarget as any).style.color = tP; }}>
              <BookOpen size={17} /> Join as Teacher
            </Link>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 22, marginBottom: 60 }}>
            {["Free to join","Verified teachers","AI moderated","50+ Boards"].map((t) => (
              <div key={t} className="h-trust" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} color="#22c55e" />
                <span style={{ fontSize: 13, fontWeight: 600, color: tM }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", maxWidth: 620, margin: "0 auto", border: `1px solid ${cBd}`, borderRadius: 20, overflow: "hidden" }}>
            {[{ v: "15M+", l: "Teachers" },{ v: "250M+", l: "Students" },{ v: "1,000+", l: "Educators" },{ v: "50+", l: "Boards" }].map((s, i) => (
              <div key={s.l} className="h-stat" style={{ padding: "16px 10px", textAlign: "center", background: cBg, borderRight: i < 3 ? `1px solid ${cBd}` : "none" }}>
                <div style={{ fontSize: "clamp(1.2rem,3vw,2rem)", fontWeight: 900, color: "#f97316" }}>{s.v}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: tM, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ borderTop: `1px solid ${sBd}`, borderBottom: `1px solid ${sBd}`, overflow: "hidden", padding: "11px 0" }}>
        <div style={{ display: "flex", gap: 36, whiteSpace: "nowrap", animation: "marquee 24s linear infinite" }}>
          {[...Array(3)].flatMap((_, ai) =>
            ["CBSE","ICSE","JEE","NEET","UPSC","State Boards","Class 6-12","Verified Teachers","Leaderboard","Academic Games"].map((item, ii) => (
              <span key={`${ai}${ii}`} style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em", color: dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.17)", flexShrink: 0 }}>
                {item}<span style={{ color: "#f97316", margin: "0 12px" }}>✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── LIVE ── */}
      <section id="live" style={{ maxWidth: 900, margin: "0 auto", padding: "80px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="sfade" style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.35em", color: "#f97316", marginBottom: 20 }}>Live Experience</p>
          <h2 className="swrev" style={{ fontSize: "clamp(2rem,5.5vw,4.5rem)", fontWeight: 900, letterSpacing: "-0.028em", lineHeight: 1.08, color: tP, margin: "0 0 20px" }}>
            <W text="Learning," /><span style={{ color: "#f97316" }}><W text="Live" /></span>
            <br /><span style={{ color: "#f97316" }}><W text="& Real-Time" /></span>
          </h2>
          <p className="sfade" style={{ fontSize: 16, color: tM, maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>
            India's top verified teachers, live reactions, real-time comments — the classroom experience, reimagined.
          </p>
        </div>
        <div className="lcard"><LiveCard dark={dark} /></div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="students" style={{ borderTop: `1px solid ${sBd}`, borderBottom: `1px solid ${sBd}`, background: sBg, padding: "80px 0", transition: "all 0.5s" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="sfade" style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.35em", color: "#f97316", marginBottom: 20 }}>How It Works</p>
            <h2 className="swrev" style={{ fontSize: "clamp(2rem,5.5vw,4.5rem)", fontWeight: 900, letterSpacing: "-0.028em", lineHeight: 1.08, color: tP, marginBottom: 32 }}>
              <W text="Simple." /> <span style={{ color: "#f97316" }}><W text="Structured." /></span> <W text="Powerful." />
            </h2>
            <div className="sfade" style={{ display: "inline-flex", borderRadius: 18, padding: 6, gap: 4, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              {(["student","teacher"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: "10px 22px", borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: "pointer", border: "none", transition: "all 0.3s", background: tab === t ? (t === "student" ? "#f97316" : "#a855f7") : "transparent", color: tab === t ? "#fff" : tM, boxShadow: tab === t ? `0 4px 22px ${t === "student" ? "rgba(249,115,22,0.42)" : "rgba(168,85,247,0.42)"}` : "none" }}>
                  {t === "student" ? "🎓 For Students" : "🧑‍🏫 For Teachers"}
                </button>
              ))}
            </div>
          </div>
          <div id="teachers" style={{ maxWidth: 680, margin: "0 auto" }}>
            <p className="sfade" style={{ fontSize: 24, fontWeight: 900, color: tP, marginBottom: 8 }}>{T.head}</p>
            <p className="sfade" style={{ fontSize: 15, color: tM, lineHeight: 1.72, marginBottom: 48 }}>{T.desc}</p>
            <div className="stepswrap" style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 19, top: 0, bottom: 0, width: 2, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}>
                <div className="sline" style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${T.col}, transparent)` }} />
              </div>
              {T.steps.map((s, i) => (
                <div key={s.n} style={{ display: "flex", gap: 24, paddingBottom: i < T.steps.length - 1 ? 36 : 0 }}>
                  <div className="snode" style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${T.col},${T.col}99)`, boxShadow: `0 0 22px ${T.col}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, zIndex: 5 }}>{s.icon}</div>
                  <div className="stxt" style={{ flex: 1, paddingTop: 6, borderBottom: i < T.steps.length - 1 ? `1px solid ${sBd}` : "none", paddingBottom: i < T.steps.length - 1 ? 36 : 0 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: T.col, opacity: 0.45, letterSpacing: "0.1em" }}>{s.n}</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: tP }}>{s.t}</span>
                    </div>
                    <p style={{ fontSize: 14, color: tM, lineHeight: 1.65, margin: 0 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href={tab === "student" ? "/auth/login" : "/auth/login?role=teacher"} className="bmag sfade"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 40, background: T.col, color: "#fff", fontWeight: 900, fontSize: 14, padding: "13px 30px", borderRadius: 14, textDecoration: "none", boxShadow: `0 0 30px ${T.col}44` }}>
              {tab === "student" ? "Start Learning Free" : "Apply as Teacher"} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="sfade" style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.35em", color: "#f97316", marginBottom: 20 }}>Platform Features</p>
          <h2 className="swrev" style={{ fontSize: "clamp(2rem,5.5vw,4.5rem)", fontWeight: 900, letterSpacing: "-0.028em", lineHeight: 1.08, color: tP }}>
            <W text="Everything you need" /><br />
            <span style={{ color: "#f97316" }}><W text="to excel" /></span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="fc"
              style={{ padding: 26, borderRadius: 22, border: `1px solid ${cBd}`, background: cBg, cursor: "pointer", transition: "transform 0.25s, box-shadow 0.25s, border-color 0.25s", position: "relative", overflow: "hidden" }}>
              <div className="glare" style={{ position: "absolute", inset: 0, opacity: 0, transition: "opacity 0.2s", pointerEvents: "none", zIndex: 10, borderRadius: 22 }} />
              <div style={{ position: "relative", zIndex: 5 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.glow}18`, display: "flex", alignItems: "center", justifyContent: "center", color: f.glow, marginBottom: 16, transition: "transform 0.2s, box-shadow 0.2s", boxShadow: `0 0 0 0 ${f.glow}44` }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.12) rotate(-4deg)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${f.glow}55`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1) rotate(0deg)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${f.glow}44`; }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: tP, marginBottom: 8 }}>{f.t}</h3>
                <p style={{ fontSize: 13, color: tM, lineHeight: 1.68, margin: 0 }}>{f.d}</p>
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: f.glow, opacity: 0.8 }}>
                  Learn more <ChevronRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEADERBOARD ── */}
      <section id="leaderboard" style={{ borderTop: `1px solid ${sBd}`, borderBottom: `1px solid ${sBd}`, background: sBg, padding: "80px 0", transition: "all 0.5s" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="sfade" style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.35em", color: "#f97316", marginBottom: 20 }}>National Leaderboard</p>
            <h2 className="swrev" style={{ fontSize: "clamp(2rem,5.5vw,4.5rem)", fontWeight: 900, letterSpacing: "-0.028em", lineHeight: 1.08, color: tP }}>
              <W text="Top performers" /><br />
              <span style={{ color: "#f97316" }}><W text="this week" /></span>
            </h2>
          </div>
          <DynamicLeaderboard dark={dark} />
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link
              href="/auth/login?redirect=/student/feed"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 900,
                color: "#f97316",
                textDecoration: "none",
              }}
            >
              See full leaderboard <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: "relative", padding: "100px 20px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: dark ? "#08080f" : "#0a0a1a" }} />
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.35) 0%,transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.3) 0%,transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "55%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,0.2) 0%,transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "72px 72px" }} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div className="ctael" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 99, border: "1px solid rgba(249,115,22,0.35)", background: "rgba(249,115,22,0.1)", marginBottom: 36 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", animation: "blink 1.4s ease infinite", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.2em" }}>Join 250M+ Students Nationwide</span>
          </div>
          <h2 className="ctael" style={{ fontSize: "clamp(2.2rem,6vw,5.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1.05, marginBottom: 22, letterSpacing: "-0.03em" }}>
            Ready to join<br />
            <span style={{ background: "linear-gradient(90deg,#f97316,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>India's learning</span><br />
            revolution?
          </h2>
          <p className="ctael" style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", marginBottom: 48, lineHeight: 1.75, maxWidth: 480, margin: "0 auto 48px" }}>
            Free for students. Apply as a teacher and reach millions of students nationwide.
          </p>
          <div className="ctael" style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <Link href="/auth/login" className="bmag"
              style={{ background: "#f97316", color: "#fff", fontWeight: 900, fontSize: 15, padding: "16px 36px", borderRadius: 18, textDecoration: "none", boxShadow: "0 0 50px rgba(249,115,22,0.5), 0 8px 30px rgba(249,115,22,0.3)", display: "inline-flex", alignItems: "center", gap: 8 }}>
              Join as Student — Free <ArrowRight size={17} />
            </Link>
            <Link href="/auth/login?role=teacher" className="bmag"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 900, fontSize: 15, padding: "16px 36px", borderRadius: 18, textDecoration: "none", backdropFilter: "blur(12px)", display: "inline-flex", alignItems: "center", gap: 8, transition: "background 0.2s, border-color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as any).style.background = "rgba(255,255,255,0.14)"; (e.currentTarget as any).style.borderColor = "rgba(255,255,255,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as any).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as any).style.borderColor = "rgba(255,255,255,0.2)"; }}>
              <BookOpen size={17} /> Apply as Teacher
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="about" style={{ borderTop: `1px solid ${sBd}`, background: dark ? "#030307" : sBg, padding: "60px 20px 40px", transition: "all 0.5s" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, paddingBottom: 40, borderBottom: `1px solid ${sBd}` }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <img src="/mainlogo.png" alt="VidyaSangrah" style={{ height: 48, width: "auto", objectFit: "contain" }} />
              </div>
              <p style={{ fontSize: 13, color: tM, maxWidth: 280, lineHeight: 1.72, marginBottom: 10 }}>India's national educational community connecting verified teachers with K-12 students.</p>
              <a href="mailto:team@servexai.in" style={{ fontSize: 11, color: tM, textDecoration: "none" }}>Built by ServexAI · team@servexai.in</a>
            </div>
            <div>
              <h5 style={{ fontSize: 10, fontWeight: 900, color: tM, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 14 }}>Platform</h5>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {FOOTER_PLATFORM.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} style={{ fontSize: 13, fontWeight: 600, color: tM, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f97316")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = tM)}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 style={{ fontSize: 10, fontWeight: 900, color: tM, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 14 }}>Legal</h5>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {FOOTER_LEGAL.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} style={{ fontSize: 13, fontWeight: 600, color: tM, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f97316")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = tM)}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: tM, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>© 2026 VidyaSangrah Education Pvt. Ltd.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              {SOCIAL.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, fontWeight: 700, color: tM, textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f97316")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = tM)}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.32} }
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; cursor: none; }
        @media(pointer:coarse) { body { cursor: auto; } }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-cta   { display: none !important; }
          .hamburger { display: flex !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 520px) {
          .h-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
      <LanguageSelector />
    </div>
  );
}
