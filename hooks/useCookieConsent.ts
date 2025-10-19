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

  useEffect(() => {
    // Mark as loaded après le premier render
    setIsLoaded(true);
  }, []);

  const giveConsent = () => {
    localStorage.setItem('analytics_consent', 'true');
    setHasConsent(true);
    // Refresh après 300ms (permet à l'UI de se mettre à jour d'abord)
    setTimeout(() => window.location.reload(), 300);
  };

  const denyConsent = () => {
    localStorage.setItem('analytics_consent', 'false');
    setHasConsent(true);
  };

  const withdrawConsent = () => {
    localStorage.removeItem('analytics_consent');
    setHasConsent(false);
    // Refresh après 300ms
    setTimeout(() => window.location.reload(), 300);
  };

  // hasConsent: la valeur actuelle
  // isLoaded: true après le premier render (pour savoir si on doit show la banneau)
  return {
    hasConsent,
    isLoaded,
    giveConsent,
    denyConsent,
    withdrawConsent,
  };
}
