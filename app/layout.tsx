'use client';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import BackendStatus from '@/components/backend_status_checker';
import CookieStatusChecker from '@/components/cookie_status_checker';
import MediaPlayer from '@/components/media_player';
import Toast from '@/components/toast';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CookieConsent } from '@/components/cookie_consent';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAnalytics();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
          <MediaPlayer />
          <BackendStatus />
          <CookieStatusChecker />
          <CookieConsent /> {/* Affiche la banneau */}
          <Toast /> {/* Added Toast container */}
        </ThemeProvider>
      </body>
    </html>
  );
}
