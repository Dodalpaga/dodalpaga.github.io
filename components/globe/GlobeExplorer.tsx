'use client';
import React from 'react';
import GlobeCanvas from './GlobeCanvas';
import DatasetPanel from './DatasetPanel';
import LayersPanel from './LayersPanel';
import EmbeddingPanel from './EmbeddingPanel';
import ScaleBadge from './ScaleBadge';
import ScaleBar from './ScaleBar';
import StatsBar from './StatsBar';
import TimeControl from './TimeControl';
import type { GlobeStats } from './useOrthographicGlobe';
import { T, cardStyle } from './theme';
import { DATASETS } from './openMeteo';

const MOBILE_BP = 768; // navbar collapses to logo + burger here
const BOTTOM_RESERVE = 110; // chat/music widgets + footer
const MIN_SCALE = 0.6;
const HIDE_EMBEDDING_BELOW = 640; // viewport height (desktop)

function useViewport() {
  const [viewport, setViewport] = React.useState(() => ({
    w: typeof window === 'undefined' ? 0 : window.innerWidth,
    h: typeof window === 'undefined' ? 0 : window.innerHeight,
    ready: false,
  }));

  React.useEffect(() => {
    const updateViewport = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight, ready: true });
    window.addEventListener('resize', updateViewport);
    updateViewport();
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
}

