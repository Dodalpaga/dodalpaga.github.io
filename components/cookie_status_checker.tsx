// components/cookie_status_checker.tsx
'use client';

import { useState } from 'react';
import { Cookie } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import './backend_status_checker.css'; // shares the same pill styles

export default function CookieStatusChecker() {
  const { hasConsent, isLoaded } = useCookieConsent();

  if (!isLoaded) return null;

  const status = hasConsent ? 'success' : 'error';
  const label = hasConsent ? 'Analytics on' : 'Analytics off';

  return (
    <div className="status-pill" title={label}>
      <span className={`status-dot ${status}`} />
      <span className="status-icon-wrap">
        <Cookie size={13} strokeWidth={1.8} />
      </span>
      <span className="status-label">{label}</span>
    </div>
  );
}
