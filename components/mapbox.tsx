import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './mapbox.css';

type MapProps = {
  lng: number;
  lat: number;
  zoom: number;
};

type MapRef = {
  getCenter: () => { lng: number; lat: number };
  setCenter: (lng: number, lat: number) => void;
  exportImage: () => string; // New method to export the map as an image
};

const ExampleMap = forwardRef<MapRef, MapProps>(({ lng, lat, zoom }, ref) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  useEffect(() => {
    if (map.current) return; // Stops map from initializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: `https://api.maptiler.com/maps/satellite/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
      preserveDrawingBuffer: true,
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, [API_KEY, lng, lat, zoom]);

  useImperativeHandle(ref, () => ({
    getCenter: () => {
      if (map.current) {
        const center = map.current.getCenter();
        return { lng: center.lng, lat: center.lat };
      }
      return { lng, lat };
    },
    setCenter: (newLng: number, newLat: number) => {
      if (map.current) {
        map.current.setCenter([newLng, newLat]);
      }
    },
    exportImage: () => {
      if (map.current) {
        const canvas = map.current.getCanvas();
        return canvas.toDataURL('image/png');
      }
      return '';
    },
  }));

  return (
    <div className="map-container">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
});

ExampleMap.displayName = 'ExampleMap';

export default ExampleMap;
