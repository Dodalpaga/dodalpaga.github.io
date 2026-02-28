// app/page.tsx
'use client';
import Link from 'next/link';
import NavBar from '@/components/navbar';
import { Tilt } from 'react-next-tilt';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import './styles.css';

const navLinks = [
  {
    href: '/profile',
    label: '01 — About',
    title: 'Profile',
    description: 'Data Scientist. Builder. Explorer of ideas.',
  },
  {
    href: '/projects',
    label: '02 — Work',
    title: 'Projects',
    description:
      'Interactive demos, tools, and experiments — all in one place.',
  },
  {
    href: '/blog',
    label: '03 — Writing',
    title: 'Blog',
    description: 'Thoughts on AI, data, and building things.',
  },
];

export default function Home() {
  const { hasConsent, withdrawConsent } = useCookieConsent();
  const [isMounted, setIsMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const t = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      {/* Navbar */}
      <div
        className="flex flex-col items-center justify-between p-4"
        style={{ height: '84px', width: '100%' }}
      >
        <NavBar />
      </div>

      {/* Hero grid */}
      <div
        className="home-hero"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        {/* Parallax visual */}
        <div
          className="flex items-center justify-center w-full animate-scale-in"
          style={{ animationDelay: '0.1s' }}
        >
          <Tilt
            borderRadius="7%"
            scale={1.05}
            perspective="900px"
            tiltReverse={true}
          >
            <div id="container">
              <div id="child1" />
              <div id="child2" />
            </div>
          </Tilt>
        </div>

        {/* Nav links */}
        <div className="home-nav-links">
          {/* Eyebrow */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: '0.2s', marginBottom: '8px' }}
          >
            <span className="section-label">Dorian Voydie</span>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: '0 0 4px',
              }}
            >
              Data Scientist
              <br />
              &amp; Builder.
            </h1>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--foreground-muted)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginTop: '10px',
              }}
            >
              I build intelligent systems, beautiful interfaces, and everything
              in between.
            </p>
          </div>

          {navLinks.map((link, i) => (
            <Link
              href={link.href}
              key={link.href}
              className="home-nav-link animate-fade-up"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <span className="link-label">{link.label}</span>
              <h2>{link.title}</h2>
              <p>{link.description}</p>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* API & links banner */}
      <div
        className="animate-fade-up"
        style={{
          animationDelay: '0.7s',
          width: '100%',
          maxWidth: '680px',
          marginTop: '16px',
        }}
      >
        <div className="api-section-container">
          <div className="api-section-header">
            <div
              className="api-section-dot"
              style={{ background: '#ff5f56' }}
            />
            <div
              className="api-section-dot"
              style={{ background: '#febc2e' }}
            />
            <div
              className="api-section-dot"
              style={{ background: '#27c840' }}
            />
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.7rem',
                color: 'var(--foreground-muted)',
                marginLeft: '8px',
              }}
            >
              REST API
            </span>
          </div>

          <div className="api-section-body">
            <span>
              Backend API available at&nbsp;
              <Link
                href={`${process.env.NEXT_PUBLIC_API_URL}/docs`}
                target="_blank"
                style={{ color: 'var(--accent)', opacity: 1 }}
              >
                /docs
              </Link>
            </span>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Link href="/privacy">
                <Button
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.75rem',
                    padding: '5px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground-muted)',
                    '&:hover': {
                      backgroundColor: 'var(--accent-muted)',
                      borderColor: 'var(--accent)',
                      color: 'var(--accent)',
                    },
                  }}
                >
                  📋 Privacy Policy
                </Button>
              </Link>

              {isMounted && hasConsent && (
                <Button
                  size="small"
                  onClick={withdrawConsent}
                  sx={{
                    textTransform: 'none',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.75rem',
                    padding: '5px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground-muted)',
                    '&:hover': {
                      backgroundColor: 'var(--bg-color-2)',
                      borderColor: 'var(--text-color-2)',
                      color: 'var(--text-color-2)',
                    },
                  }}
                >
                  🍪 Withdraw Consent
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
