import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import SessionProvider from '@/components/providers/SessionProvider';
import { Toaster } from 'sonner';
import './globals.css';
import '@uploadthing/react/styles.css';
import Script from 'next/script';


export const metadata: Metadata = {
  title: 'VidyaSangrah — India\'s Learning Community',
  description: 'A national platform connecting teachers and students across India through micro-learning videos, gamification, and leaderboards.',
  keywords: ['edtech', 'education', 'india', 'students', 'teachers', 'learning'],
  authors: [{ name: 'VidyaSangrah' }],
  openGraph: {
    title: 'VidyaSangrah',
    description: 'India\'s professional educational community for K-12 students and educators.',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif' },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
