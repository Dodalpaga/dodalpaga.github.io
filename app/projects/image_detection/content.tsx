import * as React from 'react';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress for loading symbol
import Image from 'next/image';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material'; // Import Select and related components

export default function Content() {
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null); // State for uploaded image
  const [processedImage, setProcessedImage] = React.useState<string | null>(
    null
  ); // State for processed image
  const [loading, setLoading] = React.useState<boolean>(false); // State for loading
  const [modelName, setModelName] = React.useState<string>('yolov8l.pt'); // State for selected model

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file); // Convert the image to base64
    }
  };

  const handleProcessImage = () => {
    if (!uploadedImage) {
      console.warn('No image uploaded.');
      return;
    }

    setLoading(true); // Set loading to true when starting the request

    // Send a POST request to the FastAPI endpoint with the base64 image
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_IMG_DETECTION}` +
        `?model_name=${modelName}`, // Use selected model name
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ base64_image: uploadedImage }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // Set the returned base64 image as the processed image
        setProcessedImage(data.base64_image);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false); // Set loading to false after the request is complete
      });
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
        {/* Left side: uploaded image */}
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
          {uploadedImage ? (
            <Image
              src={uploadedImage}
              alt="Uploaded Image"
              width={0}
              height={0}
              sizes="100%"
              style={{
                height: 'auto',
                width: 'auto',
                maxHeight: '100%',
                maxWidth: '100%',
              }} // optional styling
            />
          ) : (
            <div>No image uploaded</div>
          )}
        </div>

        {/* Right side: processed image or loading */}
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
            <CircularProgress /> // Show loading symbol while waiting for the image processing
          ) : processedImage ? (
            <Image
              src={processedImage}
              alt="Processed Image"
              width={0}
              height={0}
              sizes="100%"
              style={{
                height: 'auto',
                width: 'auto',
                maxHeight: '100%',
                maxWidth: '100%',
              }} //
            />
          ) : (
            <div>No processed image</div>
          )}
        </div>
      </Stack>

      {/* Model selection dropdown */}
      <FormControl variant="outlined" sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel id="model-select-label">Model</InputLabel>
        <Select
          labelId="model-select-label"
          value={modelName}
          onChange={(event) => setModelName(event.target.value)}
          label="Model"
        >
          <MenuItem value="yolov8n.pt">YOLOv8n</MenuItem>
          <MenuItem value="yolov8s.pt">YOLOv8s</MenuItem>
          <MenuItem value="yolov8m.pt">YOLOv8m</MenuItem>
          <MenuItem value="yolov8l.pt">YOLOv8l</MenuItem>
          <MenuItem value="yolov8x.pt">YOLOv8x</MenuItem>
        </Select>
      </FormControl>

      {/* Upload image button */}
      <Button variant="contained" component="label">
        Upload Image
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageUpload}
        />
      </Button>

      {/* Process image button */}
      <Button
        variant="contained"
        onClick={handleProcessImage}
        disabled={!uploadedImage}
      >
        Process Image
      </Button>
    </Container>
  );
}
