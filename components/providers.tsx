// components/Providers.tsx  ← CLIENT COMPONENT
'use client';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import Toast from '@/components/toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { Suspense } from 'react';
import { AnalyticsTracker } from '@/components/analytics_tracker';
import SiteToolsProvider from '@/components/site-tools';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppRouterCacheProvider>
        <SiteToolsProvider>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          {children}
        </SiteToolsProvider>
      </AppRouterCacheProvider>

      <Toast />
    </ThemeProvider>
  );
}
