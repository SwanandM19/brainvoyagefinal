// import type { NextAuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';
// import connectDB from '@/lib/db';
// import User from '@/models/User';
// import OtpToken from '@/models/OtpToken';

// export const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET!,

//   session: {
//     strategy: 'jwt',
//     maxAge:   30 * 24 * 60 * 60,
//   },

//   pages: {
//     signIn:  '/auth/login',
//     error:   '/auth/error',
//     newUser: '/onboarding',
//   },

//   providers: [
//     /* ── Google OAuth ─────────────────────────────────────── */
//     GoogleProvider({
//       clientId:     process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
//       },
//     }),

//     /* ── OTP / Email Credentials ──────────────────────────── */
//     CredentialsProvider({
//       id:   'otp',
//       name: 'OTP',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         otp:   { label: 'OTP',   type: 'text'  },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.otp) return null;

//         await connectDB();

//         const tokenDoc = await OtpToken.findOne({
//           email:     credentials.email.toLowerCase(),
//           expiresAt: { $gt: new Date() },
//         }).sort({ createdAt: -1 });

//         if (!tokenDoc) return null;

//         if (tokenDoc.attempts >= 5) {
//           await OtpToken.deleteOne({ _id: tokenDoc._id });
//           return null;
//         }

//         const valid = await bcrypt.compare(credentials.otp, tokenDoc.otp);

//         if (!valid) {
//           await OtpToken.updateOne({ _id: tokenDoc._id }, { $inc: { attempts: 1 } });
//           return null;
//         }

//         await OtpToken.deleteOne({ _id: tokenDoc._id });

//         let user = await User.findOne({ email: credentials.email.toLowerCase() });

//         if (!user) {
//           const isAdmin = credentials.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
//           user = await User.create({
//             email:               credentials.email.toLowerCase(),
//             name:                credentials.email.split('@')[0],
//             role:                isAdmin ? 'admin' : 'student',
//             onboardingCompleted: isAdmin ? true : false,
//           });
//         }

//         return {
//           id:                  user._id.toString(), // ✅ MongoDB _id
//           email:               user.email,
//           name:                user.name,
//           image:               user.image,
//           role:                user.role,
//           teacherStatus:       user.teacherStatus,
//           onboardingCompleted: user.onboardingCompleted,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     /* ── Google sign-in: create user if first time ───────── */
//     async signIn({ user, account }) {
//       if (account?.provider === 'google') {
//         await connectDB();

//         const existing = await User.findOne({ email: user.email!.toLowerCase() });

//         if (!existing) {
//           const isAdmin = user.email!.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
//           await User.create({
//             email:               user.email!.toLowerCase(),
//             name:                user.name  ?? 'User',
//             image:               user.image ?? undefined,
//             role:                isAdmin ? 'admin' : 'student',
//             emailVerified:       new Date(),
//             onboardingCompleted: isAdmin ? true : false,
//           });
//         } else if (user.image && !existing.image) {
//           await User.updateOne({ _id: existing._id }, { image: user.image });
//         }
//       }
//       return true;
//     },

//     /* ── Attach custom fields to JWT ─────────────────────── */
//     async jwt({ token, user, trigger, session }) {
//       // On sign-in via Credentials — user.id is already MongoDB _id
//       if (user) {
//         token.id                  = user.id;
//         token.mongoId             = user.id; // ✅ alias used by API routes
//         token.role                = user.role;
//         token.teacherStatus       = user.teacherStatus;
//         token.onboardingCompleted = user.onboardingCompleted;
//       }

//       // On session update (e.g. after onboarding)
//       if (trigger === 'update' && session) {
//         if (session.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
//         if (session.role)                              token.role                = session.role;
//         if (session.teacherStatus !== undefined)       token.teacherStatus       = session.teacherStatus;
//       }

//       // Google OAuth — token.id not set yet on first load, fetch from DB
//       if (!token.role || !token.mongoId) {
//         await connectDB();
//         const dbUser = await User.findOne({ email: token.email }).lean();
//         if (dbUser) {
//           token.id                  = (dbUser as any)._id.toString();
//           token.mongoId             = (dbUser as any)._id.toString(); // ✅ alias
//           token.role                = (dbUser as any).role;
//           token.teacherStatus       = (dbUser as any).teacherStatus;
//           token.onboardingCompleted = (dbUser as any).onboardingCompleted;
//         }
//       }

