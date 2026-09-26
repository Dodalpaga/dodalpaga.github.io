'use client';

import { COLORMAP_INDEX } from '@developmentseed/deck.gl-raster/gpu-modules';
import colormapsPngUrl from '@developmentseed/deck.gl-raster/gpu-modules/colormaps.png';
import { percentileFromHistogram, type AutoStats } from '../render/stats';
import type { CogState } from '../state/types';

function numberLabel(value: number) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat(undefined, { maximumSignificantDigits: 5 }).format(value)
    : '—';
}

export default function CogColorbar({
  state,
  autoStats,
}: {
  state: CogState;
  autoStats: AutoStats | null;
}) {
  const band = state.bands?.[0] ?? 1;
  const stats = autoStats?.perBand?.get(band) ?? autoStats?.global ?? null;
  const fallback = stats
    ? [percentileFromHistogram(stats, 0.02), percentileFromHistogram(stats, 0.98)] as [number, number]
    : null;
  const range = state.rescale?.[0] ?? fallback;
  const colormap = state.colormap ?? 'viridis';
  const rowIndex = COLORMAP_INDEX[colormap as keyof typeof COLORMAP_INDEX] ?? 0;
  const rowCount = Object.keys(COLORMAP_INDEX).length;
  const singleBand = state.mode === 'single';

  return (
    <div
      aria-label={singleBand ? `${colormap} color scale` : 'RGB composite legend'}
      style={{
        position: 'absolute',
        zIndex: 4,
        left: '50%',
        bottom: 76,
        transform: 'translateX(-50%)',
        width: 'min(420px, calc(100vw - 48px))',
        padding: '8px 12px 6px',
        border: '1px solid var(--cog-border)',
        borderRadius: 8,
        background: 'var(--cog-surface)',
        color: 'var(--cog-text)',
        boxShadow: 'var(--cog-shadow)',
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--cog-muted)', fontSize: 10 }}>
        <span>{singleBand ? `${colormap} · band ${band}` : 'RGB composite'}</span>
        {!singleBand && <span>R · G · B</span>}
      </div>
      <div
        role="img"
        aria-label={singleBand && range ? `Values from ${numberLabel(range[0])} to ${numberLabel(range[1])}` : 'Red, green, and blue composite'}
        style={{
          height: 12,
          borderRadius: 6,
          backgroundImage: singleBand
            ? `url(${colormapsPngUrl.src})`
            : 'linear-gradient(90deg, #272b8b 0%, #218b9b 28%, #62b765 53%, #e4ca48 76%, #c84238 100%)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: singleBand ? `100% ${rowCount * 12}px` : '100% 100%',
          backgroundPosition: singleBand ? `0 ${-rowIndex * 12}px` : undefined,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, color: 'var(--cog-muted)', fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>
        <span>{singleBand && range ? numberLabel(range[0]) : singleBand ? 'min' : 'Composite'}</span>
        <span>{singleBand && range ? numberLabel(range[1]) : singleBand ? 'max' : 'No scalar range'}</span>
      </div>
    </div>
  );
}
