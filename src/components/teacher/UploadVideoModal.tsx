'use client';

import { useState, useRef, useCallback } from 'react';
import {
  X, Upload, Loader2, Video as VideoIcon,
  CheckCircle, ImageIcon, AlertCircle, CloudUpload,
} from 'lucide-react';
import { R2_LIMITS } from '@/lib/r2RateLimit';
// import { useGoogleTranslatePause } from "@/hooks/useGoogleTranslatePause";

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Hindi', 'History', 'Geography', 'Computer Science', 'Economics',
  'Accountancy', 'Business Studies', 'Environmental Science',
];

const ALL_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12',
];

const ALL_BOARDS = [
  'CBSE', 'ICSE', 'Maharashtra SSC', 'UP Board', 'Rajasthan Board',
  'Karnataka Board', 'Tamil Nadu Board', 'JEE', 'NEET', 'UPSC', 'Other State Board',
];

interface Props { onClose: () => void; onSuccess?: (v: any) => void; }

type UploadStep = 'details' | 'uploading' | 'done' | 'error';

export default function UploadVideoModal({ onClose }: Props) {
  // useGoogleTranslatePause();

  const [step, setStep] = useState<UploadStep>('details');
  const [stageLabel, setStageLabel] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    classes: [] as string[],
    boards: [] as string[],
    tags: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = R2_LIMITS.MAX_VIDEO_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrors(p => ({ ...p, video: `Max size is ${R2_LIMITS.MAX_VIDEO_SIZE_MB}MB.` }));
      return;
    }
    if (!R2_LIMITS.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setErrors(p => ({ ...p, video: 'Only MP4, WebM, MOV, AVI allowed.' }));
      return;
    }
    setErrors(p => ({ ...p, video: '' }));
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    const vid = document.createElement('video');
    vid.src = url;
    vid.onloadedmetadata = () => { setVideoDuration(Math.round(vid.duration)); URL.revokeObjectURL(url); };
  }

  function handleThumbSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = R2_LIMITS.MAX_THUMBNAIL_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrors(p => ({ ...p, thumb: `Max thumbnail size is ${R2_LIMITS.MAX_THUMBNAIL_SIZE_MB}MB.` }));
      return;
    }
    setErrors(p => ({ ...p, thumb: '' }));
    setThumbFile(file);
  }

  function toggleMulti(key: 'classes' | 'boards', value: string) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value],
    }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.subject) e.subject = 'Subject is required.';
    if (!videoFile) e.video = 'Please select a video file.';
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
      xhr.addEventListener('load', () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
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
    setVideoProgress(0);
    setThumbProgress(0);

    try {
      setStageLabel('⏳ Preparing upload...');
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: videoFile!.name,
          fileType: videoFile!.type,
          fileSize: videoFile!.size,
          uploadType: 'video',
        }),
      });
      let presignData: any = {};
      try { presignData = await presignRes.json(); } catch { /* non-JSON */ }
      if (!presignRes.ok) {
        setErrorMsg(presignData?.error ?? 'Failed to get upload URL.');
        setStep('error');
        return;
      }

      setStageLabel('🎬 Uploading video to cloud...');
      await uploadToR2(presignData.presignedUrl, videoFile!, p => setVideoProgress(p));

      let thumbnailPublicUrl = '';
      let thumbnailKey = '';
      if (thumbFile) {
        setStageLabel('🖼 Uploading thumbnail...');
        const thumbPresignRes = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: thumbFile.name,
            fileType: thumbFile.type,
            fileSize: thumbFile.size,
            uploadType: 'thumbnail',
          }),
        });
        let thumbData: any = {};
        try { thumbData = await thumbPresignRes.json(); } catch { /* non-JSON */ }
        if (thumbPresignRes.ok) {
          await uploadToR2(thumbData.presignedUrl, thumbFile, p => setThumbProgress(p));
          thumbnailPublicUrl = thumbData.publicUrl;
          thumbnailKey = thumbData.objectKey;
        }
      }

      setStageLabel('💾 Saving video details...');
      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectKey: presignData.objectKey,
          publicUrl: presignData.publicUrl,
          thumbnailKey: thumbnailKey,
          thumbnailUrl: thumbnailPublicUrl,
          title: form.title.trim(),
          description: form.description.trim(),
          subject: form.subject,
          classes: form.classes,
          boards: form.boards,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          duration: videoDuration,
          fileSize: videoFile!.size,
        }),
      });

      let completeData: any = {};
      try { completeData = await completeRes.json(); } catch { /* empty or non-JSON response */ }

      if (!completeRes.ok) {
        setErrorMsg(completeData?.error ?? 'Failed to save video.');
        setStep('error');
        return;
      }

      setStep('done');

    } catch (err: any) {
      console.error('[UPLOAD]', err);
      setErrorMsg(err.message ?? 'Upload failed. Please try again.');
      setStep('error');
    }
  }

  // ── Uploading screen ──────────────────────────────────────
  // ✅ FIX: removed translate="no" from root div so GT can translate the modal
  if (step === 'uploading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CloudUpload size={20} className="text-[#f97316]" />
            </div>
            <div>
              <p className="font-extrabold text-[#111827]">Uploading to Cloud</p>
              <p className="text-xs text-[#6B7280]">Please don't close this window</p>
            </div>
          </div>
          <div className="space-y-5">
            <p className="text-sm font-semibold text-[#6B7280]">{stageLabel}</p>
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#6B7280] mb-1.5">
                <span>🎬 Video</span><span>{videoProgress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-[#f97316] rounded-full transition-all duration-300"
                  style={{ width: `${videoProgress}%` }} />
              </div>
            </div>
            {thumbFile && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#6B7280] mb-1.5">
                  <span>🖼 Thumbnail</span><span>{thumbProgress}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${thumbProgress}%` }} />
                </div>
              </div>
            )}
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
          <p className="font-extrabold text-[#111827] text-lg">Video Submitted! 🎉</p>
          <p className="text-sm text-[#6B7280] mt-2 max-w-xs mx-auto">
            Your video has been uploaded to Cloudflare R2 and is pending admin review. It will go live once approved.
          </p>
          <button
            onClick={() => { onClose(); window.location.reload(); }}
            className="btn-primary w-full py-3 rounded-xl mt-6">
            Back to Dashboard
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
            <button onClick={() => { setStep('details'); setErrorMsg(''); setVideoProgress(0); setThumbProgress(0); }}
              className="flex-1 py-3 bg-[#f97316] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
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
          <div>
            <h2 className="font-extrabold text-[#111827]">Upload New Video</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Max {R2_LIMITS.MAX_VIDEO_SIZE_MB}MB · {R2_LIMITS.MAX_UPLOADS_PER_TEACHER_PER_DAY} uploads/day
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Video file */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              Video File <span className="text-red-500">*</span>
              <span className="text-[#6B7280] font-normal ml-1">(MP4, MOV, WebM — max {R2_LIMITS.MAX_VIDEO_SIZE_MB}MB)</span>
            </label>
            <input ref={videoInputRef} type="file"
              accept={R2_LIMITS.ALLOWED_VIDEO_TYPES.join(',')}
              className="hidden" onChange={handleVideoSelect} />
            <button type="button" onClick={() => videoInputRef.current?.click()}
              className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${videoFile
                  ? 'border-[#f97316] bg-orange-50'
                  : errors.video
                    ? 'border-red-400 bg-red-50'
                    : 'border-[#E5E7EB] bg-gray-50 hover:border-[#f97316] hover:bg-orange-50'
                }`}>
              {videoFile ? (
                <div className="text-center">
                  <VideoIcon size={28} className="text-[#f97316] mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#f97316] truncate max-w-xs">{videoFile.name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    {videoDuration > 0 && ` · ${Math.floor(videoDuration / 60)}:${String(videoDuration % 60).padStart(2, '0')}`}
                  </p>
                  <p className="text-xs text-[#f97316] font-semibold mt-1">Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={28} className="text-[#6B7280] mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#111827]">Click to select video</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">MP4, WebM, MOV up to {R2_LIMITS.MAX_VIDEO_SIZE_MB}MB</p>
                </div>
              )}
            </button>
            {errors.video && <p className="text-red-500 text-xs mt-1">{errors.video}</p>}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              Thumbnail <span className="text-[#6B7280] font-normal">(optional — JPG/PNG, max {R2_LIMITS.MAX_THUMBNAIL_SIZE_MB}MB)</span>
            </label>
            <input ref={thumbInputRef} type="file"
              accept={R2_LIMITS.ALLOWED_IMAGE_TYPES.join(',')}
              className="hidden" onChange={handleThumbSelect} />
            <button type="button" onClick={() => thumbInputRef.current?.click()}
              className={`w-full flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${thumbFile ? 'border-[#f97316] bg-orange-50' : 'border-[#E5E7EB] hover:border-[#f97316] hover:bg-orange-50'
                }`}>
              <ImageIcon size={20} className={thumbFile ? 'text-[#f97316]' : 'text-[#6B7280]'} />
              <div className="text-left">
                <p className="text-sm font-semibold text-[#111827]">
                  {thumbFile ? thumbFile.name : 'Add a thumbnail image'}
                </p>
                {thumbFile && <p className="text-xs text-[#6B7280]">{(thumbFile.size / 1024).toFixed(0)} KB</p>}
              </div>
            </button>
            {errors.thumb && <p className="text-red-500 text-xs mt-1">{errors.thumb}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(p => ({ ...p, title: '' })); }}
              placeholder="e.g. Trigonometry Shortcuts — Class 10 CBSE"
              maxLength={200}
              className={`input-base ${errors.title ? 'border-red-400' : ''}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <select value={form.subject}
              onChange={e => { setForm(f => ({ ...f, subject: e.target.value })); setErrors(p => ({ ...p, subject: '' })); }}
              className={`input-base ${errors.subject ? 'border-red-400' : ''}`}>
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>

          {/* Classes */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-2">Classes Covered</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CLASSES.map(c => (
                <button key={c} type="button" onClick={() => toggleMulti('classes', c)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${form.classes.includes(c)
                      ? 'bg-[#f97316] border-[#f97316] text-white'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#f97316]'
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
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${form.boards.includes(b)
                      ? 'bg-[#f97316] border-[#f97316] text-white'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#f97316]'
                    }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">Description</label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What will students learn? Any prerequisites?"
              maxLength={1000} rows={3}
              className="input-base resize-none" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">
              Tags <span className="text-[#6B7280] font-normal">(comma separated)</span>
            </label>
            <input type="text" value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="shortcut, trick, formula, derivation"
              className="input-base" />
          </div>

          {/* Limits info */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-xs text-[#6B7280]">
            <p className="font-bold text-[#f97316] mb-1">📋 Upload Limits</p>
            <p>· Max {R2_LIMITS.MAX_UPLOADS_PER_TEACHER_PER_DAY} uploads/day &nbsp;|&nbsp; {R2_LIMITS.MAX_UPLOADS_PER_TEACHER_PER_MONTH} uploads/month</p>
            <p>· Max video size: {R2_LIMITS.MAX_VIDEO_SIZE_MB}MB per video</p>
            <p>· Videos go live after admin approval</p>
          </div>

          <button type="submit"
            disabled={!videoFile || !form.title || !form.subject}
            className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed">
            <Upload size={18} /><span>Upload & Submit for Review</span>
          </button>

        </form>
      </div>
    </div>
  );
}