export default function GlobeExplorer({
  insetTop = 0,
  insetBottom = 56,
}: {
  insetTop?: number;
  insetBottom?: number;
}) {
  const [stats, setStats] = React.useState<GlobeStats>({
    drawn: 0,
    cells: 0,
    level: 0,
    classCounts: [],
    ready: false,
    ms: 0,
  });
  const { w, h, ready: viewportReady } = useViewport();
  const mobile = viewportReady && w < MOBILE_BP;
  const [panelsOpen, setPanelsOpen] = React.useState(false);
  const [scale, setScale] = React.useState(1);
  const [datasetId, setDatasetId] = React.useState(DATASETS[0]?.id);
  const [headId, setHeadId] = React.useState(
    DATASETS[0]?.defaultHeadId ?? DATASETS[0]?.heads[0]?.id,
  );
  const [timeId, setTimeId] = React.useState(
    DATASETS[0]?.defaultTimeId ?? DATASETS[0]?.timeOptions?.[0]?.id,
  );
  const colRef = React.useRef<HTMLDivElement>(null);
  const dataset = DATASETS.find((item) => item.id === datasetId) ?? DATASETS[0];

  React.useEffect(() => {
    setHeadId(dataset?.defaultHeadId ?? dataset?.heads[0]?.id);
    setTimeId(dataset?.defaultTimeId ?? dataset?.timeOptions?.[0]?.id);
  }, [dataset]);

  const timeOption = dataset?.timeOptions?.find(
    (option) => option.id === timeId,
  );
  const activeHead =
    dataset?.heads.find((head) => head.id === headId) ?? dataset?.heads[0];
  const scaleSegments =
    stats.cells > 0
      ? activeHead?.classes
          .map((item, index) => ({
            color: item.color,
            share: stats.classCounts[index] ?? 0,
            label: item.note ? `${item.label} · ${item.note}` : item.label,
          }))
          .filter((segment) => segment.share > 0)
      : [];

  const widgetsReady = viewportReady && stats.ready;
  const showPanels = widgetsReady && (!mobile || panelsOpen);
  const showEmbedding = mobile || h >= HIDE_EMBEDDING_BELOW;
  const colTop = mobile ? insetTop + 44 : insetTop + 16;
  const avail = h - colTop - BOTTOM_RESERVE;

  // desktop: shrink the column so it always fits above the bottom widgets
  React.useLayoutEffect(() => {
    const el = colRef.current;
    if (!el || mobile) {
      setScale(1);
      return;
    }
    const fit = () => {
      const natural = el.offsetHeight; // unaffected by transforms
      if (natural > 0)
        setScale(Math.max(MIN_SCALE, Math.min(1, avail / natural)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mobile, avail, showEmbedding]);

  const rowY = insetTop / 2 - 6; // vertically aligned with the navbar row

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: T.bg,
        fontFamily: T.sans,
      }}
    >
      {/* on phones the globe and the panels never show together */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          visibility: mobile && panelsOpen ? 'hidden' : 'visible',
        }}
      >
        <GlobeCanvas
          dataset={dataset}
          headId={headId}
          timeOffsetHours={timeOption?.offsetHours}
          onStats={setStats}
        />
      </div>

      {!widgetsReady && (
        <div
          aria-label="Loading globe controls"
          style={{
            position: 'absolute',
            top: viewportReady ? colTop : 16,
            left: 16,
            width: mobile ? 'calc(100vw - 32px)' : 455,
            maxWidth: 455,
            display: 'grid',
            gap: 12,
            pointerEvents: 'none',
          }}
        >
          {[82, 154, 52, 42].map((height) => (
            <div
              key={height}
              style={{
                height,
                borderRadius: 8,
                background: 'rgba(221, 216, 204, 0.72)',
                border: `1px solid ${T.border}`,
              }}
            />
          ))}
        </div>
      )}

      {/* left column */}
      {showPanels && (
        <div
          ref={colRef}
          style={
            {
              position: 'absolute',
              top: colTop,
              left: 16,
              width: mobile ? 'calc(100vw - 32px)' : 455,
              maxWidth: 455,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              pointerEvents: 'none',
              transform: mobile ? undefined : `scale(${scale})`,
              transformOrigin: 'top left',
              maxHeight: mobile ? avail : undefined,
              overflowY: mobile ? 'auto' : undefined,
              '--panel-max': mobile ? '100%' : '278px',
            } as React.CSSProperties
          }
        >
          <div style={{ pointerEvents: 'auto' }}>
            {dataset && (
              <DatasetPanel
                dataset={dataset}
                datasets={DATASETS}
                onSelect={setDatasetId}
              />
            )}
          </div>
          <div style={{ pointerEvents: 'auto' }}>
            {dataset && (
              <LayersPanel
                heads={dataset.heads}
                selectedId={headId}
                onSelect={setHeadId}
              />
            )}
          </div>
          {showEmbedding && dataset?.embedding && (
            <div style={{ pointerEvents: 'auto' }}>
              <EmbeddingPanel />
            </div>
          )}
          <div style={{ pointerEvents: 'auto' }}>
            <ScaleBadge
              title={dataset?.describeLevel(stats.level).title ?? 'Grid level'}
              subtitle={dataset?.describeLevel(stats.level).subtitle ?? '—'}
            />
          </div>
          <div style={{ pointerEvents: 'auto' }}>
            <TimeControl
              options={dataset?.timeOptions}
              value={timeId}
              onChange={setTimeId}
            />
          </div>
        </div>
      )}

      {widgetsReady && (
        <div
          style={
            mobile
              ? { position: 'absolute', top: rowY + 2, left: 84, right: 84 }
              : {
                  position: 'absolute',
                  bottom: insetBottom + 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'min(420px, calc(100vw - 32px))',
                }
          }
        >
          <ScaleBar segments={scaleSegments} width="100%" />
        </div>
      )}

      {/* metrics: right of navbar (desktop) / under the burger (phone) */}
      {widgetsReady && (
        <div
          style={{
            position: 'absolute',
            right: 16,
            top: mobile ? insetTop - 4 : insetTop / 2 - 14,
          }}
        >
          <StatsBar cells={stats.cells} level={stats.level} ms={stats.ms} />
        </div>
      )}

      {/* phone: switch between panels and globe */}
      {widgetsReady && mobile && (
        <button
          onClick={() => setPanelsOpen((o) => !o)}
          aria-pressed={panelsOpen}
          style={{
            ...cardStyle,
            position: 'absolute',
            left: 16,
            top: insetTop - 4,
            padding: '5px 12px',
            fontSize: 12,
            cursor: 'pointer',
            borderRadius: 999,
          }}
        >
          {panelsOpen ? 'Show globe' : 'Show panels'}
        </button>
      )}
    </div>
  );
}
