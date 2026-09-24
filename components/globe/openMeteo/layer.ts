import type { Cell } from './grid';

/** What the canvas paints: coarse levels first, finer levels on top. */
export type RenderLayer = {
  colors: string[]; // by class index
  levels: { level: number; items: { cell: Cell; cls: number }[] }[];
};
