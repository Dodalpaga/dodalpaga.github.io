import * as React from 'react';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress for loading symbol
import Image from 'next/image';
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
} from '@mui/material';
import './styles.css'; // Import regular CSS

export default function Content() {
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null); // State for uploaded image
  const [processedImage, setProcessedImage] = React.useState<string | null>(
    null
  ); // State for processed image
  const [loading, setLoading] = React.useState<boolean>(false); // State for loading
  const [modelName, setModelName] = React.useState<string>(
    'facebook/mask2former-swin-large-coco-panoptic'
  ); // State for selected model

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

  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    'No processed image'
  ); // State for error message

  const handleProcessImage = () => {
    if (!uploadedImage) {
      console.warn('No image uploaded.');
      return;
    }

    setLoading(true);
    setErrorMessage(null); // Clear previous errors
    setProcessedImage(null); // Clear previous processed image

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_IMG_DETECTION}?model_name=${modelName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        mode: 'cors',
        body: JSON.stringify({ base64_image: uploadedImage }),
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Unknown error occurred');
        }
        return response.json();
      })
      .then((data) => {
        setProcessedImage(data.base64_image);
      })
      .catch((error) => {
        console.error('Error:', error);
        setErrorMessage(error.message); // Set error message for UI
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Container
      maxWidth={false}
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
            sx={{
              color: 'var(--foreground)',
            }}
            id="model-select-label"
          >
            Model from HuggingFace
          </InputLabel>
          <Select
            labelId="model-select-label"
            value={modelName}
            onChange={(event) => setModelName(event.target.value)}
            label="Model from HuggingFace"
            sx={{
              minWidth: 120,
              height: '100%',
              color: 'var(--foreground)',
              '& .MuiSelect-icon': {
                color: 'var(--foreground)',
              },
            }}
          >
            <MenuItem value="openmmlab/upernet-convnext-small">
              UperNet (ADE20k)
            </MenuItem>
            <MenuItem value="facebook/mask2former-swin-large-coco-panoptic">
              Mask2Former (COCO panoptic segmentation)
            </MenuItem>
          </Select>
        </FormControl>

        {/* Upload image button */}
        <Button
          variant="contained"
          component="label"
          style={{
            minWidth: 120,
            height: '100%',
          }}
        >
          Upload
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
          disabled={loading || !uploadedImage} // Disable the button when loading is true or no image is uploaded
          sx={{
            minWidth: 120,
            height: '100%',
          }}
        >
          Process
        </Button>
      </Stack>

      <Stack
        spacing={4}
        id="images-stack" // Use the ID for CSS targeting
        direction="row"
      >
        {/* Left side: uploaded image */}
        <div className="image-container">
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
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                textAlign: 'center',
              }}
            >
              No image uploaded
            </div>
          )}
        </div>

        {/* Right side: processed image or loading */}
        <div className="image-container">
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
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                textAlign: 'center',
              }}
            >
              {errorMessage && (
                <div
                  style={{
                    color: 'red',
                    marginTop: '10px',
                    textAlign: 'center',
                  }}
                >
                  {errorMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </Stack>
    </Container>
  );
}
