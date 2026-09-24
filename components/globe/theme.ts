import type React from "react";
export const T = {
  bg: '#f2eee6',
  card: '#faf8f3',
  border: '#e2ddd2',
  ink: '#1c1a17',
  muted: '#6f6a60',
  ocean: '#e3e8ec',
  land: '#f3f1ec',
  grid: 'rgba(120,130,140,0.28)',
  border2: 'rgba(90,90,90,0.35)',
  serif: "'Newsreader','Iowan Old Style',Georgia,serif",
  sans: "'Inter',system-ui,-apple-system,'Segoe UI',sans-serif",
};

export const cardStyle: React.CSSProperties = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  fontFamily: T.sans,
  color: T.ink,
};
