// components/backend_status_checker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Server } from 'lucide-react';
import './backend_status_checker.css';

const CHECK_URL = `${process.env.NEXT_PUBLIC_API_URL}/docs`;
const TIMEOUT = 5000;
const CHECK_INTERVAL = 30_000; // reduced from 10s — no need to hammer the server

type Status = 'loading' | 'success' | 'timeout' | 'error';

const STATUS_LABELS: Record<Status, string> = {
  loading: 'Checking API…',
  success: 'API online',
  timeout: 'API timeout',
  error: 'API unreachable',
};

export default function BackendStatus() {
  const [status, setStatus] = useState<Status>('loading');

  const check = () => {
    setStatus('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    fetch(CHECK_URL, { signal: controller.signal })
      .then((res) => {
        setStatus(res.ok ? 'success' : 'error');
      })
      .catch((err) => {
        setStatus(err.name === 'AbortError' ? 'timeout' : 'error');
      })
      .finally(() => clearTimeout(timer));
  };

  useEffect(() => {
    check();
    const id = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="status-pill" title={STATUS_LABELS[status]}>
      <span className={`status-dot ${status}`} />
      <span className="status-icon-wrap">
        <Server size={13} strokeWidth={1.8} />
      </span>
      <span className="status-label">{STATUS_LABELS[status]}</span>
    </div>
  );
}
