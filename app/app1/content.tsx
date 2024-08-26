import * as React from 'react';
import ExampleMap from '../../components/mapbox';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

// Define the MapRef type
type MapRef = {
  getCenter: () => { lng: number; lat: number };
  setCenter: (lng: number, lat: number) => void;
};

export default function Content() {
  const map1Ref = React.useRef<MapRef>(null);
  const map2Ref = React.useRef<MapRef>(null);

  const handleSyncMaps = () => {
    if (map1Ref.current && map2Ref.current) {
      const center = map1Ref.current.getCenter();
      map2Ref.current.setCenter(center.lng, center.lat);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        className="container flex flex-col items-center justify-between p-4"
      >
        <ExampleMap ref={map1Ref} lng={139.753} lat={35.6844} zoom={14} />
        <ExampleMap ref={map2Ref} lng={139.753} lat={35.6844} zoom={14} />
      </Stack>
      <Button variant="outlined" onClick={handleSyncMaps}>
        Sync Maps
      </Button>
    </Container>
  );
}
