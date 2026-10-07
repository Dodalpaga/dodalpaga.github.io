// hooks/useCookieConsent.ts
import { useEffect, useState } from 'react';

export function useCookieConsent() {
  // Initialize depuis localStorage dès le départ (pas null)
  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('analytics_consent');
    return stored === 'true'; // Retourne false si null ou 'false'
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasDecided, setHasDecided] = useState(false);

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem('analytics_consent');
      setHasConsent(stored === 'true');
      setHasDecided(stored !== null);
      setIsLoaded(true);
    };
    sync();
    window.addEventListener('analytics-consent-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('analytics-consent-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const giveConsent = () => {
    localStorage.setItem('analytics_consent', 'true');
    window.dispatchEvent(new Event('analytics-consent-change'));
  };

  const denyConsent = () => {
    localStorage.setItem('analytics_consent', 'false');
    window.dispatchEvent(new Event('analytics-consent-change'));
  };

  const withdrawConsent = () => {
    localStorage.removeItem('analytics_consent');
    window.dispatchEvent(new Event('analytics-consent-change'));
  };

  // hasConsent: la valeur actuelle
  // isLoaded: true après le premier render (pour savoir si on doit show la banneau)
  return {
    hasConsent,
    isLoaded,
    hasDecided,
    giveConsent,
    denyConsent,
    withdrawConsent,
  };
}
