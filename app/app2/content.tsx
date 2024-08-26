import * as React from 'react';
import ExampleMap from '../../components/mapbox';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Image from 'next/image';
import Box from '@mui/material/Box';

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
      console.log('center', center);
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
        direction="row"
        className="container flex flex-col items-center justify-between p-4"
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <ExampleMap ref={map1Ref} lng={139.753} lat={35.6844} zoom={14} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <Image
            src="/assets/mountain.png"
            width={0}
            height={0}
            sizes="100%"
            style={{ width: '100%', height: 'auto' }} // optional
            alt="Picture of the author"
          />
        </Box>
      </Stack>
      <Button variant="outlined" onClick={handleSyncMaps}>
        Sync Maps
      </Button>
    </Container>
  );
}
