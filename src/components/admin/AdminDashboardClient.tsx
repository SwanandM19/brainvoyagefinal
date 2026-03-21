'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Users, BookOpen, Clock, CheckCircle, XCircle,
  LogOut, BarChart3, RefreshCw, GraduationCap,
  ChevronRight, ChevronLeft,
  Shield, Loader2, Crown, Activity,
  UserCheck, Zap, Award, Menu, X,
} from 'lucide-react';
import UsersTable from '@/components/admin/UsersTable';

// ── Interfaces ────────────────────────────────────────────
interface User {
  id: string; name: string; email: string;
  role: string; teacherStatus: string | null; createdAt: string;
}
interface Stats {
  totalStudents: number; totalTeachers: number; pendingTeachers: number;
}
interface Props {
  adminName: string; adminEmail: string;
  stats: Stats; recentUsers: User[];
}
type Tab = 'overview' | 'teachers' | 'users';

// ── Helpers ───────────────────────────────────────────────
function initials(name: string) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}
function avatarGradient(name: string) {
  const COLORS = [
    'from-rose-500 to-pink-600', 'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600', 'from-sky-500 to-cyan-600',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
}

// ═══════════════════════════════════════════════════════════
export default function AdminDashboardClient({ adminName, adminEmail, stats, recentUsers }: Props) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>(recentUsers);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // ── Mobile state ─────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (mobileLeftOpen || mobileRightOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileLeftOpen, mobileRightOpen]);

  const mobileNavigate = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setMobileLeftOpen(false);
    setMobileRightOpen(false);
  }, []);

  const pendingTeacherList = users.filter(u => u.role === 'teacher' && u.teacherStatus === 'pending');
  const approvedTeachers   = users.filter(u => u.role === 'teacher' && u.teacherStatus === 'approved');

  const NAV_ITEMS = [
    { id: 'overview' as Tab, icon: <BarChart3 size={15} />, label: 'Dashboard',         badge: 0 },
    { id: 'teachers' as Tab, icon: <BookOpen size={15} />,  label: 'Teacher Approvals', badge: pendingTeacherList.length },
    { id: 'users'    as Tab, icon: <Users size={15} />,     label: 'All Users',          badge: 0 },
  ];

  // ← Defined here so header JSX can use it safely
  const TAB_LABELS: Record<Tab, string> = {
    overview: 'Dashboard',
    teachers: 'Teacher Approvals',
    users:    'All Users',
  };

  async function handleTeacherAction(userId: string, action: 'approve' | 'reject') {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/teacher-action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Action failed.'); return; }
      toast.success(action === 'approve' ? '✅ Teacher approved!' : '❌ Teacher rejected.');
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, teacherStatus: action === 'approve' ? 'approved' : 'rejected' }
          : u
      ));
    } catch { toast.error('Network error.'); }
    finally { setActionLoading(null); }
  }

  // ── Left Sidebar Content ──────────────────────────────────
  const LeftSidebarContent = ({ onNavigate }: { onNavigate: (t: Tab) => void }) => (
    <>
      {/* Admin profile card */}
      <div className="bg-white rounded-2xl border border-[#EBEBF0] overflow-hidden shadow-sm">
        <div className="h-16 bg-gradient-to-r from-violet-500 to-purple-600 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        <div className="px-4 pb-4 -mt-7 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-violet-200 border-2 border-white">
            {initials(adminName)}
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-[#111827] text-sm truncate">{adminName}</p>
              <Crown size={11} className="text-amber-500 flex-shrink-0" />
            </div>
            <p className="text-[11px] text-[#9CA3AF] truncate">{adminEmail}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 bg-violet-50 text-violet-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-violet-100">
              <Shield size={9} /> Super Admin
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-3 text-center border-t border-[#F3F4F6] pt-3">
            {[
              { label: 'Students', value: fmtNum(stats.totalStudents) },
              { label: 'Teachers', value: fmtNum(stats.totalTeachers) },
              { label: 'Pending',  value: stats.pendingTeachers },
            ].map(s => (
              <div key={s.label}>
                <p className="text-sm font-extrabold text-[#111827]">{s.value}</p>
                <p className="text-[9px] text-[#9CA3AF] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div className="bg-white rounded-2xl border border-[#EBEBF0] p-2 shadow-sm">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === item.id
                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                : 'text-[#6B7280] hover:bg-[#F5F6FA] hover:text-[#111827]'
            }`}>
            <span className="flex items-center gap-2.5">
              <span className={activeTab === item.id ? 'text-orange-500' : 'text-[#9CA3AF]'}>{item.icon}</span>
              {item.label}
            </span>
            {(item.badge ?? 0) > 0
              ? <span className="bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">{item.badge}</span>
              : activeTab === item.id
                ? <ChevronRight size={13} className="text-orange-400" />
                : null}
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 border border-red-100 bg-white transition-colors shadow-sm">
        <LogOut size={13} /><span>Sign Out</span>
      </button>
    </>
  );

  // ── Right Sidebar Content ─────────────────────────────────
  const RightSidebarContent = () => (
    <>
      {/* Platform health */}
      <div className="bg-white rounded-2xl border border-[#EBEBF0] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center gap-2">
          <Activity size={13} className="text-orange-500" />
          <p className="text-xs font-extrabold text-[#111827]">Platform Health</p>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: 'Students', value: fmtNum(stats.totalStudents), icon: <GraduationCap size={13} />, color: 'text-blue-500',   bg: 'bg-blue-50'   },
            { label: 'Teachers', value: fmtNum(stats.totalTeachers), icon: <BookOpen size={13} />,      color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Pending',  value: stats.pendingTeachers,        icon: <Clock size={13} />,         color: 'text-amber-500',  bg: 'bg-amber-50'  },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>{s.icon}</div>
                <span className="text-xs text-[#374151] font-semibold">{s.label}</span>
              </div>
              <span className={`text-xs font-extrabold ${s.color}`}>{s.value}</span>
            </div>
          ))}
          <div className="pt-1 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-bold text-green-600">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent approved teachers */}
      <div className="bg-white rounded-2xl border border-[#EBEBF0] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center gap-2">
          <Award size={13} className="text-orange-500" />
          <p className="text-xs font-extrabold text-[#111827]">
            <span className="text-orange-500">Recent</span> Teachers
          </p>
        </div>
        <div className="p-3 space-y-2">
          {approvedTeachers.length === 0 ? (
            <p className="text-xs text-[#9CA3AF] text-center py-3">No approved teachers yet</p>
          ) : (
            approvedTeachers.slice(0, 4).map(t => (
              <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F5F6FA] transition-colors">
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${avatarGradient(t.name)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
                  {initials(t.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111827] truncate">{t.name}</p>
                  <p className="text-[9px] text-[#9CA3AF] truncate">{t.email}</p>
                </div>
                <UserCheck size={12} className="text-green-500 flex-shrink-0" />
              </div>
            ))
          )}
          {approvedTeachers.length > 4 && (
            <button onClick={() => setActiveTab('users')}
              className="w-full text-center text-[11px] font-bold text-violet-500 hover:text-violet-700 py-1 transition-colors">
              View all →
            </button>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-[#EBEBF0] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center gap-2">
          <Zap size={13} className="text-orange-500" />
          <p className="text-xs font-extrabold text-[#111827]">Quick Actions</p>
        </div>
        <div className="p-3 space-y-2">
          <button onClick={() => setActiveTab('teachers')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-100 transition-colors text-left">
            <BookOpen size={13} className="text-orange-500 flex-shrink-0" />
            <span className="text-xs font-bold text-orange-700">Teacher Approvals</span>
          </button>
          <button onClick={() => setActiveTab('users')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors text-left">
            <Users size={13} className="text-blue-500 flex-shrink-0" />
            <span className="text-xs font-bold text-blue-700">Manage Users</span>
          </button>
          <button onClick={() => window.location.reload()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F5F6FA] hover:bg-[#EBEBF0] border border-[#EBEBF0] transition-colors text-left">
            <RefreshCw size={13} className="text-[#6B7280] flex-shrink-0" />
            <span className="text-xs font-bold text-[#374151]">Refresh Data</span>
          </button>
        </div>
      </div>
    </>
  );

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#F5F6FA]">

      {/* ══ NAVBAR ═════════════════════════════════════════ */}
      <header className="h-14 bg-white border-b border-[#EBEBF0] flex items-center px-4 sm:px-6 gap-2 sticky top-0 z-40 overflow-hidden">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-extrabold text-sm hidden sm:block">
            <span className="text-[#f97316]">VIDYA</span><span className="text-[#111827]">SANGAM</span>
          </span>
        </a>

        {/* Center */}
        <div className="flex-1 flex justify-center overflow-hidden min-w-0">

          {/* Mobile: active tab label only — no overflow */}
          <div className="flex sm:hidden items-center gap-2 min-w-0">
            <span className="text-sm font-extrabold text-[#111827] truncate">
              {TAB_LABELS[activeTab]}
            </span>
            {activeTab === 'teachers' && pendingTeacherList.length > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0">
                {pendingTeacherList.length}
              </span>
            )}
          </div>

          {/* Desktop: full pill tab switcher */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#F5F6FA] rounded-2xl p-1.5 border border-[#EBEBF0]">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-white text-[#111827] shadow-sm border border-[#EBEBF0]'
                    : 'text-[#9CA3AF] hover:text-[#374151] hover:bg-white/60'
                }`}>
                <span className={activeTab === item.id ? 'text-orange-500' : 'text-[#9CA3AF]'}>{item.icon}</span>
                <span>{item.label}</span>
                {(item.badge ?? 0) > 0 && (
                  <span className="bg-amber-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F6FA] border border-[#EBEBF0] text-[#6B7280] hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 text-xs font-bold transition-all">
            <ChevronLeft size={12} /><span>Home</span>
          </a>
          {pendingTeacherList.length > 0 && (
            <button onClick={() => setActiveTab('teachers')}
              className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
              <Clock size={11} /><span>{pendingTeacherList.length} pending</span>
            </button>
          )}
          {/* Avatar + dropdown */}
          <div className="relative group">
            <button className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm hover:scale-105 transition-all flex-shrink-0">
              {initials(adminName)}
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-[#EBEBF0] z-50 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none group-hover:pointer-events-auto">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                  {initials(adminName)}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-extrabold text-xs truncate">{adminName}</p>
                  <p className="text-white/60 text-[10px] truncate">{adminEmail}</p>
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <LogOut size={13} className="text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-red-500">Sign Out</p>
                    <p className="text-[10px] text-[#9CA3AF]">See you next time!</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══ PAGE BODY ══════════════════════════════════════ */}
      <div
        className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5"
        style={{ paddingBottom: isMobile ? '96px' : '20px' }}
      >
        <div className="flex gap-5 items-start">

          {/* ── LEFT SIDEBAR — desktop only ── */}
          {!isMobile && (
            <aside className="flex flex-col gap-4 w-[220px] flex-shrink-0 sticky top-[4.5rem] self-start">
              <LeftSidebarContent onNavigate={setActiveTab} />
            </aside>
          )}

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 space-y-4">

            {/* ─ OVERVIEW ─ */}
            {activeTab === 'overview' && (
              <>
                {/* Hero banner */}
                <div className="relative bg-gradient-to-r from-[#1a0533] via-[#2d1060] to-[#1a0533] rounded-2xl p-5 sm:p-6 overflow-hidden border border-violet-900/30">
                  <div className="absolute -right-8 -top-8 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute left-1/2 -bottom-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide">
                          ✦ Admin Panel
                        </span>
                        <span className="inline-flex items-center gap-1 bg-green-500/20 border border-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                        </span>
                      </div>
                      <h2 className="text-white font-extrabold text-xl sm:text-2xl mb-1.5 tracking-tight">
                        Welcome back, {adminName.split(' ')[0]}! 👋
                      </h2>
                      <p className="text-white/50 text-sm max-w-sm">
                        {pendingTeacherList.length > 0
                          ? `${pendingTeacherList.length} teacher application${pendingTeacherList.length > 1 ? 's' : ''} awaiting review.`
                          : 'Everything is running smoothly. Great job!'}
                      </p>
                      {pendingTeacherList.length > 0 && (
                        <button onClick={() => setActiveTab('teachers')}
                          className="mt-4 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/25">
                          Review Applications <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col items-center gap-2 flex-shrink-0">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-2xl shadow-orange-500/30 border-2 border-white/10">
                          {initials(adminName)}
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Crown size={12} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat cards — 1 col mobile, 3 col sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: <GraduationCap size={18} className="text-white" />,
                      label: 'Total Students', value: fmtNum(stats.totalStudents),
                      sub: 'Registered', gradient: 'from-blue-500 to-indigo-500',
                      onClick: undefined as (() => void) | undefined, alert: false,
                    },
                    {
                      icon: <BookOpen size={18} className="text-white" />,
                      label: 'Total Teachers', value: fmtNum(stats.totalTeachers),
                      sub: 'Approved', gradient: 'from-orange-500 to-amber-400',
                      onClick: undefined as (() => void) | undefined, alert: false,
                    },
                    {
                      icon: <Clock size={18} className="text-white" />,
                      label: 'Pending', value: stats.pendingTeachers,
                      sub: 'Need review', gradient: 'from-amber-500 to-yellow-400',
                      onClick: () => setActiveTab('teachers'),
                      alert: stats.pendingTeachers > 0,
                    },
                  ].map(s => (
                    <div key={s.label} onClick={s.onClick}
                      className={`bg-white rounded-2xl border p-4 shadow-sm transition-all relative overflow-hidden ${
                        s.onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
                      } ${s.alert ? 'border-amber-200 ring-2 ring-amber-50' : 'border-[#EBEBF0]'}`}>
                      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.07]`} />
                      <div className="flex items-center justify-between">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm`}>
                          {s.icon}
                        </div>
                        {s.onClick && (
                          <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-violet-500">
                            Review <ChevronRight size={10} />
                          </div>
                        )}
                      </div>
                      <p className="text-2xl font-extrabold text-[#111827] tabular-nums mt-3">{s.value}</p>
                      <p className="text-xs font-bold text-[#374151] mt-0.5">{s.label}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Teacher approvals quick card */}
                <div onClick={() => setActiveTab('teachers')}
                  className="bg-white rounded-2xl border border-[#EBEBF0] p-4 cursor-pointer hover:border-orange-200 hover:shadow-md transition-all group shadow-sm">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center shadow-md shadow-orange-100 group-hover:scale-105 transition-transform flex-shrink-0">
                      <BookOpen size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-[#111827] text-sm">Teacher Approvals</h3>
                      <p className="text-xs text-[#9CA3AF] mt-0.5 hidden sm:block">
                        Review and approve teacher applications to go live
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {pendingTeacherList.length > 0
                        ? <span className="bg-amber-100 text-amber-700 text-xs font-extrabold px-2.5 py-1 rounded-full">{pendingTeacherList.length} pending</span>
                        : <span className="bg-green-50 text-green-600 text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 border border-green-100">
                            <CheckCircle size={10} /> All clear
                          </span>}
                      <div className="w-7 h-7 rounded-xl bg-[#F5F6FA] group-hover:bg-orange-50 flex items-center justify-center border border-[#EBEBF0] transition-colors">
                        <ChevronRight size={13} className="text-[#9CA3AF] group-hover:text-orange-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                <UsersTable />
              </>
            )}

            {/* ─ TEACHER APPROVALS ─ */}
            {activeTab === 'teachers' && (
              <div className="bg-white rounded-2xl border border-[#EBEBF0] shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-[#EBEBF0] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center shadow-sm shadow-orange-100 flex-shrink-0">
                      <BookOpen size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-extrabold text-[#111827] text-sm">Pending Teacher Applications</h2>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                        {pendingTeacherList.length > 0
                          ? `${pendingTeacherList.length} application${pendingTeacherList.length > 1 ? 's' : ''} awaiting review`
                          : 'No pending applications'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => window.location.reload()}
                    className="p-2 rounded-xl text-[#6B7280] hover:bg-[#F5F6FA] border border-[#EBEBF0] transition-colors flex-shrink-0">
                    <RefreshCw size={14} />
                  </button>
                </div>

                {pendingTeacherList.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-100">
                      <CheckCircle size={28} className="text-green-500" />
                    </div>
                    <p className="font-extrabold text-[#111827]">All caught up! 🎉</p>
                    <p className="text-sm text-[#9CA3AF] mt-1.5">No pending teacher applications right now.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F5F6FA]">
                    {pendingTeacherList.map(user => (
                      <div key={user.id} className="px-4 sm:px-5 py-4 hover:bg-[#FAFAFA] transition-colors group">
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarGradient(user.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm ring-2 ring-white group-hover:ring-violet-100 transition-all`}>
                            {initials(user.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-extrabold text-[#111827] text-sm">{user.name}</p>
                              <span className="text-[9px] font-extrabold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Pending</span>
                            </div>
                            <p className="text-xs text-[#6B7280] truncate mt-0.5">{user.email}</p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                              <Clock size={9} />
                              Applied {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            {/* Buttons — below name on mobile */}
                            <div className="flex gap-2 mt-3 sm:hidden">
                              <button onClick={() => handleTeacherAction(user.id, 'approve')} disabled={actionLoading === user.id}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-extrabold text-xs px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
                                {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                                Approve
                              </button>
                              <button onClick={() => handleTeacherAction(user.id, 'reject')} disabled={actionLoading === user.id}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-extrabold text-xs px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
                                {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                                Reject
                              </button>
                            </div>
                          </div>
                          {/* Buttons — inline on sm+ */}
                          <div className="hidden sm:flex gap-2 flex-shrink-0">
                            <button onClick={() => handleTeacherAction(user.id, 'approve')} disabled={actionLoading === user.id}
                              className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-extrabold text-xs px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
                              {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                              Approve
                            </button>
                            <button onClick={() => handleTeacherAction(user.id, 'reject')} disabled={actionLoading === user.id}
                              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-extrabold text-xs px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
                              {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─ ALL USERS ─ */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#EBEBF0] p-4 flex items-center justify-between gap-3 shadow-sm flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm shadow-blue-100 flex-shrink-0">
                      <Users size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-extrabold text-[#111827] text-sm">All Users</h2>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">{fmtNum(stats.totalStudents + stats.totalTeachers)} total members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-blue-100">{fmtNum(stats.totalStudents)} students</span>
                    <span className="bg-orange-50 text-orange-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-orange-100">{fmtNum(stats.totalTeachers)} teachers</span>
                  </div>
                </div>
                <UsersTable />
              </div>
            )}

          </main>

          {/* ── RIGHT SIDEBAR — desktop only ── */}
          {!isMobile && (
            <aside className="flex flex-col gap-4 w-[220px] flex-shrink-0 sticky top-[4.5rem] self-start">
              <RightSidebarContent />
            </aside>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MOBILE OVERLAY — Left (Menu)
      ══════════════════════════════════════════════════ */}
      {isMobile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          opacity: mobileLeftOpen ? 1 : 0,
          pointerEvents: mobileLeftOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileLeftOpen(false)}
          />
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: 'min(300px, 85vw)', background: '#F5F6FA',
            display: 'flex', flexDirection: 'column',
            boxShadow: '4px 0 32px rgba(0,0,0,0.25)',
            transition: 'transform 0.3s ease',
            transform: mobileLeftOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderBottom: '1px solid #EBEBF0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Menu size={14} color="white" />
                </div>
                <span style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>Admin Menu</span>
              </div>
              <button
                onClick={() => setMobileLeftOpen(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <LeftSidebarContent onNavigate={mobileNavigate} />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MOBILE OVERLAY — Right (Stats & Actions)
      ══════════════════════════════════════════════════ */}
      {isMobile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          opacity: mobileRightOpen ? 1 : 0,
          pointerEvents: mobileRightOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileRightOpen(false)}
          />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: 'min(300px, 85vw)', background: '#F5F6FA',
            display: 'flex', flexDirection: 'column',
            boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
            transition: 'transform 0.3s ease',
            transform: mobileRightOpen ? 'translateX(0)' : 'translateX(100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderBottom: '1px solid #EBEBF0', flexShrink: 0 }}>
              <button
                onClick={() => setMobileRightOpen(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280' }}>
                <X size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>Stats & Actions</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={14} color="white" />
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <RightSidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MOBILE FAB BUTTONS
      ══════════════════════════════════════════════════ */}
      {isMobile && (
        <>
          <button
            onClick={() => { setMobileLeftOpen(true); setMobileRightOpen(false); }}
            style={{
              position: 'fixed', bottom: 24, left: 50, zIndex: 150,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', borderRadius: 50,
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              color: 'white', fontWeight: 800, fontSize: 13,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            }}>
            <Menu size={16} />
            <span>Menu</span>
          </button>

          <button
            onClick={() => { setMobileRightOpen(true); setMobileLeftOpen(false); }}
            style={{
              position: 'fixed', bottom: 24, right: 50, zIndex: 150,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', borderRadius: 50,
              background: 'linear-gradient(135deg, #f97316, #f59e0b)',
              color: 'white', fontWeight: 800, fontSize: 13,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
            }}>
            <span>Stats</span>
            <Activity size={16} />
          </button>
        </>
      )}

    </div>
  );
}
