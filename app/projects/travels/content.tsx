// app/projects/travels/content.tsx
import * as React from 'react';
import { useRef, useCallback, useState, useEffect } from 'react';
import { Map, MapRef, Source, Layer, LayerProps } from '@vis.gl/react-maplibre';
import { Marker, Popup } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import ControlPanel from './control-panel';
import Carousel from '@/components/carousel';
import { useThemeContext } from '@/context/ThemeContext';
import './styles.css';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

const INITIAL_VIEW_STATE = {
  latitude: 20,
  longitude: 10,
  zoom: 1.8,
  bearing: 0,
  pitch: 0,
};

interface CountrySelectEvent {
  longitude: number;
  latitude: number;
  zoom: number;
}

// ⚠️ MapLibre paint properties only accept literal color values — CSS variables won't work here
const VISITED_FILL = '#22c55e'; // green
const UNVISITED_FILL = '#f97316'; // orange
const VISITED_BORDER = '#16a34a';
const UNVISITED_BORDER = '#ea580c';

export default function Content() {
  const mapRef = useRef<MapRef | null>(null);
  const { theme } = useThemeContext();

  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [visitedCountries, setVisitedCountries] = useState<any[]>([]);
  const [visitedNames, setVisitedNames] = useState<string[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const onSelectCountry = useCallback(
    ({ longitude, latitude, zoom }: CountrySelectEvent) => {
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom,
        duration: 2000,
        essential: true,
      });
      setIsPanelOpen(false);
    },
    [],
  );

  useEffect(() => {
    fetch('/data/countries.geojson')
      .then((r) => r.json())
      .then(setGeojsonData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/data/countries.json')
      .then((r) => r.json())
      .then((data) => {
        setVisitedCountries(data);
        // Pre-derive the name list — used in MapLibre's ['literal', [...]] expression
        setVisitedNames(data.map((c: any) => c.country));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/data/memories.json')
      .then((r) => r.json())
      .then(setMemories)
      .catch(console.error);
  }, []);

  // Rebuild layer specs only when visited list changes (visitedNames is derived together)
  const fillLayerStyle: LayerProps = {
    id: 'countries-fill',
    type: 'fill',
    paint: {
      'fill-color': [
        'case',
        ['in', ['get', 'ADMIN'], ['literal', visitedNames]],
        VISITED_FILL,
        UNVISITED_FILL,
      ],
      'fill-opacity': 0.45,
    },
  };

  const borderLayerStyle: LayerProps = {
    id: 'countries-border',
    type: 'line',
    paint: {
      'line-color': [
        'case',
        ['in', ['get', 'ADMIN'], ['literal', visitedNames]],
        VISITED_BORDER,
        UNVISITED_BORDER,
      ],
      'line-width': 0.8,
      'line-opacity': 0.6,
    },
  };

  const mapStyle =
    theme === 'dark'
      ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`
      : `https://api.maptiler.com/maps/dataviz/style.json?key=${MAPTILER_KEY}`;

  return (
    <div className="travels-root">
      {/* Header */}
      <div className="travels-header">
        <div className="travels-header__left">
          <span className="travels-header__label">TRAVEL MAP</span>
          <span className="travels-header__sep">/</span>
          <span className="travels-header__count">
            {visitedCountries.length > 0
              ? `${visitedCountries.length} countries visited`
              : 'Loading…'}
          </span>
        </div>

        <div className="travels-header__right">
          {/* Legend */}
          <span className="travels-legend">
            <span className="travels-legend__dot travels-legend__dot--visited" />
            Visited
          </span>
          <span className="travels-legend">
            <span className="travels-legend__dot travels-legend__dot--unvisited" />
            Not yet
          </span>

          {/* Mobile panel toggle */}
          <button
            className="travels-panel-toggle"
            onClick={() => setIsPanelOpen((v) => !v)}
            aria-label="Toggle country list"
          >
            <span>{isPanelOpen ? '✕' : '☰'}</span>
            <span>{isPanelOpen ? 'Close' : 'Countries'}</span>
          </button>
        </div>
      </div>

      <div className="travels-body">
        {/* Map */}
        <div className="travels-map">
          <Map
            ref={mapRef}
            initialViewState={INITIAL_VIEW_STATE}
            mapStyle={mapStyle}
            interactiveLayerIds={['countries-fill']}
            onLoad={() => setMapReady(true)}
          >
            {geojsonData && (
              <Source id="countries-data" type="geojson" data={geojsonData}>
                <Layer {...fillLayerStyle} />
                <Layer {...borderLayerStyle} />
              </Source>
            )}

            {memories.map((memory) => (
              <Marker
                key={memory.city}
                longitude={memory.longitude}
                latitude={memory.latitude}
              >
                <button
                  className="travels-pin"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMemory(memory);
                  }}
                  aria-label={`Open memories from ${memory.city}`}
                >
                  <span className="travels-pin__dot" />
                  <span className="travels-pin__ring" />
                </button>
              </Marker>
            ))}

            {selectedMemory && (
              <Popup
                longitude={selectedMemory.longitude}
                latitude={selectedMemory.latitude}
                onClose={() => setSelectedMemory(null)}
                className="travels-popup"
                maxWidth="340px"
                offset={20}
              >
                <div className="travels-popup__title">
                  {selectedMemory.city}
                </div>
                <Carousel images={selectedMemory.images} />
              </Popup>
            )}
          </Map>

          {mapReady && (
            <div className="travels-map-overlay">
              <span className="travels-map-overlay__dot" />
              <span>Interactive · Click pins to view memories</span>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div
          className={`travels-panel${isPanelOpen ? ' travels-panel--open' : ''}`}
        >
          <ControlPanel onSelectCountry={onSelectCountry} />
        </div>

        {isPanelOpen && (
          <div
            className="travels-backdrop"
            onClick={() => setIsPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
