// app/profile/content.tsx
'use client';
import * as React from 'react';
import CountUp from 'react-countup';
import Image from 'next/image';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import CodeIcon from '@mui/icons-material/Code';
import { useThemeContext } from '@/context/ThemeContext';
import '../globals.css';
import './styles.css';
import {
  SiPytorch,
  SiScikitlearn,
  SiTensorflow,
  SiLangchain,
  SiFastapi,
  SiDjango,
  SiDocker,
  SiKubernetes,
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiElasticsearch,
  SiKibana,
  SiLogstash,
  SiPython,
  SiRaspberrypi,
  SiNvidia,
  SiOpencv,
  SiPlotly,
  SiGrafana,
} from 'react-icons/si';
import type { IconType } from 'react-icons';

/* ─────────────────────────── helpers ─────────────────────────── */

const getYearsSpent = (startDateString: string): number => {
  const startDate = new Date(startDateString);
  const now = new Date();
  const years = now.getFullYear() - startDate.getFullYear();
  const monthDiff = Math.abs(now.getMonth() - startDate.getMonth());
  return monthDiff > 6 ? years - 1 : years;
};

/* ─────────────────────────── sub-components ─────────────────────── */

interface TechTagProps {
  Icon: IconType;
  label: string;
  color: string;
}
const TechTag: React.FC<TechTagProps> = ({ Icon, label, color }) => {
  const IC = Icon as React.ComponentType<{ size?: number }>;
  return (
    <span
      className="tech-tag"
      style={{ '--tag-accent': color } as React.CSSProperties}
    >
      <IC size={13} />
      {label}
    </span>
  );
};

const CornerBrackets: React.FC = () => (
  <div className="corner-brackets" aria-hidden="true">
    <span className="corner tl" />
    <span className="corner tr" />
    <span className="corner bl" />
    <span className="corner br" />
  </div>
);

interface ContactLinkProps {
  Icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  href: string;
}
const ContactLink: React.FC<ContactLinkProps> = ({ Icon, label, href }) => (
  <a
    className="contact-link"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Icon style={{ fontSize: 15 }} />
    <span>{label}</span>
  </a>
);

interface SectionHeaderProps {
  number: string;
  title: string;
}
const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title }) => (
  <div className="section-header">
    <span className="section-number">{number}</span>
    <h2 className="section-title">{title}</h2>
    <div className="section-line" />
  </div>
);

interface ObjectiveProps {
  children: React.ReactNode;
}
const Objective: React.FC<ObjectiveProps> = ({ children }) => (
  <div className="objective-item">
    <span className="objective-arrow">→</span>
    <span>{children}</span>
  </div>
);

/* ─────────────────────────── data ─────────────────────────── */

const thalesSkills: TechTagProps[] = [
  { Icon: SiPython, label: 'Python', color: '#3b82f6' },
  { Icon: SiTensorflow, label: 'TensorFlow', color: '#f97316' },
  { Icon: SiPytorch, label: 'PyTorch', color: '#ef4444' },
  { Icon: SiLangchain, label: 'LangChain', color: '#22c55e' },
  { Icon: SiScikitlearn, label: 'Scikit-Learn', color: '#f59e0b' },
  { Icon: SiFastapi, label: 'FastAPI', color: '#06b6d4' },
  { Icon: SiDjango, label: 'Django', color: '#22c55e' },
  { Icon: SiDocker, label: 'Docker', color: '#38bdf8' },
  { Icon: SiKubernetes, label: 'Kubernetes', color: '#3b82f6' },
  { Icon: SiNextdotjs, label: 'Next.js', color: 'currentColor' },
  { Icon: SiReact, label: 'React', color: '#38bdf8' },
  { Icon: SiTypescript, label: 'TypeScript', color: '#3b82f6' },
  { Icon: SiElasticsearch, label: 'Elasticsearch', color: '#f59e0b' },
  { Icon: SiKibana, label: 'Kibana', color: '#ec4899' },
  { Icon: SiLogstash, label: 'Logstash', color: '#f97316' },
];

const atosSkills: TechTagProps[] = [
  { Icon: SiPython, label: 'Python', color: '#3b82f6' },
  { Icon: SiRaspberrypi, label: 'Raspberry Pi', color: '#ef4444' },
  { Icon: SiNvidia, label: 'Jetson Nano', color: '#22c55e' },
  { Icon: SiOpencv, label: 'OpenCV', color: '#22c55e' },
  { Icon: SiScikitlearn, label: 'Scikit-Learn', color: '#f59e0b' },
  { Icon: SiPlotly, label: 'Dash Plotly', color: '#3b82f6' },
  { Icon: SiGrafana, label: 'Grafana', color: '#f97316' },
];

