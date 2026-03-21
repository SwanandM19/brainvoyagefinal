'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import Logo from '@/components/layout/Logo';

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin:        'Error starting Google sign-in. Please try again.',
  OAuthCallback:      'Error completing Google sign-in. Please try again.',
  OAuthCreateAccount: 'Could not create account with Google. Try email OTP instead.',
  EmailCreateAccount: 'Could not create account with this email.',
  Callback:           'Authentication callback error. Please try again.',
  OAuthAccountNotLinked:
    'This email is already linked to a different sign-in method.',
  SessionRequired:    'Please sign in to access this page.',
  default:            'An unexpected authentication error occurred.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error        = searchParams.get('error') ?? 'default';
  const message      = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <Logo size="lg" className="justify-center" />

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-10">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-extrabold text-[#111827] mb-3">Authentication Error</h1>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-6">{message}</p>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="btn-primary w-full block py-3 rounded-xl text-sm text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block py-3 rounded-xl text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <p className="text-xs text-[#6B7280]">
          Error code: <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{error}</code>
        </p>
      </div>
    </div>
  );
}
