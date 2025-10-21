import * as React from 'react';
import {
  Container,
  Stack,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Paper,
  Box,
} from '@mui/material';

export default function ImageSegmentation() {
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [processedImage, setProcessedImage] = React.useState<string | null>(
    null
  );
  const [detections, setDetections] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [modelName, setModelName] = React.useState<string>('');
  const [availableModels, setAvailableModels] = React.useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = React.useState<boolean>(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const colors = [
    '#e8a6a6',
    '#b3d9b3',
    '#d4af37',
    '#87ceeb',
    '#dda0dd',
    '#98fb98',
  ];

  React.useEffect(() => {
    fetchAvailableModels();
  }, []);

  const fetchAvailableModels = async () => {
    try {
      setModelsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/detection/models`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      setAvailableModels(data.models || []);
      if (data.models && data.models.length > 0) {
        setModelName(data.models[0].value);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setErrorMessage('Failed to load available models');
    } finally {
      setModelsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setProcessedImage(null);
        setDetections([]);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = () => {
    if (!uploadedImage) {
      setErrorMessage('No image uploaded.');
      return;
    }

    if (!modelName) {
      setErrorMessage('No model selected.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setProcessedImage(null);
    setDetections([]);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/detection/detect_image?model_name=${modelName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        setDetections(data.detections || []);
      })
      .catch((error) => {
        console.error('Error:', error);
        setErrorMessage(error.message);
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
        justifyContent: 'flex-start',
        maxHeight: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          Image Segmentation
        </Typography>
        <Typography variant="body2" color="var(--foreground)">
          Upload an image to detect and segment objects
        </Typography>
      </Box>

      {/* Controls */}
      <Stack
        spacing={2}
        direction="row"
        sx={{
          marginBottom: 4,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <FormControl
          variant="outlined"
          sx={{
            minWidth: 280,
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
          disabled={modelsLoading}
        >
          <InputLabel
            sx={{ color: 'var(--foreground)' }}
            id="model-select-label"
          >
            {modelsLoading ? 'Loading models...' : 'Model from HuggingFace'}
          </InputLabel>
          <Select
            labelId="model-select-label"
            value={modelName}
            onChange={(event) => setModelName(event.target.value)}
            label={
              modelsLoading ? 'Loading models...' : 'Model from HuggingFace'
            }
            sx={{
              minWidth: 280,
              color: 'var(--foreground)',
              '& .MuiSelect-icon': {
                color: 'var(--foreground)',
              },
            }}
          >
            {availableModels.map((model) => (
              <MenuItem key={model.value} value={model.value}>
                {model.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" component="label" sx={{ minWidth: 120 }}>
          Upload
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </Button>

        <Button
          variant="contained"
          onClick={handleProcessImage}
          disabled={loading || !uploadedImage || !modelName || modelsLoading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Process'}
        </Button>
      </Stack>

      {/* Main Content */}
      <Stack
        spacing={0}
        direction="row"
        sx={{ width: '100%', height: 'calc(100vh - 300px)', gap: 2 }}
      >
        {/* Left Panel - Uploaded Image (2/5) */}
        <Box sx={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
          <Paper
            sx={{
              padding: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--foreground)',
              borderOpacity: 0.1,
            }}
          >
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Uploaded Image"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Typography color="var(--foreground)">
                No image uploaded
              </Typography>
            )}
          </Paper>
        </Box>

        {/* Center Panel - Results (2/5) */}
        <Box sx={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
          {/* Segmented Image */}
          <Paper
            sx={{
              padding: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--foreground)',
              borderOpacity: 0.1,
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : processedImage ? (
              <img
                src={processedImage}
                alt="Processed Image"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : errorMessage ? (
              <Typography color="error" sx={{ textAlign: 'center' }}>
                {errorMessage}
              </Typography>
            ) : (
              <Typography color="var(--foreground)">
                Results will appear here
              </Typography>
            )}
          </Paper>
        </Box>

        {/* Right Panel - Detections List (1/5) */}
        {detections.length > 0 && (
          <Box
            sx={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflowY: 'auto',
              paddingRight: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'var(--background)',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'var(--foreground)',
                borderRadius: '4px',
                opacity: 0.3,
              },
            }}
          >
            {detections.map((detection, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingY: 1.5,
                  paddingX: 1,
                  borderBottom: '1px solid var(--foreground)',
                  borderOpacity: 0.1,
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box
                  sx={{
                    height: '4px',
                    width: '100%',
                    backgroundColor: colors[idx % colors.length],
                    marginBottom: 1,
                    borderRadius: '2px',
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    fontSize: '0.9rem',
                    marginBottom: 0.5,
                  }}
                >
                  {detection.label}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: 'var(--foreground)',
                    opacity: 0.7,
                  }}
                >
                  {(detection.score * 100).toFixed(1)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Stack>
    </Container>
  );
}
