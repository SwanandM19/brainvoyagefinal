'use client';

import { useState } from 'react';
import { ChevronLeft, Loader2, User } from 'lucide-react';

const CLASSES = [
  'Class 1','Class 2','Class 3','Class 4','Class 5',
  'Class 6','Class 7','Class 8','Class 9','Class 10',
  'Class 11','Class 12',
];

const BOARDS = [
  'CBSE','ICSE','IGCSE',
  'Maharashtra SSC','UP Board','Rajasthan Board',
  'Karnataka Board','Tamil Nadu Board','AP Board',
  'Telangana Board','Gujarat Board','Other State Board',
  'JEE Aspirant','NEET Aspirant','UPSC Aspirant',
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

export default function StudentOnboardingForm({ email, defaultName, onBack, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:         defaultName || '',
    studentClass: '',
    studentBoard: '',
    school:       '',
    city:         '',
    state:        '',
    bio:          '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())      e.name         = 'Full name is required.';
    if (!form.studentClass)     e.studentClass = 'Please select your class.';
    if (!form.studentBoard)     e.studentBoard = 'Please select your board.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
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
            <User size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Student Profile</h2>
            <p className="text-white/70 text-sm">{email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-[#111827] mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Aarav Mehta"
            maxLength={100}
            className={`input-base ${errors.name ? 'border-red-400 focus:border-red-400' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Class + Board */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              Class / Grade <span className="text-red-500">*</span>
            </label>
            <select
              value={form.studentClass}
              onChange={(e) => set('studentClass', e.target.value)}
              className={`input-base ${errors.studentClass ? 'border-red-400' : ''}`}
            >
              <option value="">Select class</option>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.studentClass && <p className="text-red-500 text-xs mt-1">{errors.studentClass}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              Board / Exam <span className="text-red-500">*</span>
            </label>
            <select
              value={form.studentBoard}
              onChange={(e) => set('studentBoard', e.target.value)}
              className={`input-base ${errors.studentBoard ? 'border-red-400' : ''}`}
            >
              <option value="">Select board</option>
              {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.studentBoard && <p className="text-red-500 text-xs mt-1">{errors.studentBoard}</p>}
          </div>
        </div>

        {/* School */}
        <div>
          <label className="block text-sm font-bold text-[#111827] mb-1.5">
            School Name <span className="text-[#6B7280] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.school}
            onChange={(e) => set('school', e.target.value)}
            placeholder="e.g. Delhi Public School"
            maxLength={150}
            className="input-base"
          />
        </div>

        {/* City + State */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              City <span className="text-[#6B7280] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="e.g. Nashik"
              maxLength={100}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              State <span className="text-[#6B7280] font-normal">(optional)</span>
            </label>
            <select
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              className="input-base"
            >
              <option value="">Select state</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-[#111827] mb-1.5">
            About You <span className="text-[#6B7280] font-normal">(optional)</span>
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="Tell us about yourself — your goals, favourite subjects, etc."
            maxLength={300}
            rows={3}
            className="input-base resize-none"
          />
          <p className="text-xs text-[#6B7280] mt-1 text-right">{form.bio.length}/300</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Setting up your account...</>
          ) : (
            '🚀 Complete Setup & Start Learning'
          )}
        </button>
      </form>
    </div>
  );
}
