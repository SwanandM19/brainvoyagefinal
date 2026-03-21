import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import Logo from '@/components/layout/Logo';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <Logo size="lg" className="justify-center" />
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-10">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShieldX size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-extrabold text-[#111827] mb-3">Access Denied</h1>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
            You don't have permission to view this page. Please sign in with the correct account.
          </p>
          <div className="space-y-3">
            <Link href="/auth/login" className="btn-primary w-full block py-3 rounded-xl text-sm text-center">
              Sign In Again
            </Link>
            <Link href="/" className="block py-3 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
