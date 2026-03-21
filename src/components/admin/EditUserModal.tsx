'use client';

import { useState, useEffect } from 'react';
import {
  X, Save, Loader2, User, GraduationCap,
  BookOpen, MapPin, Phone, Award, Star,
} from 'lucide-react';
import { toast } from 'sonner';

const ALL_SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology','English','Hindi',
  'History','Geography','Computer Science','Economics',
  'Accountancy','Business Studies',
];
const ALL_CLASSES = [
  'Class 6','Class 7','Class 8','Class 9','Class 10',
  'Class 11','Class 12',
];
const ALL_BOARDS  = ['CBSE','ICSE','IB','State Board','IGCSE'];
const TEACHER_STATUSES = ['pending','approved','rejected','suspended'];
const STUDENT_CLASSES  = [
  'Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12',
];
const STUDENT_BOARDS   = ['CBSE','ICSE','IB','State Board','IGCSE'];

interface Props {
  userId:   string;
  onClose:  () => void;
  onSaved:  (updated: any) => void;
}

function Toggle({
  label, options, value, onChange,
}: {
  label: string; options: string[]; value: string[]; onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter(x => x !== opt) : [...value, opt]);
  }
  return (
    <div>
      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt} type="button"
            onClick={() => toggle(opt)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              value.includes(opt)
                ? 'bg-[#f97316] text-white border-[#f97316]'
                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-orange-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-orange-400 text-[#111827] bg-white transition-colors";
const TEXTAREA = `${INPUT} resize-none`;

export default function EditUserModal({ userId, onClose, onSaved }: Props) {
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [user,    setUser]      = useState<any>(null);
  const [form,    setForm]      = useState<any>({});

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then(r => r.json())
      .then(d => {
        setUser(d.user);
        setForm({
          name:                 d.user.name               ?? '',
          bio:                  d.user.bio                ?? '',
          phone:                d.user.phone              ?? '',
          city:                 d.user.city               ?? '',
          state:                d.user.state              ?? '',
          points:               d.user.points             ?? 0,
          onboardingCompleted:  d.user.onboardingCompleted ?? false,
          // Teacher
          teacherStatus:        d.user.teacherStatus       ?? 'pending',
          teacherRejectionNote: d.user.teacherRejectionNote ?? '',
          subjects:             d.user.subjects            ?? [],
          classes:              d.user.classes             ?? [],
          boards:               d.user.boards              ?? [],
          qualifications:       d.user.qualifications      ?? '',
          yearsOfExperience:    d.user.yearsOfExperience   ?? '',
          // Student
          studentClass:         d.user.studentClass        ?? '',
          studentBoard:         d.user.studentBoard        ?? '',
          school:               d.user.school              ?? '',
        });
      })
      .catch(() => toast.error('Failed to load user.'))
      .finally(() => setLoading(false));
  }, [userId]);

  function set(key: string, val: unknown) {
    setForm((f: any) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const res  = await fetch(`/api/admin/users/${userId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Update failed.'); return; }
      toast.success('✅ Profile updated successfully.');
      onSaved(data.user);
      onClose();
    } catch { toast.error('Network error.'); }
    finally   { setSaving(false); }
  }

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const roleColor = isTeacher
    ? 'bg-orange-50 text-[#f97316] border-orange-200'
    : isStudent
    ? 'bg-blue-50 text-blue-600 border-blue-200'
    : 'bg-purple-50 text-purple-600 border-purple-200';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#E5E7EB]">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '…'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-[#111827] text-base">Edit Profile</h2>
              {user && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border capitalize ${roleColor}`}>
                  {user.role}
                </span>
              )}
            </div>
            {user && <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F8F9FA] transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-[#f97316]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-6">

              {/* ── SHARED ─────────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User size={14} className="text-[#9CA3AF]" />
                  <span className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider">Basic Info</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name *">
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                      className={INPUT} placeholder="Full name" required />
                  </Field>
                  <Field label="Phone">
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                      <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                        className={`${INPUT} pl-9`} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </Field>
                </div>
              </div>

              <div>
                <Field label="Bio">
                  <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                    className={TEXTAREA} rows={3} maxLength={500}
                    placeholder="Short bio…" />
                  <p className="text-[10px] text-[#9CA3AF] mt-1 text-right">{form.bio?.length ?? 0}/500</p>
                </Field>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={14} className="text-[#9CA3AF]" />
                  <span className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider">Location</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City">
                    <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                      className={INPUT} placeholder="e.g. Mumbai" />
                  </Field>
                  <Field label="State">
                    <input type="text" value={form.state} onChange={e => set('state', e.target.value)}
                      className={INPUT} placeholder="e.g. Maharashtra" />
                  </Field>
                </div>
              </div>

              {/* ── GAMIFICATION ───────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star size={14} className="text-[#9CA3AF]" />
                  <span className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider">Gamification</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Points">
                    <input type="number" value={form.points} min={0}
                      onChange={e => set('points', parseInt(e.target.value) || 0)}
                      className={INPUT} />
                  </Field>
                  <Field label="Onboarding Status">
                    <select value={form.onboardingCompleted ? 'true' : 'false'}
                      onChange={e => set('onboardingCompleted', e.target.value === 'true')}
                      className={INPUT}>
                      <option value="true">Completed</option>
                      <option value="false">Incomplete</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* ── TEACHER FIELDS ─────────────────────── */}
              {isTeacher && (
                <>
                  <div className="border-t border-[#F3F4F6] pt-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen size={14} className="text-[#9CA3AF]" />
                      <span className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider">Teacher Profile</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Field label="Account Status">
                        <select value={form.teacherStatus}
                          onChange={e => set('teacherStatus', e.target.value)}
                          className={`${INPUT} capitalize`}>
                          {TEACHER_STATUSES.map(s => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Experience (Years)">
                        <input type="number" value={form.yearsOfExperience} min={0} max={60}
                          onChange={e => set('yearsOfExperience', parseInt(e.target.value) || 0)}
                          className={INPUT} />
                      </Field>
                    </div>

                    {form.teacherStatus === 'rejected' && (
                      <div className="mb-4">
                        <Field label="Rejection Note (sent to teacher)">
                          <textarea value={form.teacherRejectionNote}
                            onChange={e => set('teacherRejectionNote', e.target.value)}
                            className={TEXTAREA} rows={2}
                            placeholder="Reason for rejection…" />
                        </Field>
                      </div>
                    )}

                    <Field label="Qualifications">
                      <input type="text" value={form.qualifications}
                        onChange={e => set('qualifications', e.target.value)}
                        className={INPUT} placeholder="e.g. B.Ed, M.Sc Physics" />
                    </Field>
                  </div>

                  <div className="space-y-4">
                    <Toggle label="Subjects"
                      options={ALL_SUBJECTS}
                      value={form.subjects}
                      onChange={v => set('subjects', v)} />
                    <Toggle label="Classes Taught"
                      options={ALL_CLASSES}
                      value={form.classes}
                      onChange={v => set('classes', v)} />
                    <Toggle label="Boards"
                      options={ALL_BOARDS}
                      value={form.boards}
                      onChange={v => set('boards', v)} />
                  </div>
                </>
              )}

              {/* ── STUDENT FIELDS ─────────────────────── */}
              {isStudent && (
                <div className="border-t border-[#F3F4F6] pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap size={14} className="text-[#9CA3AF]" />
                    <span className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider">Student Profile</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Class">
                      <select value={form.studentClass}
                        onChange={e => set('studentClass', e.target.value)}
                        className={INPUT}>
                        <option value="">Select class</option>
                        {STUDENT_CLASSES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Board">
                      <select value={form.studentBoard}
                        onChange={e => set('studentBoard', e.target.value)}
                        className={INPUT}>
                        <option value="">Select board</option>
                        {STUDENT_BOARDS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="School">
                      <input type="text" value={form.school}
                        onChange={e => set('school', e.target.value)}
                        className={INPUT} placeholder="School name" />
                    </Field>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3 flex-shrink-0 bg-[#FAFAFA]">
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-[#6B7280] hover:text-[#111827] border border-[#E5E7EB] rounded-xl hover:bg-white transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
