'use client';

import type { CSSProperties } from 'react';
import type { GeoTIFF } from '@developmentseed/geotiff';
import type { AutoStats } from '../render/stats';
import type { CogState, CogStateUpdate } from '../state/types';
import { T } from '@/components/cog/theme';

const cardStyle: CSSProperties = {
  background: 'var(--cog-surface)',
  border: '1px solid var(--cog-border)',
  borderRadius: 10,
  color: 'var(--cog-text)',
};

type Props = {
  url: string;
  geotiff: GeoTIFF | null;
  bandCount: number | null;
  bandNames: Map<number, string> | null;
  autoStats: AutoStats | null;
  state: CogState;
  update: (patch: CogStateUpdate) => void;
  onOpenDataset: () => void;
};

function datasetTitle(url: string) {
  try {
    const name = decodeURIComponent(
      new URL(url).pathname.split('/').pop() ?? '',
    );
    return name.replace(/\.(tif|tiff)$/i, '') || 'Cloud Optimized GeoTIFF';
  } catch {
    return 'Cloud Optimized GeoTIFF';
  }
}

export default function CogInfoPanel({
  url,
  geotiff,
  bandCount,
  bandNames,
  autoStats,
  state,
  update,
  onOpenDataset,
}: Props) {
  const count = bandCount ?? geotiff?.count ?? 0;
  const title =
    state.urls.length > 1
      ? `${state.urls.length} COG layers`
      : datasetTitle(url);
  const activeBands =
    state.bands ?? (state.mode === 'single' ? [1] : [1, 2, 3]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 96,
        left: 16,
        zIndex: 4,
        width: 'min(455px, calc(100vw - 32px))',
        display: 'grid',
        alignContent: 'start',
        gap: 12,
        pointerEvents: 'auto',
        fontFamily: T.sans,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="button"
          onClick={onOpenDataset}
          aria-label="Open a different Cloud Optimized GeoTIFF"
          style={{
            padding: '7px 11px',
            border: '1px solid var(--cog-border)',
            borderRadius: 6,
            background: 'var(--cog-surface)',
            color: 'var(--cog-text)',
            fontSize: 11,
            cursor: 'pointer',
            boxShadow: 'var(--cog-shadow)',
          }}
        >
          Open COG…
        </button>
      </div>
      <section style={{ ...cardStyle, padding: '18px 20px 16px' }}>
        <h1
          title={title}
          style={{
            margin: 0,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: T.serif,
            fontWeight: 600,
            fontSize: 'clamp(18px, 5vw, 25px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h1>
        <div
          style={{
            marginTop: 5,
            color: 'var(--cog-muted)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {state.urls.length > 1
            ? 'MULTI-COG DATASET'
            : 'CLOUD OPTIMIZED GEOTIFF'}
        </div>
        <p
          style={{
            margin: '10px 0 12px',
            color: 'var(--cog-text)',
            fontSize: 12.5,
            lineHeight: 1.55,
          }}
        >
          {geotiff
            ? `${geotiff.width.toLocaleString()} × ${geotiff.height.toLocaleString()} pixels · ${count} ${count === 1 ? 'band' : 'bands'}.`
            : 'Reading the GeoTIFF header and geographic extent…'}
        </p>
        <div
          title={url}
          style={{
            overflow: 'hidden',
            color: 'var(--cog-muted)',
            fontSize: 10.5,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {url}
        </div>
      </section>

      {count > 0 && (
        <section style={{ ...cardStyle, padding: '13px 8px 10px' }}>
          <div
            style={{
              padding: '0 8px 10px',
              color: 'var(--cog-muted)',
              fontSize: 11,
              letterSpacing: '0.08em',
            }}
          >
            VARIABLES
          </div>
          {Array.from({ length: count }, (_, index) => {
            const band = index + 1;
            const selected = activeBands.includes(band);
            const stat = autoStats?.perBand?.get(band);
            const channel =
              state.mode === 'rgb'
                ? ['R', 'G', 'B'][activeBands.indexOf(band)]
                : undefined;
            return (
              <button
                key={band}
                type="button"
                aria-pressed={selected}
                onClick={() => update({ mode: 'single', bands: [band] })}
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 8px',
                  border: 0,
                  borderRadius: 6,
                  background:
                    state.mode === 'single' && activeBands[0] === band
                      ? 'var(--cog-selected)'
                      : 'transparent',
                  color:
                    state.mode === 'single' && activeBands[0] === band
                      ? 'var(--cog-selected-text)'
                      : 'var(--cog-text)',
                  textAlign: 'left',
                  fontFamily: T.sans,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <strong style={{ fontWeight: selected ? 600 : 400 }}>
                    {bandNames?.get(band) ?? `Band ${band}`}
                  </strong>
                  <span style={{ opacity: 0.72 }}> · band {band}</span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    opacity: 0.75,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {channel ??
                    (stat
                      ? `${stat.min.toPrecision(3)}–${stat.max.toPrecision(3)}`
                      : '')}
                </span>
              </button>
            );
          })}
          <p
            style={{
              margin: '8px 8px 2px',
              color: 'var(--cog-muted)',
              fontSize: 11,
              lineHeight: 1.45,
            }}
          >
            Select a band to view it with the active colormap. Use Options for
            RGB composites and rendering controls.
          </p>
        </section>
      )}

      <section style={{ ...cardStyle, padding: '8px 16px' }}>
        <div style={{ fontFamily: T.serif, fontSize: 19, lineHeight: 1.2 }}>
          Grid level {geotiff?.overviews.length ?? 0}
        </div>
        <div
          style={{ marginTop: 4, color: 'var(--cog-muted)', fontSize: 11.5 }}
        >
          {geotiff
            ? `${geotiff.overviews.length} overview levels · ${geotiff.width.toLocaleString()} × ${geotiff.height.toLocaleString()} px`
            : 'Overview pyramid · loading metadata'}
        </div>
      </section>
    </div>
  );
}
