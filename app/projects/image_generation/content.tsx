import * as React from 'react';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import DownloadIcon from '@mui/icons-material/Download';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';

export default function Content() {
  const [prompt, setPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<string[]>([]);

  const examplePrompts = [
    'Astronaut riding a horse on Mars',
    'Cyberpunk city at sunset with neon lights',
    'Magical forest with glowing mushrooms',
    'Futuristic robot playing piano',
    'Ancient temple in the clouds',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/image_gen/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

      // Add to history
      if (!history.includes(prompt)) {
        setHistory([prompt, ...history.slice(0, 4)]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      link.click();
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError(null); // Clear error when selecting an example
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    setError(null); // Clear error when user starts typing
  };

  const handleCloseError = () => {
    setError(null); // Clear error when closing the alert
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        height: '100%',
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          mb: 1,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
        }}
      >
        AI Image Generator
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mb: 4,
          textAlign: 'center',
          color: 'var(--foreground-2)',
          opacity: 0.8,
        }}
      >
        Transform your ideas into stunning visuals with AI-powered image
        generation
      </Typography>

      <Grid container spacing={3} sx={{ height: 'calc(100% - 120px)' }}>
        {/* Left Column - Input Section */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              background: 'var(--background)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                onClose={handleCloseError}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}

            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: 'var(--foreground)' }}
            >
              Describe Your Image
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={6}
              value={prompt}
              onChange={handlePromptChange} // Updated to use new handler
              onKeyDown={handleKeyDown}
              variant="outlined"
              placeholder="Describe the image you want to create in detail..."
              disabled={loading}
              autoComplete="off"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'var(--foreground-2)',
                  backgroundColor: 'var(--background-2)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
              autoFocus
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                sx={{
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 600,
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  '✨ Generate Image'
                )}
              </Button>

              {imageUrl && (
                <Tooltip title="Download">
                  <Button
                    variant="outlined"
                    onClick={handleDownload}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      borderColor: 'var(--background-1)',
                      color: 'var(--foreground-2)',
                      '&:hover': {
                        borderColor: 'var(--bg-color-4)',
                        backgroundColor: 'var(--bg-color-4)',
                      },
                    }}
                  >
                    <DownloadIcon />
                  </Button>
                </Tooltip>
              )}
            </Box>

            <Typography
              variant="caption"
              sx={{
                mb: 2,
                color: 'var(--foreground-2)',
                opacity: 0.6,
                textAlign: 'center',
              }}
            >
              Press Ctrl + Enter to generate
            </Typography>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  color: 'var(--foreground-2)',
                }}
              >
                Example Prompts
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {examplePrompts.map((example, index) => (
                  <Chip
                    key={index}
                    label={example}
                    onClick={() => handleExampleClick(example)}
                    disabled={loading}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                ))}
              </Box>

              {history.length > 0 && (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      mt: 2,
                      fontWeight: 600,
                      color: 'var(--foreground-2)',
                    }}
                  >
                    Recent Prompts
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    {history.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        onClick={() => setPrompt(item)}
                        disabled={loading}
                        variant="outlined"
                        sx={{
                          justifyContent: 'flex-start',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Preview Section */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              background: 'var(--background)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {!imageUrl && !loading && (
              <Box
                sx={{
                  textAlign: 'center',
                  color: 'var(--foreground-2)',
                  opacity: 0.5,
                }}
              >
                <Typography variant="h1" sx={{ fontSize: '80px', mb: 2 }}>
                  🎨
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Your masterpiece will appear here
                </Typography>
                <Typography variant="body2">
                  Enter a prompt and click generate to create your image
                </Typography>
              </Box>
            )}

            {loading && (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'var(--foreground-2)' }}>
                  Creating your image...
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--foreground-2)', opacity: 0.7, mt: 1 }}
                >
                  This may take a few moments
                </Typography>
              </Box>
            )}

            {imageUrl && !loading && (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  component="img"
                  src={imageUrl}
                  alt="Generated"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: 2,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    objectFit: 'contain',
                    animation: 'fadeIn 0.5s ease-in',
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'scale(0.95)' },
                      to: { opacity: 1, transform: 'scale(1)' },
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
