import * as React from 'react';
import ExampleMap from '../../../components/mapbox';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress for loading symbol
import Image from 'next/image';

// Define the MapRef type
type MapRef = {
  getCenter: () => { lng: number; lat: number };
  setCenter: (lng: number, lat: number) => void;
  exportImage: () => string;
};

export default function Content() {
  const mapRef = React.useRef<MapRef | null>(null); // MapRef can be null
  const [mapImage, setMapImage] = React.useState<string>(
    'https://www.un-autre-regard-sur-la-terre.org/document/blogUARST/Histoire/30%20ans%20du%20satellite%20SPOT%201/Toulouse%20vu%20par%20SPOT/Spot%205%20-%20Toulouse%20-%20Apr%e8s%20AZF%20-%2017-06-2002%20-%20Vignette.jpg'
  );
  const [loading, setLoading] = React.useState<boolean>(false); // State for loading

  const handleExportImage = () => {
    if (!mapRef.current) {
      console.warn('mapRef is null, cannot export image.');
      return;
    }

    setLoading(true); // Set loading to true when starting the request
    setTimeout(() => {
      // Use optional chaining to safely call exportImage if mapRef.current exists
      const imageData = mapRef.current?.exportImage();
      if (!imageData) {
        console.error('Failed to export image from mapRef.');
        setLoading(false);
        return;
      }

      console.log(imageData); // Log the image data URL to verify it's being generated

      // Send a POST request to the FastAPI endpoint with the base64 image
      fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
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
        })
        .finally(() => {
          setLoading(false); // Set loading to false after the request is complete
        });
    }, 1000); // Adjust the delay if needed
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
        <ExampleMap ref={mapRef} lng={1.444209} lat={43.604652} zoom={11.8} />

        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'calc(100vh - 250px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <CircularProgress /> // Show loading symbol while waiting for the image
          ) : (
            mapImage && (
              <Image
                src={mapImage}
                alt="Map Preview"
                width={0}
                height={0}
                sizes="100%"
                style={{ width: 'auto', height: '100%' }} // optional
              />
            )
          )}
        </div>
      </Stack>
      <Button variant="contained" onClick={handleExportImage}>
        Export Map Image
      </Button>
    </Container>
  );
}
