'use client';
import React from 'react';
import { T, cardStyle } from './theme';

export default function ScaleBadge({
  title = 'Grid level 0',
  subtitle = '— · —',
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        ...cardStyle,
        width: '100%',
        maxWidth: 'var(--panel-max, 278px)',
        boxSizing: 'border-box',
        padding: '8px 16px',
        textAlign: 'left',
      }}
    >
      <div style={{ fontFamily: T.serif, fontSize: 20, lineHeight: 1.2 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
        {subtitle}
      </div>
    </div>
  );
}
