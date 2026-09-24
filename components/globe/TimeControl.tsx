'use client';
import React from 'react';
import { T } from './theme';
import type { DatasetTimeOption } from './openMeteo';

export default function TimeControl({
  options,
  value,
  onChange,
}: {
  options?: DatasetTimeOption[];
  value?: string;
  onChange?: (id: string) => void;
}) {
  if (!options?.length) return null;
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 'var(--panel-max, 278px)',
        boxSizing: 'border-box',
        gap: 8,
        padding: '6px 10px',
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        background: 'rgba(255,255,255,0.8)',
        color: T.muted,
        fontSize: 11,
        fontFamily: T.sans,
      }}
    >
      <span>TIME</span>
      <select
        aria-label="Time range"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        style={{
          border: 0,
          background: 'transparent',
          color: T.ink,
          font: 'inherit',
        }}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
