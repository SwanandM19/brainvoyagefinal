// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { signIn, useSession } from 'next-auth/react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { toast } from 'sonner';
// import {
//   Mail, ArrowRight, RotateCcw, Chrome, Loader2, ChevronLeft,
// } from 'lucide-react';
// import Logo from '@/components/layout/Logo';
// import LanguageSelector from '@/components/FloatingLanguageSwitcher';

// type AuthStep = 'email' | 'otp';

// export default function LoginPage() {
//   const router      = useRouter();
//   const { data: session, status } = useSession();
//   const searchParams = useSearchParams();

//   const [step,       setStep]       = useState<AuthStep>('email');
//   const [email,      setEmail]      = useState('');
//   const [otp,        setOtp]        = useState(['', '', '', '', '', '']);
//   const [loading,    setLoading]    = useState(false);
//   const [gLoading,   setGLoading]   = useState(false);
//   const [countdown,  setCountdown]  = useState(0);

//   const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

//   // Redirect if already logged in
//   useEffect(() => {
//     if (status === 'authenticated' && session?.user) {
//       redirectByRole(session.user.role, session.user.onboardingCompleted, session.user.teacherStatus);
//     }
//   }, [status, session]);

//   // Countdown timer for resend OTP
//   useEffect(() => {
//     if (countdown <= 0) return;
//     const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
//     return () => clearTimeout(t);
//   }, [countdown]);

//   function redirectByRole(
//     role: string,
//     onboardingCompleted: boolean,
//     teacherStatus?: string | null
//   ) {
//     if (!onboardingCompleted) {
//       router.replace('/onboarding');
//       return;
//     }
//     if (role === 'admin')   { router.replace('/admin/dashboard');   return; }
//     if (role === 'teacher') {
//       if (teacherStatus === 'approved') { router.replace('/teacher/feed'); return; }
//       router.replace('/teacher/pending');
//       return;
//     }
//     router.replace('/student/feed');
//   }

//   /* ── Send OTP ────────────────────────────────────────────── */
//   async function handleSendOtp(e: React.FormEvent) {
//     e.preventDefault();
//     if (!email.trim()) return;
//     setLoading(true);

//     try {
//       const res = await fetch('/api/auth/send-otp', {
//         method:  'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body:    JSON.stringify({ email: email.trim() }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         toast.error(data.error ?? 'Failed to send OTP.');
//         return;
//       }

//       toast.success('OTP sent! Check your inbox.');
//       setStep('otp');
//       setCountdown(60);
//       setTimeout(() => otpRefs.current[0]?.focus(), 100);
//     } catch {
//       toast.error('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   /* ── OTP input handling ──────────────────────────────────── */
//   function handleOtpChange(index: number, value: string) {
//     if (!/^\d*$/.test(value)) return;
//     const next = [...otp];
//     next[index] = value.slice(-1);
//     setOtp(next);
//     if (value && index < 5) otpRefs.current[index + 1]?.focus();
//   }

//   function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       otpRefs.current[index - 1]?.focus();
//     }
//   }

//   function handleOtpPaste(e: React.ClipboardEvent) {
//     e.preventDefault();
//     const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
//     if (text.length === 6) {
//       setOtp(text.split(''));
//       otpRefs.current[5]?.focus();
//     }
//   }

//   /* ── Verify OTP ──────────────────────────────────────────── */
//   async function handleVerifyOtp(e: React.FormEvent) {
//     e.preventDefault();
//     const code = otp.join('');
//     if (code.length !== 6) {
//       toast.error('Please enter the complete 6-digit code.');
//       return;
//     }
//     setLoading(true);

//     try {
//       const result = await signIn('otp', {
//         email:    email.trim(),
//         otp:      code,
//         redirect: false,
//       });

//       if (result?.error) {
//         toast.error('Invalid or expired OTP. Please try again.');
//         setOtp(['', '', '', '', '', '']);
//         otpRefs.current[0]?.focus();
//         return;
//       }

