// app/projects/whats_halfway/content.tsx
'use client';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Pen,
  Trash2,
  MapPin,
  Target,
  Route,
  GitMerge,
  Navigation,
} from 'lucide-react';
import {
  Map,
  MapRef,
  Marker,
  Source,
  Layer,
  LayerProps,
} from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { projectInputSx } from '@/constants/ui';

// ── Constants ───────────────────────────────────────────────────────────────
const OSRM_BASE = 'https://router.project-osrm.org';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse';
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
const INITIAL_VIEW = { longitude: 2.35, latitude: 48.85, zoom: 3 };

// Point colors for map markers
const POINT_COLORS = [
  '#6B8EFF',
  '#FF6B8E',
  '#6BFFB8',
  '#FFD56B',
  '#C46BFF',
  '#6BFFF0',
  '#FF9A6B',
];

type Point = { lat: number; lng: number; label: string; place?: string };
type Mode = 'halfway' | 'route';

// ── Helpers ──────────────────────────────────────────────────────────────────
const randomEmail = () =>
  `${Math.random().toString(36).substring(2, 10)}@example.com`;

function formatDuration(minutes: number): string {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.round(minutes % 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins || (!days && !hours)) parts.push(`${mins}min`);
  return parts.join(' ') || '0min';
}

async function getTravelTimes(
  points: Point[],
  candidates: { lat: number; lng: number }[],
): Promise<number[][]> {
  const all = [
    ...points.map((p) => `${p.lng},${p.lat}`),
    ...candidates.map((c) => `${c.lng},${c.lat}`),
  ].join(';');
  const src = points.map((_, i) => i).join(';');
  const dst = candidates.map((_, i) => points.length + i).join(';');
  const res = await fetch(
    `${OSRM_BASE}/table/v1/driving/${all}?sources=${src}&destinations=${dst}`,
  );
  const json = await res.json();
  if (json.code !== 'Ok') throw new Error('OSRM table error');
  return json.durations;
}

async function findCentralPoint(
  points: Point[],
): Promise<{ lat: number; lng: number }> {
  const centroid = {
    lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
    lng: points.reduce((s, p) => s + p.lng, 0) / points.length,
  };
  const r = 0.1,
    step = r / 2;
  const candidates = [
    centroid,
    { lat: centroid.lat + step, lng: centroid.lng },
    { lat: centroid.lat - step, lng: centroid.lng },
    { lat: centroid.lat, lng: centroid.lng + step },
    { lat: centroid.lat, lng: centroid.lng - step },
  ];
  const durations = await getTravelTimes(points, candidates);
  let best = centroid,
    minMax = Infinity;
  durations.forEach((row, i) => {
    const max = Math.max(...row);
    if (max < minMax) {
      minMax = max;
      best = candidates[i];
    }
  });
  return best;
}

async function computeRoutesToCentral(
  points: Point[],
  central: { lat: number; lng: number },
) {
  return Promise.all(
    points.map(async (p) => {
      const res = await fetch(
        `${OSRM_BASE}/route/v1/driving/${p.lng},${p.lat};${central.lng},${central.lat}?overview=full&geometries=geojson`,
      );
      const json = await res.json();
      if (json.code !== 'Ok') throw new Error('OSRM route error');
      const route = json.routes[0];
      return {
        geojson: {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: route.geometry, properties: {} },
          ],
        },
        duration: route.duration,
        distance: route.distance,
      };
    }),
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  duration,
  distance,
}: {
  label: string;
  duration: number;
  distance: number;
}) {
  return (
    <Box
      sx={{
        p: '10px 14px',
        borderRadius: '10px',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <Typography
        sx={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.72rem',
          color: 'var(--foreground-muted)',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'var(--foreground)',
        }}
      >
        🕒 {formatDuration(duration / 60)}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.78rem',
          color: 'var(--foreground-muted)',
        }}
      >
        📏 {(distance / 1000).toFixed(1)} km
      </Typography>
    </Box>
  );
}

