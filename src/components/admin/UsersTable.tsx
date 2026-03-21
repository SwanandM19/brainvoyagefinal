'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Download, Users, GraduationCap,
  ChevronLeft, ChevronRight, X, Loader2,
  CheckCircle, Clock, XCircle, AlertCircle,
  Eye, Users2, Star, BookOpen, Pencil, Trash2,
} from 'lucide-react';
import EditUserModal from '@/components/admin/EditUserModal';
import DeleteUserModal from '@/components/admin/DeleteUserModal';

interface StudentUser {
  id: string; name: string; email: string; image: string | null;
  studentClass: string; studentBoard: string; school: string;
  points: number; followingCount: number;
  onboardingCompleted: boolean; createdAt: string;
}
interface TeacherUser {
  id: string; name: string; email: string; image: string | null;
  teacherStatus: string | null; subjects: string[]; classes: string[];
  boards: string[]; qualifications: string; yearsOfExperience: number | null;
  followersCount: number; totalViews: number; points: number;
  city: string; state: string; onboardingCompleted: boolean; createdAt: string;
}
type AnyUser = StudentUser & TeacherUser;

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  approved: { label: 'Approved', icon: <CheckCircle size={11} />, classes: 'bg-green-50 text-green-700 border-green-200' },
  pending: { label: 'Pending', icon: <Clock size={11} />, classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  rejected: { label: 'Rejected', icon: <XCircle size={11} />, classes: 'bg-red-50 text-red-700 border-red-200' },
  suspended: { label: 'Suspended', icon: <AlertCircle size={11} />, classes: 'bg-gray-50 text-gray-600 border-gray-200' },
};

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}
function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
}

