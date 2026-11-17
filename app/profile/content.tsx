// app/profile/content.tsx
"use client";
import * as React from "react";
import Image from "next/image";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import CodeIcon from "@mui/icons-material/Code";
import { useThemeContext } from "@/context/ThemeContext";
import "../globals.css";
import "./styles.css";
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
} from "react-icons/si";
import type { IconType } from "react-icons";

const getYearsSince = (startDateString: string): number => {
  const start = new Date(startDateString);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  if (now.getMonth() < start.getMonth()) years -= 1;
  return Math.max(years, 0);
};

interface TechTagProps {
  Icon: IconType;
  label: string;
}
const TechTag: React.FC<TechTagProps> = ({ Icon, label }) => {
  const IC = Icon as React.ComponentType<{ size?: number }>;
  return (
    <span className="tech-tag">
      <IC size={13} />
      {label}
    </span>
  );
};

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
    <Icon style={{ fontSize: 16 }} />
    <span>{label}</span>
  </a>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="section-header">
    <h2 className="section-title">{title}</h2>
  </div>
);

const thalesSkills: TechTagProps[] = [
  { Icon: SiPython, label: "Python" },
  { Icon: SiTensorflow, label: "TensorFlow" },
  { Icon: SiPytorch, label: "PyTorch" },
  { Icon: SiLangchain, label: "LangChain" },
  { Icon: SiScikitlearn, label: "Scikit-Learn" },
  { Icon: SiFastapi, label: "FastAPI" },
  { Icon: SiDjango, label: "Django" },
  { Icon: SiDocker, label: "Docker" },
  { Icon: SiKubernetes, label: "Kubernetes" },
  { Icon: SiNextdotjs, label: "Next.js" },
  { Icon: SiReact, label: "React" },
  { Icon: SiTypescript, label: "TypeScript" },
  { Icon: SiElasticsearch, label: "Elasticsearch" },
  { Icon: SiKibana, label: "Kibana" },
  { Icon: SiLogstash, label: "Logstash" },
];

const atosSkills: TechTagProps[] = [
  { Icon: SiPython, label: "Python" },
  { Icon: SiRaspberrypi, label: "Raspberry Pi" },
  { Icon: SiNvidia, label: "Jetson Nano" },
  { Icon: SiOpencv, label: "OpenCV" },
  { Icon: SiScikitlearn, label: "Scikit-Learn" },
  { Icon: SiPlotly, label: "Dash Plotly" },
  { Icon: SiGrafana, label: "Grafana" },
];

const coreSkills = [
  "Machine learning",
  "Generative AI",
  "Data science",
  "Python",
  "TypeScript",
  "React",
  "Next.js",
];

