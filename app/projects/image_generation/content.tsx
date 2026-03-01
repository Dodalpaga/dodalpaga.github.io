// app/projects/image_generation/content.tsx
'use client';

import * as React from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import { Info, Sparkles, Image as ImageIcon } from 'lucide-react';
import {
  Container,
  Grid,
  CircularProgress,
  Chip,
  Typography,
  Box,
  TextField,
  Tooltip,
  IconButton,
  Button,
  Alert,
} from '@mui/material';
import { projectInputSx } from '@/constants/ui';

const EXAMPLE_PROMPTS = [
  'Astronaut riding a horse on Mars',
  'Cyberpunk city at sunset with neon lights',
  'Magical forest with glowing mushrooms',
  'Futuristic robot playing piano',
  'Ancient temple floating in clouds',
];

export default function Content() {
  const [prompt, setPrompt] = React.useState('');
  const [hfToken, setHfToken] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !hfToken.trim()) {
      setError('Enter a prompt and HuggingFace token.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/image_gen/generate?hf_token=${encodeURIComponent(hfToken)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
          }),
        },
      );
      if (!res.ok) throw new Error('Failed to generate image');
      const blob = await res.blob();
      setImageUrl(URL.createObjectURL(blob));
      if (!history.includes(prompt))
        setHistory((h) => [prompt, ...h.slice(0, 4)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `generated-${Date.now()}.png`;
    a.click();
  };

  const tokenTooltip = (
    <Box sx={{ p: 1 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, mb: 1, fontFamily: "'Syne', sans-serif" }}
      >
        🔒 Token Privacy
      </Typography>
      {[
        'Never stored in a database',
        'Used only for this request',
        'Not stored on the server',
      ].map((t, i) => (
        <Typography key={i} variant="caption" display="block" sx={{ mb: 0.5 }}>
          • {t}
        </Typography>
      ))}
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

  return (
    <Container
      maxWidth="xl"
      sx={{ height: '100%', py: 3, px: { xs: 2, sm: 3 } }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <span className="section-label">AI · Generative</span>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.03em',
            mb: 0.5,
          }}
        >
          Image Generator
        </Typography>
        <Typography
          sx={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Transform ideas into visuals with Stable Diffusion XL
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ height: 'calc(100% - 100px)' }}>
        {/* Left: Input panel */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '14px',
              p: 3,
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{
                  borderRadius: '10px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </Alert>
            )}

            <Box>
              <Typography
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.72rem',
                  color: 'var(--accent)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  mb: 1,
                }}
              >
                01 · Describe your image
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="A photorealistic portrait of..."
                disabled={loading}
                autoComplete="off"
                sx={{
                  ...projectInputSx,
                  '& textarea': {
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.72rem',
                  color: 'var(--accent)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  mb: 1,
                }}
              >
                02 · HuggingFace API token
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <TextField
                  fullWidth
                  value={hfToken}
                  onChange={(e) => {
                    setHfToken(e.target.value);
                    setError(null);
                  }}
                  placeholder="hf_..."
                  type="password"
                  disabled={loading}
                  autoComplete="off"
                  sx={projectInputSx}
                />
                <Tooltip title={tokenTooltip} arrow placement="bottom">
                  <IconButton
                    size="small"
                    sx={{
                      flexShrink: 0,
                      color: 'var(--foreground-muted)',
                      '&:hover': { color: 'var(--accent)' },
                    }}
                  >
                    <Info size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || !hfToken.trim()}
                startIcon={
                  loading ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Sparkles size={16} />
                  )
                }
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.85rem',
                  letterSpacing: '0.04em',
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--accent), #764ba2)',
                  boxShadow: '0 4px 16px var(--accent-muted)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px var(--accent-muted)',
                  },
                  '&:disabled': {
                    background: 'var(--background-2)',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                {loading ? 'Generating…' : 'Generate Image'}
              </Button>
              {imageUrl && (
                <Tooltip title="Download">
                  <Button
                    variant="outlined"
                    onClick={handleDownload}
                    sx={{
                      minWidth: 48,
                      px: 1.5,
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
                    <DownloadIcon fontSize="small" />
                  </Button>
                </Tooltip>
              )}
            </Box>

            <Typography
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.65rem',
                color: 'var(--foreground-muted)',
                textAlign: 'center',
              }}
            >
              Ctrl+Enter to generate
            </Typography>

            {/* Examples */}
            <Box>
              <Typography
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.7rem',
                  color: 'var(--foreground-muted)',
                  letterSpacing: '0.08em',
                  mb: 1,
                }}
              >
                EXAMPLE PROMPTS
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {EXAMPLE_PROMPTS.map((ex, i) => (
                  <Chip
                    key={i}
                    label={ex}
                    size="small"
                    onClick={() => {
                      setPrompt(ex);
                      setError(null);
                    }}
                    disabled={loading}
                    sx={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--background-elevated)',
                      border: '1px solid var(--card-border)',
                      color: 'var(--foreground-muted)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'var(--accent-muted)',
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)',
                      },
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Recent */}
            {history.length > 0 && (
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.7rem',
                    color: 'var(--foreground-muted)',
                    letterSpacing: '0.08em',
                    mb: 1,
                  }}
                >
                  RECENT PROMPTS
                </Typography>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}
                >
                  {history.map((h, i) => (
                    <Chip
                      key={i}
                      label={h}
                      size="small"
                      variant="outlined"
                      onClick={() => setPrompt(h)}
                      disabled={loading}
                      sx={{
                        justifyContent: 'flex-start',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '0.75rem',
                        borderColor: 'var(--card-border)',
                        color: 'var(--foreground-muted)',
                        '&:hover': {
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                          backgroundColor: 'var(--accent-muted)',
                        },
                        transition: 'all 0.15s ease',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Right: Preview panel */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '14px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {!imageUrl && !loading && (
              <Box
                sx={{
                  textAlign: 'center',
                  color: 'var(--foreground-muted)',
                  opacity: 0.4,
                }}
              >
                <ImageIcon size={64} strokeWidth={1} />
                <Typography
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.82rem',
                    mt: 2,
                  }}
                >
                  Your image will appear here
                </Typography>
              </Box>
            )}
            {loading && (
              <Box
                sx={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CircularProgress size={48} sx={{ color: 'var(--accent)' }} />
                <Typography
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.82rem',
                    color: 'var(--foreground-muted)',
                  }}
                >
                  Generating your image…
                </Typography>
              </Box>
            )}
            {imageUrl && !loading && (
              <Box
                component="img"
                src={imageUrl}
                alt="Generated"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  '@keyframes scaleIn': {
                    from: { opacity: 0, transform: 'scale(0.94)' },
                    to: { opacity: 1, transform: 'scale(1)' },
                  },
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
