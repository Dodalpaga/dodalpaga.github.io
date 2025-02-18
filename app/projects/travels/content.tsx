import * as React from 'react';
import { useRef, useCallback, useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import { Map, MapRef, Source, Layer, LayerProps } from '@vis.gl/react-maplibre';
import { Marker, Popup } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import ControlPanel from './control-panel';
import Carousel from '@/components/carousel';

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
  const mapRef = useRef<MapRef | null>(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [visitedCountries, setVisitedCountries] = useState<any[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch('/data/countries.geojson');
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

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await fetch('/data/memories.json');
        const data = await response.json();
        setMemories(data);
      } catch (error) {
        console.error('Error fetching memories:', error);
      }
    };

    fetchMemories();
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
        '#00FF00',
        '#ff8000',
      ],
      'fill-opacity': 0.5,
    },
  };

  // Function to handle mouse move over the map
  const onHover = (event: any) => {
    const { features, point } = event;

    if (features && features.length > 0) {
      const countryName = features[0].properties.ADMIN;
      const countryInfo = visitedCountries.find(
        (c) => c.country === countryName
      );

      if (countryInfo) {
        setHoveredCountry(countryInfo.description);
        setTooltipPosition({ x: point.x, y: point.y });
      } else {
        // If the country is not in the visited list, clear the tooltip
        setHoveredCountry(null);
        setTooltipPosition(null);
      }
    } else {
      // If hovering over the sea, clear the tooltip
      setHoveredCountry(null);
      setTooltipPosition(null);
    }
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
        interactiveLayerIds={['countries-layer']}
        onMouseMove={onHover}
      >
        {geojsonData && (
          <Source id="countries-data" type="geojson" data={geojsonData}>
            <Layer {...layerStyle} />
          </Source>
        )}
        <React.Fragment>
          {memories.map((memory) => (
            <Marker
              key={memory.city}
              longitude={memory.longitude}
              latitude={memory.latitude}
            >
              <div
                style={{ cursor: 'pointer' }}
                onClick={(event) => {
                  event.stopPropagation();
                  console.log('Marker clicked:', memory);
                  setSelectedMemory(memory);
                }}
              >
                📍
              </div>
            </Marker>
          ))}
        </React.Fragment>

        {selectedMemory && (
          <Popup
            longitude={selectedMemory.longitude}
            latitude={selectedMemory.latitude}
            onClose={() => setSelectedMemory(null)}
            className="popup-carousel"
          >
            <div className="popup-title">{selectedMemory.city}</div>
            <Carousel images={selectedMemory.images} />
          </Popup>
        )}
      </Map>

      {hoveredCountry && tooltipPosition && (
        <div
          className="hover-description"
          style={{
            position: 'absolute',
            left: `${tooltipPosition.x + 30}px`, // Align to the right of the cursor
            top: `${tooltipPosition.y + 20}px`, // Position slightly below the mouse
          }}
        >
          {hoveredCountry}
        </div>
      )}

      <ControlPanel onSelectCountry={onSelectCountry} />
    </Container>
  );
}
