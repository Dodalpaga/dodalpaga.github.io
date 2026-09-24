// hooks/useAnalytics.ts
import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCookieConsent } from './useCookieConsent';

let visitorId: string | null = null;

// Initialiser le visitor_id une seule fois
if (typeof window !== 'undefined') {
  visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
}

export function useAnalytics() {
  const { hasConsent } = useCookieConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fonction de tracking réutilisable
  const trackEvent = useCallback(
    async (eventType: string, eventName?: string, customPage?: string) => {
      if (hasConsent !== true) {
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
      if (!apiUrl) {
        return;
      }

      const url =
        customPage ||
        pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : '');

      console.log('📊 Tracking event:', {
        eventType,
        eventName,
        page: url,
        visitorId,
        apiUrl,
      });

      try {
        const response = await fetch(
          `${apiUrl.replace(/\/$/, '')}/analytics/track`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              page: url,
              event_type: eventType,
              event_name: eventName || '',
              visitor_id: visitorId,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Tracking success:', data);
        } else {
          console.error(
            '❌ Tracking failed:',
            response.status,
            response.statusText,
          );
        }
      } catch (err) {
        console.warn('Analytics unavailable; tracking skipped.', err);
      }
    },
    [hasConsent, pathname, searchParams],
  );

  // Track page views automatiquement
  useEffect(() => {
    console.log('🔍 Analytics check:', {
      hasConsent,
      pathname,
      searchParams: searchParams?.toString(),
      visitorId,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
    });

    if (hasConsent === true) {
      console.log('✅ Consent given - Tracking page view');
      trackEvent('page_view');
    } else {
      console.log('⏳ Waiting for consent or consent denied');
    }
  }, [hasConsent, pathname, searchParams, trackEvent]);

  return { trackEvent };
}
