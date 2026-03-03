// components/SkillsSection.tsx
'use client';
import * as React from 'react';
import { Typography } from '@mui/material';
import type { IconType } from 'react-icons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill {
  label: string;
  Icon: IconType;
}

export interface SkillCategory {
  title: string;
  accent: string; // CSS color
  skills: Skill[];
}

interface Props {
  categories: SkillCategory[];
}

// ─── Safe Icon wrapper ────────────────────────────────────────────────────────

const Icon: React.FC<{ src: IconType; size?: number; color?: string }> = ({
  src: Src,
  size = 14,
  color,
}) => {
  const C = Src as React.ComponentType<any>;
  return <C size={size} color={color} />;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SkillsSection({ categories }: Props) {
  const [active, setActive] = React.useState<string | null>(null);

  const displayed = active
    ? categories.filter((c) => c.title === active)
    : categories;

  return (
    <div style={{ marginTop: 24, width: '100%' }}>
      {/* ── Filter tabs ── */}
      <div style={styles.tabBar}>
        <button
          style={{
            ...styles.tab,
            ...(active === null ? styles.tabActive : {}),
          }}
          onClick={() => setActive(null)}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.title}
            style={{
              ...styles.tab,
              ...(active === c.title
                ? {
                    ...styles.tabActive,
                    borderColor: c.accent,
                    color: c.accent,
                  }
                : {}),
            }}
            onClick={() => setActive(active === c.title ? null : c.title)}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* ── Category grid ── */}
      <div style={styles.grid}>
        {displayed.map((cat) => (
          <CategoryCard key={cat.title} cat={cat} />
        ))}
      </div>
    </div>
  );
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({ cat }: { cat: SkillCategory }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        ...styles.card,
        borderColor: hovered
          ? cat.accent
          : 'var(--card-border, rgba(255,255,255,0.08))',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px ${cat.accent}40`
          : '0 2px 12px rgba(0,0,0,0.15)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent bar */}
      <div
        style={{
          ...styles.accentBar,
          background: cat.accent,
          opacity: hovered ? 1 : 0.5,
        }}
      />

      {/* Header */}
      <div style={styles.cardHeader}>
        <Typography
          variant="caption"
          style={{
            ...styles.categoryLabel,
            color: cat.accent,
          }}
        >
          {cat.title.toUpperCase()}
        </Typography>
      </div>

      {/* Skills */}
      <div style={styles.skillsWrap}>
        {cat.skills.map((s) => (
          <SkillPill key={s.label} skill={s} accent={cat.accent} />
        ))}
      </div>
    </div>
  );
}

// ─── Skill pill ───────────────────────────────────────────────────────────────

function SkillPill({ skill, accent }: { skill: Skill; accent: string }) {
  const [hov, setHov] = React.useState(false);

  return (
    <div
      style={{
        ...styles.pill,
        background: hov
          ? `${accent}18`
          : 'var(--background-elevated, rgba(255,255,255,0.04))',
        borderColor: hov
          ? `${accent}70`
          : 'var(--card-border, rgba(255,255,255,0.08))',
        color: hov ? accent : 'var(--foreground-2, rgba(255,255,255,0.7))',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          opacity: hov ? 1 : 0.65,
        }}
      >
        <Icon
          src={skill.Icon}
          size={13}
          color={hov ? accent : 'currentColor'}
        />
      </span>
      <span style={styles.pillLabel}>{skill.label}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  tabBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    padding: '5px 14px',
    borderRadius: 999,
    border: '1px solid var(--card-border, rgba(255,255,255,0.12))',
    background: 'transparent',
    color: 'var(--foreground-2, rgba(255,255,255,0.55))',
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.7rem',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    background: 'var(--accent-muted, rgba(100,140,255,0.12))',
    borderColor: 'var(--accent, #648cff)',
    color: 'var(--accent, #648cff)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
  },
  card: {
    position: 'relative',
    borderRadius: 14,
    border: '1px solid',
    background: 'var(--background-elevated, rgba(255,255,255,0.03))',
    padding: '16px 14px 14px',
    transition:
      'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: '14px 14px 0 0',
    transition: 'opacity 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
  },
  skillsWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '5px 10px',
    borderRadius: 8,
    border: '1px solid',
    fontSize: '0.78rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 500,
    cursor: 'default',
    transition: 'all 0.15s ease',
    width: '100%',
  },
  pillLabel: {
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
};
