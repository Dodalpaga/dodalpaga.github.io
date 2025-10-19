'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Link } from 'lucide-react';
import './backend_status_checker.css';
import ScrollingTitle from '@/components/scrolling_title';

const CHECK_URL = `${process.env.NEXT_PUBLIC_API_URL_DOCS}`; // Change to your backend URL
const TIMEOUT = 5000; // 5 seconds timeout
const CHECK_INTERVAL = 10000; // 10 seconds interval

export default function BackendStatus() {
  const [status, setStatus] = useState<'success' | 'timeout' | 'error' | null>(
    null
  );
  const [message, setMessage] = useState('');
  const [hover, setHover] = useState(false);

  const checkBackendStatus = () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    console.log('Fetching backend status...');

    fetch(CHECK_URL, { signal: controller.signal })
      .then((res) => {
        console.log(res);
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        setStatus('success');
        setMessage('Backend can be reached.');
      })
      .catch((err) => {
        console.log(err);
        if (err.name === 'AbortError') {
          setStatus('timeout');
          setMessage('Backend Request timed out.');
        } else if (err.name === 'TypeError') {
          setStatus('error');
          setMessage('Backend DNS resolution failed. Check the server status');
        } else {
          setStatus('error');
          setMessage(err.message || 'An error occurred.');
        }
      })
      .finally(() => clearTimeout(timeoutId));
  };

  useEffect(() => {
    checkBackendStatus(); // Initial check
    const intervalId = setInterval(checkBackendStatus, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="backend-status-container"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="backend-status-content">
        <Link className="status-icon" size={32} />
        {status === 'success' && (
          <CheckCircle className="status-icon success" size={32} />
        )}
        {status === 'timeout' && (
          <AlertCircle className="status-icon timeout" size={32} />
        )}
        {status === 'error' && (
          <XCircle className="status-icon error" size={32} />
        )}
        {hover && <ScrollingTitle title={message} />}
      </div>
    </div>
  );
}
