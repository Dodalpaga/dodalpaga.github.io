// app/layout.tsx
'use client';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import BackendStatus from '@/components/backend_status_checker';
import CookieStatusChecker from '@/components/cookie_status_checker';
import MediaPlayer from '@/components/media_player';
import Toast from '@/components/toast';
import { Syne, DM_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { CookieConsent } from '@/components/cookie_consent';
import { Suspense } from 'react';
import { AnalyticsTracker } from '@/components/analytics_tracker';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${dmMono.variable} ${plusJakarta.variable}`}
    >
      <body className={plusJakarta.className} suppressHydrationWarning>
        <ThemeProvider>
          <AppRouterCacheProvider>
            <Suspense fallback={null}>
              <AnalyticsTracker />
            </Suspense>
            {children}
          </AppRouterCacheProvider>

          <MediaPlayer />

          {/* Status hub — two stacked pills, bottom-right */}
          <div className="status-hub">
            <CookieStatusChecker />
            <BackendStatus />
          </div>

          {/* Cookie consent slide-up toast */}
          <CookieConsent />

          <Toast />
        </ThemeProvider>
      </body>
    </html>
  );
}