//       return token;
//     },

//     /* ── Expose JWT fields on the session ────────────────── */
//     async session({ session, token }) {
//       session.user.id                  = token.id;
//       session.user.role                = token.role;
//       session.user.teacherStatus       = token.teacherStatus;
//       session.user.onboardingCompleted = token.onboardingCompleted;
//       return session;
//     },
//   },
// };



// import type { NextAuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';
// import connectDB from '@/lib/db';
// import User from '@/models/User';
// import OtpToken from '@/models/OtpToken';

// export const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET!,

//   session: {
//     strategy: 'jwt',
//     maxAge:   30 * 24 * 60 * 60,
//   },

//   pages: {
//     signIn:  '/auth/login',
//     error:   '/auth/error',
//     newUser: '/onboarding',
//   },

//   providers: [
//     /* ── Google OAuth ─────────────────────────────────────── */
//     GoogleProvider({
//       clientId:     process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
//       },
//     }),

//     /* ── OTP / Email Credentials ──────────────────────────── */
//     CredentialsProvider({
//       id:   'otp',
//       name: 'OTP',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         otp:   { label: 'OTP',   type: 'text'  },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.otp) return null;

//         await connectDB();

//         const tokenDoc = await OtpToken.findOne({
//           email:     credentials.email.toLowerCase(),
//           expiresAt: { $gt: new Date() },
//         }).sort({ createdAt: -1 });

//         if (!tokenDoc) return null;

//         if (tokenDoc.attempts >= 5) {
//           await OtpToken.deleteOne({ _id: tokenDoc._id });
//           return null;
//         }

//         const valid = await bcrypt.compare(credentials.otp, tokenDoc.otp);

//         if (!valid) {
//           await OtpToken.updateOne({ _id: tokenDoc._id }, { $inc: { attempts: 1 } });
//           return null;
//         }

//         await OtpToken.deleteOne({ _id: tokenDoc._id });

//         let user = await User.findOne({ email: credentials.email.toLowerCase() });

//         if (!user) {
//           const isAdmin = credentials.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
//           user = await User.create({
//             email:               credentials.email.toLowerCase(),
//             name:                credentials.email.split('@')[0],
//             role:                isAdmin ? 'admin' : 'student',
//             onboardingCompleted: isAdmin ? true : false,
//           });
//         }

//         return {
//           id:                  user._id.toString(),
//           email:               user.email,
//           name:                user.name,
//           image:               user.image,
//           role:                user.role,
//           teacherStatus:       user.teacherStatus,
//           onboardingCompleted: user.onboardingCompleted,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     /* ── Google sign-in: create user if first time ───────── */
//     async signIn({ user, account }) {
//       if (account?.provider === 'google') {
//         await connectDB();

//         const existing = await User.findOne({ email: user.email!.toLowerCase() });

//         if (!existing) {
//           const isAdmin = user.email!.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
//           await User.create({
//             email:               user.email!.toLowerCase(),
//             name:                user.name  ?? 'User',
//             image:               user.image ?? undefined,
//             role:                isAdmin ? 'admin' : 'student',
//             emailVerified:       new Date(),
//             onboardingCompleted: isAdmin ? true : false,
//           });
//         } else if (user.image && !existing.image) {
//           await User.updateOne({ _id: existing._id }, { image: user.image });
//         }
//       }
//       return true;
//     },

//     /* ── Attach custom fields to JWT ─────────────────────── */
//     async jwt({ token, user, trigger, session }) {
//       // On sign-in via Credentials
//       if (user) {
//         token.id                  = user.id;
//         token.mongoId             = user.id;
//         token.role                = user.role;
//         token.teacherStatus       = user.teacherStatus;
//         token.onboardingCompleted = user.onboardingCompleted;
//         // Fresh sign-in always clears the deleted flag
//         token.deleted             = false;
//         token.checkedAt           = Date.now();
//       }

//       // On session update (e.g. after onboarding)
//       if (trigger === 'update' && session) {
//         if (session.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
//         if (session.role)                              token.role                = session.role;
//         if (session.teacherStatus !== undefined)       token.teacherStatus       = session.teacherStatus;
//       }

