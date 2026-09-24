'use client';
import React from 'react';

export type ScaleSegment = { color: string; share: number; label?: string };

const DEFAULT: ScaleSegment[] = [
  { color: '#3b9ae1', share: 20 },
  { color: '#3f7d4e', share: 25 },
  { color: '#8db15f', share: 32 },
  { color: '#e7962a', share: 4 },
  { color: '#e6c15a', share: 4 },
  { color: '#a89f91', share: 15 },
];

export default function ScaleBar({
  segments = DEFAULT,
  width = 750,
}: {
  segments?: ScaleSegment[];
  width?: number | string;
}) {
  const [hovered, setHovered] = React.useState<ScaleSegment | null>(null);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height: 30,
      }}
      role="img"
      aria-label="Class share legend"
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: 12,
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {segments.map((s, i) => (
          <div
            key={i}
            aria-label={s.label}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(null)}
            style={{ flex: s.share, background: s.color }}
          />
        ))}
      </div>
      {hovered?.label && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 'calc(100% + 8px)',
            transform: 'translateX(-50%)',
            padding: '5px 8px',
            borderRadius: 5,
            background: '#27251f',
            color: '#fff',
            fontSize: 11,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {hovered.label}
        </div>
      )}
    </div>
  );
}
