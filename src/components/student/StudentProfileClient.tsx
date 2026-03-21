'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Loader2, CheckCircle, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudentData {
  name: string; email: string; studentClass: string;
  studentBoard: string; school: string; city: string;
  state: string; phone: string; bio: string; points: number;
}

const CLASSES = ['Class 6','Class 7','Class 8','Class 9','Class 10',
                 'Class 11','Class 12','JEE','NEET','UPSC','CA'];
const BOARDS  = ['CBSE','ICSE','Maharashtra Board','UP Board','RBSE',
                 'Tamil Nadu Board','Karnataka Board','Other'];

export default function StudentProfileClient({ student: initial }: { student: StudentData }) {
  const router  = useRouter();
  const [form,   setForm]    = useState<StudentData>(initial);
  const [saving, setSaving]  = useState(false);
  const [saved,  setSaved]   = useState(false);
  const [error,  setError]   = useState('');

  const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  function set(field: keyof StudentData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/student/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push('/student/feed'), 1500);
      } else {
        setError('Failed to save. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">

      {/* Header */}
      <header className="h-14 bg-white border-b border-[#E5E7EB] sticky top-0 z-40 flex items-center px-4 sm:px-6 gap-4">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-[#6B7280] hover:text-[#111827] transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="font-extrabold text-[#111827] text-base">Edit Profile</h1>
        <div className="ml-auto">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-extrabold px-4 py-2 rounded-xl hover:brightness-105 transition-all disabled:opacity-60">
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : saved
              ? <><CheckCircle size={14} /> Saved!</>
              : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Avatar + name preview */}
        <div className="bg-gradient-to-r from-[#f97316] to-[#ea580c] rounded-2xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0">
            {initials || '?'}
          </div>
          <div>
            <p className="text-white font-extrabold text-lg">{form.name || 'Your Name'}</p>
            <p className="text-white/70 text-sm">{form.email}</p>
            <p className="text-white/60 text-xs mt-0.5">
              {form.studentClass && `${form.studentClass}`}
              {form.studentClass && form.studentBoard && ' · '}
              {form.studentBoard}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 space-y-4">
          <h2 className="font-extrabold text-[#111827] text-sm flex items-center gap-2">
            <Edit3 size={14} className="text-orange-400" /> Basic Info
          </h2>

          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1.5 block">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1.5 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              rows={3}
              placeholder="Tell something about yourself..."
              className="w-full px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 space-y-4">
          <h2 className="font-extrabold text-[#111827] text-sm">🎓 Academic Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1.5 block">Class</label>
              <select
                value={form.studentClass}
                onChange={e => set('studentClass', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors bg-white"
              >
                <option value="">Select class</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1.5 block">Board / Exam</label>
              <select
                value={form.studentBoard}
                onChange={e => set('studentBoard', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors bg-white"
              >
                <option value="">Select board</option>
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1.5 block">School / College</label>
            <input
              value={form.school}
              onChange={e => set('school', e.target.value)}
              placeholder="Your school or college name"
              className="w-full px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 space-y-4">
          <h2 className="font-extrabold text-[#111827] text-sm">📍 Location & Contact</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1.5 block">City</label>
              <input
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder="Your city"
                className="w-full px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1.5 block">State</label>
              <input
                value={form.state}
                onChange={e => set('state', e.target.value)}
                placeholder="Your state"
                className="w-full px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1.5 block">Phone</label>
            <input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              type="tel"
              className="w-full px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Success */}
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 text-sm font-bold px-4 py-3 rounded-xl">
            <CheckCircle size={16} /> Profile saved! Redirecting to feed…
          </div>
        )}

        {/* Save button — bottom */}
        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold py-3.5 rounded-2xl hover:brightness-105 transition-all disabled:opacity-60 text-sm shadow-lg shadow-orange-200">
          {saving
            ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
            : saved
            ? <><CheckCircle size={16} /> Saved!</>
            : <><Save size={16} /> Save Changes</>}
        </button>

      </div>
    </div>
  );
}
