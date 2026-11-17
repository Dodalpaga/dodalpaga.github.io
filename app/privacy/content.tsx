// app/privacy/content.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorageIcon from '@mui/icons-material/Storage';
import PublicIcon from '@mui/icons-material/Public';
import CloudIcon from '@mui/icons-material/Cloud';
import GitHubIcon from '@mui/icons-material/GitHub';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import UndoIcon from '@mui/icons-material/Undo';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import BlockIcon from '@mui/icons-material/Block';
import GavelIcon from '@mui/icons-material/Gavel';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import './styles.css';

/* ─────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'introduction', index: '01', title: 'Introduction' },
  { id: 'analytics', index: '02', title: 'Analytics & Tracking' },
  { id: 'storage', index: '03', title: 'Data Storage' },
  { id: 'rights', index: '04', title: 'Your GDPR Rights' },
  { id: 'cookies', index: '05', title: 'Cookie Management' },
  { id: 'third-party', index: '06', title: 'Third-Party Services' },
  { id: 'principles', index: '07', title: 'Processing Principles' },
  { id: 'contact', index: '08', title: 'Contact & DPA' },
];

/* ─────────────────────────────────────────────────────────────────────────
   Blueprint grid background
───────────────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────────────
   Table of Contents
───────────────────────────────────────────────────────────────────────── */
function TableOfContents({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="priv-toc" aria-label="Table of contents">
      <div className="priv-toc__header">
        <span className="section-label">Contents</span>
      </div>
      <ul className="priv-toc__list">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <button
              className={`priv-toc__item${active === s.id ? ' priv-toc__item--active' : ''}`}
              onClick={() => onNavigate(s.id)}
            >
              <span className="priv-toc__index">{s.index}</span>
              <span className="priv-toc__title">{s.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Reusable sub-components
───────────────────────────────────────────────────────────────────────── */
function SectionCard({
  id,
  index,
  title,
  badge,
  children,
}: {
  id: string;
  index: string;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="priv-card">
      <div className="priv-card__header">
        <span className="priv-card__index">{index}</span>
        <h2 className="priv-card__title">{title}</h2>
        {badge && <span className="priv-card__badge">{badge}</span>}
      </div>
      <div className="priv-card__body">{children}</div>
    </section>
  );
}

function DataRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="priv-data-row">
      <span className="priv-data-row__dot" aria-hidden="true" />
      <span className="priv-data-row__label">{label}</span>
      {value && <span className="priv-data-row__value">{value}</span>}
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="priv-info-card">
      <span className="priv-info-card__icon">{icon}</span>
      <strong className="priv-info-card__title">{title}</strong>
      <div className="priv-info-card__body">{children}</div>
    </div>
  );
}

function RightCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="priv-right-card">
      <span className="priv-right-card__icon">{icon}</span>
      <strong className="priv-right-card__title">{title}</strong>
      <p className="priv-right-card__desc">{description}</p>
    </div>
  );
}