//       // Google OAuth — fetch from DB on first load
//       if (!token.role || !token.mongoId) {
//         await connectDB();
//         const dbUser = await User.findOne({ email: token.email }).lean();
//         if (dbUser) {
//           token.id                  = (dbUser as any)._id.toString();
//           token.mongoId             = (dbUser as any)._id.toString();
//           token.role                = (dbUser as any).role;
//           token.teacherStatus       = (dbUser as any).teacherStatus;
//           token.onboardingCompleted = (dbUser as any).onboardingCompleted;
//           token.deleted             = false;
//           token.checkedAt           = Date.now();
//         }
//       }

//       // ── Periodic existence check — catches deleted/banned users ──
//       // Re-checks DB every 30s. Cheap: uses User.exists (indexed _id lookup only).
//       if (token.mongoId && !token.deleted) {
//         const now         = Date.now();
//         const lastChecked = (token.checkedAt as number) ?? 0;

//         if (now - lastChecked > 30_000) {
//           await connectDB();
//           const exists  = await User.exists({ _id: token.mongoId as string });
//           token.checkedAt = now;

//           if (!exists) {
//             // User was deleted — mark token so proxy catches it immediately
//             token.deleted = true;
//           }
//         }
//       }

//       return token;
//     },

//     /* ── Expose JWT fields on the session ────────────────── */
//     async session({ session, token }) {
//       session.user.id                  = token.id;
//       session.user.role                = token.role;
//       session.user.teacherStatus       = token.teacherStatus;
//       session.user.onboardingCompleted = token.onboardingCompleted;
//       return session;
//     },
//   },
// };




// import type { NextAuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';
// import connectDB from '@/lib/db';
// import User from '@/models/User';
// import OtpToken from '@/models/OtpToken';

// export const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET!,

//   session: {
//     strategy: 'jwt',
//     maxAge:   30 * 24 * 60 * 60,
//   },

//   pages: {
//     signIn:  '/auth/login',
//     error:   '/auth/error',
//     newUser: '/onboarding',
//   },

//   providers: [
//     /* ── Google OAuth ─────────────────────────────────────── */
//     GoogleProvider({
//       clientId:     process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
//       },
//     }),

//     /* ── OTP / Email Credentials ──────────────────────────── */
//     CredentialsProvider({
//       id:   'otp',
//       name: 'OTP',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         otp:   { label: 'OTP',   type: 'text'  },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.otp) return null;

//         await connectDB();

//         const tokenDoc = await OtpToken.findOne({
//           email:     credentials.email.toLowerCase(),
//           expiresAt: { $gt: new Date() },
//         }).sort({ createdAt: -1 });

//         if (!tokenDoc) return null;

//         if (tokenDoc.attempts >= 5) {
//           await OtpToken.deleteOne({ _id: tokenDoc._id });
//           return null;
//         }

//         const valid = await bcrypt.compare(credentials.otp, tokenDoc.otp);

//         if (!valid) {
//           await OtpToken.updateOne({ _id: tokenDoc._id }, { $inc: { attempts: 1 } });
//           return null;
//         }

//         await OtpToken.deleteOne({ _id: tokenDoc._id });

//         let user = await User.findOne({ email: credentials.email.toLowerCase() });

//         if (!user) {
//           // ✅ CHANGED — supports multiple comma-separated admin emails
//           const adminEmails = (process.env.ADMIN_EMAIL ?? '').split(',').map(e => e.trim().toLowerCase());
//           const isAdmin = adminEmails.includes(credentials.email.toLowerCase());
//           user = await User.create({
//             email:               credentials.email.toLowerCase(),
//             name:                credentials.email.split('@')[0],
//             role:                isAdmin ? 'admin' : 'student',
//             onboardingCompleted: isAdmin ? true : false,
//           });
//         }

//         return {
//           id:                  user._id.toString(),
//           email:               user.email,
//           name:                user.name,
//           image:               user.image,
//           role:                user.role,
//           teacherStatus:       user.teacherStatus,
//           onboardingCompleted: user.onboardingCompleted,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     /* ── Google sign-in: create user if first time ───────── */
//     async signIn({ user, account }) {
//       if (account?.provider === 'google') {
//         await connectDB();

//         const existing = await User.findOne({ email: user.email!.toLowerCase() });

