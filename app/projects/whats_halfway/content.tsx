import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Pen, Trash2, MapPin, Target } from 'lucide-react';
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
  DroppableProvided,
  DroppableStateSnapshot,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';

const OSRM_BASE = 'https://router.project-osrm.org';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

const initialViewState = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
};

type Point = { lat: number; lng: number; label: string; place?: string };

export default function MapWithRouting() {
  const mapRef = useRef<MapRef>(null);
  const [addressInput, setAddressInput] = useState('');
  const [addressOptions, setAddressOptions] = useState<
    { label: string; lat: number; lon: number }[]
  >([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [mode, setMode] = useState<'halfway' | 'route'>('halfway');
  const [centralPoint, setCentralPoint] = useState<Point | null>(null);
  const [routesToCentral, setRoutesToCentral] = useState<
    { geojson: any; duration: number; distance: number }[]
  >([]);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);
  const [legDurationsDistance, setLegDurationsDistance] = useState<
    { duration: number; distance: number }[]
  >([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const generateRandomEmail = () => {
    const randomString = Math.random().toString(36).substring(2, 10);
    return `${randomString}@example.com`;
  };

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const url = `${NOMINATIM_BASE}?format=json&lat=${lat}&lon=${lng}&zoom=10`;
      const resp = await fetch(url, {
        headers: {
          'User-Agent': `MapWithRouting/1.0 (${generateRandomEmail()})`,
        },
      });
      const json = await resp.json();
      return json.display_name || 'Unknown place';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Unknown place';
    }
  }, []);

  const onMapClick = useCallback(
    async (event: any) => {
      const lng = event.lngLat.lng;
      const lat = event.lngLat.lat;
      const userLabel = window.prompt('Label (optional):') || undefined;
      const place = await reverseGeocode(lat, lng);
      setPoints((pts) => {
        const newIndex = pts.length + 1;
        const defaultLabel = `#${newIndex}`;
        return [...pts, { lat, lng, label: userLabel || defaultLabel, place }];
      });
    },
    [reverseGeocode]
  );

  const computeRoute = useCallback(async () => {
    if (points.length < 2) return;

    const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
    const url =
      `${OSRM_BASE}/route/v1/driving/${coords}` +
      `?overview=full&geometries=geojson`;

    try {
      const resp = await fetch(url);
      const json = await resp.json();

      if (json.code !== 'Ok' || !json.routes?.length) {
        console.error('OSRM error', json);
        return;
      }

      const geometry = json.routes[0].geometry;
      setRouteGeoJSON({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry, properties: {} }],
      });

      const legs = json.routes[0].legs.map((leg: any) => ({
        duration: leg.duration,
        distance: leg.distance,
      }));

      setTotalDuration(json.routes[0].duration);
      setTotalDistance(json.routes[0].distance);
      setLegDurationsDistance(legs);
    } catch (err) {
      console.error('Route computation failed:', err);
    }
  }, [points]);

  const deletePoint = (index: number) => {
    setPoints((pts) =>
      pts
        .filter((_, i) => i !== index)
        .map((p, i) => ({
          ...p,
          label: p.label.startsWith('#') ? `#${i + 1}` : p.label,
        }))
    );
  };

  const renamePoint = (index: number) => {
    const newLabel = window.prompt('New label:');
    if (newLabel !== null) {
      setPoints((pts) =>
        pts.map((p, i) =>
          i === index ? { ...p, label: newLabel || `#${i + 1}` } : p
        )
      );
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    setPoints((pts) => {
      const updated = Array.from(pts);
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated.map((p, i) => ({
        ...p,
        label: p.label.startsWith('#') ? `#${i + 1}` : p.label,
      }));
    });
  };

  const routeLayerStyle: LayerProps = {
    id: 'route-line',
    type: 'line',
    paint: {
      'line-color': '#007cbf',
      'line-width': 4,
    },
  };

  useEffect(() => {
    if (points.length >= 2) {
      setLoadingRoutes(true);
      if (mode === 'route') {
        computeRoute().finally(() => setLoadingRoutes(false));
        setCentralPoint(null);
        setRoutesToCentral([]);
      } else {
        const computeCentralAndRoutes = async () => {
          try {
            const central = await findCentralPoint(points);
            const place = await reverseGeocode(central.lat, central.lng);
            setCentralPoint({ ...central, label: 'Central Point', place });
            const routes = await computeRoutesToCentral(points, central);
            setRoutesToCentral(routes);
            setRouteGeoJSON(null);
            setTotalDuration(null);
            setTotalDistance(null);
            setLegDurationsDistance([]);
          } catch (error) {
            console.error('Error computing central point and routes:', error);
          } finally {
            setLoadingRoutes(false);
          }
        };
        computeCentralAndRoutes();
      }
    } else {
      setCentralPoint(null);
      setRoutesToCentral([]);
      setRouteGeoJSON(null);
      setTotalDuration(null);
      setTotalDistance(null);
      setLegDurationsDistance([]);
      setLoadingRoutes(false);
    }
  }, [points, mode, computeRoute, reverseGeocode]);

  useEffect(() => {
    if (mapRef.current && points.length > 0) {
      const allPoints = [
        ...points,
        ...(centralPoint && mode === 'halfway' ? [centralPoint] : []),
      ];
      const lats = allPoints.map((p) => p.lat);
      const lngs = allPoints.map((p) => p.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const bounds: [[number, number], [number, number]] = [
        [minLng, minLat],
        [maxLng, maxLat],
      ];

      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [points, centralPoint, mode]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (addressInput.length < 3) {
        setAddressOptions([]);
        return;
      }

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&addressdetails=1&limit=5`;
        const resp = await fetch(url, {
          headers: {
            'User-Agent': `MapWithRouting/1.0 (${generateRandomEmail()})`,
          },
        });
        const json = await resp.json();

        const options = json.map((f: any) => ({
          label: f.display_name,
          lat: parseFloat(f.lat),
          lon: parseFloat(f.lon),
        }));
        setAddressOptions(options);
      } catch (error) {
        console.error('Autocomplete error:', error);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 300); // debounce
    return () => clearTimeout(timeout);
  }, [addressInput]);

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        margin: 0,
      }}
    >
      <Grid className="iss-grid" container spacing={4} sx={{ height: '100%' }}>
        <Grid
          item
          className="points"
          xs={12}
          md={2}
          sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'route'}
                  onChange={(e) =>
                    setMode(e.target.checked ? 'route' : 'halfway')
                  }
                />
              }
              label={mode === 'route' ? 'Route Mode' : 'Halfway Mode'}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <Autocomplete
              freeSolo
              options={addressOptions}
              getOptionLabel={(option) => (option as { label: string }).label}
              onInputChange={(event, value) => setAddressInput(value)}
              onChange={(event, value) => {
                if (value && typeof value !== 'string') {
                  const newIndex = points.length + 1;
                  setPoints((pts) => [
                    ...pts,
                    {
                      lat: value.lat,
                      lng: value.lon,
                      label: `#${newIndex}`,
                      place: value.label,
                    },
                  ]);
                  setAddressInput('');
                  setAddressOptions([]);
                }
              }}
              inputValue={addressInput}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search city"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            />
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="points-list" type="POINT">
              {(provided) => (
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '8px',
                  }}
                >
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ listStyle: 'none', padding: 0 }}
                  >
                    {points.map((p, i) => (
                      <Draggable key={i} draggableId={`point-${i}`} index={i}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: '0.5rem',
                              padding: '0.5rem',
                              background: 'var(--bg-color-4)',
                              borderRadius: '4px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                              <strong>{p.label}</strong>
                              <br />
                              <small>{p.place || 'Fetching place...'}</small>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                              }}
                            >
                              <button
                                onClick={() => renamePoint(i)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                                aria-label="Rename"
                                title="Rename"
                              >
                                <Pen size={16} />
                              </button>
                              <button
                                onClick={() => deletePoint(i)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                                aria-label="Delete"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Grid>

        <Grid
          item
          className="map"
          xs={12}
          md={8}
          sx={{ minHeight: { xs: '400px', md: '100%' } }}
        >
          <Map
            ref={mapRef}
            initialViewState={initialViewState}
            mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`}
            style={{ width: '100%', height: '100%' }}
            onClick={onMapClick}
          >
            {points.map((p, i) => (
              <Marker key={`point-${i}`} longitude={p.lng} latitude={p.lat}>
                <div style={{ position: 'relative', textAlign: 'center' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '-50%',
                      whiteSpace: 'nowrap',
                      background: 'var(--background)',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxShadow: '0 0 3px rgba(0,0,0,0.2)',
                    }}
                  >
                    {p.label}
                  </div>
                  <MapPin size={20} color="#007cbf" />
                </div>
              </Marker>
            ))}
            {mode === 'halfway' && centralPoint && (
              <Marker
                key="central"
                longitude={centralPoint.lng}
                latitude={centralPoint.lat}
              >
                <div style={{ position: 'relative', textAlign: 'center' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '-50%',
                      whiteSpace: 'nowrap',
                      background: 'var(--background)',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxShadow: '0 0 3px rgba(0,0,0,0.2)',
                    }}
                  >
                    Central Point
                  </div>
                  <Target size={20} color="#d81b60" />
                </div>
              </Marker>
            )}
            {!loadingRoutes && (
              <>
                {mode === 'halfway' &&
                  centralPoint &&
                  routesToCentral.length === points.length && (
                    <Source
                      id="all-routes"
                      type="geojson"
                      data={{
                        type: 'FeatureCollection',
                        features: routesToCentral
                          .filter((route) => route.geojson)
                          .map((route) => route.geojson.features[0]),
                      }}
                    >
                      <Layer {...routeLayerStyle} />
                    </Source>
                  )}
                {mode === 'route' && routeGeoJSON && (
                  <Source id="route-source" type="geojson" data={routeGeoJSON}>
                    <Layer {...routeLayerStyle} />
                  </Source>
                )}
              </>
            )}
          </Map>
        </Grid>

        <Grid
          item
          className="results"
          xs={12}
          md={2}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%', // Ensure Grid takes full height of its parent
          }}
        >
          {loadingRoutes ? (
            <p>Loading routes...</p>
          ) : points.length < 2 ? (
            <p>Add at least two points to compute routes.</p>
          ) : mode === 'halfway' &&
            centralPoint &&
            routesToCentral.length === points.length ? (
            <div
              style={{
                flex: '1 1 auto', // Take remaining height
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <p>
                <strong>Central Location:</strong> <br />
                {centralPoint.place || 'Fetching place...'}
              </p>
              <br />
              <div
                style={{
                  flex: '1 1 auto', // Take remaining height
                  overflowY: 'auto', // Scroll on overflow
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {points.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      background: 'var(--bg-color-2)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <strong style={{ marginBottom: '0.25rem' }}>
                      From {p.label} to Central Point
                    </strong>
                    <span>
                      🕒 {formatDuration(routesToCentral[i].duration / 60)}
                      <br />
                      📏 {(routesToCentral[i].distance / 1000).toFixed(2)} km
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : mode === 'route' &&
            totalDuration !== null &&
            totalDistance !== null ? (
            <div
              style={{
                flex: '1 1 auto', // Take remaining height
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'var(--bg-color-2)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                }}
              >
                <h4 style={{ marginBottom: '0.5rem' }}>Overall</h4>
                <p style={{ margin: 0 }}>
                  🕒 Duration: {formatDuration(totalDuration / 60)}
                  <br />
                  📏 Distance: {(totalDistance / 1000).toFixed(2)} km
                </p>
              </div>
              {legDurationsDistance.length > 0 && (
                <div
                  style={{
                    flex: '1 1 auto', // Take remaining height
                    overflowY: 'auto', // Scroll on overflow
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {legDurationsDistance.map((leg, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        background: 'var(--bg-color-2)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <strong style={{ marginBottom: '0.25rem' }}>
                        {points[i].label} → {points[i + 1]?.label}
                      </strong>
                      <span>
                        🕒 {(leg.duration / 60).toFixed(1)} min
                        <br />
                        📏 {(leg.distance / 1000).toFixed(2)} km
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p>Computing routes...</p>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

async function getTravelTimes(
  points: Point[],
  candidates: { lat: number; lng: number }[]
): Promise<number[][]> {
  const pointCoords = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const candidateCoords = candidates.map((c) => `${c.lng},${c.lat}`).join(';');
  const coords = `${pointCoords};${candidateCoords}`;
  const sourceIndices = points.map((_, i) => i).join(';');
  const destIndices = candidates.map((_, i) => points.length + i).join(';');
  const url = `${OSRM_BASE}/table/v1/driving/${coords}?sources=${sourceIndices}&destinations=${destIndices}`;
  const resp = await fetch(url);
  const json = await resp.json();
  if (json.code !== 'Ok') {
    throw new Error('OSRM table error');
  }
  return json.durations;
}

async function findCentralPoint(
  points: Point[]
): Promise<{ lat: number; lng: number }> {
  const centroid = {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  };

  const radius = 0.1;
  const step = radius / 2;
  const candidates = [
    centroid,
    { lat: centroid.lat + step, lng: centroid.lng },
    { lat: centroid.lat - step, lng: centroid.lng },
    { lat: centroid.lat, lng: centroid.lng + step },
    { lat: centroid.lat, lng: centroid.lng - step },
  ];

  const durations = await getTravelTimes(points, candidates);

  let bestCandidate = centroid;
  let minMaxDuration = Infinity;
  durations.forEach((row, i) => {
    const maxDur = Math.max(...row);
    if (maxDur < minMaxDuration) {
      minMaxDuration = maxDur;
      bestCandidate = candidates[i];
    }
  });

  return bestCandidate;
}

async function computeRoutesToCentral(
  points: Point[],
  central: { lat: number; lng: number }
): Promise<{ geojson: any; duration: number; distance: number }[]> {
  const routes = await Promise.all(
    points.map(async (p) => {
      const coords = `${p.lng},${p.lat};${central.lng},${central.lat}`;
      const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson`;
      const resp = await fetch(url);
      const json = await resp.json();
      if (json.code !== 'Ok') {
        throw new Error('OSRM route error');
      }
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
    })
  );
  return routes;
}

function formatDuration(minutes: number): string {
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = Math.round(minutes % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (mins > 0 || (days === 0 && hours === 0))
    parts.push(`${mins} ${mins === 1 ? 'min' : 'mins'}`);

  return parts.join(', ') || '0 mins';
}
