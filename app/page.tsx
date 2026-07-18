// app/page.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import NavBar from '@/components/navbar';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useEffect, useState } from 'react';
import './styles.css';

export default function Home() {
  const { hasConsent, giveConsent, withdrawConsent } = useCookieConsent();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock document scroll while on the home page — without this, a hair of
  // extra scrollable height on mobile is enough to trigger the browser's
  // address-bar collapse animation, which resizes 100dvh mid-gesture.
  useEffect(() => {
    const { overflow: htmlOverflow } = document.documentElement.style;
    const { overflow: bodyOverflow } = document.body.style;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, []);

  return (
    <main className="home-main">
      <NavBar />

      <div className="home-bg-wrap" aria-hidden="true">
        <Image
          src="/images/hero/glitch_background.png"
          alt=""
          width={1024}
          height={1024}
          priority
          className="home-bg-image"
        />
      </div>

      <footer className="home-footer">
        <div className="home-footer-card">
          <div className="home-footer-row">
            <span className="home-footer-item">
              REST API&nbsp;
              <Link
                href={`${process.env.NEXT_PUBLIC_API_URL}/docs`}
                target="_blank"
                className="home-footer-link"
              >
                /docs
              </Link>
            </span>

            <span className="home-footer-divider" />

            <Link href="/privacy" className="home-footer-link">
              Privacy Policy
            </Link>

            <span className="home-footer-divider" />

            {mounted && hasConsent === false && (
              <button
                className="home-footer-link home-footer-btn"
                onClick={giveConsent}
              >
                Accept Analytics
              </button>
            )}
            {mounted && hasConsent === true && (
              <button
                className="home-footer-link home-footer-btn"
                onClick={withdrawConsent}
              >
                Withdraw Consent
              </button>
            )}

            <span className="home-footer-divider" />

            <div className="home-footer-contacts">
              <a
                href="mailto:dorian.voydie@gmail.com"
                aria-label="Email"
                className="home-footer-icon"
              >
                <AlternateEmailIcon style={{ fontSize: 15 }} />
              </a>
              <a
                href="https://www.linkedin.com/in/dorian-voydie/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="home-footer-icon"
              >
                <LinkedInIcon style={{ fontSize: 15 }} />
              </a>
              <a
                href="https://github.com/Dodalpaga?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="home-footer-icon"
              >
                <GitHubIcon style={{ fontSize: 15 }} />
              </a>
            </div>
          </div>

          <p className="home-footer-copyright">
            &copy; {new Date().getFullYear()} Dorian Voydie. All rights
            reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
