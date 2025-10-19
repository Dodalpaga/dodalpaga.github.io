'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Cookie } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import './cookie_status_checker.css';
import ScrollingTitle from '@/components/scrolling_title';

export default function CookieStatusChecker() {
  const { hasConsent, isLoaded, withdrawConsent } = useCookieConsent();
  const [hover, setHover] = useState(false);

  // Déterminer le statut en fonction du consentement
  const getStatus = () => {
    if (!isLoaded) return null;
    return hasConsent ? 'success' : 'error';
  };

  const getMessage = () => {
    if (!isLoaded) return '';
    if (hasConsent) {
      return 'Analytics enabled - Your data helps improve the site.';
    } else {
      return 'Analytics disabled - No tracking data is being collected.';
    }
  };

  const status = getStatus();
  const message = getMessage();

  return (
    <div
      className="cookie-status-container"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="cookie-status-content">
        <Cookie className="status-icon" size={32} />
        {status === 'success' && (
          <CheckCircle className="status-icon success" size={32} />
        )}
        {status === 'error' && (
          <XCircle className="status-icon error" size={32} />
        )}
        {!isLoaded && <AlertCircle className="status-icon timeout" size={32} />}

        {hover && message && <ScrollingTitle title={message} />}
      </div>
    </div>
  );
}
