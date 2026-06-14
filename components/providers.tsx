// components/Providers.tsx  ← CLIENT COMPONENT
'use client';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import BackendStatus from '@/components/backend_status_checker';
import CookieStatusChecker from '@/components/cookie_status_checker';
import MediaPlayer from '@/components/media_player';
import Toast from '@/components/toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { CookieConsent } from '@/components/cookie_consent';
import { Suspense } from 'react';
import { AnalyticsTracker } from '@/components/analytics_tracker';
import FloatingChat from '@/components/floating-chat/index';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppRouterCacheProvider>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        {children}
      </AppRouterCacheProvider>

      <MediaPlayer />

      {/* Floating AI chat — always mounted so the panel persists across scrolling */}
      <FloatingChat />

      <div className="status-hub">
        <CookieStatusChecker />
        <BackendStatus />
      </div>

      <CookieConsent />
      <Toast />
    </ThemeProvider>
  );
}
