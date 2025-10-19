'use client';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import Link from 'next/link';
import './cookie_consent.css';

export function CookieConsent() {
  const { hasConsent, isLoaded, giveConsent, denyConsent } = useCookieConsent();

  if (!isLoaded || hasConsent) {
    return null;
  }

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-consent-text">
        I use analytics to enhance your experience. Your IP address will be
        anonymized.{' '}
        <Link
          href="/privacy"
          style={{ color: 'white', textDecoration: 'underline' }}
        >
          Learn more
        </Link>
      </div>
      <div className="cookie-consent-buttons">
        <button
          className="cookie-consent-btn cookie-consent-btn-deny"
          onClick={denyConsent}
        >
          Deny
        </button>
        <button
          className="cookie-consent-btn cookie-consent-btn-allow"
          onClick={giveConsent}
        >
          Allow
        </button>
      </div>
    </div>
  );
}
