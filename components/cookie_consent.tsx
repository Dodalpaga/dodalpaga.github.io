// components/cookie_consent.tsx
'use client';

import { useCookieConsent } from '@/hooks/useCookieConsent';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import './cookie_consent.css';

export function CookieConsent() {
  const { hasDecided, isLoaded, giveConsent, denyConsent } = useCookieConsent();

  // Both accept and deny are decisions; settings remain available in Site tools.
  if (!isLoaded || hasDecided) return null;

  return (
    <div
      className="cookie-consent-card"
      role="dialog"
      aria-label="Cookie consent"
    >
      {/* Icon */}
      <div className="cookie-consent-icon">
        <Cookie size={18} strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div className="cookie-consent-body">
        <p className="cookie-consent-title">Analytics & Privacy</p>
        <p className="cookie-consent-desc">
          I use anonymised analytics to improve this site. No personal data is
          sold. <Link href="/privacy">Learn more →</Link>
        </p>
      </div>

      {/* Actions */}
      <div className="cookie-consent-actions">
        <button className="cookie-btn cookie-btn-deny" onClick={denyConsent}>
          Deny
        </button>
        <button className="cookie-btn cookie-btn-allow" onClick={giveConsent}>
          Allow
        </button>
      </div>
    </div>
  );
}
