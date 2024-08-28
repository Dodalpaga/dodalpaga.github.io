import * as React from 'react';
import ExampleMap from '../../components/mapbox';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Image from 'next/image';

// Define the MapRef type
type MapRef = {
  getCenter: () => { lng: number; lat: number };
  setCenter: (lng: number, lat: number) => void;
  exportImage: () => string;
};

export default function Content() {
  const mapRef = React.useRef<MapRef>(null);
  const [mapImage, setMapImage] = React.useState<string | null>(null);

  const handleExportImage = () => {
    if (mapRef.current) {
      setTimeout(() => {
        const imageData = mapRef.current.exportImage();
        console.log(imageData); // Log the image data URL to verify it's being generated

        // Send a POST request to the FastAPI endpoint with the base64 image
        fetch('http://localhost:8000/api/image_segmentation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ base64_image: imageData }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Response from FastAPI:', data);
            // Set the returned base64 image as the map image
            setMapImage(data.base64_image);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }, 1000); // Adjust the delay if needed
    }
  };

  return (
    <Container
      maxWidth={false} // Pass boolean false, not a string
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
        <ExampleMap ref={mapRef} lng={139.753} lat={35.6844} zoom={14} />

        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'calc(100vh - 250px)',
          }}
        >
          {mapImage && (
            <Image
              src={mapImage}
              alt="Map Preview"
              width={0}
              height={0}
              sizes="100%"
              style={{ width: '100%', height: 'auto' }} // optional
            />
          )}
        </div>
      </Stack>
      <Button variant="outlined" onClick={handleExportImage}>
        Export Map Image
      </Button>
    </Container>
  );
}