function Principle({ label, text }: { label: string; text: string }) {
  return (
    <div className="priv-principle">
      <span className="priv-principle__label">{label}</span>
      <span className="priv-principle__text">{text}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────── */
export default function PrivacyPolicy() {
  const { hasConsent, giveConsent, withdrawConsent } = useCookieConsent();
  const [isMounted, setIsMounted] = useState(false);
  const [active, setActive] = useState(SECTIONS[0].id);
  const [tick, setTick] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: '-20% 0px -70% 0px' },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const today = isMounted
    ? new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const iconSx = { fontSize: 18, color: 'var(--accent-text)', opacity: 0.85 };

  return (
    <div className="priv-root">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <header className="priv-hero">
        <div className="priv-hero__terminal">
          <div className="priv-hero__content">
            <h1 className="priv-hero__title">
              Privacy policy
            </h1>
            <p className="priv-hero__subtitle">
              What this site collects, why, where it is stored and how long it
              is kept.
            </p>
            {isMounted && (
              <div className="priv-hero__meta">
                <span className="priv-meta-badge">
                  <span
                    className="priv-meta-badge__dot"
                    style={{ background: hasConsent ? '#2e9e62' : 'var(--lobster)' }}
                  />
                  {hasConsent ? 'Analytics ON' : 'Analytics OFF'}
                </span>
                <span className="priv-meta-badge priv-meta-badge--muted">
                  Updated: {today}
                </span>
                <span className="priv-meta-badge priv-meta-badge--muted">
                  Retention: 90 days
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Layout ───────────────────────────────────────────────── */}
      <div className="priv-layout">
        <aside className="priv-toc-wrap">
          <TableOfContents active={active} onNavigate={scrollTo} />
        </aside>

        <main className="priv-content">
          <SectionCard
            id="introduction"
            index="01"
            title="Introduction"
            badge="Overview"
          >
            <p>
              This policy explains how this portfolio (&quot;Site&quot;)
              collects, uses, discloses and protects your information under the
              General Data Protection Regulation (GDPR) and other applicable
              data protection laws.
            </p>
            <p>
              Every piece of data collected is listed below with the reason it
              is needed and how long it is kept. The Site uses no advertising
              networks and no third-party trackers.
            </p>
          </SectionCard>

          <SectionCard
            id="analytics"
            index="02"
            title="Analytics & Tracking Data"
            badge="Consent-Based"
          >
            <div className="priv-sub-section">
              <h3 className="priv-sub-title">What I collect</h3>
              <div className="priv-data-grid">
                <DataRow label="IP address" value="anonymized + geolocated" />
                <DataRow label="Pages visited & time on page" />
                <DataRow label="Device type & browser" />
                <DataRow
                  label="Geographic location"
                  value="country · city · region"
                />
                <DataRow label="ISP (Internet Service Provider)" />
                <DataRow label="Referring website" />
              </div>
            </div>
            <div className="priv-sub-section">
              <h3 className="priv-sub-title">Why I collect this</h3>
              <div className="priv-data-grid">
                <DataRow label="Understand user interactions & page performance" />
                <DataRow label="Improve functionality and user experience" />
                <DataRow label="Identify technical issues and bottlenecks" />
                <DataRow label="Monitor website security" />
              </div>
            </div>
            <div className="priv-legal-basis">
              <span className="priv-legal-basis__label">
                Legal basis: GDPR Art. 6
              </span>
              <span className="priv-legal-basis__text">
                Consent only. Analytics data is collected after explicit opt-in
                via the cookie banner. You may withdraw at any time with
                immediate effect.
              </span>
            </div>
          </SectionCard>

          <SectionCard
            id="storage"
            index="03"
            title="Data Storage & Retention"
            badge="90-Day Limit"
          >
            <div className="priv-info-grid">
              <InfoCard
                icon={<StorageIcon sx={iconSx} />}
                title="Storage Location"
              >
                <p>
                  Hosted on{' '}
                  <Link
                    href="https://render.com"
                    target="_blank"
                    underline="hover"
                  >
                    Render
                  </Link>
                  , a GDPR-compliant cloud provider. Data never leaves certified
                  infrastructure.
                </p>
              </InfoCard>
              <InfoCard
                icon={<AccessTimeIcon sx={iconSx} />}
                title="Retention Period"
              >
                <p>
                  Analytics data is automatically purged after{' '}
                  <strong>90 days</strong>. Expiry is enforced at the database
                  level.
                </p>
              </InfoCard>
              <InfoCard icon={<LockIcon sx={iconSx} />} title="Security">
                <p>
                  Encryption at rest and in transit. Strict access controls with
                  audited credentials and regular security reviews.
                </p>
              </InfoCard>
            </div>
          </SectionCard>

          <SectionCard
            id="rights"
            index="04"
            title="Your GDPR Rights"
            badge="Art. 15–22"
          >
            <p className="priv-rights-intro">
              Under the GDPR you hold the following enforceable rights. Email{' '}
              <Link href="mailto:dorian.voydie@gmail.com" underline="hover">
                dorian.voydie@gmail.com
              </Link>{' '}
              to exercise any of them. I reply within 30 days.
            </p>
            <div className="priv-rights-grid">
              <RightCard
                icon={<FolderOpenIcon sx={iconSx} />}
                title="Access"
                description="Request a copy of all personal data I hold about you."
              />
              <RightCard
                icon={<EditIcon sx={iconSx} />}
                title="Rectification"
                description="Request correction of inaccurate or incomplete data."
              />
              <RightCard
                icon={<DeleteOutlineIcon sx={iconSx} />}
                title="Erasure"
                description='Request full deletion of your data ("Right to be Forgotten").'
              />
              <RightCard
                icon={<PauseCircleOutlineIcon sx={iconSx} />}
                title="Restriction"
                description="Ask me to limit how your data is processed."
              />
              <RightCard
                icon={<UndoIcon sx={iconSx} />}
                title="Withdraw"
                description="Revoke analytics consent at any time, with immediate effect."
              />
              <RightCard
                icon={<MoveToInboxIcon sx={iconSx} />}
                title="Portability"
                description="Receive your data in a structured, machine-readable format."
              />
              <RightCard
                icon={<BlockIcon sx={iconSx} />}
                title="Object"
                description="Object to certain processing activities at any time."
              />
            </div>
          </SectionCard>

          <SectionCard
            id="cookies"
            index="05"
            title="Cookie Management"
            badge="First-Party Only"
          >
            <p>
              Cookies are small text files stored on your device to persist your
              analytics consent preference and track page interactions, only
              after you opt in. I use{' '}
              <strong>no third-party advertising or tracking cookies</strong>.
            </p>
            <div className="priv-sub-section">
              <h3 className="priv-sub-title">Cookie policy</h3>
              <div className="priv-data-grid">
                <DataRow label="Analytics cookies set only after explicit consent" />
                <DataRow label="No cross-site or third-party tracking cookies" />
                <DataRow label="Consent preference stored in a first-party cookie" />
                <DataRow label="Clear cookies at any time via your browser settings" />
              </div>
            </div>
            {isMounted && (
              <div className="priv-consent-panel">
                <div className="priv-consent-panel__status">
                  <span className="priv-consent-panel__label">
                    Current status
                  </span>
                  <span
                    className="priv-consent-panel__value"
                    style={{ color: hasConsent ? 'var(--foreground)' : 'var(--accent-text)' }}
                  >
                    <span
                      className="priv-consent-panel__dot"
                      style={{ background: hasConsent ? '#2e9e62' : 'var(--lobster)' }}
                    />
                    {hasConsent ? 'Analytics Enabled' : 'Analytics Disabled'}
                  </span>
                </div>
                <Button
                  size="small"
                  onClick={hasConsent ? withdrawConsent : giveConsent}
                  sx={{
                    textTransform: 'none',
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '0.75rem',
                    padding: '6px 18px',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground-muted)',
                    '&:hover': {
                      borderColor: 'var(--card-border)',
                      color: 'var(--foreground)',
                    },
                  }}
                >
                  {hasConsent ? 'Withdraw Consent' : 'Enable Analytics'}
                </Button>
              </div>
            )}
          </SectionCard>

          <SectionCard
            id="third-party"
            index="06"
            title="Third-Party Services"
            badge="3 Providers"
          >
            <div className="priv-info-grid">
              <InfoCard icon={<PublicIcon sx={iconSx} />} title="ipapi.co">
                <p>
                  Geolocation service. Converts anonymised IPs to country/city
                  data. Governed by their{' '}
                  <Link
                    href="https://ipapi.co/privacy/"
                    target="_blank"
                    underline="hover"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              </InfoCard>
              <InfoCard icon={<CloudIcon sx={iconSx} />} title="Render">
                <p>
                  Backend hosting (GDPR-compliant). All analytics data is
                  persisted here.{' '}
                  <Link
                    href="https://render.com/privacy"
                    target="_blank"
                    underline="hover"
                  >
                    Privacy policy →
                  </Link>
                </p>
              </InfoCard>
              <InfoCard icon={<GitHubIcon sx={iconSx} />} title="GitHub Pages">
                <p>
                  Frontend hosting. May collect standard server access logs.{' '}
                  <Link
                    href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                    target="_blank"
                    underline="hover"
                  >
                    Privacy policy →
                  </Link>
                </p>
              </InfoCard>
            </div>
          </SectionCard>

          <SectionCard
            id="principles"
            index="07"
            title="Data Processing Principles"
            badge="GDPR Art. 5"
          >
            <p>
              All data processing on this site conforms to the GDPR Article 5
              principles:
            </p>
            <div className="priv-principles-list">
              <Principle
                label="Lawfulness"
                text="Processing is based solely on your explicit consent."
              />
              <Principle
                label="Fairness"
                text="Every data point collected is listed here with its purpose."
              />
              <Principle
                label="Transparency"
                text="This policy documents all data practices."
              />
              <Principle
                label="Purpose Limitation"
                text="Data is used only to improve this site's analytics."
              />
              <Principle
                label="Data Minimisation"
                text="Only strictly necessary data points are collected."
              />
              <Principle
                label="Accuracy"
                text="Records are accurate; IP geolocation is best-effort."
              />
              <Principle
                label="Storage Limitation"
                text="Hard 90-day retention with automated deletion."
              />
              <Principle
                label="Integrity & Confidentiality"
                text="Encrypted storage, strict access controls, regular audits."
              />
            </div>
          </SectionCard>

          <SectionCard
            id="contact"
            index="08"
            title="Contact & Data Protection Authority"
            badge="DPA"
          >
            <div className="priv-contact-grid">
              <div className="priv-contact-card">
                <span className="priv-contact-card__label">
                  Data Controller
                </span>
                <span className="priv-contact-card__value">Dorian VOYDIE</span>
              </div>
              <div className="priv-contact-card">
                <span className="priv-contact-card__label">Email</span>
                <Link
                  href="mailto:dorian.voydie@gmail.com"
                  underline="hover"
                  className="priv-link priv-contact-card__value"
                >
                  dorian.voydie@gmail.com
                </Link>
              </div>
              <div className="priv-contact-card">
                <span className="priv-contact-card__label">Portfolio</span>
                <Link
                  href="https://dodalpaga.github.io"
                  target="_blank"
                  underline="hover"
                  className="priv-link priv-contact-card__value"
                >
                  dodalpaga.github.io
                </Link>
              </div>
              <div className="priv-contact-card">
                <span className="priv-contact-card__label">Response SLA</span>
                <span className="priv-contact-card__value">Within 30 days</span>
              </div>
            </div>
            <div className="priv-dpa-note">
              <GavelIcon
                sx={{
                  fontSize: 20,
                  color: 'var(--accent-text)',
                  opacity: 0.7,
                  flexShrink: 0,
                }}
              />
              <p>
                If you believe your GDPR rights have been violated and direct
                contact has not resolved the issue, you have the right to lodge
                a complaint with the relevant supervisory authority in your
                country of residence (e.g.{' '}
                <Link
                  href="https://www.cnil.fr"
                  target="_blank"
                  underline="hover"
                >
                  CNIL
                </Link>{' '}
                in France,{' '}
                <Link
                  href="https://ico.org.uk"
                  target="_blank"
                  underline="hover"
                >
                  ICO
                </Link>{' '}
                in the UK).
              </p>
            </div>
          </SectionCard>

          <footer className="priv-footer">
            <div className="priv-footer__line" />
            <p className="priv-footer__text">
              This policy is effective as of {isMounted ? today : '—'} and may
              be updated periodically. Material changes will be reflected in the
              &quot;last updated&quot; date above.
            </p>
            <Link href="/" className="priv-footer__back">
              ← Back to portfolio
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
