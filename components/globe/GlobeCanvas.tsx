'use client';
import React from 'react';
import { useOrthographicGlobe, GlobeStats } from './useOrthographicGlobe';
import type { GlobeDataset } from './openMeteo';

export default function GlobeCanvas({
  dataset,
  headId,
  timeOffsetHours,
  onStats,
}: {
  dataset?: GlobeDataset;
  headId?: string;
  timeOffsetHours?: number;
  onStats?: (s: GlobeStats) => void;
}) {
  const { canvasRef } = useOrthographicGlobe({
    dataset,
    headId,
    timeOffsetHours,
    onStats,
  });
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
