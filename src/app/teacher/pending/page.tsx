import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle, XCircle, Mail, LogOut } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';

export default async function TeacherPendingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user)                  redirect('/auth/login');
  if (session.user.role !== 'teacher') redirect('/unauthorized');
  // ── REMOVED: if approved redirect to dashboard ──
  // Teacher sees this page regardless — we show button if approved

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean() as any;
  const status = user?.teacherStatus ?? 'pending';

  // Check subscription
  const sub = await Subscription.findOne({ teacherId: user?._id }).lean() as any;
  const hasPaid = sub && sub.status === 'active';

  // If approved but hasn't paid yet — go pay first
  if (status === 'approved' && !hasPaid) {
    redirect('/teacher/subscription');
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center px-6">
        <Logo size="sm" />
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-[#6B7280] hidden sm:block">{session.user.email}</span>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-red-500 transition-colors"
          >
            <LogOut size={15} /> Sign out
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-20 text-center">

        {/* Status icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          status === 'pending'  ? 'bg-amber-50'  :
          status === 'rejected' ? 'bg-red-50'    : 'bg-green-50'
        }`}>
          {status === 'pending'  && <Clock       size={36} className="text-amber-500" />}
          {status === 'rejected' && <XCircle     size={36} className="text-red-500"   />}
          {status === 'approved' && <CheckCircle size={36} className="text-green-500" />}
        </div>

        <h1 className="text-2xl font-extrabold text-[#111827] mb-3">
          {status === 'pending'  && 'Application Under Review'}
          {status === 'rejected' && 'Application Not Approved'}
          {status === 'approved' && 'You\'re Approved! 🎉'}
        </h1>

        <p className="text-[#6B7280] leading-relaxed mb-6">
          {status === 'pending' && (
            <>
              Hi <strong>{user?.name}</strong>! Your teacher application has been received.
              Our team reviews applications within <strong>24–48 hours</strong>.
              You'll receive an email at <strong>{session.user.email}</strong> once a decision is made.
            </>
          )}
          {status === 'approved' && (
            <>
              Congratulations <strong>{user?.name}</strong>! Your application has been approved.
              You can now access your full teacher dashboard.
            </>
          )}
          {status === 'rejected' && (
            <>
              Unfortunately your application was not approved at this time.
              {user?.teacherRejectionNote && (
                <span className="block mt-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
                  <strong>Reason:</strong> {user.teacherRejectionNote}
                </span>
              )}
            </>
          )}
        </p>

        {/* Profile summary — only when pending */}
        {status === 'pending' && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 text-left mb-6 space-y-4">
            <h3 className="font-bold text-[#111827] text-sm uppercase tracking-widest">Your Submitted Profile</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-semibold">Name</span>
                <span className="font-bold text-[#111827]">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-semibold">Experience</span>
                <span className="font-bold text-[#111827]">{user?.yearsOfExperience ?? 0} years</span>
              </div>
              {user?.subjects?.length ? (
                <div>
                  <span className="text-[#6B7280] font-semibold block mb-1.5">Subjects</span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.subjects.map((s: string) => (
                      <span key={s} className="text-xs bg-orange-50 border border-orange-200 text-[#f97316] font-bold px-2.5 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {user?.classes?.length ? (
                <div>
                  <span className="text-[#6B7280] font-semibold block mb-1.5">Classes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.classes.map((c: string) => (
                      <span key={c} className="text-xs bg-gray-100 border border-gray-200 text-[#6B7280] font-bold px-2.5 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="space-y-3">

          {/* ── APPROVED: Go to Dashboard button ── */}
          {status === 'approved' && hasPaid && (
            <Link
              href="/teacher/feed"
              className="w-full block py-4 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-extrabold text-base rounded-xl hover:opacity-90 transition-opacity text-center shadow-lg shadow-orange-200"
            >
              🚀 Go to Dashboard
            </Link>
          )}

          {status === 'rejected' && (
            <Link
              href="/onboarding"
              className="btn-primary w-full block py-3 rounded-xl text-sm text-center"
            >
              Re-apply with Updated Profile
            </Link>
          )}

          <a
            href={`mailto:team@servexai.in?subject=Teacher Application — ${session.user.email}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#f97316] hover:text-[#f97316] transition-all"
          >
            <Mail size={16} /> Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