//         if (!existing) {
//           // ✅ CHANGED — supports multiple comma-separated admin emails
//           const adminEmails = (process.env.ADMIN_EMAIL ?? '').split(',').map(e => e.trim().toLowerCase());
//           const isAdmin = adminEmails.includes(user.email!.toLowerCase());
//           await User.create({
//             email:               user.email!.toLowerCase(),
//             name:                user.name  ?? 'User',
//             image:               user.image ?? undefined,
//             role:                isAdmin ? 'admin' : 'student',
//             emailVerified:       new Date(),
//             onboardingCompleted: isAdmin ? true : false,
//           });
//         } else if (user.image && !existing.image) {
//           await User.updateOne({ _id: existing._id }, { image: user.image });
//         }
//       }
//       return true;
//     },

//     /* ── Attach custom fields to JWT ─────────────────────── */
//     async jwt({ token, user, trigger, session }) {
//       // On sign-in via Credentials
//       if (user) {
//         token.id                  = user.id;
//         token.mongoId             = user.id;
//         token.role                = user.role;
//         token.teacherStatus       = user.teacherStatus;
//         token.onboardingCompleted = user.onboardingCompleted;
//         token.deleted             = false;
//         token.checkedAt           = Date.now();
//       }

//       // On session update (e.g. after onboarding)
//       // if (trigger === 'update' && session) {
//       //   if (session.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
//       //   if (session.role)                              token.role                = session.role;
//       //   if (session.teacherStatus !== undefined)       token.teacherStatus       = session.teacherStatus;
//       // }
//       // On session update — always re-fetch from DB to get latest status
// if (trigger === 'update') {
//   await connectDB();
//   const dbUser = await User.findOne({ email: token.email }).lean();
//   if (dbUser) {
//     token.role                = (dbUser as any).role;
//     token.teacherStatus       = (dbUser as any).teacherStatus;
//     token.onboardingCompleted = (dbUser as any).onboardingCompleted;
//   }
//   // Also apply any explicit overrides passed via update({ ... })
//   if (session?.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
//   if (session?.role)                              token.role                = session.role;
//   if (session?.teacherStatus !== undefined)       token.teacherStatus       = session.teacherStatus;
// }

//       // Google OAuth — fetch from DB on first load
//       if (!token.role || !token.mongoId) {
//         await connectDB();
//         const dbUser = await User.findOne({ email: token.email }).lean();
//         if (dbUser) {
//           token.id                  = (dbUser as any)._id.toString();
//           token.mongoId             = (dbUser as any)._id.toString();
//           token.role                = (dbUser as any).role;
//           token.teacherStatus       = (dbUser as any).teacherStatus;
//           token.onboardingCompleted = (dbUser as any).onboardingCompleted;
//           token.deleted             = false;
//           token.checkedAt           = Date.now();
//         }
//       }

//       // ── Periodic existence check ──────────────────────────
//       if (token.mongoId && !token.deleted) {
//         const now         = Date.now();
//         const lastChecked = (token.checkedAt as number) ?? 0;

//         if (now - lastChecked > 30_000) {
//           await connectDB();
//           const exists  = await User.exists({ _id: token.mongoId as string });
//           token.checkedAt = now;

//           if (!exists) {
//             token.deleted = true;
//           }
//         }
//       }

//       return token;
//     },

//     /* ── Expose JWT fields on the session ────────────────── */
//     async session({ session, token }) {
//       session.user.id                  = token.id;
//       session.user.role                = token.role;
//       session.user.teacherStatus       = token.teacherStatus;
//       session.user.onboardingCompleted = token.onboardingCompleted;
//       return session;
//     },
//   },
// };


// import type { NextAuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';
// import connectDB from '@/lib/db';
// import User from '@/models/User';
// import OtpToken from '@/models/OtpToken';
// import { processReferral } from '@/lib/processReferral'; // ✅ NEW

// export const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET!,

//   session: {
//     strategy: 'jwt',
//     maxAge:   30 * 24 * 60 * 60,
//   },

//   pages: {
//     signIn:  '/auth/login',
//     error:   '/auth/error',
//     newUser: '/onboarding',
//   },

//   providers: [
//     /* ── Google OAuth ─────────────────────────────────────── */
//     GoogleProvider({
//       clientId:     process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
//       },
//     }),

//     /* ── OTP / Email Credentials ──────────────────────────── */
//     CredentialsProvider({
//       id:   'otp',
//       name: 'OTP',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         otp:   { label: 'OTP',   type: 'text'  },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.otp) return null;

//         await connectDB();

