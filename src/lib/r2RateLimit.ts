// ╔══════════════════════════════════════════════════════╗
// ║  EDITABLE RATE LIMIT CONFIG                          ║
// ║  Change these values before going to production      ║
// ╚══════════════════════════════════════════════════════╝

export const R2_LIMITS = {
  // ── Per-teacher upload limits ──────────────────────────
  MAX_UPLOADS_PER_TEACHER_PER_DAY:   3,      // TEST: 3  → PROD: 10
  MAX_UPLOADS_PER_TEACHER_PER_MONTH: 20,     // TEST: 20 → PROD: 60

  // ── File size limits ───────────────────────────────────
  MAX_VIDEO_SIZE_MB:     500,   // TEST: 500MB → PROD: 1000MB (1GB per project report)
  MAX_THUMBNAIL_SIZE_MB: 5,     // 5MB for thumbnails

  // ── Platform-wide daily Class A operation budget ───────
  // Free tier = 1,000,000/month → ~33,333/day
  // We cap at 500/day during testing to stay safe
  MAX_CLASS_A_OPS_PER_DAY:   500,    // TEST: 500  → PROD: 25000
  MAX_CLASS_A_OPS_PER_MONTH: 5000,   // TEST: 5000 → PROD: 900000

  // ── Storage budget (bytes) ─────────────────────────────
  // Free tier = 10GB/month
  MAX_STORAGE_BYTES: 8 * 1024 * 1024 * 1024, // TEST: 8GB → PROD: 9.5GB

  // ── Presigned URL expiry ───────────────────────────────
  PRESIGN_EXPIRY_SECONDS: 3600, // 1 hour to complete upload

  // ── Allowed file types ─────────────────────────────────
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};
