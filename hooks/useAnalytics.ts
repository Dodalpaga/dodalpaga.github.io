import { useEffect } from 'react';

export function useAnalytics() {
  useEffect(() => {
    // Générer ou récupérer un ID visiteur unique
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitor_id', visitorId);
    }

    // Tracker la page actuelle
    const trackPage = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL_ANALYTICS}/track`, {
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

    // Tracker les changements de page (pour les SPA)
    const handleRouteChange = () => trackPage();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);
}