//         const tokenDoc = await OtpToken.findOne({
//           email:     credentials.email.toLowerCase(),
//           expiresAt: { $gt: new Date() },
//         }).sort({ createdAt: -1 });

//         if (!tokenDoc) return null;

//         if (tokenDoc.attempts >= 5) {
//           await OtpToken.deleteOne({ _id: tokenDoc._id });
//           return null;
//         }

//         const valid = await bcrypt.compare(credentials.otp, tokenDoc.otp);

//         if (!valid) {
//           await OtpToken.updateOne({ _id: tokenDoc._id }, { $inc: { attempts: 1 } });
//           return null;
//         }

//         await OtpToken.deleteOne({ _id: tokenDoc._id });

//         let user = await User.findOne({ email: credentials.email.toLowerCase() });

//         if (!user) {
//           const adminEmails = (process.env.ADMIN_EMAIL ?? '').split(',').map(e => e.trim().toLowerCase());
//           const isAdmin = adminEmails.includes(credentials.email.toLowerCase());
//           user = await User.create({
//             email:               credentials.email.toLowerCase(),
//             name:                credentials.email.split('@')[0],
//             role:                isAdmin ? 'admin' : 'student',
//             onboardingCompleted: isAdmin ? true : false,
//           });

//           // ✅ Process referral for new OTP user
//           try {
//             const { cookies } = await import('next/headers');
//             const ref = (await cookies()).get('referral_code')?.value;
//             if (ref) await processReferral(user._id.toString(), ref);
//           } catch (e) {
//             console.error('[referral] OTP signup referral error:', e);
//           }
//         }

//         return {
//           id:                  user._id.toString(),
//           email:               user.email,
//           name:                user.name,
//           image:               user.image,
//           role:                user.role,
//           teacherStatus:       user.teacherStatus,
//           onboardingCompleted: user.onboardingCompleted,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     /* ── Google sign-in: create user if first time ───────── */
//     async signIn({ user, account }) {
//       if (account?.provider === 'google') {
//         await connectDB();

//         const existing = await User.findOne({ email: user.email!.toLowerCase() });

//         if (!existing) {
//           const adminEmails = (process.env.ADMIN_EMAIL ?? '').split(',').map(e => e.trim().toLowerCase());
//           const isAdmin = adminEmails.includes(user.email!.toLowerCase());
//           const newUser = await User.create({  // ✅ capture return value
//             email:               user.email!.toLowerCase(),
//             name:                user.name  ?? 'User',
//             image:               user.image ?? undefined,
//             role:                isAdmin ? 'admin' : 'student',
//             emailVerified:       new Date(),
//             onboardingCompleted: isAdmin ? true : false,
//           });

//           // ✅ Process referral for new Google user
//           try {
//             const { cookies } = await import('next/headers');
//             const ref = (await cookies()).get('referral_code')?.value;
//             if (ref) await processReferral(newUser._id.toString(), ref);
//           } catch (e) {
//             console.error('[referral] Google signup referral error:', e);
//           }

//         } else if (user.image && !existing.image) {
//           await User.updateOne({ _id: existing._id }, { image: user.image });
//         }
//       }
//       return true;
//     },

//     /* ── Attach custom fields to JWT ─────────────────────── */
//     async jwt({ token, user, trigger, session }) {
//       if (user) {
//         token.id                  = user.id;
//         token.mongoId             = user.id;
//         token.role                = user.role;
//         token.teacherStatus       = user.teacherStatus;
//         token.onboardingCompleted = user.onboardingCompleted;
//         token.deleted             = false;
//         token.checkedAt           = Date.now();
//       }

//       if (trigger === 'update') {
//         await connectDB();
//         const dbUser = await User.findOne({ email: token.email }).lean();
//         if (dbUser) {
//           token.role                = (dbUser as any).role;
//           token.teacherStatus       = (dbUser as any).teacherStatus;
//           token.onboardingCompleted = (dbUser as any).onboardingCompleted;
//         }
//         if (session?.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
//         if (session?.role)                              token.role                = session.role;
//         if (session?.teacherStatus !== undefined)       token.teacherStatus       = session.teacherStatus;
//       }

