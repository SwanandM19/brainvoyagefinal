'use client';

import { useState, useRef, useCallback } from 'react';
import {
  X, Upload, Loader2, Image as ImageIcon,
  CheckCircle, AlertCircle, CloudUpload, ZoomIn,
} from 'lucide-react';

const MAX_PHOTO_SIZE_MB    = 10;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
const ALLOWED_PHOTO_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology','English',
  'Hindi','History','Geography','Computer Science','Economics',
  'Accountancy','Business Studies','Environmental Science',
];
const ALL_CLASSES = [
  'Class 1','Class 2','Class 3','Class 4','Class 5',
  'Class 6','Class 7','Class 8','Class 9','Class 10',
  'Class 11','Class 12',
];
const ALL_BOARDS = [
  'CBSE','ICSE','Maharashtra SSC','UP Board','Rajasthan Board',
  'Karnataka Board','Tamil Nadu Board','JEE','NEET','UPSC','Other State Board',
];

interface Props {
  onClose:   () => void;
  onSuccess: (post: any) => void;
}

type UploadStep = 'details' | 'uploading' | 'done' | 'error';

export default function UploadPhotoModal({ onClose, onSuccess }: Props) {
  const [step,         setStep]         = useState<UploadStep>('details');
  const [stageLabel,   setStageLabel]   = useState('');
  const [progress,     setProgress]     = useState(0);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [photoFile,    setPhotoFile]    = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    caption: '',
    subject: '',
    classes: [] as string[],
    boards:  [] as string[],
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const xhrRef        = useRef<XMLHttpRequest | null>(null);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setErrors(p => ({ ...p, photo: 'Only JPEG, PNG, WebP or GIF allowed.' }));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setErrors(p => ({ ...p, photo: `Max photo size is ${MAX_PHOTO_SIZE_MB}MB.` }));
      return;
    }
    setErrors(p => ({ ...p, photo: '' }));
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handlePhotoSelect({ target: { files: e.dataTransfer.files } } as any);
  }

  function toggleMulti(key: 'classes' | 'boards', value: string) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value],
    }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!photoFile) e.photo = 'Please select a photo.';
    return e;
  }

  const uploadToR2 = useCallback((
    presignedUrl: string,
    file: File,
    onProgress: (pct: number) => void,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener('load',  () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
      xhr.addEventListener('error', () => reject(new Error('Network error during upload.')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled.')));
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrorMsg('');
    setStep('uploading');
    setProgress(0);

    try {
      // ── Step 1: get presigned URL ──
      setStageLabel('⏳ Preparing upload...');
      const presignRes = await fetch('/api/upload/photo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          fileName: photoFile!.name,
          fileType: photoFile!.type,
          fileSize: photoFile!.size,
        }),
      });

      // ✅ FIX: safe JSON parse
      let presignData: any = {};
      try { presignData = await presignRes.json(); } catch { /* empty body */ }

      if (!presignRes.ok) {
        setErrorMsg(presignData?.error ?? 'Failed to get upload URL.');
        setStep('error');
        return;
      }

      // ── Step 2: upload photo to R2 ──
      setStageLabel('🖼️ Uploading photo to cloud...');
      await uploadToR2(presignData.presignedUrl, photoFile!, p => setProgress(p));

      // ── Step 3: save post to DB ──
      setStageLabel('💾 Saving post...');
      const saveRes = await fetch('/api/teacher/posts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type:      'photo',
          objectKey: presignData.objectKey,
          publicUrl: presignData.publicUrl,
          caption:   form.caption.trim(),
          subject:   form.subject,
          classes:   form.classes,
          boards:    form.boards,
          fileSize:  photoFile!.size,
        }),
      });

      // ✅ FIX: safe JSON parse
      let saveData: any = {};
      try { saveData = await saveRes.json(); } catch { /* empty body */ }

      if (!saveRes.ok) {
        setErrorMsg(saveData?.error ?? 'Failed to save post.');
        setStep('error');
        return;
      }

      onSuccess({
        id:         saveData.postId,
        type:       'photo',
        photoUrl:   presignData.publicUrl,
        caption:    form.caption.trim(),
        subject:    form.subject,
        classes:    form.classes,
        boards:     form.boards,
        likesCount: 0,
        views:      0,
        createdAt:  new Date().toISOString(),
      });

      setStep('done');

    } catch (err: any) {
      console.error('[UPLOAD_PHOTO]', err);
      setErrorMsg(err.message ?? 'Upload failed. Please try again.');
      setStep('error');
    }
  }

  // ── Uploading screen ──────────────────────────────────────
  if (step === 'uploading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CloudUpload size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="font-extrabold text-[#111827]">Uploading Photo</p>
              <p className="text-xs text-[#6B7280]">Please don't close this window</p>
            </div>
          </div>
          <div className="space-y-5">
            <p className="text-sm font-semibold text-[#6B7280]">{stageLabel}</p>
            {photoPreview && (
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-[#F3F4F6]">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#6B7280] mb-1.5">
                <span>🖼️ Photo</span><span>{progress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#9CA3AF] text-center mt-6">Powered by Cloudflare R2 CDN</p>
        </div>
      </div>
    );
  }

  // ── Done screen ───────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <p className="font-extrabold text-[#111827] text-lg">Photo Posted! 🎉</p>
          <p className="text-sm text-[#6B7280] mt-2 max-w-xs mx-auto">
            Your photo is live and visible to students across the platform.
          </p>
          {photoPreview && (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-[#F3F4F6] mt-4">
              <img src={photoPreview} alt="Posted" className="w-full h-full object-cover" />
            </div>
          )}
          <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl mt-5">
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Error screen ──────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <p className="font-extrabold text-[#111827] text-lg">Upload Failed</p>
          <p className="text-sm text-red-500 mt-2 font-semibold">{errorMsg}</p>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose}
              className="flex-1 py-3 border border-[#E5E7EB] text-[#6B7280] font-bold rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => { setStep('details'); setErrorMsg(''); setProgress(0); }}
              className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Details form ──────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ImageIcon size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#111827]">Share a Photo</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">JPEG, PNG, WebP, GIF — max {MAX_PHOTO_SIZE_MB}MB</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Photo drop zone */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              Photo <span className="text-red-500">*</span>
            </label>
            <input ref={photoInputRef} type="file"
              accept={ALLOWED_PHOTO_TYPES.join(',')}
              className="hidden" onChange={handlePhotoSelect} />
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-blue-300 bg-[#F3F4F6] group">
                <img src={photoPreview} alt="Preview" className="w-full max-h-72 object-contain" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-3">
                  <button type="button" onClick={() => photoInputRef.current?.click()}
                    className="opacity-0 group-hover:opacity-100 transition-all bg-white text-[#111827] text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-orange-50">
                    Change Photo
                  </button>
                </div>
                <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                onClick={() => photoInputRef.current?.click()}
                className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${
                  errors.photo
                    ? 'border-red-400 bg-red-50'
                    : 'border-[#E5E7EB] bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                  <ImageIcon size={28} className="text-blue-400" />
                </div>
                <p className="text-sm font-bold text-[#111827]">Click or drag & drop a photo</p>
                <p className="text-xs text-[#6B7280] mt-1">JPEG, PNG, WebP, GIF up to {MAX_PHOTO_SIZE_MB}MB</p>
              </div>
            )}
            {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              Caption <span className="text-[#6B7280] font-normal ml-1">(optional)</span>
            </label>
            <textarea value={form.caption}
              onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
              placeholder="Describe what students will learn from this..."
              maxLength={2200} rows={3} className="input-base resize-none" />
            <p className="text-[10px] text-[#9CA3AF] text-right mt-1">{form.caption.length}/2200</p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">Subject</label>
            <select value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="input-base">
              <option value="">Select subject (optional)</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Classes */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-2">Classes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CLASSES.map(c => (
                <button key={c} type="button" onClick={() => toggleMulti('classes', c)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    form.classes.includes(c)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-blue-400'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Boards */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-2">Boards / Exams</label>
            <div className="flex flex-wrap gap-2">
              {ALL_BOARDS.map(b => (
                <button key={b} type="button" onClick={() => toggleMulti('boards', b)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    form.boards.includes(b)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-blue-400'
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-[#6B7280]">
            <p className="font-bold text-blue-500 mb-1">📸 Photo Guidelines</p>
            <p>· Use clear, high-quality images (notes, diagrams, boards)</p>
            <p>· Photos are live immediately — no review needed</p>
            <p>· Max {MAX_PHOTO_SIZE_MB}MB per photo</p>
          </div>

          <button type="submit" disabled={!photoFile}
            className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600">
            <Upload size={18} /><span>Post Photo</span>
          </button>

        </form>
      </div>
    </div>
  );
}
