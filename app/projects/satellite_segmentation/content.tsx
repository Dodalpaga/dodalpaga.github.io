import * as React from 'react';
import ExampleMap from '../../../components/mapbox';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress for loading symbol
import Image from 'next/image';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material'; // Import Select and related components
import './styles.css'; // Ensure the correct CSS file is imported

// Define the MapRef type
type MapRef = {
  getCenter: () => { lng: number; lat: number };
  setCenter: (lng: number, lat: number) => void;
  exportImage: () => string;
};

export default function Content() {
  const mapRef = React.useRef<MapRef | null>(null); // MapRef can be null
  const [mapImage, setMapImage] = React.useState<string>(
    '/assets/segmentation_toulouse.png'
  );
  const [loading, setLoading] = React.useState<boolean>(false); // State for loading
  const [modelName, setModelName] = React.useState<string>('FastSAM-s.pt'); // State for selected model

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

      // Send a POST request to the FastAPI endpoint with the base64 image
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL_IMG_SEGMENTATION}` +
          `?model_name=${modelName}`, // Use selected model name
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          mode: 'cors',
          body: JSON.stringify({ base64_image: imageData }),
        }
      )
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
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Stack
        spacing={2}
        id="buttons-stack" // Use the ID for CSS targeting
        direction="row"
      >
        {/* Model selection dropdown */}
        <FormControl
          variant="outlined"
          sx={{
            minWidth: 120,
            height: '100%',
            '& .MuiOutlinedInput-root': {
              color: 'var(--foreground)',
              '& fieldset': {
                borderColor: 'var(--foreground)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--foreground)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--foreground)',
              },
            },
          }}
        >
          <InputLabel
            id="model-select-label"
            sx={{
              color: 'var(--foreground)',
            }}
          >
            Model
          </InputLabel>
          <Select
            labelId="model-select-label"
            value={modelName}
            onChange={(event) => setModelName(event.target.value)}
            label="Model"
            sx={{
              minWidth: 120,
              height: '100%',
              color: 'var(--foreground)',
              '& .MuiSelect-icon': {
                color: 'var(--foreground)',
              },
            }}
          >
            <MenuItem value="FastSAM-s.pt">FastSAM-s</MenuItem>
            <MenuItem value="FastSAM-x.pt">FastSAM-x</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleExportImage}>
          Export Map Image
        </Button>
      </Stack>
      <Stack
        spacing={4}
        id="images-stack" // Use the ID for CSS targeting
        direction="row"
      >
        <div className="image-container">
          <ExampleMap ref={mapRef} lng={1.42} lat={43.6} zoom={13} />
        </div>

        <div className="image-container">
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
    </Container>
  );
}
