'use client';

import { useState } from 'react';
import { ChevronLeft, Loader2, BookOpen, X, Plus } from 'lucide-react';

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
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Teacher Application</h2>
            {/* <p className="text-white/70 text-sm">Your profile will be reviewed by our admin team</p> */}
            <p className="text-white/70 text-sm">Set up your profile and start teaching for free</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      {/* <div className="mx-8 mt-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-sm text-amber-800 font-semibold">
          📋 After submitting, your application will be reviewed within 24–48 hours. You'll be notified once approved.
        </p>
      </div> */}

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

        {/* Subjects */}
        <MultiSelect
          label="Subjects You Teach"
          options={ALL_SUBJECTS}
          selected={form.subjects}
          onChange={(v) => set('subjects', v)}
          error={errors.subjects}
        />

        {/* Classes */}
        <MultiSelect
          label="Classes You Teach"
          options={ALL_CLASSES}
          selected={form.classes}
          onChange={(v) => set('classes', v)}
          error={errors.classes}
        />

        {/* Boards */}
        <MultiSelect
          label="Boards / Exams You Cover"
          options={ALL_BOARDS}
          selected={form.boards}
          onChange={(v) => set('boards', v)}
          error={errors.boards}
        />

        {/* Qualifications */}
        <div>
          <label className="block text-sm font-bold text-[#111827] mb-1.5">
            Qualifications <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.qualifications}
            onChange={(e) => set('qualifications', e.target.value)}
            placeholder="e.g. B.Ed, M.Sc Mathematics, 8 years experience at DPS"
            maxLength={200}
            className={`input-base ${errors.qualifications ? 'border-red-400' : ''}`}
          />
          {errors.qualifications && <p className="text-red-500 text-xs mt-1">{errors.qualifications}</p>}
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-bold text-[#111827] mb-1.5">
            Years of Teaching Experience
          </label>
          <input
            type="number"
            value={form.yearsOfExperience}
            onChange={(e) => set('yearsOfExperience', e.target.value)}
            placeholder="e.g. 5"
            min={0} max={60}
            className="input-base"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-[#111827] mb-1.5">
            Teaching Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="Describe your teaching style, achievements, and what students can expect from your videos..."
            maxLength={500}
            rows={4}
            className={`input-base resize-none ${errors.bio ? 'border-red-400' : ''}`}
          />
          <p className="text-xs text-[#6B7280] mt-1 text-right">{form.bio.length}/500</p>
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
        </div>

        {/* Phone + City + State */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              maxLength={15}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="e.g. Pune"
              maxLength={100}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">State</label>
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Submitting application...</>
          ) : (
            '🚀 Create My Teacher Account'
          )}
        </button>
      </form>
    </div>
  );
}
