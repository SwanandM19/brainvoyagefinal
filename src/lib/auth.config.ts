import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OtpToken from '@/models/OtpToken';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60,
  },

  pages: {
    signIn:  '/auth/login',
    error:   '/auth/error',
    newUser: '/onboarding',
  },

  providers: [
    /* ── Google OAuth ─────────────────────────────────────── */
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
      },
    }),

    /* ── OTP / Email Credentials ──────────────────────────── */
    CredentialsProvider({
      id:   'otp',
      name: 'OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp:   { label: 'OTP',   type: 'text'  },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;

        await connectDB();

        const tokenDoc = await OtpToken.findOne({
          email:     credentials.email.toLowerCase(),
          expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (!tokenDoc) return null;

        if (tokenDoc.attempts >= 5) {
          await OtpToken.deleteOne({ _id: tokenDoc._id });
          return null;
        }

        const valid = await bcrypt.compare(credentials.otp, tokenDoc.otp);

        if (!valid) {
          await OtpToken.updateOne({ _id: tokenDoc._id }, { $inc: { attempts: 1 } });
          return null;
        }

        await OtpToken.deleteOne({ _id: tokenDoc._id });

        let user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          const isAdmin = credentials.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
          user = await User.create({
            email:               credentials.email.toLowerCase(),
            name:                credentials.email.split('@')[0],
            role:                isAdmin ? 'admin' : 'student',
            onboardingCompleted: isAdmin ? true : false,
          });
        }

        return {
          id:                  user._id.toString(), // ✅ MongoDB _id
          email:               user.email,
          name:                user.name,
          image:               user.image,
          role:                user.role,
          teacherStatus:       user.teacherStatus,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],

  callbacks: {
    /* ── Google sign-in: create user if first time ───────── */
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();

        const existing = await User.findOne({ email: user.email!.toLowerCase() });

        if (!existing) {
          const isAdmin = user.email!.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
          await User.create({
            email:               user.email!.toLowerCase(),
            name:                user.name  ?? 'User',
            image:               user.image ?? undefined,
            role:                isAdmin ? 'admin' : 'student',
            emailVerified:       new Date(),
            onboardingCompleted: isAdmin ? true : false,
          });
        } else if (user.image && !existing.image) {
          await User.updateOne({ _id: existing._id }, { image: user.image });
        }
      }
      return true;
    },

    /* ── Attach custom fields to JWT ─────────────────────── */
    async jwt({ token, user, trigger, session }) {
      // On sign-in via Credentials — user.id is already MongoDB _id
      if (user) {
        token.id                  = user.id;
        token.mongoId             = user.id; // ✅ alias used by API routes
        token.role                = user.role;
        token.teacherStatus       = user.teacherStatus;
        token.onboardingCompleted = user.onboardingCompleted;
      }

      // On session update (e.g. after onboarding)
      if (trigger === 'update' && session) {
        if (session.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
        if (session.role)                              token.role                = session.role;
        if (session.teacherStatus !== undefined)       token.teacherStatus       = session.teacherStatus;
      }

      // Google OAuth — token.id not set yet on first load, fetch from DB
      if (!token.role || !token.mongoId) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email }).lean();
        if (dbUser) {
          token.id                  = (dbUser as any)._id.toString();
          token.mongoId             = (dbUser as any)._id.toString(); // ✅ alias
          token.role                = (dbUser as any).role;
          token.teacherStatus       = (dbUser as any).teacherStatus;
          token.onboardingCompleted = (dbUser as any).onboardingCompleted;
        }
      }

      return token;
    },

    /* ── Expose JWT fields on the session ────────────────── */
    async session({ session, token }) {
      session.user.id                  = token.id;
      session.user.role                = token.role;
      session.user.teacherStatus       = token.teacherStatus;
      session.user.onboardingCompleted = token.onboardingCompleted;
      return session;
    },
  },
};
