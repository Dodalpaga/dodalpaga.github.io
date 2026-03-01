// app/projects/image_detection/content.tsx
'use client';

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
  Box,
  TextField,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Info, Upload, Cpu } from 'lucide-react';
import {
  projectInputSx,
  projectSelectSx,
  projectPaperSx,
} from '@/constants/ui';

interface Model {
  value: string;
  label: string;
}
interface Detection {
  label: string;
  score: number;
}

const ACCENT_COLORS = [
  '#6B8EFF',
  '#FF6B8E',
  '#6BFFB8',
  '#FFD56B',
  '#C46BFF',
  '#6BFFF0',
];

export default function ImageSegmentation() {
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [processedImage, setProcessedImage] = React.useState<string | null>(
    null,
  );
  const [detections, setDetections] = React.useState<Detection[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [modelName, setModelName] = React.useState('');
  const [hfToken, setHfToken] = React.useState('');
  const [availableModels, setAvailableModels] = React.useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetch_ = async () => {
      try {
        setModelsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/detection/models`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAvailableModels(data.models || []);
        if (data.models?.length) setModelName(data.models[0].value);
      } catch {
        setErrorMessage('Failed to load models');
      } finally {
        setModelsLoading(false);
      }
    };
    fetch_();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setProcessedImage(null);
      setDetections([]);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!uploadedImage || !modelName || !hfToken.trim()) {
      setErrorMessage(
        'Please upload an image, select a model, and enter your HF token.',
      );
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setProcessedImage(null);
    setDetections([]);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/detection/detect_image?model_name=${encodeURIComponent(modelName)}&hf_token=${encodeURIComponent(hfToken)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64_image: uploadedImage }),
        },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Unknown error');
      }
      const data = await res.json();
      setProcessedImage(data.base64_image);
      setDetections(data.detections || []);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const tokenTooltip = (
    <Box sx={{ p: 1 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, mb: 1, fontFamily: "'Syne', sans-serif" }}
      >
        🔒 Token Privacy
      </Typography>
      <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
        • Never stored in a database or persistent variable
      </Typography>
      <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
        • Used only for this single API request
      </Typography>
      <Typography
        variant="caption"
        display="block"
        sx={{ fontStyle: 'italic', mt: 1 }}
      >
        Your data safety is my priority
      </Typography>
      <Typography
        variant="caption"
        display="block"
        sx={{ mt: 1.5, pt: 1, borderTop: '1px solid rgba(255,255,255,0.15)' }}
      >
        No token?{' '}
        <a
          href="https://huggingface.co/settings/tokens"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)', textDecoration: 'underline' }}
        >
          Create one here ↗
        </a>
      </Typography>
    </Box>
  );

  const EmptyState = ({
    icon,
    text,
  }: {
    icon: React.ReactNode;
    text: string;
  }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        color: 'var(--foreground-muted)',
        opacity: 0.5,
      }}
    >
      {icon}
      <Typography
        sx={{ fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' }}
      >
        {text}
      </Typography>
    </Box>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid var(--card-border)' }}>
        <span className="section-label">AI · Computer Vision</span>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          Image Detection
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Upload an image · Select a YOLO model · Detect objects in real time
        </Typography>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          mb: 2,
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <FormControl
          size="small"
          sx={{ minWidth: 240 }}
          disabled={modelsLoading}
        >
          <InputLabel
            sx={{
              color: 'var(--foreground-muted)',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.8rem',
            }}
          >
            {modelsLoading ? 'Loading models…' : 'HuggingFace Model'}
          </InputLabel>
          <Select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            label="HuggingFace Model"
            sx={projectSelectSx}
          >
            {availableModels.map((m) => (
              <MenuItem
                key={m.value}
                value={m.value}
                sx={{ fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' }}
              >
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TextField
            size="small"
            value={hfToken}
            onChange={(e) => {
              setHfToken(e.target.value);
              setErrorMessage(null);
            }}
            placeholder="HuggingFace API token"
            type="password"
            disabled={loading || modelsLoading}
            sx={{ minWidth: 240, ...projectInputSx }}
          />
          <Tooltip title={tokenTooltip} arrow placement="bottom">
            <IconButton
              size="small"
              sx={{
                color: 'var(--foreground-muted)',
                '&:hover': { color: 'var(--accent)' },
              }}
            >
              <Info size={16} />
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          component="label"
          variant="outlined"
          startIcon={<Upload size={16} />}
          sx={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.78rem',
            textTransform: 'none',
            borderRadius: '10px',
            borderColor: 'var(--card-border)',
            color: 'var(--foreground-muted)',
            '&:hover': {
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              backgroundColor: 'var(--accent-muted)',
            },
          }}
        >
          Upload Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </Button>

        <Button
          variant="contained"
          onClick={handleProcess}
          disabled={
            loading ||
            !uploadedImage ||
            !modelName ||
            !hfToken.trim() ||
            modelsLoading
          }
          startIcon={
            loading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <Cpu size={16} />
            )
          }
          sx={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.78rem',
            textTransform: 'none',
            borderRadius: '10px',
            backgroundColor: 'var(--accent)',
            '&:hover': {
              backgroundColor: 'var(--accent-hover)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              backgroundColor: 'var(--background-2)',
              color: 'var(--foreground-muted)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? 'Processing…' : 'Detect Objects'}
        </Button>
      </Box>

      {/* Error */}
      {errorMessage && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1.5,
            borderRadius: '10px',
            backgroundColor: 'rgba(255,100,100,0.1)',
            border: '1px solid rgba(255,100,100,0.3)',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.8rem',
              color: '#ff6464',
            }}
          >
            {errorMessage}
          </Typography>
        </Box>
      )}

      {/* Main panels */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flex: 1,
          minHeight: 0,
          flexWrap: 'wrap',
        }}
      >
        {/* Upload panel */}
        <Box
          sx={{
            flex: 2,
            minWidth: 220,
            ...projectPaperSx,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {uploadedImage ? (
            <img
              src={uploadedImage}
              alt="Uploaded"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <EmptyState icon={<Upload size={32} />} text="No image uploaded" />
          )}
          {uploadedImage && (
            <Box sx={{ position: 'absolute', top: 10, left: 12, ...badgeSx }}>
              Source
            </Box>
          )}
        </Box>

        {/* Result panel */}
        <Box
          sx={{
            flex: 2,
            minWidth: 220,
            ...projectPaperSx,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                color: 'var(--foreground-muted)',
              }}
            >
              <CircularProgress size={36} sx={{ color: 'var(--accent)' }} />
              <Typography
                sx={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem' }}
              >
                Detecting objects…
              </Typography>
            </Box>
          ) : processedImage ? (
            <>
              <img
                src={processedImage}
                alt="Processed"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
              <Box sx={{ position: 'absolute', top: 10, left: 12, ...badgeSx }}>
                Result
              </Box>
            </>
          ) : (
            <EmptyState
              icon={<Cpu size={32} />}
              text="Results will appear here"
            />
          )}
        </Box>

        {/* Detections list */}
        {detections.length > 0 && (
          <Box
            sx={{
              flex: 1,
              minWidth: 140,
              maxWidth: 200,
              ...projectPaperSx,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: '1px solid var(--card-border)',
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.72rem',
                  color: 'var(--foreground-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {detections.length} detection
                {detections.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            {detections.map((d, i) => (
              <Box
                key={i}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid var(--card-border)',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box
                  sx={{
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length],
                    mb: 1,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {d.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.75rem',
                    color: 'var(--foreground-muted)',
                  }}
                >
                  {(d.score * 100).toFixed(1)}%
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

const badgeSx = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '0.65rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--foreground-muted)',
  backgroundColor: 'var(--background-transparent)',
  backdropFilter: 'blur(8px)',
  padding: '2px 8px',
  borderRadius: '100px',
  border: '1px solid var(--card-border)',
};