// ── Point List Item ───────────────────────────────────────────────────────────
function PointItem({
  p,
  i,
  onRename,
  onDelete,
  color,
}: {
  p: Point;
  i: number;
  color: string;
  onRename: (i: number) => void;
  onDelete: (i: number) => void;
}) {
  return (
    <Box
      sx={{
        p: '8px 10px',
        borderRadius: '10px',
        mb: 0.75,
        backgroundColor: 'var(--card)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
      }}
    >
      {/* Color dot + label */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flex: 1,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--foreground)',
            }}
          >
            {p.label}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.7rem',
              color: 'var(--foreground-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {p.place || '…'}
          </Typography>
        </Box>
      </Box>
      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
        <Tooltip title="Rename">
          <IconButton
            size="small"
            onClick={() => onRename(i)}
            sx={{
              color: 'var(--foreground-muted)',
              borderRadius: '6px',
              width: 24,
              height: 24,
              '&:hover': {
                color: 'var(--accent)',
                backgroundColor: 'var(--accent-muted)',
              },
            }}
          >
            <Pen size={12} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => onDelete(i)}
            sx={{
              color: 'var(--foreground-muted)',
              borderRadius: '6px',
              width: 24,
              height: 24,
              '&:hover': {
                color: 'var(--text-color-2)',
                backgroundColor: 'var(--bg-color-2)',
              },
            }}
          >
            <Trash2 size={12} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MapWithRouting() {
  const mapRef = useRef<MapRef>(null);
  const [addressInput, setAddressInput] = useState('');
  const [addressOptions, setAddressOptions] = useState<
    { label: string; lat: number; lon: number }[]
  >([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [mode, setMode] = useState<Mode>('halfway');
  const [centralPoint, setCentralPoint] = useState<Point | null>(null);
  const [routesToCentral, setRoutesToCentral] = useState<
    { geojson: any; duration: number; distance: number }[]
  >([]);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);
  const [legDurations, setLegDurations] = useState<
    { duration: number; distance: number }[]
  >([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        {
          headers: { 'User-Agent': `MapWithRouting/1.0 (${randomEmail()})` },
        },
      );
      return (await res.json()).display_name || 'Unknown place';
    } catch {
      return 'Unknown place';
    }
  }, []);

  const onMapClick = useCallback(
    async (event: any) => {
      const { lng, lat } = event.lngLat;
      const userLabel = window.prompt('Label (optional):') || undefined;
      const place = await reverseGeocode(lat, lng);
      setPoints((pts) => {
        const n = pts.length + 1;
        return [...pts, { lat, lng, label: userLabel || `#${n}`, place }];
      });
    },
    [reverseGeocode],
  );

  const computeRoute = useCallback(async () => {
    if (points.length < 2) return;
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
    const res = await fetch(
      `${OSRM_BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson`,
    );
    const json = await res.json();
    if (json.code !== 'Ok' || !json.routes?.length) return;
    setRouteGeoJSON({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: json.routes[0].geometry, properties: {} },
      ],
    });
    setTotalDuration(json.routes[0].duration);
    setTotalDistance(json.routes[0].distance);
    setLegDurations(
      json.routes[0].legs.map((l: any) => ({
        duration: l.duration,
        distance: l.distance,
      })),
    );
  }, [points]);

  const deletePoint = (i: number) =>
    setPoints((pts) =>
      pts
        .filter((_, j) => j !== i)
        .map((p, j) => ({
          ...p,
          label: p.label.startsWith('#') ? `#${j + 1}` : p.label,
        })),
    );

  const renamePoint = (i: number) => {
    const label = window.prompt('New label:');
    if (label !== null)
      setPoints((pts) =>
        pts.map((p, j) =>
          j === i ? { ...p, label: label || `#${j + 1}` } : p,
        ),
      );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    setPoints((pts) => {
      const next = [...pts];
      const [moved] = next.splice(result.source.index, 1);
      next.splice(result.destination!.index, 0, moved);
      return next.map((p, i) => ({
        ...p,
        label: p.label.startsWith('#') ? `#${i + 1}` : p.label,
      }));
    });
  };

  // Recompute routes when points or mode changes
  useEffect(() => {
    if (points.length < 2) {
      setCentralPoint(null);
      setRoutesToCentral([]);
      setRouteGeoJSON(null);
      setTotalDuration(null);
      setTotalDistance(null);
      setLegDurations([]);
      setLoadingRoutes(false);
      return;
    }
    setLoadingRoutes(true);
    if (mode === 'route') {
      computeRoute().finally(() => setLoadingRoutes(false));
      setCentralPoint(null);
      setRoutesToCentral([]);
    } else {
      (async () => {
        try {
          const central = await findCentralPoint(points);
          const place = await reverseGeocode(central.lat, central.lng);
          setCentralPoint({ ...central, label: 'Central Point', place });
          const routes = await computeRoutesToCentral(points, central);
          setRoutesToCentral(routes);
          setRouteGeoJSON(null);
          setTotalDuration(null);
          setTotalDistance(null);
          setLegDurations([]);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingRoutes(false);
        }
      })();
    }
  }, [points, mode, computeRoute, reverseGeocode]);

  // Fit map to all points
  useEffect(() => {
    if (!mapRef.current || !points.length) return;
    const all = [
      ...points,
      ...(centralPoint && mode === 'halfway' ? [centralPoint] : []),
    ];
    const lats = all.map((p) => p.lat),
      lngs = all.map((p) => p.lng);
    mapRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 64 },
    );
  }, [points, centralPoint, mode]);

  // Autocomplete debounce
  useEffect(() => {
    const t = setTimeout(async () => {
      if (addressInput.length < 3) {
        setAddressOptions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&limit=5`,
          {
            headers: { 'User-Agent': `MapWithRouting/1.0 (${randomEmail()})` },
          },
        );
        setAddressOptions(
          (await res.json()).map((f: any) => ({
            label: f.display_name,
            lat: +f.lat,
            lon: +f.lon,
          })),
        );
      } catch {
        setAddressOptions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [addressInput]);

  const routeLayer: LayerProps = {
    id: 'route-line',
    type: 'line',
    paint: {
      'line-color': 'var(--accent)',
      'line-width': 3,
      'line-opacity': 0.85,
    },
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 1.5,
          pb: 1.5,
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <span className="section-label">Maps · Tool</span>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            What&apos;s Halfway?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--foreground-muted)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.8rem',
            }}
          >
            Click the map to add points · Drag to reorder
          </Typography>
        </Box>

        {/* Mode toggle */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            p: 0.5,
            borderRadius: '12px',
            backgroundColor: 'var(--background-2)',
            border: '1px solid var(--card-border)',
          }}
        >
          {(
            [
              ['halfway', 'Halfway', GitMerge],
              ['route', 'Route', Route],
            ] as const
          ).map(([m, label, Icon]) => (
            <Box
              key={m}
              onClick={() => setMode(m as Mode)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.75rem',
                fontWeight: 500,
                backgroundColor: mode === m ? 'var(--card)' : 'transparent',
                color: mode === m ? 'var(--accent)' : 'var(--foreground-muted)',
                border: `1px solid ${mode === m ? 'var(--accent)' : 'transparent'}`,
                boxShadow: mode === m ? 'var(--card-shadow)' : 'none',
                transition: 'all 0.15s ease',
                userSelect: 'none',
              }}
            >
              <Icon size={14} />
              {label}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Layout */}
      <Box sx={{ flex: 1, display: 'flex', gap: 1.5, minHeight: 0 }}>
        {/* Left: Points list */}
        <Box
          sx={{
            width: 220,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflow: 'hidden',
          }}
        >
          {/* Search */}
          <Autocomplete
            freeSolo
            size="small"
            options={addressOptions}
            getOptionLabel={(opt) =>
              typeof opt === 'string' ? opt : opt.label
            }
            onInputChange={(_, v) => setAddressInput(v)}
            onChange={(_, v) => {
              if (v && typeof v !== 'string') {
                const n = points.length + 1;
                setPoints((pts) => [
                  ...pts,
                  { lat: v.lat, lng: v.lon, label: `#${n}`, place: v.label },
                ]);
                setAddressInput('');
                setAddressOptions([]);
              }
            }}
            inputValue={addressInput}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search city…"
                sx={{
                  ...projectInputSx,
                  '& input': {
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.82rem',
                  },
                }}
              />
            )}
            renderOption={(props, opt) => (
              <Box
                component="li"
                {...props}
                sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.8rem',
                  py: '4px !important',
                }}
              >
                {typeof opt === 'string' ? opt : opt.label}
              </Box>
            )}
          />

          {/* Points */}
          <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {points.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 1,
                  color: 'var(--foreground-muted)',
                  opacity: 0.5,
                  textAlign: 'center',
                  py: 4,
                }}
              >
                <Navigation size={28} strokeWidth={1} />
                <Typography
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.72rem',
                  }}
                >
                  Click the map or search to add points
                </Typography>
              </Box>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="points" type="POINT">
                  {(provided) => (
                    <Box ref={provided.innerRef} {...provided.droppableProps}>
                      {points.map((p, i) => (
                        <Draggable key={i} draggableId={`pt-${i}`} index={i}>
                          {(dp) => (
                            <div
                              ref={dp.innerRef}
                              {...dp.draggableProps}
                              {...dp.dragHandleProps}
                            >
                              <PointItem
                                p={p}
                                i={i}
                                color={POINT_COLORS[i % POINT_COLORS.length]}
                                onRename={renamePoint}
                                onDelete={deletePoint}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Box>
        </Box>

        {/* Center: Map */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid var(--card-border)',
            position: 'relative',
          }}
        >
          <Map
            ref={mapRef}
            initialViewState={INITIAL_VIEW}
            mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`}
            style={{ width: '100%', height: '100%' }}
            onClick={onMapClick}
          >
            {points.map((p, i) => (
              <Marker key={`pt-${i}`} longitude={p.lng} latitude={p.lat}>
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      mb: 0.5,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.68rem',
                      px: 0.75,
                      py: 0.2,
                      borderRadius: '6px',
                      backgroundColor: 'var(--background-transparent)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid var(--card-border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {p.label}
                  </Box>
                  <MapPin
                    size={22}
                    color={POINT_COLORS[i % POINT_COLORS.length]}
                    fill={POINT_COLORS[i % POINT_COLORS.length]}
                    fillOpacity={0.3}
                  />
                </Box>
              </Marker>
            ))}

            {mode === 'halfway' && centralPoint && (
              <Marker longitude={centralPoint.lng} latitude={centralPoint.lat}>
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      mb: 0.5,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.68rem',
                      px: 0.75,
                      py: 0.2,
                      borderRadius: '6px',
                      backgroundColor: '#d81b6015',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #d81b60',
                      color: '#d81b60',
                    }}
                  >
                    Halfway ✦
                  </Box>
                  <Target size={22} color="#d81b60" />
                </Box>
              </Marker>
            )}

            {!loadingRoutes && (
              <>
                {mode === 'halfway' &&
                  centralPoint &&
                  routesToCentral.length === points.length && (
                    <Source
                      id="routes"
                      type="geojson"
                      data={{
                        type: 'FeatureCollection',
                        features: routesToCentral
                          .filter((r) => r.geojson)
                          .map((r) => r.geojson.features[0]),
                      }}
                    >
                      <Layer {...routeLayer} />
                    </Source>
                  )}
                {mode === 'route' && routeGeoJSON && (
                  <Source id="route" type="geojson" data={routeGeoJSON}>
                    <Layer {...routeLayer} />
                  </Source>
                )}
              </>
            )}
          </Map>

          {/* Loading overlay */}
          {loadingRoutes && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--background-transparent)',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <CircularProgress size={32} sx={{ color: 'var(--accent)' }} />
                <Typography
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.78rem',
                    color: 'var(--foreground-muted)',
                  }}
                >
                  Computing routes…
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right: Results */}
        <Box
          sx={{
            width: 200,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          {points.length < 2 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 1,
                color: 'var(--foreground-muted)',
                opacity: 0.5,
                textAlign: 'center',
                py: 4,
              }}
            >
              <Typography
                sx={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem' }}
              >
                Add 2+ points to see results
              </Typography>
            </Box>
          ) : mode === 'halfway' &&
            centralPoint &&
            routesToCentral.length === points.length ? (
            <>
              <Box
                sx={{
                  p: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-muted)',
                  border: '1px solid var(--accent)',
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.65rem',
                    color: 'var(--accent)',
                    letterSpacing: '0.08em',
                    mb: 0.5,
                  }}
                >
                  HALFWAY POINT
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.75rem',
                    color: 'var(--foreground)',
                    lineHeight: 1.4,
                  }}
                >
                  {centralPoint.place?.split(',').slice(0, 2).join(',') ||
                    'Unknown'}
                </Typography>
              </Box>
              {points.map((p, i) => (
                <StatCard
                  key={i}
                  label={`From ${p.label}`}
                  duration={routesToCentral[i].duration}
                  distance={routesToCentral[i].distance}
                />
              ))}
            </>
          ) : mode === 'route' &&
            totalDuration !== null &&
            totalDistance !== null ? (
            <>
              <StatCard
                label="Total journey"
                duration={totalDuration}
                distance={totalDistance}
              />
              <Box
                sx={{
                  height: '1px',
                  backgroundColor: 'var(--divider)',
                  my: 0.5,
                }}
              />
              {legDurations.map((leg, i) => (
                <StatCard
                  key={i}
                  label={`${points[i]?.label} → ${points[i + 1]?.label}`}
                  duration={leg.duration}
                  distance={leg.distance}
                />
              ))}
            </>
          ) : null}
        </Box>
      </Box>
    </Container>
  );
}
