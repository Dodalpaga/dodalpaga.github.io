'use client';
import React from 'react';
import { T, cardStyle } from './theme';
import type { Head as DatasetHead } from './openMeteo';

export default function LayersPanel({
  heads = [],
  selectedId,
  onSelect,
  note,
}: {
  heads?: DatasetHead[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  note?: string;
}) {
  const headList = heads;
  const [sel, setSel] = React.useState(selectedId ?? headList[0]?.id);
  const activeId = selectedId ?? sel;
  const activeHead = headList.find((h) => h.id === activeId) ?? headList[0];

  return (
    <div
      style={{
        ...cardStyle,
        width: '100%',
        maxWidth: 'var(--panel-max, 278px)',
        boxSizing: 'border-box',
        fontSize: 13,
      }}
    >
      <div style={{ padding: '14px 8px 10px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 8px 10px',
          }}
        >
          <span
            style={{ fontSize: 11, letterSpacing: '0.08em', color: T.muted }}
          >
            DATASETS
          </span>
        </div>
        {headList.map((h) => {
          const on = h.id === activeId;
          return (
            <button
              key={h.id}
              onClick={() => {
                setSel(h.id);
                onSelect?.(h.id);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                textAlign: 'left',
                padding: '5px 8px',
                border: 0,
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                background: on ? T.ink : 'transparent',
                color: on ? '#fff' : T.ink,
                fontFamily: T.sans,
              }}
            >
              <span>
                <span style={{ fontWeight: on ? 600 : 400 }}>{h.label}</span>
                <span style={{ opacity: 0.75 }}> · {h.scope}</span>
              </span>
              <span
                style={{ opacity: 0.75, fontVariantNumeric: 'tabular-nums' }}
              >
                {h.badge}
              </span>
            </button>
          );
        })}
        <p
          style={{
            margin: '10px 8px 2px',
            fontSize: 11.5,
            lineHeight: 1.45,
            color: T.muted,
          }}
        >
          {note ?? activeHead?.description}
        </p>
      </div>
    </div>
  );
}
