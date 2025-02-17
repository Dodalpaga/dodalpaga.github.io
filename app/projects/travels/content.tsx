import * as React from 'react';
import { useRef, useCallback, useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import { Map, MapRef, Source, Layer, LayerProps } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import ControlPanel from './control-panel';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
const initialViewState = {
  latitude: 46.88430942721118,
  longitude: 2.5873182849049954,
  zoom: 5,
  bearing: 0,
  pitch: 0,
};

interface CountrySelectEvent {
  longitude: number;
  latitude: number;
  zoom: number;
}

export default function Content() {
  const mapRef = useRef<MapRef | null>(null); // Set initial value to `null` instead of `undefined`
  const [geojsonData, setGeojsonData] = useState(null);
  const [visitedCountries, setVisitedCountries] = useState<any[]>([]);

  const onSelectCountry = useCallback(
    ({ longitude, latitude, zoom }: CountrySelectEvent) => {
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        duration: 2000,
      });
    },
    []
  );

  // Fetch GeoJSON data from the local file
  useEffect(() => {
    // Assuming the geojson file is in the public folder or hosted on a URL
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch('/data/countries.geojson'); // Update the path
        const data = await response.json();
        setGeojsonData(data);
      } catch (error) {
        console.error('Error fetching geojson countries:', error);
      }
    };

    fetchGeoJSON();
  }, []);

  useEffect(() => {
    const fetchVisitedCountries = async () => {
      try {
        const response = await fetch('/data/countries.json');
        const data = await response.json();
        setVisitedCountries(data);
      } catch (error) {
        console.error('Error fetching visited countries:', error);
      }
    };

    fetchVisitedCountries();
  }, []);

  const layerStyle: LayerProps = {
    id: 'countries-layer',
    type: 'fill',
    paint: {
      'fill-color': [
        'case',
        [
          'in',
          ['get', 'ADMIN'],
          ['literal', visitedCountries.map((country) => country.country)],
        ],
        '#00FF00', // Green for visited
        '#ff8000', // Blue for unvisited
      ],
      'fill-opacity': 0.5,
    },
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${MAPTILER_KEY}`}
        onMove={(evt) => {
          const { latitude, longitude, zoom } = evt.viewState;
          console.log(
            `Latitude: ${latitude}, Longitude: ${longitude}, Zoom: ${zoom}`
          );
        }}
      >
        {/* Add Source and Layer only when GeoJSON data is available */}
        {geojsonData && (
          <Source id="countries-data" type="geojson" data={geojsonData}>
            <Layer {...layerStyle} />
          </Source>
        )}
      </Map>
      <ControlPanel onSelectCountry={onSelectCountry} />
    </Container>
  );
}