export default function Content() {
  const { theme } = useThemeContext();
  const yearsAtThales = getYearsSince("2022-12-01");
  const totalYears = getYearsSince("2021-09-01");

  return (
    <div className="profile-container">
      <aside className="profile-sidebar">
        <div className="sidebar-inner">
          <div className="identity-block">
            <Image
              src="/images/pp.jpeg"
              alt="Dorian Voydie"
              width={112}
              height={112}
              className="profile-img"
            />
            <div className="identity-text">
              <h1 className="identity-name">Dorian Voydie</h1>
              <p className="identity-label">AI Engineer, Toulouse</p>
            </div>
          </div>

          <dl className="stats-row">
            <div className="stat-item">
              <dd className="stat-value">{totalYears}+</dd>
              <dt className="stat-key">Years of experience</dt>
            </div>
            <div className="stat-item">
              <dd className="stat-value">6</dd>
              <dt className="stat-key">Projects delivered</dt>
            </div>
            <div className="stat-item">
              <dd className="stat-value">1</dd>
              <dt className="stat-key">Patent</dt>
            </div>
          </dl>

          <div className="sidebar-section">
            <p className="sidebar-label">Contact</p>
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

          <div className="sidebar-section">
            <p className="sidebar-label">Core skills</p>
            <div className="core-skills">
              {coreSkills.map((s) => (
                <span key={s} className="core-skill-tag">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="sidebar-section sidebar-section--fill">
            <p className="sidebar-label">GitHub activity</p>
            <div className="stats-img-wrapper">
              <Image
                src="https://github-readme-streak-stats.herokuapp.com?user=Dodalpaga&theme=transparent&hide_border=true&currStreakLabel=F0E8D8&currStreakNum=F03A2A&fire=F03A2A&ring=F03A2A&sideNums=F0E8D8&sideLabels=F0E8D8&dates=C9BFAE&stroke=3A5371"
                alt="GitHub contribution streak"
                width={495}
                height={195}
                className="stats-img"
              />
            </div>
          </div>
        </div>
      </aside>

      <main className="profile-main">
        <section className="content-section">
          <SectionHeader title="Experience" />

          <article className="mission-card">
            <header className="mission-company">
              <div className="company-logo-wrapper">
                <Image
                  src={
                    theme === "dark"
                      ? "/images/thales-inverted.png"
                      : "/images/thales.png"
                  }
                  alt="Thales"
                  width={100}
                  height={32}
                  style={{
                    objectFit: "contain",
                    width: "auto",
                    height: "26px",
                  }}
                />
              </div>
              <div className="company-meta">
                <h3 className="company-name">Thales Services Numériques</h3>
                <p className="company-location">
                  Tech Lead &amp; AI Engineer · Toulouse, France
                </p>
              </div>
              <div className="mission-dates">
                Dec 2022 to present · {yearsAtThales}+ yrs
              </div>
            </header>

            <p className="mission-brief">
              I&apos;m a tech lead with {totalYears}+ years of experience, and I
              specialise in taking agentic AI applications to production,
              including{" "}
              <a
                className="inline-link"
                href="https://viseo.esa.int/"
                target="_blank"
                rel="noopener noreferrer"
              >
                VISEO
              </a>{" "}
              for ESA. I&apos;m also a Knowledge Booster at Thales. I started as
              a data engineer on the European Galileo navigation system, then
              worked as a data scientist on the Euclid satellite ground segment
              for CNES (Centre National d&apos;Études Spatiales). I placed 4th
              out of 200 in internal coding competitions.
            </p>

            <div className="featured-project">
              <div className="featured-head">
                <h4 className="featured-title">VISEO for ESA / ESRIN</h4>
                <a
                  className="inline-link"
                  href="https://viseo.esa.int/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  viseo.esa.int (live)
                </a>
              </div>
              <p className="featured-text">
                Tech lead of a 3 to 4 person team on a €1.5M, two-year
                generative AI project for ESRIN, ESA&apos;s Centre for Earth
                Observation in Frascati, Italy. I write and ship code alongside
                the team and own delivery: stakeholders, timelines and
                deliverables. VISEO uses LLM agents to guide users through 200+
                Earth observation collections (tens of millions of products),
                with recommendations, visualisations and access guidance.
              </p>
            </div>

            <div className="mission-body">
              <div className="mission-col">
                <h4 className="mission-section-label">What I did</h4>
                <ul className="objectives-list">
                  <li>
                    Applied AI and data science to satellite imagery for Earth
                    observation.
                  </li>
                  <li>
                    Designed and built ML pipelines for large-scale data
                    processing.
                  </li>
                  <li>
                    Built containerised full-stack apps with Docker: APIs,
                    monitoring and UIs.
                  </li>
                  <li>
                    Contributed to tenders and technical studies for CNES.
                  </li>
                </ul>

                <h4 className="mission-section-label">Conferences</h4>
                <ul className="objectives-list">
                  <li>
                    WGISS-60 (Oberpfaffenhofen, Germany, 2025): CEOS Working
                    Group on Information Systems and Services, hosted by DLR,
                    on Earth observation data discovery and interoperability.
                  </li>
                  <li>
                    Φnnovation Summit (ESA ESRIN, Frascati, Italy, 2026): ESA
                    Φ-lab&apos;s summit on AI, HPC and quantum computing for
                    Earth observation.
                  </li>
                  <li>
                    Agentic AI for Earth Observation (Berlin, Germany, 2026):
                    workshop co-organised by ESA Φ-lab and BIFOLD on LLM agents
                    applied to Earth observation.
                  </li>
                </ul>
              </div>

              <div className="mission-col">
                <h4 className="mission-section-label">Stack</h4>
                <div className="tech-grid">
                  {thalesSkills.map((s) => (
                    <TechTag key={s.label} {...s} />
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="mission-card">
            <header className="mission-company">
              <div className="company-logo-wrapper">
                <Image
                  src="/images/atos.png"
                  alt="Atos"
                  width={80}
                  height={32}
                  style={{
                    objectFit: "contain",
                    width: "auto",
                    height: "22px",
                  }}
                />
              </div>
              <div className="company-meta">
                <h3 className="company-name">Atos France</h3>
                <p className="company-location">
                  Embedded ML apprentice · Toulouse, France
                </p>
              </div>
              <div className="mission-dates">Sep 2021 to Nov 2022</div>
            </header>

            <div className="mission-body">
              <div className="mission-col">
                <p className="mission-brief">
                  Apprenticeship alongside my MSc (VALDOM at INSA Toulouse and
                  ENSEEIHT). I worked on AI and embedded machine learning
                  projects, including predictive maintenance of physical systems
                  and defect detection on aircraft fuselages.
                </p>

                <h4 className="mission-section-label">What I did</h4>
                <ul className="objectives-list">
                  <li>
                    Built embedded instrumentation on Raspberry Pi and Jetson
                    Nano.
                  </li>
                  <li>
                    Analysed and structured sensor data and designed ML model
                    architectures.
                  </li>
                  <li>
                    Trained computer vision models to detect defects on aircraft
                    fuselages.
                  </li>
                  <li>Built dashboards to visualise model predictions.</li>
                </ul>
              </div>

              <div className="mission-col">
                <h4 className="mission-section-label">Publications</h4>
                <ul className="objectives-list">
                  <li>Co-authored a paper for the IFAC 2023 conference.</li>
                  <li>Contributed to a registered patent.</li>
                </ul>

                <h4 className="mission-section-label">Stack</h4>
                <div className="tech-grid">
                  {atosSkills.map((s) => (
                    <TechTag key={s.label} {...s} />
                  ))}
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="content-section">
          <SectionHeader title="Education" />
          <div className="education-grid">
            <a
              className="edu-card"
              href="https://www.insa-toulouse.fr/valorisation-des-donnees-massives/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="edu-logo">
                <Image
                  src="/images/insa-toulouse.webp"
                  alt="INSA Toulouse"
                  width={140}
                  height={60}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "48px",
                  }}
                />
              </div>
              <div className="edu-body">
                <p className="edu-degree">MSc, VALDOM</p>
                <h4 className="edu-school">INSA Toulouse</h4>
                <p className="edu-desc">
                  Valorisation des Données Massives: big data, machine learning
                  and cloud.
                </p>
              </div>
            </a>

            <a
              className="edu-card"
              href="https://www.enseeiht.fr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="edu-logo">
                <Image
                  src="/images/n7.png"
                  alt="ENSEEIHT"
                  width={140}
                  height={60}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "48px",
                  }}
                />
              </div>
              <div className="edu-body">
                <p className="edu-degree">MSc, VALDOM</p>
                <h4 className="edu-school">ENSEEIHT</h4>
                <p className="edu-desc">
                  Engineering school in Toulouse covering electronics, computer
                  science, hydraulics and telecommunications.
                </p>
              </div>
            </a>

            <a
              className="edu-card"
              href="https://www.supmicrotech.fr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="edu-logo">
                <Image
                  src="/images/ensmm.png"
                  alt="ENSMM"
                  width={140}
                  height={60}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "48px",
                  }}
                />
              </div>
              <div className="edu-body">
                <p className="edu-degree">Engineering degree</p>
                <h4 className="edu-school">Supmicrotech ENSMM</h4>
                <p className="edu-desc">
                  Specialised in connected objects: embedded systems, machine
                  learning, networking and object-oriented programming.
                </p>
              </div>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
