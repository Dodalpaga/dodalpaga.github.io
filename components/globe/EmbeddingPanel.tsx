'use client';
import React from 'react';
import { T, cardStyle } from './theme';

export type EmbPoint = [number, number, number, string]; // x,y,z in [-1,1], color

function placeholder(n = 220): EmbPoint[] {
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cols = ['#3b9ae1', '#3f7d4e', '#8db15f', '#a89f91'];
  return Array.from({ length: n }, () => {
    const c = Math.floor(rnd() * cols.length);
    return [
      (rnd() - 0.5) * 1.4 + c * 0.1,
      (rnd() - 0.5) * 1.2,
      (rnd() - 0.5) * 1.4,
      cols[c],
    ] as EmbPoint;
  });
}

export default function EmbeddingPanel({
  points,
  variance = [42, 18, 10],
}: {
  points?: EmbPoint[];
  variance?: [number, number, number] | number[];
}) {
  const [axes, setAxes] = React.useState<'Global axes' | 'This view'>(
    'Global axes',
  );
  const pts = React.useMemo(() => points ?? placeholder(), [points]);

  const W = 248,
    H = 170,
    cx = 100,
    cy = 88,
    S = 62;
  const az = 0.55,
    el = 0.35;
  const p = (x: number, y: number, z: number): [number, number] => {
    const X = x * Math.cos(az) - z * Math.sin(az);
    const Z = x * Math.sin(az) + z * Math.cos(az);
    const Y = y * Math.cos(el) - Z * Math.sin(el);
    return [cx + X * S, cy - Y * S];
  };
  const o = p(0, 0, 0);
  const axis = (
    x: number,
    y: number,
    z: number,
    label: string,
    color: string,
  ) => {
    const [ax, ay] = p(x, y, z);
    return (
      <g key={label}>
        <line
          x1={o[0]}
          y1={o[1]}
          x2={ax}
          y2={ay}
          stroke={color}
          strokeWidth={1}
        />
        <text
          x={ax + 4}
          y={ay + 3}
          fontSize={9}
          fill={color}
          fontFamily={T.sans}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div
      style={{
        ...cardStyle,
        width: '100%',
        maxWidth: 'var(--panel-max, 278px)',
        boxSizing: 'border-box',
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.08em',
          color: T.muted,
          marginBottom: 10,
        }}
      >
        EMBEDDING SPACE
      </div>
      <div
        style={{
          display: 'flex',
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {(['Global axes', 'This view'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setAxes(m)}
            style={{
              flex: 1,
              padding: '6px 0',
              border: 0,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: T.sans,
              background: axes === m ? T.ink : 'transparent',
              color: axes === m ? '#fff' : T.ink,
              fontWeight: axes === m ? 600 : 400,
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', margin: '4px 0', height: 130 }}
      >
        {axis(0, 1.15, 0, 'PC2', '#3f8f5a')}
        {axis(1.3, 0, 0, 'PC1', '#d33')}
        {axis(0, 0, -1.3, 'PC3', '#2f6fd0')}
        {pts.map(([x, y, z, c], i) => {
          const [px, py] = p(x, y, z);
          return (
            <circle key={i} cx={px} cy={py} r={2.2} fill={c} opacity={0.75} />
          );
        })}
      </svg>
      <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.4 }}>
        <span style={{ color: '#d33' }}>PC1 {variance[0]}%</span> ·{' '}
        <span style={{ color: '#3f8f5a' }}>PC2 {variance[1]}%</span> ·{' '}
        <span style={{ color: '#2f6fd0' }}>PC3 {variance[2]}%</span> of the
        variance
      </div>
    </div>
  );
}
