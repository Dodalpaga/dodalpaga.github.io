# Globe data explorer

This folder contains the client-side globe explorer used by `app/projects/globe/page.tsx`.
The globe is intentionally dataset-driven: the canvas knows how to display a geographic grid, while each dataset owns its API, value channels, classes, resolution policy, and optional embedding source.

## Structure

- `GlobeExplorer.tsx`: page-level composition and UI state (dataset, variable, time).
- `GlobeCanvas.tsx`: small canvas wrapper.
- `useOrthographicGlobe.ts`: orthographic projection, interaction, progressive loading, and cell rendering.
- `DatasetPanel.tsx`: dataset title, description, attribution, and dataset selector.
- `LayersPanel.tsx`: variable selector (`PM2.5`, `PM10`) and class bands.
- `TimeControl.tsx`: optional time selector supplied by a dataset.
- `ScaleBar.tsx`: colour legend generated from the selected head's classes.
- `ScaleBadge.tsx`: active grid level and approximate cell size.
- `StatsBar.tsx`: painted cell count, active level, and draw time.
- `openMeteo/types.ts`: contracts for datasets, heads, samples, batches, and time options.
- `openMeteo/grid.ts`: regular latitude/longitude grid and visible-cell selection.
- `openMeteo/projection.ts`: shared projection helpers.
- `openMeteo/openMeteoAirQuality.tsx`: Open-Meteo PM2.5/PM10 implementation.
- `openMeteo/index.ts`: dataset registry and public exports.

## Data flow

1. `openMeteo/index.ts` registers one or more `GlobeDataset` objects in `DATASETS`.
2. `GlobeExplorer` selects a dataset, head, and optional time offset.
3. `useOrthographicGlobe` computes visible cells for the current zoom and loads the base level plus the active level.
4. `fetchCells` emits batches as they arrive. The canvas redraws after every batch.
5. The selected head classifies each sample and supplies the cell colour.
6. The legend and class list are derived from the same `Head.classes` array, so they cannot drift from the renderer.

## Open-Meteo air quality dataset

The current source is the Open-Meteo Air Quality API backed by CAMS forecasts:

- Endpoint: `https://air-quality-api.open-meteo.com/v1/air-quality`
- Variables: `pm2_5`, `pm10`
- Request mode: hourly values for a two-day lookback and one-day forecast.
- Time choices: now, 6 hours ago, 12 hours ago, yesterday, and two days ago.
- Cache: browser `localStorage`, one hour per cell and time offset.
- Attribution: Open-Meteo and Copernicus Atmosphere Monitoring Service.

The API is modelled atmospheric data, not a network of ground sensors. Public API rate limits can return HTTP 429 responses; requests retry briefly, and cached cells remain usable when available.

## Grid resolution

The air-quality dataset uses these levels:

| Level | Cell size | Zoom range    |
| ----- | --------: | ------------- |
| 0     |       20° | fallback/base |
| 1     |       10° | below 1.6     |
| 2     |        5° | 1.6 to 3.5    |
| 3     |      2.5° | 3.5 to 6      |
| 4     |        1° | 6 to 12       |
| 5     |      0.5° | 12 and above  |

The cell grid is an interpolation/sampling grid over the API. It does not create new atmospheric detail beyond the underlying model resolution. Finer levels improve visual grain but increase requests and rate-limit pressure. The renderer limits the number of visible cells per load to keep interaction responsive.

## Adding a dataset

Create a module implementing `GlobeDataset`, then register it in `openMeteo/index.ts`:

```ts
export const DATASETS: GlobeDataset[] = [openMeteoAirQuality, myDataset];
```

A dataset must provide:

- `heads`: variables or classifiers, each with `classes` and `classOf(sample)`.
- `cellDegrees`, `baseLevel`, `levelForZoom`, and `describeLevel`.
- `fetchCells`, which emits `FetchBatch` values as data arrives.
- Optional `timeOptions` when the source supports historical or forecast values.
- Optional `embedding()` when the source has points for `EmbeddingPanel`.

The canvas does not need to change for a normal gridded dataset. Embedding-specific UI should remain optional and should only be enabled when the dataset exposes an embedding source.

## Practical limitations

- The browser calls Open-Meteo directly; a public API rate limit can temporarily prevent new cells from loading.
- The current cache is local to the browser and expires after one hour.
- Changing time, zooming, or panning requests the visible cells for the new view.
- The globe uses a regular lat/lon grid. It is not a tiled raster or a vector-tile pipeline.
- The current renderer uses Natural Earth 110m land and country boundaries from GitHub.
