import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import OtpToken from '@/models/OtpToken';
import { sendOtpEmail } from '@/lib/email';

// Rate limit: max 3 OTP requests per 10 minutes per email
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS         = 3;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string = body?.email?.toLowerCase()?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Rate limiting check
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recentCount = await OtpToken.countDocuments({
      email,
      createdAt: { $gte: windowStart },
    });

    if (recentCount >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait 10 minutes before trying again.' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = await bcrypt.hash(otp, 10);

    // Delete previous unused OTPs for this email
    await OtpToken.deleteMany({ email });

    // Store hashed OTP
    await OtpToken.create({
      email,
      otp:       hashed,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send email
    await sendOtpEmail(email, otp);

    return NextResponse.json(
      { message: 'OTP sent successfully. Check your inbox.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[SEND_OTP_ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
