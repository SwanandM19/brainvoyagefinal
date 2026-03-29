import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Never block these ──────────────────────────────────────
  const alwaysPublic = [
    '/_next',
    '/favicon.ico',
    '/api',
    '/auth',
    '/unauthorized',
    '/images',        // ✅ public/images/ folder (logos, icons, etc.)
  ];

  if (
    alwaysPublic.some((p) => pathname.startsWith(p)) ||
    pathname === '/' ||
    // ✅ Allow any static file extension at root level
    /\.(png|jpg|jpeg|svg|webp|ico|gif|woff|woff2|ttf|otf)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ── Get JWT token ──────────────────────────────────────────
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  // Not logged in → redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role                = token.role as string;
  const onboardingCompleted = token.onboardingCompleted as boolean;
  const teacherStatus       = token.teacherStatus as string | undefined;

  // ── Force onboarding for new users (PAGE routes only) ─────
  if (!onboardingCompleted && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // ── Role-based guards ──────────────────────────────────────
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (pathname.startsWith('/teacher') && role !== 'teacher') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (pathname.startsWith('/student') && role !== 'student') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // ── Pending teachers ───────────────────────────────────────
  if (
    pathname.startsWith('/teacher') &&
    !pathname.startsWith('/teacher/pending') &&
    role === 'teacher' &&
    teacherStatus !== 'approved'
  ) {
    return NextResponse.redirect(new URL('/teacher/pending', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // ✅ Also exclude image/font extensions right in the matcher
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.gif|.*\\.ico|.*\\.woff2?).*)',],
};