//       toast.success('Signed in successfully!');
//       // Session will update, useEffect will redirect
//     } catch {
//       toast.error('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   /* ── Google sign-in ──────────────────────────────────────── */
//   async function handleGoogleLogin() {
//     setGLoading(true);
//     try {
//       await signIn('google', { callbackUrl: '/onboarding' });
//     } catch {
//       toast.error('Google sign-in failed. Please try again.');
//       setGLoading(false);
//     }
//   }

//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
//         <Loader2 size={32} className="animate-spin text-[#f97316]" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
//       {/* Top bar */}
//       <header className="h-[100px] bg-white border-b border-[#E5E7EB] flex items-center px-6">
//         <Logo size="sm" />
//         <Link
//           href="/"
//           className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
//         >
//           <ChevronLeft size={16} />
//           Back to home
//         </Link>
//       </header>

//       {/* Main content */}
//       <div className="flex-1 flex items-center justify-center px-4 py-12">
//         <div className="w-full max-w-md">

//           {/* Card */}
//           <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
//             {/* Card header */}
//             <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] px-8 py-8 text-center">
//               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                 <Mail size={28} className="text-white" />
//               </div>
//               <h1 className="text-2xl font-extrabold text-white">
//                 {step === 'email' ? 'Welcome to VidyaSangrah' : 'Enter your code'}
//               </h1>
//               <p className="text-white/80 text-sm mt-2">
//                 {step === 'email'
//                   ? 'Sign in or create your free account'
//                   : `We sent a 6-digit code to ${email}`}
//               </p>
//             </div>

//             {/* Card body */}
//             <div className="px-8 py-8 space-y-6">

//               {/* ── STEP: EMAIL ── */}
//               {step === 'email' && (
//                 <>
//                   {/* Google */}
//                   <button
//                     onClick={handleGoogleLogin}
//                     disabled={gLoading}
//                     className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[#E5E7EB] rounded-xl font-bold text-[#111827] hover:border-[#f97316] hover:bg-orange-50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                   >
//                     {gLoading ? (
//                       <Loader2 size={18} className="animate-spin" />
//                     ) : (
//                       <Chrome size={18} className="text-[#4285F4]" />
//                     )}
//                     Continue with Google
//                   </button>

//                   {/* Divider */}
//                   <div className="flex items-center gap-4">
//                     <div className="flex-1 h-px bg-[#E5E7EB]" />
//                     <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">or with email OTP</span>
//                     <div className="flex-1 h-px bg-[#E5E7EB]" />
//                   </div>

//                   {/* Email form */}
//                   <form onSubmit={handleSendOtp} className="space-y-4">
//                     <div>
//                       <label htmlFor="email" className="block text-sm font-bold text-[#111827] mb-2">
//                         Email Address
//                       </label>
//                       <input
//                         id="email"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="you@example.com"
//                         required
//                         autoFocus
//                         className="input-base"
//                       />
//                     </div>
//                     <button
//                       type="submit"
//                       disabled={loading || !email.trim()}
//                       className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
//                     >
//                       {loading ? (
//                         <Loader2 size={18} className="animate-spin" />
//                       ) : (
//                         <>Send Login Code <ArrowRight size={18} /></>
//                       )}
//                     </button>
//                   </form>
//                 </>
//               )}

//               {/* ── STEP: OTP ── */}
//               {step === 'otp' && (
//                 <form onSubmit={handleVerifyOtp} className="space-y-6">
//                   {/* OTP boxes */}
//                   <div>
//                     <label className="block text-sm font-bold text-[#111827] mb-4 text-center">
//                       6-Digit Verification Code
//                     </label>
//                     <div
//                       className="flex gap-3 justify-center"
//                       onPaste={handleOtpPaste}
//                     >
//                       {otp.map((digit, i) => (
//                         <input
//                           key={i}
//                           ref={(el) => { otpRefs.current[i] = el; }}
//                           type="text"
//                           inputMode="numeric"
//                           maxLength={1}
//                           value={digit}
//                           onChange={(e) => handleOtpChange(i, e.target.value)}
//                           onKeyDown={(e) => handleOtpKeyDown(i, e)}
//                           className={`w-12 h-14 text-center text-xl font-extrabold border-2 rounded-xl outline-none transition-all duration-200 ${
//                             digit
//                               ? 'border-[#f97316] bg-orange-50 text-[#f97316]'
//                               : 'border-[#E5E7EB] bg-white text-[#111827]'
//                           } focus:border-[#f97316] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)]`}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading || otp.join('').length !== 6}
//                     className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
//                   >
//                     {loading ? (
//                       <Loader2 size={18} className="animate-spin" />
//                     ) : (
//                       <>Verify & Sign In <ArrowRight size={18} /></>
//                     )}
//                   </button>

