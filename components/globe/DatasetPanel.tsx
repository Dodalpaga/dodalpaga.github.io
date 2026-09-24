'use client';
import React from 'react';
import { T, cardStyle } from './theme';
import type { GlobeDataset } from './openMeteo';

export default function DatasetPanel({
  dataset,
  datasets = [],
  onSelect,
}: {
  dataset: GlobeDataset;
  datasets?: GlobeDataset[];
  onSelect?: (id: string) => void;
}) {
  return (
    <div
      style={{
        ...cardStyle,
        padding: '20px 20px 16px',
        width: '100%',
        maxWidth: 455,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: T.serif,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: '-0.01em',
          }}
        >
          {dataset.title}
        </h1>
        {datasets.length > 1 && (
          <select
            aria-label="Dataset"
            value={dataset.id}
            onChange={(event) => onSelect?.(event.target.value)}
            style={{
              maxWidth: 150,
              padding: '5px 8px',
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              background: 'transparent',
              color: T.ink,
              fontFamily: T.sans,
              fontSize: 11,
            }}
          >
            {datasets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        )}
        <button
          aria-label="Help"
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: `1px solid ${T.border}`,
            background: 'transparent',
            color: T.muted,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ?
        </button>
      </div>
      <p
        style={{
          margin: '10px 0 14px',
          fontSize: 13,
          lineHeight: 1.55,
          color: '#3d3a34',
        }}
      >
        {dataset.description}
      </p>
      <div style={{ fontSize: 12, color: T.muted }}>{dataset.footnote}</div>
      {dataset.attribution && (
        <div
          style={{
            marginTop: 8,
            fontSize: 10.5,
            color: T.muted,
            lineHeight: 1.4,
          }}
        >
          {dataset.attribution}
        </div>
      )}
    </div>
  );
}