export default function UsersTable() {
  const [tab, setTab] = useState<'student' | 'teacher'>('student');
  const [users, setUsers] = useState<AnyUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Modal state
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; role: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: tab, page: String(page), search: query });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok) { setUsers(data.users); setTotal(data.total); setTotalPages(data.totalPages); }
    } finally { setLoading(false); }
  }, [tab, page, query]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [tab, query]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/users/export?role=${tab}`);
      if (!res.ok) { alert('Export failed.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tab}s_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  }

  // Called after successful edit
  function handleSaved(updated: any) {
    setUsers(prev => prev.map(u =>
      u.id === updated._id?.toString() || u.id === updated.id
        ? { ...u, ...updated, id: updated._id?.toString() ?? updated.id }
        : u
    ));
  }

  // Called after successful delete
  function handleDeleted(userId: string) {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setTotal(t => t - 1);
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h2 className="font-extrabold text-[#111827] text-lg">User Management</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">{total.toLocaleString('en-IN')} {tab}s total</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-xs font-bold rounded-xl hover:bg-[#1f2937] disabled:opacity-50 transition-colors flex-shrink-0"
          >
            {exporting
              ? <><Loader2 size={14} className="animate-spin" /> Exporting…</>
              : <><Download size={14} /> Export CSV</>}
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="px-6 py-3 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1 bg-[#F8F9FA] p-1 rounded-xl flex-shrink-0">
            <button onClick={() => setTab('student')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${tab === 'student' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
                }`}>
              <GraduationCap size={13} /> Students
            </button>
            <button onClick={() => setTab('teacher')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${tab === 'teacher' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
                }`}>
              <Users size={13} /> Teachers
            </button>
          </div>

          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setQuery(search)}
              placeholder={`Search ${tab}s by name or email… (Enter)`}
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-orange-400 bg-[#F8F9FA] text-[#111827] placeholder:text-[#9CA3AF]"
            />
            {search && (
              <button onClick={() => { setSearch(''); setQuery(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[#f97316]" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <Users2 size={36} className="text-[#E5E7EB] mx-auto mb-3" />
              <p className="font-bold text-[#111827]">No {tab}s found</p>
              {query && <p className="text-sm text-[#6B7280] mt-1">No results for "{query}"</p>}
            </div>
          ) : tab === 'student' ? (
            <StudentTable users={users}
              onEdit={id => setEditId(id)}
              onDelete={u => setDeleteTarget({ id: u.id, name: u.name, role: 'student' })} />
          ) : (
            <TeacherTable users={users}
              onEdit={id => setEditId(id)}
              onDelete={u => setDeleteTarget({ id: u.id, name: u.name, role: 'teacher' })} />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
            <p className="text-xs text-[#6B7280] font-semibold">
              Page {page} of {totalPages} · {total.toLocaleString('en-IN')} total
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#6B7280] hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft size={13} /> Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#6B7280] hover:bg-gray-50 disabled:opacity-40 transition-colors">
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────── */}
      {editId && (
        <EditUserModal
          userId={editId}
          onClose={() => setEditId(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteUserModal
          userId={deleteTarget.id}
          userName={deleteTarget.name}
          userRole={deleteTarget.role}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}

// ── Action buttons ─────────────────────────────────────
function Actions({
  user, onEdit, onDelete,
}: { user: AnyUser; onEdit: (id: string) => void; onDelete: (u: AnyUser) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onEdit(user.id)}
        title="Edit profile"
        className="p-2 rounded-lg text-[#6B7280] hover:text-[#f97316] hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all">
        <Pencil size={13} />
      </button>
      <button
        onClick={() => onDelete(user)}
        title="Delete account"
        className="p-2 rounded-lg text-[#6B7280] hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Student Table ──────────────────────────────────────
function StudentTable({ users, onEdit, onDelete }: {
  users: AnyUser[];
  onEdit: (id: string) => void;
  onDelete: (u: AnyUser) => void;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
          {['Student', 'Class · Board', 'School', 'Points', 'Following', 'Onboarding', 'Joined', 'Actions'].map(h => (
            <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F3F4F6]">
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#f97316] font-extrabold text-[10px] flex-shrink-0">
                  {initials(u.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#111827] text-xs truncate max-w-[140px]">{u.name}</p>
                  <p className="text-[10px] text-[#9CA3AF] truncate max-w-[140px]">{u.email}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <p className="text-xs font-semibold text-[#111827]">{u.studentClass || '—'}</p>
              <p className="text-[10px] text-[#9CA3AF]">{u.studentBoard || '—'}</p>
            </td>
            <td className="px-4 py-3">
              <p className="text-xs text-[#6B7280] max-w-[120px] truncate">{u.school || '—'}</p>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className="flex items-center gap-1 text-xs font-extrabold text-[#f97316]">
                <Star size={10} className="text-yellow-400" />{u.points.toLocaleString('en-IN')}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className="text-xs font-semibold text-[#6B7280]">{u.followingCount}</span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${u.onboardingCompleted
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                {u.onboardingCompleted ? 'Done' : 'Pending'}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className="text-[10px] text-[#9CA3AF]">
                {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
              </span>
            </td>
            <td className="px-4 py-3">
              <Actions user={u} onEdit={onEdit} onDelete={onDelete} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Teacher Table ──────────────────────────────────────
function TeacherTable({ users, onEdit, onDelete }: {
  users: AnyUser[];
  onEdit: (id: string) => void;
  onDelete: (u: AnyUser) => void;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
          {['Teacher', 'Status', 'Subjects', 'Classes · Boards', 'Followers', 'Views', 'Points', 'Location', 'Joined', 'Actions'].map(h => (
            <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F3F4F6]">
        {users.map((u) => {
          const status = STATUS_CONFIG[u.teacherStatus ?? 'pending'] ?? STATUS_CONFIG.pending;
          return (
            <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-extrabold text-[10px] flex-shrink-0">
                    {initials(u.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#111827] text-xs truncate max-w-[130px]">{u.name}</p>
                    <p className="text-[10px] text-[#9CA3AF] truncate max-w-[130px]">{u.email}</p>
                    {u.yearsOfExperience != null && (
                      <p className="text-[9px] text-[#9CA3AF]">{u.yearsOfExperience} yrs exp</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full border w-fit ${status.classes}`}>
                  {status.icon} {status.label}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1 max-w-[130px]">
                  {u.subjects.slice(0, 2).map(s => (
                    <span key={s} className="text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-100 px-1.5 py-0.5 rounded-full">{s}</span>
                  ))}
                  {u.subjects.length > 2 && <span className="text-[9px] text-[#9CA3AF]">+{u.subjects.length - 2}</span>}
                  {u.subjects.length === 0 && <span className="text-[10px] text-[#D1D5DB]">—</span>}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="text-[10px] text-[#6B7280]">
                  {u.classes.length > 0
                    ? `${u.classes.slice(0, 2).join(', ')}${u.classes.length > 2 ? ` +${u.classes.length - 2}` : ''}`
                    : '—'}
                </p>
                <p className="text-[9px] text-[#9CA3AF]">
                  {u.boards.length > 0
                    ? `${u.boards.slice(0, 2).join(', ')}${u.boards.length > 2 ? ` +${u.boards.length - 2}` : ''}`
                    : '—'}
                </p>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="flex items-center gap-1 text-xs font-semibold text-[#6B7280]">
                  <Users size={10} /> {fmtNum(u.followersCount)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="flex items-center gap-1 text-xs font-semibold text-[#6B7280]">
                  <Eye size={10} /> {fmtNum(u.totalViews)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="flex items-center gap-1 text-xs font-extrabold text-[#f97316]">
                  <Star size={10} className="text-yellow-400" />{u.points.toLocaleString('en-IN')}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="text-[10px] text-[#9CA3AF]">
                  {[u.city, u.state].filter(Boolean).join(', ') || '—'}
                </p>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[10px] text-[#9CA3AF]">
                  {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
              </td>
              <td className="px-4 py-3">
                <Actions user={u} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