//                   {/* Resend / change email */}
//                   <div className="flex items-center justify-between text-sm">
//                     <button
//                       type="button"
//                       onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); }}
//                       className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#111827] font-semibold transition-colors"
//                     >
//                       <ChevronLeft size={16} />
//                       Change email
//                     </button>

//                     {countdown > 0 ? (
//                       <span className="text-[#6B7280] font-semibold">
//                         Resend in {countdown}s
//                       </span>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={handleSendOtp as any}
//                         className="flex items-center gap-1.5 text-[#f97316] hover:text-[#ea580c] font-bold transition-colors"
//                       >
//                         <RotateCcw size={14} />
//                         Resend code
//                       </button>
//                     )}
//                   </div>
//                 </form>
//               )}

//               {/* Terms notice */}
//               <p className="text-xs text-[#6B7280] text-center leading-relaxed">
//                 By continuing, you agree to our{' '}
//                 <a href="#" className="text-[#f97316] font-semibold hover:underline">Terms of Service</a>{' '}
//                 and{' '}
//                 <a href="#" className="text-[#f97316] font-semibold hover:underline">Privacy Policy</a>.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//       <LanguageSelector />
//     </div>
//   );
// }


'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Mail, ArrowRight, RotateCcw, Chrome, Loader2, ChevronLeft,
  ShieldAlert,
} from 'lucide-react';
import Logo from '@/components/layout/Logo';
import LanguageSelector from '@/components/FloatingLanguageSwitcher';

type AuthStep = 'email' | 'otp';

