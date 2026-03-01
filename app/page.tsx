// app/page.tsx
'use client';
import Link from 'next/link';
import NavBar from '@/components/navbar';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import Button from '@mui/material/Button';
import { useEffect, useState, useRef } from 'react';
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

/* ─────────────────────────────────────────────────────────────────────────
   BlueprintPhoto — theme-aware via CSS custom properties
───────────────────────────────────────────────────────────────────────── */
function BlueprintPhoto() {
  const [tick, setTick] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };
  const handleMouseLeave = () => setMousePos({ x: 0.5, y: 0.5 });

  const W = 420,
    H = 560,
    CELL = 22,
    MAJOR = 110;
  const scanY = ((tick * 1.1) % (H + 40)) - 20;

  const dataPoints = [
    { x: 52, y: 130, label: 'CV', val: '0.97' },
    { x: 350, y: 200, label: 'F1', val: '0.94' },
    { x: 44, y: 55, label: 'AUC', val: '0.99' },
    { x: 358, y: 60, label: 'ACC', val: '98.2' },
  ];

  const px = (mousePos.x - 0.5) * 12;
  const py = (mousePos.y - 0.5) * 12;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="blueprint-photo"
      style={{ width: W, height: H }}
    >
      {/* ── Grid SVG (behind photo) ─────────────────────────────── */}
      <svg
        width={W}
        height={H}
        className="blueprint-svg blueprint-svg--back"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="sg"
            width={CELL}
            height={CELL}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${CELL} 0 L 0 0 0 ${CELL}`}
              fill="none"
              stroke="var(--blueprint-line-faint)"
              strokeWidth="0.4"
            />
          </pattern>
          <pattern
            id="mg"
            width={MAJOR}
            height={MAJOR}
            patternUnits="userSpaceOnUse"
          >
            <rect width={MAJOR} height={MAJOR} fill="url(#sg)" />
            <path
              d={`M ${MAJOR} 0 L 0 0 0 ${MAJOR}`}
              fill="none"
              stroke="var(--blueprint-line)"
              strokeWidth="0.9"
            />
          </pattern>
          <linearGradient id="hfade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--background)" stopOpacity="1" />
            <stop
              offset={`${((20 / 420) * 100).toFixed(2)}%`}
              stopColor="var(--background)"
              stopOpacity="0"
            />
            <stop
              offset={`${(((420 - 20) / 420) * 100).toFixed(2)}%`}
              stopColor="var(--background)"
              stopOpacity="0"
            />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="vfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--background)" stopOpacity="1" />
            <stop
              offset={`${((20 / 560) * 100).toFixed(2)}%`}
              stopColor="var(--background)"
              stopOpacity="0"
            />
            <stop
              offset={`${(((560 - 20) / 560) * 100).toFixed(2)}%`}
              stopColor="var(--background)"
              stopOpacity="0"
            />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="1" />
          </linearGradient>
          <mask id="gmH">
            <rect width={W} height={H} fill="url(#hfade)" />
          </mask>
          <mask id="gmV">
            <rect width={W} height={H} fill="url(#vfade)" />
          </mask>
        </defs>

        <rect width={W} height={H} fill="url(#mg)" mask="url(#gmH)" />
        <rect
          width={W}
          height={H}
          fill="url(#mg)"
          mask="url(#gmV)"
          opacity="0.5"
        />

        {/* Origin cross */}
        <line
          x1={W / 2}
          y1={H / 2 - 10}
          x2={W / 2}
          y2={H / 2 + 10}
          stroke="var(--blueprint-accent)"
          strokeWidth="1"
        />
        <line
          x1={W / 2 - 10}
          y1={H / 2}
          x2={W / 2 + 10}
          y2={H / 2}
          stroke="var(--blueprint-accent)"
          strokeWidth="1"
        />
        <circle
          cx={W / 2}
          cy={H / 2}
          r={3}
          fill="none"
          stroke="var(--blueprint-accent)"
          strokeWidth="0.8"
        />

        {/* Corner brackets */}
        {(
          [
            [14, 14, 1, 1],
            [W - 14, 14, -1, 1],
            [14, H - 14, 1, -1],
            [W - 14, H - 14, -1, -1],
          ] as [number, number, number, number][]
        ).map(([cx, cy, sx, sy], i) => (
          <g key={i}>
            <line
              x1={cx}
              y1={cy}
              x2={cx + sx * 26}
              y2={cy}
              stroke="var(--blueprint-accent)"
              strokeWidth="1.3"
            />
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy + sy * 26}
              stroke="var(--blueprint-accent)"
              strokeWidth="1.3"
            />
            <circle cx={cx} cy={cy} r={1.8} fill="var(--blueprint-accent)" />
          </g>
        ))}

        {/* Dimension rulers */}
        <g opacity="0.38">
          <line
            x1={48}
            y1={9}
            x2={W - 48}
            y2={9}
            stroke="var(--blueprint-accent)"
            strokeWidth="0.7"
          />
          <line
            x1={48}
            y1={6}
            x2={48}
            y2={12}
            stroke="var(--blueprint-accent)"
            strokeWidth="0.7"
          />
          <line
            x1={W - 48}
            y1={6}
            x2={W - 48}
            y2={12}
            stroke="var(--blueprint-accent)"
            strokeWidth="0.7"
          />
          <text
            x={W / 2}
            y={7}
            fill="var(--blueprint-accent)"
            fontSize="6.5"
            textAnchor="middle"
            fontFamily="monospace"
            dominantBaseline="auto"
          >
            420px
          </text>
        </g>
        <g opacity="0.38">
          <line
            x1={W - 7}
            y1={48}
            x2={W - 7}
            y2={H - 48}
            stroke="var(--blueprint-accent)"
            strokeWidth="0.7"
          />
          <line
            x1={W - 10}
            y1={48}
            x2={W - 4}
            y2={48}
            stroke="var(--blueprint-accent)"
            strokeWidth="0.7"
          />
          <line
            x1={W - 10}
            y1={H - 48}
            x2={W - 4}
            y2={H - 48}
            stroke="var(--blueprint-accent)"
            strokeWidth="0.7"
          />
          <text
            x={W - 5}
            y={H / 2}
            fill="var(--blueprint-accent)"
            fontSize="6.5"
            textAnchor="middle"
            fontFamily="monospace"
            transform={`rotate(-90,${W - 5},${H / 2})`}
          >
            560px
          </text>
        </g>

        {/* Left ticks */}
        {Array.from(
          { length: Math.floor(H / CELL) + 1 },
          (_, i) => i * CELL,
        ).map((y) => (
          <g key={y}>
            <line
              x1={0}
              y1={y}
              x2={y % MAJOR === 0 ? 12 : 5}
              y2={y}
              stroke="var(--blueprint-accent)"
              strokeWidth="0.6"
              opacity="0.45"
            />
            {y % MAJOR === 0 && y > 0 && y < H && (
              <text
                x={14}
                y={y + 1}
                fill="var(--blueprint-accent)"
                fontSize="5.5"
                fontFamily="monospace"
                dominantBaseline="middle"
                opacity="0.4"
              >
                {y}
              </text>
            )}
          </g>
        ))}

        {/* Scan line */}
        <line
          x1={0}
          y1={scanY}
          x2={W}
          y2={scanY}
          stroke="var(--blueprint-accent)"
          strokeWidth="1"
          opacity="0.5"
          mask="url(#gmH)"
        />
        <line
          x1={0}
          y1={scanY}
          x2={W}
          y2={scanY}
          stroke="var(--blueprint-accent)"
          strokeWidth="10"
          opacity="0.06"
          mask="url(#gmH)"
        />

        {/* Target rings */}
        <circle
          cx={W / 2}
          cy={H / 2}
          r={95}
          fill="none"
          stroke="var(--blueprint-accent)"
          strokeWidth="0.8"
          strokeDasharray="4 7"
          opacity="0.09"
        />
        <circle
          cx={W / 2}
          cy={H / 2}
          r={160}
          fill="none"
          stroke="var(--blueprint-accent)"
          strokeWidth="0.6"
          strokeDasharray="2 10"
          opacity="0.06"
        />

        {/* Annotation data points */}
        {dataPoints.map((dp, i) => {
          const pulse = Math.sin(tick / 20 + i * 1.5) * 0.5 + 0.5;
          return (
            <g key={i}>
              <line
                x1={dp.x - 7}
                y1={dp.y}
                x2={dp.x + 7}
                y2={dp.y}
                stroke="var(--blueprint-accent)"
                strokeWidth="0.8"
                opacity="0.7"
              />
              <line
                x1={dp.x}
                y1={dp.y - 7}
                x2={dp.x}
                y2={dp.y + 7}
                stroke="var(--blueprint-accent)"
                strokeWidth="0.8"
                opacity="0.7"
              />
              <circle
                cx={dp.x}
                cy={dp.y}
                r={4 + pulse * 4}
                fill="none"
                stroke="var(--blueprint-accent)"
                strokeWidth="0.8"
                opacity={0.6 - pulse * 0.4}
              />
              <circle
                cx={dp.x}
                cy={dp.y}
                r={2.2}
                fill="var(--blueprint-accent)"
                opacity="0.9"
              />
              <text
                x={dp.x + 10}
                y={dp.y - 4}
                fill="var(--blueprint-accent)"
                fontSize="10.5"
                fontFamily="monospace"
                fontWeight="bold"
                opacity="0.85"
              >
                {dp.label}
              </text>
              <text
                x={dp.x + 10}
                y={dp.y + 6}
                fill="var(--blueprint-accent)"
                fontSize="8"
                fontFamily="monospace"
                opacity="0.6"
              >
                {dp.val}
              </text>
            </g>
          );
        })}
        <polyline
          points={`${dataPoints[0].x},${dataPoints[0].y} ${dataPoints[2].x},${dataPoints[2].y}`}
          fill="none"
          stroke="var(--blueprint-accent)"
          strokeWidth="0.6"
          strokeDasharray="3 5"
          opacity="0.18"
        />
        <polyline
          points={`${dataPoints[1].x},${dataPoints[1].y} ${dataPoints[3].x},${dataPoints[3].y}`}
          fill="none"
          stroke="var(--blueprint-accent)"
          strokeWidth="0.6"
          strokeDasharray="3 5"
          opacity="0.18"
        />
      </svg>

      {/* ── Photo layer ──────────────────────────────────────────── */}
      <div
        className="blueprint-photo__img-wrap"
        style={{
          transition: 'transform 0.15s ease-out',
          transform: `translate(${px * 0.35}px,${py * 0.35}px)`,
        }}
      >
        <img
          src="/images/photos/2-cropped.png"
          alt="Dorian Voydie"
          className="blueprint-photo__img"
          style={{
            transform: `translate(${px * 0.55}px,${py * 0.55}px) scale(1.02)`,
          }}
        />
        <div className="blueprint-photo__fade blueprint-photo__fade--bottom" />
        <div className="blueprint-photo__fade blueprint-photo__fade--sides" />
        <div className="blueprint-photo__fade blueprint-photo__fade--top" />
      </div>

      {/* ── Frame + status bar SVG (front) ──────────────────────── */}
      <svg
        width={W}
        height={H}
        className="blueprint-svg blueprint-svg--front"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={28}
          y={28}
          width={W - 56}
          height={H - 82}
          fill="none"
          stroke="var(--blueprint-accent)"
          strokeWidth="0.8"
          opacity="0.32"
        />
        <line
          x1={28}
          y1={28 + (H - 82) / 3}
          x2={W - 28}
          y2={28 + (H - 82) / 3}
          stroke="var(--blueprint-accent)"
          strokeWidth="0.4"
          opacity="0.09"
        />
        <line
          x1={28}
          y1={28 + ((H - 82) * 2) / 3}
          x2={W - 28}
          y2={28 + ((H - 82) * 2) / 3}
          stroke="var(--blueprint-accent)"
          strokeWidth="0.4"
          opacity="0.09"
        />
        <line
          x1={28 + (W - 56) / 3}
          y1={28}
          x2={28 + (W - 56) / 3}
          y2={H - 54}
          stroke="var(--blueprint-accent)"
          strokeWidth="0.4"
          opacity="0.09"
        />
        <line
          x1={28 + ((W - 56) * 2) / 3}
          y1={28}
          x2={28 + ((W - 56) * 2) / 3}
          y2={H - 54}
          stroke="var(--blueprint-accent)"
          strokeWidth="0.4"
          opacity="0.09"
        />

        {/* Status bar */}
        <rect
          x={28}
          y={H - 54}
          width={W - 56}
          height={28}
          fill="var(--blueprint-bar-bg)"
          stroke="var(--blueprint-accent)"
          strokeWidth="0.8"
          opacity="0.92"
        />
        <text
          x={40}
          y={H - 35}
          fill="var(--blueprint-accent)"
          fontSize="6.5"
          fontFamily="monospace"
          opacity="0.8"
        >
          ID: VOYDIE_D · CLASS: DS/AI · STATUS: ACTIVE
        </text>
        <circle cx={W - 44} cy={H - 40} r={3.5} fill="#68d391" opacity="0.9" />
        <circle
          cx={W - 44}
          cy={H - 40}
          r={6}
          fill="none"
          stroke="#68d391"
          strokeWidth="0.8"
          opacity="0.35"
        />

        {/* Final edge fades — theme-aware, sit on very top */}
        <defs>
          <linearGradient id="lf2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0px" stopColor="var(--background)" stopOpacity="1" />
            <stop offset="20px" stopColor="var(--background)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rf2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--background)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="tf2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0px" stopColor="var(--background)" stopOpacity="1" />
            <stop offset="20px" stopColor="var(--background)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={20} height={H} fill="url(#lf2)" />
        <rect x={W - 20} y={0} width={20} height={H} fill="url(#rf2)" />
        <rect x={0} y={0} width={W} height={20} fill="url(#tf2)" />
      </svg>

      {/* ── Floating tech chips ──────────────────────────────────── */}
      {[
        { label: 'Python', side: 'left', top: 80, delay: '0s' },
        { label: 'GenAI', side: 'left', top: 210, delay: '0.4s' },
        { label: 'FastAPI', side: 'left', top: 340, delay: '0.8s' },
        { label: 'React', side: 'right', top: 110, delay: '0.2s' },
        { label: 'Docker', side: 'right', top: 245, delay: '0.6s' },
        { label: 'ML Ops', side: 'right', top: 375, delay: '1s' },
      ].map((chip) => (
        <div
          key={chip.label}
          className="blueprint-chip"
          style={{
            top: chip.top,
            left: chip.side === 'left' ? -2 : undefined,
            right: chip.side === 'right' ? -2 : undefined,
            animationDelay: chip.delay,
          }}
        >
          {chip.label}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { hasConsent, giveConsent, withdrawConsent } = useCookieConsent();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div
        className="flex flex-col items-center justify-between p-4"
        style={{ height: '84px', width: '100%' }}
      >
        <NavBar />
      </div>

      <div
        className="home-hero"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(12px)',
          transition:
            'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="flex items-center justify-center w-full animate-scale-in"
          style={{ animationDelay: '0.1s' }}
        >
          <BlueprintPhoto />
        </div>

        <div className="home-nav-links">
          <div
            className="animate-fade-up"
            style={{ animationDelay: '0.2s', marginBottom: '8px' }}
          >
            <span className="section-label">Dorian Voydie</span>
            <h1
              style={{
                fontFamily: "var(--font-syne), 'Syne', sans-serif",
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: '0 0 4px',
              }}
            >
              AI Engineer
              <br />
              &amp; Builder.
            </h1>
            <p
              style={{
                fontFamily:
                  "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
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
                fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
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
                    fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
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
              {mounted && hasConsent === false && (
                <Button
                  size="small"
                  onClick={giveConsent}
                  sx={{
                    textTransform: 'none',
                    fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                    fontSize: '0.75rem',
                    padding: '5px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground-muted)',
                    '&:hover': {
                      backgroundColor: 'var(--bg-color-3)',
                      borderColor: 'var(--text-color-3)',
                      color: 'var(--text-color-3)',
                    },
                  }}
                >
                  🍪 Accept Analytics
                </Button>
              )}
              {mounted && hasConsent === true && (
                <Button
                  size="small"
                  onClick={withdrawConsent}
                  sx={{
                    textTransform: 'none',
                    fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
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
