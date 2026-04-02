'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronLeft, Loader2, BookOpen, X, CreditCard, Shield } from 'lucide-react';
import { initiateRazorpayCheckout } from '@/components/teacher/TeacherSubscriptionClient';
import { toast } from 'sonner';

const ALL_SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology','English',
  'Hindi','History','Geography','Political Science','Economics',
  'Computer Science','Accountancy','Business Studies',
  'Environmental Science','Physical Education','Art','Music',
  'Sanskrit','Urdu','Social Science',
];

const ALL_CLASSES = [
  'Class 1','Class 2','Class 3','Class 4','Class 5',
  'Class 6','Class 7','Class 8','Class 9','Class 10',
  'Class 11','Class 12',
];

const ALL_BOARDS = [
  'CBSE','ICSE','IGCSE',
  'Maharashtra SSC','UP Board','Rajasthan Board',
  'Karnataka Board','Tamil Nadu Board','AP Board',
  'Telangana Board','Gujarat Board','Other State Board',
  'JEE','NEET','UPSC',
];

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh',
];

interface Props {
  email:       string;
  defaultName: string;
  onBack:      () => void;
  onSubmit:    (data: Record<string, any>) => Promise<void>;
}

function MultiSelect({
  label, options, selected, onChange, error, max = 10,
}: {
  label: string; options: string[]; selected: string[];
  onChange: (v: string[]) => void; error?: string; max?: number;
}) {
  function toggle(item: string) {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else if (selected.length < max) {
      onChange([...selected, item]);
    }
  }

  return (
    <div>
      <label className="block text-sm font-bold text-[#111827] mb-1.5">
        {label} <span className="text-red-500">*</span>
        {selected.length > 0 && (
          <span className="ml-2 text-xs font-normal text-[#6B7280]">({selected.length} selected)</span>
        )}
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-[#f97316] text-xs font-bold px-3 py-1 rounded-full"
            >
              {item}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Options grid */}
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 ${
                isSelected
                  ? 'bg-[#f97316] border-[#f97316] text-white'
                  : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#f97316] hover:text-[#f97316]'
              }`}
            >
              {isSelected ? <span className="flex items-center gap-1"><span>✓</span>{item}</span> : item}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function TeacherOnboardingForm({ email, defaultName, onBack, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const { update } = useSession();
  const [form, setForm] = useState({
    name:               defaultName || '',
    bio:                '',
    phone:              '',
    city:               '',
    state:              '',
    qualifications:     '',
    yearsOfExperience:  '',
    subjects:           [] as string[],
    classes:            [] as string[],
    boards:             [] as string[],
    autopay:            true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())         e.name     = 'Full name is required.';
    if (!form.subjects.length)     e.subjects = 'Select at least one subject.';
    if (!form.classes.length)      e.classes  = 'Select at least one class.';
    if (!form.boards.length)       e.boards   = 'Select at least one board.';
    if (!form.bio.trim())          e.bio      = 'A short bio is required for verification.';
    if (!form.qualifications.trim()) e.qualifications = 'Qualifications are required for verification.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      // 1. Submit onboarding profile first
      await onSubmit(form);

      // 2. If autopay, trigger Razorpay
      if (form.autopay) {
        const subRes = await fetch('/api/subscription/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ autopay: true }),
        });
        const subData = await subRes.json();

        if (!subRes.ok) {
          toast.error(subData.error ?? 'Failed to initiate subscription.');
          setLoading(false);
          return;
        }

        // Already subscribed — skip Razorpay and go straight to pending
        if (subData.alreadyActive) {
          toast.success('Subscription already active!');
          window.location.href = '/teacher/pending';
          return;
        }

        await initiateRazorpayCheckout({
          subscriptionId: subData.subscriptionId,
          keyId: subData.razorpayKeyId,
          prefill: {
            name: form.name,
            email: email,
          },
          onSuccess: async (response) => {
            try {
              const verifyRes = await fetch('/api/subscription/verify', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_subscription_id: response.razorpay_subscription_id,
                  razorpay_payment_id:      response.razorpay_payment_id,
                  razorpay_signature:       response.razorpay_signature,
                }),
              });

              // if (verifyRes.ok) {
              //   toast.success('🎉 Subscription activated! Welcome aboard.');
              //   window.location.href = '/teacher/pending';
              // } else {
              //   toast.error('Payment verification failed.');
              // }
              if (verifyRes.ok) {
  toast.success('🎉 Subscription activated! Welcome aboard.');
  await update({
    onboardingCompleted: true,
    role: 'teacher',
    teacherStatus: 'pending',
  });
  window.location.href = '/teacher/pending';
} else {
  toast.error('Payment verification failed.');
}
            } catch {
              toast.error('Verification error.');
            }
          },
          // onDismiss: () => {
          //   toast.warning('Payment cancelled. You can complete it later.');
          //   window.location.href = '/teacher/pending';
          // }
          onDismiss: async () => {
  toast.warning('Payment cancelled. You can complete it later.');
  await update({
    onboardingCompleted: true,
    role: 'teacher',
    teacherStatus: 'pending',
  });
  window.location.href = '/teacher/pending';
}
        });
      } else {
        window.location.href = '/teacher/pending';
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#f97316] to-[#ea580c] px-8 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold mb-4 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Teacher Application</h2>
            <p className="text-white/70 text-sm">Set up your profile and start teaching for free</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-[#111827] mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Priya Sharma"
            maxLength={100}
            className={`input-base ${errors.name ? 'border-red-400' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <MultiSelect
          label="Subjects You Teach"
          options={ALL_SUBJECTS}
          selected={form.subjects}
          onChange={(v) => set('subjects', v)}
          error={errors.subjects}
        />

        <MultiSelect
          label="Classes You Teach"
          options={ALL_CLASSES}
          selected={form.classes}
          onChange={(v) => set('classes', v)}
          error={errors.classes}
        />

        <MultiSelect
          label="Boards / Exams You Cover"
          options={ALL_BOARDS}
          selected={form.boards}
          onChange={(v) => set('boards', v)}
          error={errors.boards}
        />

        <div>
          <label className="block text-sm font-bold text-[#111827] mb-1.5">
            Qualifications <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.qualifications}
            onChange={(e) => set('qualifications', e.target.value)}
            placeholder="e.g. B.Ed, M.Sc Mathematics"
            maxLength={200}
            className={`input-base ${errors.qualifications ? 'border-red-400' : ''}`}
          />
          {errors.qualifications && <p className="text-red-500 text-xs mt-1">{errors.qualifications}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">Experience (Years)</label>
            <input
              type="number"
              value={form.yearsOfExperience}
              onChange={(e) => set('yearsOfExperience', e.target.value)}
              placeholder="e.g. 5"
              min={0} max={60}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="input-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#111827] mb-1.5">Teaching Bio <span className="text-red-500">*</span></label>
          <textarea
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="Describe your teaching style..."
            maxLength={500}
            rows={3}
            className={`input-base resize-none ${errors.bio ? 'border-red-400' : ''}`}
          />
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
        </div>

        {/* Autopay Checkbox - Glassmorphic Card */}
        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <label className="flex items-start gap-4 cursor-pointer">
            <div className="mt-1">
              <input
                type="checkbox"
                checked={form.autopay}
                onChange={(e) => set('autopay', e.target.checked)}
                className="w-5 h-5 rounded border-orange-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-[#111827]">Enable Autopay</span>
                <span className="bg-green-100 text-green-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  🎉 1st Month Free
                </span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Enjoy your first month completely free! After that, you'll be charged <span className="font-bold text-[#111827]">₹200/month</span> automatically. Cancel anytime from your dashboard.
              </p>
              <div className="mt-3 flex items-center gap-3 text-[10px] font-semibold text-[#f97316]">
                <div className="flex items-center gap-1"><CreditCard size={12}/> Secured Payment</div>
                <div className="flex items-center gap-1"><Shield size={12}/> Trial Period Protection</div>
              </div>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 rounded-xl text-base font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Processing...</>
          ) : (
            form.autopay ? '🚀 Start Free Trial & Join' : '🚀 Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
