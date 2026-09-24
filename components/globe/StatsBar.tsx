'use client';
import React from 'react';
import { T, cardStyle } from './theme';

export default function StatsBar({
  cells = 0,
  level = 0,
  ms = 0,
}: {
  cells?: number;
  level?: number;
  ms?: number;
}) {
  return (
    <div
      style={{
        ...cardStyle,
        padding: '5px 10px',
        fontSize: 11,
        color: T.muted,
        borderRadius: 6,
        whiteSpace: 'nowrap',
      }}
    >
      {cells} cells · L{level} · {ms} ms
    </div>
  );
}
