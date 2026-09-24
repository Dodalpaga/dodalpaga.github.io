import type { GlobeDataset } from './types';
import { modisNdvi } from './modisNdvi';

/** Register new datasets here; the UI adapts (switcher appears with 2+). */
export const DATASETS: GlobeDataset[] = [modisNdvi];
export type { GlobeDataset, Head, ClassDef, Sample, FetchBatch } from './types';
