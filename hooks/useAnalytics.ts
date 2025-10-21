// hooks/useAnalytics.ts
import { useEffect } from 'react';
import { useCookieConsent } from './useCookieConsent';

export function useAnalytics() {
  const { hasConsent } = useCookieConsent();

  useEffect(() => {
    // Ne track QUE si l'utilisateur a accepté
    if (hasConsent !== true) {
      return;
    }

    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitor_id', visitorId);
    }

    const trackPage = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: window.location.pathname,
          event_type: 'page_view',
          visitor_id: visitorId,
        }),
      }).catch((err) => console.error('Analytics error:', err));
    };

    trackPage();

    const handleRouteChange = () => trackPage();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [hasConsent]);
}
