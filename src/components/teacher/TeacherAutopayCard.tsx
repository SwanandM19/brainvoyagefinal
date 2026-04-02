'use client';

import { useState } from 'react';

interface Props {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  currentStatus?: string;
  trialEndsAt?: string | Date | null;
}

declare global {
  interface Window { Razorpay: any; }
}

export default function TeacherAutopayCard({
  teacherId,
  teacherName,
  teacherEmail,
  currentStatus,
  trialEndsAt,
}: Props) {
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  // Already subscribed — show status
  if (currentStatus === 'active' || currentStatus === 'trial') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-extrabold text-green-800 text-sm">Autopay Active</p>
          {trialEndsAt && (
            <p className="text-[11px] text-green-600 mt-0.5">
              Free trial ends: {new Date(trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    );
  }

  async function handleActivate() {
    setLoading(true);
    setError('');

    try {
      // Step 1 — Create subscription on backend
      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, teacherEmail, teacherName }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create subscription');

      // Step 2 — Load Razorpay script dynamically
      await loadRazorpayScript();

      // Step 3 — Open Razorpay Checkout
      const options = {
        key: data.razorpayKeyId,
        subscription_id: data.subscriptionId,
        name: 'Teacher Subscription',
        description: '1 month free trial, then ₹200/month',
        prefill: {
          name: teacherName,
          email: teacherEmail,
        },
        theme: { color: '#f97316' },
        handler: function () {
          setSuccess(true);
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  }

  function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center animate-fade-in">
        <p className="text-2xl mb-1">🎉</p>
        <p className="font-extrabold text-green-800 text-sm">Autopay Activated!</p>
        <p className="text-[11px] text-green-600 mt-1">First month is free. ₹200 will be charged after 30 days.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-sm">
          ⚡
        </div>
        <div>
          <p className="font-extrabold text-[#111827] text-sm">Enable Autopay</p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">First month free · Then ₹200/month</p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-1.5">
        {[
          '🎓 1 month completely free',
          '₹200/month after trial ends',
          '❌ Cancel anytime',
          '🔒 Secured by Razorpay',
        ].map(f => (
          <p key={f} className="text-[11px] text-[#374151] flex items-center gap-1.5">{f}</p>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Button */}
      <button
        onClick={handleActivate}
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-extrabold shadow-sm hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Setting up...
          </>
        ) : (
          '🚀 Activate Free Trial'
        )}
      </button>

      <p className="text-center text-[10px] text-[#9CA3AF]">No charge today. Cancel before trial ends to avoid billing.</p>
    </div>
  );
}