export default function LoginPage() {
  const router       = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const reason           = searchParams.get('reason');
  const isDeletedAccount = reason === 'deleted';

  const [step,      setStep]      = useState<AuthStep>('email');
  const [email,     setEmail]     = useState('');
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Tracks whether we've already fired signOut for the deleted flow
  const signedOutRef = useRef(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Handle deleted account ─────────────────────────────────
  // When arriving with ?reason=deleted, clear the stale JWT cookie
  // immediately so the redirect-loop cannot restart.
  useEffect(() => {
    if (!isDeletedAccount) return;
    if (status === 'authenticated' && !signedOutRef.current) {
      signedOutRef.current = true;
      signOut({ redirect: false });
    }
  }, [isDeletedAccount, status]);

  // ── Normal redirect for active logged-in users ─────────────
  // Deliberately skipped when ?reason=deleted is present — we
  // never want to send a just-deleted teacher back into the app.
  useEffect(() => {
    if (isDeletedAccount) return;
    if (status === 'authenticated' && session?.user) {
      redirectByRole(
        session.user.role,
        session.user.onboardingCompleted,
        session.user.teacherStatus,
      );
    }
  }, [status, session, isDeletedAccount]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Save referral code from URL to sessionStorage
useEffect(() => {
  const ref = searchParams.get('ref');
  if (ref) sessionStorage.setItem('referralCode', ref);
}, [searchParams]);

  function redirectByRole(
    role: string,
    onboardingCompleted: boolean,
    teacherStatus?: string | null,
  ) {
    if (!onboardingCompleted) { router.replace('/onboarding');         return; }
    if (role === 'admin')      { router.replace('/admin/dashboard');    return; }
    if (role === 'teacher') {
      if (teacherStatus === 'approved') { router.replace('/teacher/feed'); return; }
      router.replace('/teacher/pending');
      return;
    }
    router.replace('/student/feed');
  }

  /* ── Send OTP ────────────────────────────────────────────── */
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Failed to send OTP.'); return; }
      toast.success('OTP sent! Check your inbox.');
      setStep('otp');
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── OTP input handling ──────────────────────────────────── */
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      otpRefs.current[5]?.focus();
    }
  }

  /* ── Verify OTP ──────────────────────────────────────────── */
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    try {
      const result = await signIn('otp', {
        email:    email.trim(),
        otp:      code,
        redirect: false,
      });
      if (result?.error) {
        toast.error('Invalid or expired OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        return;
      }
      toast.success('Signed in successfully!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Google sign-in ──────────────────────────────────────── */
  async function handleGoogleLogin() {
    setGLoading(true);
    try {
      await signIn('google', { callbackUrl: '/onboarding' });
    } catch {
      toast.error('Google sign-in failed. Please try again.');
      setGLoading(false);
    }
  }

  // While NextAuth is resolving the session — but if it's a deleted
  // account flow, don't show the spinner (avoids a visible flash).
  if (status === 'loading' && !isDeletedAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 size={32} className="animate-spin text-[#f97316]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Top bar */}
      <header className="h-[100px] bg-white border-b border-[#E5E7EB] flex items-center px-6">
        <Logo size="sm" />
        <Link
          href="/"
          className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-4">

          {/* ── Deleted account banner ─────────────────────────── */}
          {isDeletedAccount && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-extrabold text-red-700 text-sm">Account Removed</p>
                <p className="text-red-600 text-xs mt-1 leading-relaxed">
                  Your account has been removed by an administrator. If you believe
                  this is a mistake, please contact support.
                </p>
              </div>
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] px-8 py-8 text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">
                {step === 'email' ? 'Welcome to VidyaSangrah' : 'Enter your code'}
              </h1>
              <p className="text-white/80 text-sm mt-2">
                {step === 'email'
                  ? isDeletedAccount
                    ? 'Sign in with a different account to continue'
                    : 'Sign in or create your free account'
                  : `We sent a 6-digit code to ${email}`}
              </p>
            </div>

            {/* Card body */}
            <div className="px-8 py-8 space-y-6">

              {/* ── STEP: EMAIL ── */}
              {step === 'email' && (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={gLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[#E5E7EB] rounded-xl font-bold text-[#111827] hover:border-[#f97316] hover:bg-orange-50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {gLoading ? <Loader2 size={18} className="animate-spin" /> : <Chrome size={18} className="text-[#4285F4]" />}
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-[#E5E7EB]" />
                    <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">or with email OTP</span>
                    <div className="flex-1 h-px bg-[#E5E7EB]" />
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-[#111827] mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoFocus
                        className="input-base"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Login Code <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </>
              )}

              {/* ── STEP: OTP ── */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-4 text-center">
                      6-Digit Verification Code
                    </label>
                    <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className={`w-12 h-14 text-center text-xl font-extrabold border-2 rounded-xl outline-none transition-all duration-200 ${
                            digit
                              ? 'border-[#f97316] bg-orange-50 text-[#f97316]'
                              : 'border-[#E5E7EB] bg-white text-[#111827]'
                          } focus:border-[#f97316] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)]`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Verify & Sign In <ArrowRight size={18} /></>}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); }}
                      className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#111827] font-semibold transition-colors"
                    >
                      <ChevronLeft size={16} /> Change email
                    </button>

                    {countdown > 0 ? (
                      <span className="text-[#6B7280] font-semibold">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp as any}
                        className="flex items-center gap-1.5 text-[#f97316] hover:text-[#ea580c] font-bold transition-colors"
                      >
                        <RotateCcw size={14} /> Resend code
                      </button>
                    )}
                  </div>
                </form>
              )}

              <p className="text-xs text-[#6B7280] text-center leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#" className="text-[#f97316] font-semibold hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-[#f97316] font-semibold hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
      <LanguageSelector />
    </div>
  );
}