const coreSkills = [
  'Machine Learning',
  'Python',
  'Data Science',
  'Generative AI',
  'React.js',
  'Next.js',
  'TypeScript',
];

/* ─────────────────────────── page ─────────────────────────── */

export default function Content() {
  const { theme } = useThemeContext();
  const yearsSpent = getYearsSpent('2022-12-01');
  const totalExp = getYearsSpent('2021-09-01');
  const foreground = theme === 'dark' ? 'ffffff' : '000000';

  return (
    <div className="profile-container">
      {/* ── SIDEBAR ── */}
      <aside className="profile-sidebar">
        <div className="sidebar-inner">
          {/* identity */}
          <div className="identity-block">
            <div className="profile-img-wrapper">
              <div className="profile-img-ring" />
              <Image
                src="/images/pp.jpeg"
                alt="Dorian Voydie"
                width={120}
                height={120}
                className="profile-img"
              />
            </div>
            <div className="identity-text">
              <p className="identity-label">AI ENGINEER</p>
              <h1 className="identity-name">
                Dorian
                <br />
                Voydie
              </h1>
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* stats */}
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">
                <CountUp
                  end={totalExp}
                  duration={3}
                  enableScrollSpy
                  scrollSpyOnce
                />
                +
              </span>
              <span className="stat-key">YRS EXP</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <span className="stat-value">
                <CountUp end={6} duration={3} enableScrollSpy scrollSpyOnce />
              </span>
              <span className="stat-key">PROJECTS</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <span className="stat-value">1</span>
              <span className="stat-key">PATENT</span>
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* contact */}
          <div className="sidebar-section">
            <p className="sidebar-label">CONTACT</p>
            <div className="contact-list">
              <ContactLink
                Icon={AlternateEmailIcon}
                label="dorian.voydie@gmail.com"
                href="mailto:dorian.voydie@gmail.com"
              />
              <ContactLink
                Icon={LinkedInIcon}
                label="in/dorian-voydie"
                href="https://www.linkedin.com/in/dorian-voydie/"
              />
              <ContactLink
                Icon={GitHubIcon}
                label="Dodalpaga"
                href="https://github.com/Dodalpaga?tab=repositories"
              />
              <ContactLink
                Icon={CodeIcon}
                label="Kaggle / dorianvoydie"
                href="https://www.kaggle.com/dorianvoydie"
              />
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* core skills */}
          <div className="sidebar-section">
            <p className="sidebar-label">CORE SYSTEMS</p>
            <div className="core-skills">
              {coreSkills.map((s) => (
                <span key={s} className="core-skill-tag">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* github streak */}
          <div className="sidebar-section">
            <p className="sidebar-label">CODING STREAK</p>
            <div className="stats-img-wrapper">
              <Image
                src={`https://github-readme-streak-stats.herokuapp.com?user=Dodalpaga&theme=transparent&currStreakLabel=${foreground}&currStreakNum=EB5454&fire=EB5454&ring=${foreground}&sideNums=${foreground}&sideLabels=${foreground}`}
                alt="GitHub Streak"
                width={260}
                height={130}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="profile-main">
        {/* ── Experience ── */}
        <section className="content-section">
          <SectionHeader number="01" title="EXPERIENCE" />

          {/* Thales */}
          <div
            className="mission-card animate-fadeup"
            style={{ '--delay': '0.05s' } as React.CSSProperties}
          >
            <CornerBrackets />

            <div className="mission-header">
              <span className="mission-id">MISSION // THALES-002</span>
              <span className="mission-dates">DEC 2022 — PRESENT</span>
            </div>

            <div className="mission-company">
              <div className="company-logo-wrapper">
                <Image
                  src={
                    theme === 'dark'
                      ? '/images/thales-inverted.png'
                      : '/images/thales.png'
                  }
                  alt="Thales"
                  width={100}
                  height={32}
                  style={{
                    objectFit: 'contain',
                    width: 'auto',
                    height: '28px',
                  }}
                />
              </div>
              <div className="company-meta">
                <h3 className="company-name">Thales Services Numériques</h3>
                <p className="company-location">Toulouse Area, France</p>
              </div>
              <div className="mission-badges">
                <span className="mission-badge badge-primary">
                  {yearsSpent}+ YRS
                </span>
                <span className="mission-badge badge-accent">TECH LEAD</span>
                <span className="mission-badge badge-accent">AI ENGINEER</span>
              </div>
            </div>

            <p className="mission-brief">
              Participated in multiple <strong>international projects</strong> —
              initially as a Data Engineer on the European{' '}
              <strong>Galileo</strong> navigation system, then as a Data
              Scientist on the <strong>Euclid</strong> satellite ground segment
              for{' '}
              <strong>CNES — Centre National d&apos; Études Spatiales</strong>.
              Developed deep expertise in{' '}
              <strong>Data Science, Python, LLM, and AI</strong>, including
              placement 4/200 in corporate coding competitions.
            </p>

            <div className="mission-section-label">OBJECTIVES</div>
            <div className="objectives-list">
              <Objective>
                Applied <strong>AI and data science</strong> to satellite
                imagery for Earth Observation applications.
              </Objective>
              <Objective>
                Designed and implemented <strong>ML pipelines</strong> for
                large-scale data processing.
              </Objective>
              <Objective>
                Built full-stack <strong>containerised applications</strong> via
                Docker — APIs, monitoring, and UIs.
              </Objective>
              <Objective>
                Managed projects end-to-end, coordinating{' '}
                <strong>stakeholders, timelines, and deliverables</strong>.
              </Objective>
              <Objective>
                Contributed to <strong>tenders and technical studies</strong>{' '}
                for CNES.
              </Objective>
              <Objective>
                Developed <strong>conversational agents</strong> using advanced
                AI and LLM technologies.
              </Objective>
            </div>

            <div className="featured-project">
              <div className="featured-label">
                ◆ FEATURED PROJECT — ESRIN / ESA
              </div>
              <p className="featured-text">
                <strong>Technical Lead</strong> for a 3–4 person
                cross-functional team on a{' '}
                <strong>€1.5M, 2-year Generative AI project</strong> for{' '}
                <strong>ESRIN – ESA Centre for Earth Observation</strong>{' '}
                (Frascati, Italy). Delivered a scalable conversational assistant
                using <strong>AI Agents + LLM</strong> to help users navigate
                200+ Earth Observation collections (tens of millions of data
                products) with intelligent recommendations, visualisations, and
                access guidance.
              </p>
            </div>

            <div className="mission-section-label">TECHNOLOGY PAYLOAD</div>
            <div className="tech-grid">
              {thalesSkills.map((s) => (
                <TechTag key={s.label} {...s} />
              ))}
            </div>

            <div className="mission-stat-line">
              <span className="mission-stat-label">
                TOTAL PROJECTS DEPLOYED
              </span>
              <span className="mission-stat-value">
                <CountUp end={6} duration={5} enableScrollSpy scrollSpyOnce />
              </span>
            </div>
          </div>

          {/* Atos */}
          <div
            className="mission-card animate-fadeup"
            style={{ '--delay': '0.15s' } as React.CSSProperties}
          >
            <CornerBrackets />

            <div className="mission-header">
              <span className="mission-id">MISSION // ATOS-001</span>
              <span className="mission-dates">SEPT 2021 — NOV 2022</span>
            </div>

            <div className="mission-company">
              <div className="company-logo-wrapper">
                <Image
                  src="/images/atos.png"
                  alt="Atos"
                  width={80}
                  height={32}
                  style={{
                    objectFit: 'contain',
                    width: 'auto',
                    height: '24px',
                  }}
                />
              </div>
              <div className="company-meta">
                <h3 className="company-name">Atos France</h3>
                <p className="company-location">Toulouse Area, France</p>
              </div>
              <div className="mission-badges">
                <span className="mission-badge badge-secondary">1 YR</span>
                <span className="mission-badge badge-accent">EMBEDDED ML</span>
              </div>
            </div>

            <p className="mission-brief">
              In parallel with my <strong>MsC</strong> (VALDOM — apprenticeship
              at INSA Toulouse &amp; ENSEEIHT), contributed to{' '}
              <strong>AI and embedded machine learning</strong> projects
              including <strong>predictive maintenance</strong> of physical
              systems and <strong>defect detection</strong> on aircraft
              fuselages.
            </p>

            <div className="mission-section-label">OBJECTIVES</div>
            <div className="objectives-list">
              <Objective>
                Developed <strong>embedded instrumentation</strong> on{' '}
                <strong>Raspberry Pi</strong> and <strong>Jetson Nano</strong>.
              </Objective>
              <Objective>
                Analysed and structured data; designed architectures for{' '}
                <strong>ML models</strong>.
              </Objective>
              <Objective>
                Developed <strong>computer vision AI models</strong> for visual
                defect detection on aircraft fuselages.
              </Objective>
              <Objective>
                Created dashboards for <strong>data visualisation</strong> of
                model predictions.
              </Objective>
            </div>

            <div className="mission-section-label">PUBLICATIONS</div>
            <div className="publications-block">
              <div className="pub-item">
                <span className="pub-icon">📄</span>
                <span>
                  Paper authored for the <strong>IFAC 2023 Conference</strong>
                </span>
              </div>
              <div className="pub-item">
                <span className="pub-icon">🔏</span>
                <span>
                  Contributed to a registered <strong>Patent</strong>
                </span>
              </div>
            </div>

            <div className="mission-section-label">TECHNOLOGY PAYLOAD</div>
            <div className="tech-grid">
              {atosSkills.map((s) => (
                <TechTag key={s.label} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Education ── */}
        <section className="content-section">
          <SectionHeader number="02" title="EDUCATION" />
          <div className="education-grid">
            <a
              className="edu-card animate-fadeup"
              style={{ '--delay': '0.05s' } as React.CSSProperties}
              href="https://www.insa-toulouse.fr/valorisation-des-donnees-massives/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CornerBrackets />
              <div className="edu-logo">
                <Image
                  src="/images/insa-toulouse.webp"
                  alt="INSA Toulouse"
                  width={140}
                  height={60}
                  style={{
                    objectFit: 'contain',
                    width: '100%',
                    height: '56px',
                  }}
                />
              </div>
              <div className="edu-body">
                <p className="edu-degree">MsC — VALDOM</p>
                <h4 className="edu-school">INSA Toulouse</h4>
                <p className="edu-desc">
                  Valorisation des Données Massives. Core competencies: Big
                  Data, Machine Learning, Cloud.
                </p>
              </div>
              <div className="edu-tags">
                <span className="edu-tag">Big Data</span>
                <span className="edu-tag">Machine Learning</span>
                <span className="edu-tag">Cloud</span>
              </div>
            </a>

            <a
              className="edu-card animate-fadeup"
              style={{ '--delay': '0.19s' } as React.CSSProperties}
              href="https://www.enseeiht.fr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CornerBrackets />
              <div className="edu-logo">
                <Image
                  src="/images/n7.png"
                  alt="ENSEEIHT"
                  width={140}
                  height={60}
                  style={{
                    objectFit: 'contain',
                    width: '100%',
                    height: '56px',
                  }}
                />
              </div>
              <div className="edu-body">
                <p className="edu-degree">MsC — VALDOM</p>
                <h4 className="edu-school">ENSEEIHT</h4>
                <p className="edu-desc">
                  École Nationale Supérieure d&apos; Électrotechnique, d&apos;
                  Électronique, d&apos; Informatique, d&apos; Hydraulique et des
                  Télécommunications. Advanced engineering curriculum in
                  Toulouse.
                </p>
              </div>
              <div className="edu-tags">
                <span className="edu-tag">Engineering</span>
                <span className="edu-tag">Electronics</span>
                <span className="edu-tag">Computer Science</span>
              </div>
            </a>

            <a
              className="edu-card animate-fadeup"
              style={{ '--delay': '0.12s' } as React.CSSProperties}
              href="https://www.supmicrotech.fr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CornerBrackets />
              <div className="edu-logo">
                <Image
                  src="/images/ensmm.png"
                  alt="ENSMM"
                  width={140}
                  height={60}
                  style={{
                    objectFit: 'contain',
                    width: '100%',
                    height: '56px',
                  }}
                />
              </div>
              <div className="edu-body">
                <p className="edu-degree">Engineering Degree</p>
                <h4 className="edu-school">Supmicrotech ENSMM</h4>
                <p className="edu-desc">
                  Specialisation in connected objects. Core competencies:
                  Embedded Systems, ML, Networking, OOP.
                </p>
              </div>
              <div className="edu-tags">
                <span className="edu-tag">Embedded</span>
                <span className="edu-tag">IoT</span>
                <span className="edu-tag">Networking</span>
                <span className="edu-tag">OOP</span>
              </div>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
