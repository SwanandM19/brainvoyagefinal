"use client";

import { useEffect, useState } from "react";
import {
  Users, Play, BookOpen, Clock, TrendingUp,
  Video, Award, ChevronRight, Sparkles, Eye,
} from "lucide-react";

interface CommunityVideo {
  id: string;
  title: string;
  subject: string;
  classes: string[];
  boards: string[];
  videoUrl: string;
  createdAt: string;
  teacher: { id: string; name: string; email: string };
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Mathematics:        { bg: "rgba(59,130,246,0.1)",  text: "#3b82f6", dot: "#3b82f6"  },
  Physics:            { bg: "rgba(168,85,247,0.1)",  text: "#a855f7", dot: "#a855f7"  },
  Chemistry:          { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", dot: "#22c55e"  },
  Biology:            { bg: "rgba(20,184,166,0.1)",  text: "#14b8a6", dot: "#14b8a6"  },
  English:            { bg: "rgba(236,72,153,0.1)",  text: "#ec4899", dot: "#ec4899"  },
  Hindi:              { bg: "rgba(249,115,22,0.1)",  text: "#f97316", dot: "#f97316"  },
  "Computer Science": { bg: "rgba(14,165,233,0.1)",  text: "#0ea5e9", dot: "#0ea5e9"  },
  Economics:          { bg: "rgba(139,92,246,0.1)",  text: "#8b5cf6", dot: "#8b5cf6"  },
  History:            { bg: "rgba(234,179,8,0.1)",   text: "#eab308", dot: "#eab308"  },
  Geography:          { bg: "rgba(132,204,22,0.1)",  text: "#84cc16", dot: "#84cc16"  },
};

function initials(name: string) {
  return name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function avatarGradient(name: string) {
  const GRADS = [
    "linear-gradient(135deg,#f97316,#ef4444)",
    "linear-gradient(135deg,#a855f7,#6366f1)",
    "linear-gradient(135deg,#22c55e,#14b8a6)",
    "linear-gradient(135deg,#3b82f6,#a855f7)",
    "linear-gradient(135deg,#ec4899,#f97316)",
    "linear-gradient(135deg,#eab308,#f97316)",
  ];
  let h = 0;
  for (let i = 0; i < name?.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return GRADS[Math.abs(h) % GRADS.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TeacherCommunityFeed() {
  const [videos, setVideos] = useState<CommunityVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "subject">("all");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teacher/community-feed")
      .then(r => r.json())
      .then(data => { setVideos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const subjects = [...new Set(videos.map(v => v.subject))].filter(Boolean);

  const filtered = activeSubject
    ? videos.filter(v => v.subject === activeSubject)
    : videos;

  // Group by teacher for community stats
  const teacherStats = videos.reduce<Record<string, { name: string; count: number }>>((acc, v) => {
    if (!acc[v.teacher.id]) acc[v.teacher.id] = { name: v.teacher.name, count: 0 };
    acc[v.teacher.id].count++;
    return acc;
  }, {});
  const topTeachers = Object.entries(teacherStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const subjectDist = videos.reduce<Record<string, number>>((acc, v) => {
    acc[v.subject] = (acc[v.subject] || 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 100, borderRadius: 18, background: "#F3F4F6", animation: "pulse 1.5s ease infinite" }} />
      ))}
      <style jsx>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );

  if (videos.length === 0) return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Video size={24} color="#f97316" />
      </div>
      <p style={{ fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 6px" }}>No community videos yet</p>
      <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Be the first to upload! Your colleagues are watching 👀</p>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 20 }}>

      {/* ── MAIN FEED ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg,#f97316,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#111827" }}>Teacher Community Feed</h3>
              <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>{videos.length} videos from {Object.keys(teacherStats).length} teachers</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "blink 1.4s ease infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e" }}>Live updates</span>
          </div>
        </div>

        {/* Subject filter pills */}
        {subjects.length > 0 && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
            <button
              onClick={() => setActiveSubject(null)}
              style={{ padding: "5px 14px", borderRadius: 99, fontSize: 11, fontWeight: 800, cursor: "pointer", border: "none", flexShrink: 0, background: !activeSubject ? "linear-gradient(135deg,#f97316,#a855f7)" : "#F3F4F6", color: !activeSubject ? "#fff" : "#6B7280", transition: "all 0.2s" }}>
              All
            </button>
            {subjects.map(sub => {
              const col = SUBJECT_COLORS[sub] ?? { bg: "rgba(107,114,128,0.1)", text: "#6B7280", dot: "#6B7280" };
              return (
                <button key={sub}
                  onClick={() => setActiveSubject(activeSubject === sub ? null : sub)}
                  style={{ padding: "5px 14px", borderRadius: 99, fontSize: 11, fontWeight: 800, cursor: "pointer", border: `1px solid ${activeSubject === sub ? col.dot : "transparent"}`, flexShrink: 0, background: activeSubject === sub ? col.bg : "#F3F4F6", color: activeSubject === sub ? col.text : "#6B7280", transition: "all 0.2s" }}>
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* Video cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((video, idx) => {
            const col = SUBJECT_COLORS[video.subject] ?? { bg: "rgba(249,115,22,0.08)", text: "#f97316", dot: "#f97316" };
            const isPreview = previewId === video.id;
            return (
              <div key={video.id}
                style={{ background: "#fff", borderRadius: 18, border: isPreview ? "1.5px solid #f97316" : "1px solid #E5E7EB", overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s", boxShadow: isPreview ? "0 8px 30px rgba(249,115,22,0.12)" : "0 2px 8px rgba(0,0,0,0.04)" }}
                onMouseEnter={e => { if (!isPreview) { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; } }}
                onMouseLeave={e => { if (!isPreview) { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; } }}>

                {/* Card header */}
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>

                  {/* Play button */}
                  <button
                    onClick={() => setPreviewId(isPreview ? null : video.id)}
                    style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", background: isPreview ? "linear-gradient(135deg,#f97316,#a855f7)" : col.bg }}>
                    <Play size={16} fill={isPreview ? "#fff" : col.text} color={isPreview ? "#fff" : col.text} style={{ marginLeft: 2 }} />
                  </button>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 900, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{video.title}</p>

                    {/* Teacher info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: avatarGradient(video.teacher.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                        {initials(video.teacher.name)}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{video.teacher.name}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>·</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={9} /> {timeAgo(video.createdAt)}
                      </span>
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 99, background: col.bg, color: col.text }}>
                        {video.subject}
                      </span>
                      {video.classes.slice(0, 2).map(c => (
                        <span key={c} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#F3F4F6", color: "#374151" }}>{c}</span>
                      ))}
                      {video.boards.slice(0, 1).map(b => (
                        <span key={b} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(59,130,246,0.08)", color: "#3b82f6" }}>{b}</span>
                      ))}
                    </div>
                  </div>

                  {/* Index badge */}
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#9CA3AF", flexShrink: 0, paddingTop: 2 }}>#{idx + 1}</div>
                </div>

                {/* Inline video preview */}
                {isPreview && (
                  <div style={{ margin: "0 16px 14px", borderRadius: 14, overflow: "hidden", border: "1px solid #E5E7EB" }}>
                    <video src={video.videoUrl} controls autoPlay style={{ width: "100%", display: "block", background: "#000", maxHeight: 260, objectFit: "contain" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      <div className="community-sidebar" style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Community pulse */}
        <div style={{ background: "linear-gradient(135deg,#0a0a1a,#1a0a35)", borderRadius: 18, padding: 18 }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)" }}>Community Pulse</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: <Video size={14} />, label: "Total Videos", value: videos.length, color: "#f97316" },
              { icon: <Users size={14} />, label: "Active Teachers", value: Object.keys(teacherStats).length, color: "#a855f7" },
              { icon: <BookOpen size={14} />, label: "Subjects", value: subjects.length, color: "#22c55e" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top contributors */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E7EB", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Award size={14} color="#f97316" />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#111827" }}>Top Contributors</p>
          </div>
          {topTeachers.length === 0 ? (
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, textAlign: "center" }}>No data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topTeachers.map(([id, t], i) => (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: avatarGradient(t.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                    {initials(t.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF" }}>{t.count} video{t.count > 1 ? "s" : ""}</p>
                  </div>
                  {i === 0 && <span style={{ fontSize: 14 }}>🥇</span>}
                  {i === 1 && <span style={{ fontSize: 14 }}>🥈</span>}
                  {i === 2 && <span style={{ fontSize: 14 }}>🥉</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subject distribution */}
        {Object.keys(subjectDist).length > 0 && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E7EB", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <TrendingUp size={14} color="#a855f7" />
              <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#111827" }}>By Subject</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(subjectDist).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([sub, cnt]) => {
                const col = SUBJECT_COLORS[sub] ?? { bg: "rgba(107,114,128,0.1)", text: "#6B7280", dot: "#6B7280" };
                const pct = Math.round((cnt / videos.length) * 100);
                return (
                  <div key={sub}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{sub}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: col.text }}>{cnt}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: "#F3F4F6", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: col.dot, transition: "width 1s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Motivational CTA */}
        <div style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.08),rgba(168,85,247,0.08))", borderRadius: 18, border: "1px solid rgba(249,115,22,0.2)", padding: 16, textAlign: "center" }}>
          <Sparkles size={20} color="#f97316" style={{ marginBottom: 8 }} />
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 900, color: "#111827" }}>Inspire your colleagues!</p>
          <p style={{ margin: "0 0 12px", fontSize: 11, color: "#6B7280", lineHeight: 1.6 }}>Upload a video and be part of the teaching community.</p>
          <a href="/teacher/upload" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#f97316,#a855f7)", color: "#fff", fontSize: 11, fontWeight: 900, padding: "8px 16px", borderRadius: 10, textDecoration: "none" }}>
            Upload Video <ChevronRight size={11} />
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media (max-width: 768px) {
          .community-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}