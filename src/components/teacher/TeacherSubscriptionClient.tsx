'use client';

import { useState } from 'react';
import {
  CheckCircle, CreditCard, Shield, Zap,
  Star, Users, Upload, AlertCircle, Loader2,
} from 'lucide-react';
import Logo from '@/components/layout/Logo';

interface Props {
  teacher: { name: string; email: string };
}

declare global {
  interface Window { Razorpay: any; }
}

const FEATURES = [
  { icon: Upload, text: 'Unlimited video uploads'       },
  { icon: Users,  text: 'Reach thousands of students'   },
  { icon: Zap,    text: 'Gamified leaderboard ranking'  },
  { icon: Star,   text: 'Verified teacher badge'        },
  { icon: Shield, text: 'Analytics & performance stats' },
];

export default function TeacherSubscriptionClient({ teacher }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  async function handlePay() {
    setLoading(true);
    setError('');

    try {
      // Step 1 — Create order
      const res  = await fetch('/api/subscription/create', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to initiate payment.');
        setLoading(false);
        return;
      }

      if (data.alreadyActive) {
        window.location.href = '/teacher/pending'; // ← already paid, go to pending
        return;
      }

      // Step 2 — Load Razorpay script
      await loadRazorpayScript();

      // Step 3 — Open Razorpay checkout
      const options = {
        key:         data.keyId,
        order_id:    data.orderId,
        amount:      data.amount,
        currency:    data.currency,
        name:        'VidyaSangam',
        description: 'Teacher Onboarding Fee — One Time',
        image:       '/logo.png',
        prefill: {
          name:  teacher.name,
          email: teacher.email,
        },
        theme: { color: '#f97316' },

        handler: async function (response: any) {
          // Step 4 — Verify on server
          try {
            const verifyRes = await fetch('/api/subscription/verify', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setSuccess(true);
              setTimeout(() => {
                window.location.href = '/teacher/pending'; // ✅ CHANGED from /teacher/dashboard
              }, 2500);
            } else {
              setError('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          } catch {
            setError('Verification error. Please contact support.');
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled. Complete the ₹200 payment to access your dashboard.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
      setLoading(false);
    }
  }

  function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) { resolve(); return; }
      const script   = document.createElement('script');
      script.src     = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload  = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay.'));
      document.body.appendChild(script);
    });
  }

  // ── Success screen ───────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          {/* ✅ CHANGED: updated success message */}
          <h2 className="text-2xl font-extrabold text-[#111827] mb-2">Payment Successful! 🎉</h2>
          <p className="text-[#6B7280] text-sm mb-2">
            Your ₹200 payment is confirmed. Your application is now under admin review.
          </p>
          <p className="text-[#6B7280] text-sm">Redirecting you to check your status...</p>
          <div className="mt-4 flex justify-center">
            <Loader2 size={20} className="animate-spin text-orange-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#f97316] to-[#ea580c] px-8 py-8 text-white text-center">
            <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-2">
              One Last Step
            </p>
            <h1 className="text-3xl font-extrabold mb-1">Activate Your Account</h1>
            <p className="text-white/80 text-sm">
              One-time onboarding fee to unlock the full platform
            </p>
          </div>

          <div className="px-8 py-7 space-y-6">

            {/* Pricing */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-center">
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-4xl font-extrabold text-[#111827]">₹200</span>
                <span className="text-[#6B7280] font-semibold mb-1">one time</span>
              </div>
              <p className="text-[#9CA3AF] text-xs mt-1">
                Pay once · Full platform access · No recurring charges
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-[#f97316]" />
                  </div>
                  <p className="text-sm font-semibold text-[#374151]">{text}</p>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-semibold">{error}</p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-extrabold text-base rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                : <><CreditCard size={18} /> Pay ₹200 &amp; Submit Application</>} {/* ✅ CHANGED button text */}
            </button>

            {/* Trust note */}
            <div className="flex items-center justify-center gap-2 text-[#9CA3AF] text-xs">
              <Shield size={12} />
              <span>Secured by Razorpay · 256-bit SSL encryption</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-4">
          One-time payment · Supports UPI, Cards, Net Banking &amp; Wallets
        </p>
      </div>
    </div>
  );
}
