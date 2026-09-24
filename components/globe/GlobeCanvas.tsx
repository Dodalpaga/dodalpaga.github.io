'use client';
import React from 'react';
import { useOrthographicGlobe, GlobeStats } from './useOrthographicGlobe';
import type { GlobeDataset } from './openMeteo';

export default function GlobeCanvas({
  dataset,
  headId,
  onStats,
}: {
  dataset?: GlobeDataset;
  headId?: string;
  onStats?: (s: GlobeStats) => void;
}) {
  const { canvasRef } = useOrthographicGlobe({ dataset, headId, onStats });
  return (
    <canvas
      id="globe"
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
}
