import type React from 'react';
import type { Cell } from './grid';

/** One value vector per cell (dataset-defined channels, NaN = missing). */
export type Sample = number[];

export interface ClassDef {
  id: string;
  label: string;
  color: string;
  note?: string; // e.g. "15–50 µg/m³"
}

/** A "head" = one way of reading the dataset (a variable, a classifier...). */
export interface Head {
  id: string;
  label: string;
  scope?: string; // shown after the label, e.g. "current"
  badge?: string; // right-aligned in the list, e.g. a unit or a score
  description: string;
  classes: ClassDef[];
  /** class index for a cell sample, -1 when there is no data */
  classOf: (sample: Sample) => number;
}

export interface FetchBatch {
  samples: Map<string, Sample>; // cell id -> sample
  bytes: number;
  requests: number;
}

export interface DatasetTimeOption {
  id: string;
  label: string;
  offsetHours: number;
}

export interface GlobeDataset {
  id: string;
  title: string;
  description: React.ReactNode;
  footnote: string;
  attribution?: React.ReactNode;
  classesLabel?: string; // label of the collapsible list, default "Classes"

  heads: Head[];
  defaultHeadId?: string;
  timeOptions?: DatasetTimeOption[];
  defaultTimeId?: string;

  /** cell size in degrees for each level (index = level) */
  cellDegrees: number[];
  /** level that is always loaded first, as a fallback while finer levels stream in */
  baseLevel: number;
  levelForZoom(zoom: number): number;
  describeLevel(level: number): { title: string; subtitle: string };

  /** Fetch samples for `cells` (all of the same level); call onBatch as data arrives. */
  fetchCells(
    level: number,
    cells: Cell[],
    signal: AbortSignal,
    onBatch: (batch: FetchBatch) => void,
    options?: { timeOffsetHours?: number },
  ): Promise<void>;

  /** optional: feeds the embedding panel; omit and the panel is hidden */
  embedding?: () => {
    points: [number, number, number, string][];
    variance: number[];
  };
}
