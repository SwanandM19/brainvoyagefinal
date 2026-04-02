'use client';

import { useEffect, useState } from 'react';
import { Gift, Copy, CheckCheck, Users, Zap, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralStats {
  referralCode:     string;
  referralPoints:   number;
  freeMonthsEarned: number;
  totalReferrals:   number;
// referredCount:    number;
  pointsToNextFree: number;
}

export default function ReferralCard() {
  const [stats,     setStats]     = useState<ReferralStats | null>(null);
  const [copied,    setCopied]    = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/referral/generate')
      .then(r => r.json())
      .then(setStats)
      .catch(() => toast.error('Failed to load referral info'))
      .finally(() => setLoading(false));
  }, []);

  function copyLink() {
    if (!stats) return;
    const link = `${window.location.origin}/auth/login?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2500);
  }

  async function redeemFreeMonth() {
    if (!stats || stats.referralPoints < 100) return;
    setRedeeming(true);
    try {
      const res  = await fetch('/api/referral/redeem', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success('🎉 Free month activated! Next billing skipped.');
        const updated = await fetch('/api/referral/generate').then(r => r.json());
        setStats(updated);
      } else {
        toast.error(data.error ?? 'Redemption failed.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setRedeeming(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-orange-400" />
      </div>
    );
  }

  if (!stats) return null;

  const progress  = Math.min(100, ((stats.referralPoints % 100) / 100) * 100);
  const canRedeem = stats.referralPoints >= 100;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Gift size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-extrabold text-sm">Refer & Earn Free Months</h3>
          <p className="text-white/75 text-[11px]">50 pts per referral · 100 pts = ₹200 saved</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Users,  label: 'Referred',    value: stats.totalReferrals   },
            // { icon: Users, label: 'Referred', value: stats.referredCount },
            { icon: Zap,    label: 'Points',       value: stats.referralPoints   },
            { icon: Trophy, label: 'Free Months',  value: stats.freeMonthsEarned },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-orange-50 rounded-xl p-3 text-center">
              <Icon size={14} className="text-[#f97316] mx-auto mb-1" />
              <p className="text-base font-extrabold text-[#111827]">{value}</p>
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-[#374151]">Next free month</span>
            <span className="text-xs font-bold text-[#f97316]">{stats.referralPoints % 100}/100 pts</span>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#f97316] to-[#ea580c] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            {canRedeem ? '🎉 Enough points! Redeem below.' : `${stats.pointsToNextFree} more points needed`}
          </p>
        </div>

        {/* Referral link */}
        <div>
          <label className="text-xs font-bold text-[#374151] block mb-1.5">Your Referral Link</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[11px] text-[#6B7280] font-mono truncate">
              {typeof window !== 'undefined'
                ? `${window.location.origin}/auth/login?ref=${stats.referralCode}`
                : `...?ref=${stats.referralCode}`}
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1 px-3 py-2 bg-[#f97316] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
            >
              {copied ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        </div>

        {/* Redeem button — only shown when eligible */}
        {canRedeem && (
          <button
            onClick={redeemFreeMonth}
            disabled={redeeming}
            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-extrabold text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trophy size={13} />
            {redeeming ? 'Activating...' : '🎉 Redeem Free Month (100 pts)'}
          </button>
        )}
      </div>
    </div>
  );
}