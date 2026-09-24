import type { GlobeDataset } from './types';
import { openMeteoAirQuality } from './openMeteoAirQuality';

/** Register new datasets here; the UI adapts (switcher appears with 2+). */
export const DATASETS: GlobeDataset[] = [openMeteoAirQuality];
export type {
  GlobeDataset,
  Head,
  ClassDef,
  Sample,
  FetchBatch,
  DatasetTimeOption,
} from './types';
