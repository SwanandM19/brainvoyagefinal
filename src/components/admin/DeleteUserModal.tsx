'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  userId:   string;
  userName: string;
  userRole: string;
  onClose:  () => void;
  onDeleted: (userId: string) => void;
}

export default function DeleteUserModal({
  userId, userName, userRole, onClose, onDeleted,
}: Props) {
  const [loading,   setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState('');

  const nameMatch = confirmed.trim().toLowerCase() === userName.trim().toLowerCase();

  async function handleDelete() {
    if (!nameMatch) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Delete failed.'); return; }
      toast.success(`🗑️ ${userName} has been deleted.`);
      onDeleted(userId);
      onClose();
    } catch { toast.error('Network error.'); }
    finally   { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <h2 className="font-extrabold text-[#111827]">Delete Account</h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-xl text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F8F9FA] transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-700 mb-1">⚠️ This action is permanent</p>
            <p className="text-xs text-red-600 leading-relaxed">
              Deleting <strong>{userName}</strong>'s account will permanently remove all their data.
              {userRole === 'teacher' && ' All their uploaded videos will remain but will show no teacher info.'}
              {' '}This cannot be undone.
            </p>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB]">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-[#6B7280] font-bold text-sm flex-shrink-0">
              {userName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-[#111827] text-sm">{userName}</p>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize ${
                userRole === 'teacher' ? 'bg-orange-50 text-[#f97316]' : 'bg-blue-50 text-blue-600'
              }`}>{userRole}</span>
            </div>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
              Type <span className="text-[#111827] font-extrabold">{userName}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmed}
              onChange={e => setConfirmed(e.target.value)}
              placeholder={`Type "${userName}" here`}
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-red-400 text-[#111827] transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3 bg-[#FAFAFA]">
          <button onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-[#6B7280] border border-[#E5E7EB] rounded-xl hover:bg-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!nameMatch || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {loading ? 'Deleting…' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