//       if (!token.role || !token.mongoId) {
//         await connectDB();
//         const dbUser = await User.findOne({ email: token.email }).lean();
//         if (dbUser) {
//           token.id                  = (dbUser as any)._id.toString();
//           token.mongoId             = (dbUser as any)._id.toString();
//           token.role                = (dbUser as any).role;
//           token.teacherStatus       = (dbUser as any).teacherStatus;
//           token.onboardingCompleted = (dbUser as any).onboardingCompleted;
//           token.deleted             = false;
//           token.checkedAt           = Date.now();
//         }
//       }

//       if (token.mongoId && !token.deleted) {
//         const now         = Date.now();
//         const lastChecked = (token.checkedAt as number) ?? 0;

//         if (now - lastChecked > 30_000) {
//           await connectDB();
//           const exists    = await User.exists({ _id: token.mongoId as string });
//           token.checkedAt = now;
//           if (!exists) token.deleted = true;
//         }
//       }

//       return token;
//     },

//     /* ── Expose JWT fields on the session ────────────────── */
//     async session({ session, token }) {
//       session.user.id                  = token.id;
//       session.user.role                = token.role;
//       session.user.teacherStatus       = token.teacherStatus;
//       session.user.onboardingCompleted = token.onboardingCompleted;
//       return session;
//     },
//   },
// };

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OtpToken from '@/models/OtpToken';
// ❌ NO processReferral import — removed entirely

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
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
      },
    }),

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
          const adminEmails = (process.env.ADMIN_EMAIL ?? '').split(',').map(e => e.trim().toLowerCase());
          const isAdmin = adminEmails.includes(credentials.email.toLowerCase());
          user = await User.create({
            email:               credentials.email.toLowerCase(),
            name:                credentials.email.split('@')[0],
            role:                isAdmin ? 'admin' : 'student',
            onboardingCompleted: isAdmin ? true : false,
          });
          // ✅ No referral here — handled in verify/route.ts after payment
        }

        return {
          id:                  user._id.toString(),
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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();

        const existing = await User.findOne({ email: user.email!.toLowerCase() });

        if (!existing) {
          const adminEmails = (process.env.ADMIN_EMAIL ?? '').split(',').map(e => e.trim().toLowerCase());
          const isAdmin = adminEmails.includes(user.email!.toLowerCase());
          await User.create({
            email:               user.email!.toLowerCase(),
            name:                user.name  ?? 'User',
            image:               user.image ?? undefined,
            role:                isAdmin ? 'admin' : 'student',
            emailVerified:       new Date(),
            onboardingCompleted: isAdmin ? true : false,
          });
          // ✅ No referral here — handled in verify/route.ts after payment
        } else if (user.image && !existing.image) {
          await User.updateOne({ _id: existing._id }, { image: user.image });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id                  = user.id;
        token.mongoId             = user.id;
        token.role                = user.role;
        token.teacherStatus       = user.teacherStatus;
        token.onboardingCompleted = user.onboardingCompleted;
        token.deleted             = false;
        token.checkedAt           = Date.now();
      }

      if (trigger === 'update') {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email }).lean();
        if (dbUser) {
          token.role                = (dbUser as any).role;
          token.teacherStatus       = (dbUser as any).teacherStatus;
          token.onboardingCompleted = (dbUser as any).onboardingCompleted;
        }
        if (session?.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
        if (session?.role)                              token.role                = session.role;
        if (session?.teacherStatus !== undefined)       token.teacherStatus       = session.teacherStatus;
      }

      if (!token.role || !token.mongoId) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email }).lean();
        if (dbUser) {
          token.id                  = (dbUser as any)._id.toString();
          token.mongoId             = (dbUser as any)._id.toString();
          token.role                = (dbUser as any).role;
          token.teacherStatus       = (dbUser as any).teacherStatus;
          token.onboardingCompleted = (dbUser as any).onboardingCompleted;
          token.deleted             = false;
          token.checkedAt           = Date.now();
        }
      }

      if (token.mongoId && !token.deleted) {
        const now         = Date.now();
        const lastChecked = (token.checkedAt as number) ?? 0;

        if (now - lastChecked > 30_000) {
          await connectDB();
          const exists    = await User.exists({ _id: token.mongoId as string });
          token.checkedAt = now;
          if (!exists) token.deleted = true;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id                  = token.id;
      session.user.role                = token.role;
      session.user.teacherStatus       = token.teacherStatus;
      session.user.onboardingCompleted = token.onboardingCompleted;
      return session;
    },
  },
};