import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, R2_BUCKET } from '@/lib/r2';
import { R2_LIMITS } from '@/lib/r2RateLimit';
import connectDB from '@/lib/db';
import UploadLog from '@/models/UploadLog';
import { randomUUID } from 'crypto';

const MAX_PHOTO_SIZE_MB    = 10;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
const ALLOWED_PHOTO_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (token.teacherStatus !== 'approved') {
      return NextResponse.json({ error: 'Teacher not approved.' }, { status: 403 });
    }

    const { fileName, fileType, fileSize } = await req.json();

    // ── Validate type ────────────────────────────────
    if (!ALLOWED_PHOTO_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: `File type ${fileType} not allowed. Use JPEG, PNG, WebP or GIF.` },
        { status: 400 }
      );
    }

    // ── Validate size ────────────────────────────────
    if (fileSize > MAX_PHOTO_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Photo too large. Max ${MAX_PHOTO_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    await connectDB();

    const today     = new Date().toISOString().slice(0, 10);
    const month     = today.slice(0, 7);
    const teacherId = (token.id ?? token.sub) as string;

    // ── Check daily upload limit ─────────────────────
    const dayLog = await UploadLog.findOne({
      teacherId, period: 'day', date: today,
    }).lean() as any;

    if (dayLog && dayLog.uploadsToday >= R2_LIMITS.MAX_UPLOADS_PER_TEACHER_PER_DAY) {
      return NextResponse.json(
        { error: `Daily upload limit reached (${R2_LIMITS.MAX_UPLOADS_PER_TEACHER_PER_DAY}/day). Try again tomorrow.` },
        { status: 429 }
      );
    }

    // ── Check monthly limit ──────────────────────────
    const monthLog = await UploadLog.findOne({
      teacherId, period: 'month', month,
    }).lean() as any;

    if (monthLog) {
      if (monthLog.uploadsMonth >= R2_LIMITS.MAX_UPLOADS_PER_TEACHER_PER_MONTH) {
        return NextResponse.json(
          { error: 'Monthly upload limit reached.' },
          { status: 429 }
        );
      }
      if (monthLog.bytesUsed + fileSize > R2_LIMITS.MAX_STORAGE_BYTES) {
        return NextResponse.json(
          { error: 'Storage limit reached for this month.' },
          { status: 429 }
        );
      }
    }

    // ── Check platform Class A ops ───────────────────
    // FIX: filter by month (matches unique index) not date
    const platformLog = await UploadLog.findOne({
      teacherId: 'platform', period: 'platform-day', month,
    }).lean() as any;

    if (platformLog && platformLog.classAOpsToday >= R2_LIMITS.MAX_CLASS_A_OPS_PER_DAY) {
      return NextResponse.json(
        { error: 'Platform upload capacity reached for today. Try again tomorrow.' },
        { status: 503 }
      );
    }

    // ── Generate R2 object key ───────────────────────
    const ext       = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
    const objectKey = `photos/${teacherId}/${randomUUID()}.${ext}`;

    // ── Generate presigned PUT URL ───────────────────
    const command = new PutObjectCommand({
      Bucket:        R2_BUCKET,
      Key:           objectKey,
      ContentType:   fileType,
      ContentLength: fileSize,
    });

    const presignedUrl = await getSignedUrl(getR2Client(), command, {
      expiresIn: R2_LIMITS.PRESIGN_EXPIRY_SECONDS,
    });

    // ── Increment platform Class A counter ───────────
    // FIX: upsert on month (unique index key), store date in $set
    await UploadLog.findOneAndUpdate(
      { teacherId: 'platform', period: 'platform-day', month },
      { $inc: { classAOpsToday: 1 }, $set: { date: today } },
      { upsert: true }
    );

    return NextResponse.json({
      presignedUrl,
      objectKey,
      publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL!.replace(/\/$/, '')}/${objectKey}`,
      expiresIn: R2_LIMITS.PRESIGN_EXPIRY_SECONDS,
    });

  } catch (err) {
    console.error('[PRESIGN_PHOTO]', err);
    return NextResponse.json({ error: 'Failed to generate upload URL.' }, { status: 500 });
  }
}
