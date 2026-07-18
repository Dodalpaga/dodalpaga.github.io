// app/projects/snowflakes/content.tsx
'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Slider } from '@mui/material';
import Image from 'next/image';
import './styles.css'; // Import regular CSS

export default function Content() {
  const [humidity, setHumidity] = React.useState<number>(1);
  const [temperature, setTemperature] = React.useState<number>(0);
  const [imageKey, setImageKey] = React.useState<string>(''); // Key to trigger animation
  const prevImagePath = React.useRef<string>('');

  // Define a map of available temperatures for each humidity level
  const availableTemperatures: { [key: number]: number[] } = {
    1: [-2, -3, -4, -6, -7, -15, -24, -26, -28],
    2: [-2, -5, -10, -16, -17, -18, -26],
    3: [-5, -13, -14],
  };

  // Function to find the closest temperature
  const getClosestTemperature = (
    targetTemp: number,
    availableTemps: number[],
  ): number => {
    const sortedTemps = availableTemps.sort((a, b) => a - b);
    let closest = sortedTemps[0];
    let minDiff = Math.abs(targetTemp - closest);

    for (let i = 1; i < sortedTemps.length; i++) {
      const diff = Math.abs(targetTemp - sortedTemps[i]);
      if (diff < minDiff) {
        closest = sortedTemps[i];
        minDiff = diff;
      }
    }

    return closest;
  };

  React.useEffect(() => {
    const newTemperature = getClosestTemperature(
      temperature,
      availableTemperatures[humidity],
    );
    setTemperature(newTemperature);
    const imagePath = `/snowflakes/images/snowflake_${humidity}_${newTemperature}.jpg`;

    if (prevImagePath.current !== imagePath) {
      prevImagePath.current = imagePath;
      // Trigger animation by updating the key
      setImageKey(imagePath + Date.now().toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [humidity, temperature]);

  const handleTemperatureChange = (
    event: Event,
    newValue: number | number[],
  ) => {
    setTemperature(newValue as number);
  };

  const handleHumidityChange = (newValue: number | number[]) => {
    setHumidity(newValue as number);
  };

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
        <span className="section-label">Simulation · Science</span>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          Snowflakes
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Learn how snowflake shape is determined by temperature and humidity
        </Typography>
      </Box>

      {/* Stage */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid var(--card-border)',
          backgroundColor: 'var(--background-sunken)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <Stack
          spacing={4}
          direction="row"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
          sx={{ px: { xs: 2, sm: 5 } }}
        >
          {/* Left: Humidity Selector */}
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            spacing={1.5}
          >
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.68rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--foreground-muted)',
              }}
            >
              Humidity
            </span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {['Level 3', 'Level 2', 'Level 1'].map((level, index) => (
                <div
                  key={level}
                  onClick={() => handleHumidityChange(3 - index)}
                  title={level}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    border: '2px solid var(--accent)',
                    backgroundColor:
                      humidity >= 3 - index ? 'var(--accent)' : 'transparent',
                    boxShadow:
                      humidity >= 3 - index
                        ? '0 0 10px var(--accent-muted)'
                        : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                />
              ))}
            </div>
          </Stack>

          {/* Image in between Humidity and Temperature */}
          <div
            className="fadein"
            style={{ width: '90%', maxWidth: 480, height: '85%' }}
          >
            <Image
              src={`/snowflakes/images/snowflake_${humidity}_${temperature}.jpg`}
              alt="Snowflake"
              key={imageKey}
              fill
              sizes="(max-width: 600px) 90vw, 480px"
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Right: Temperature Slider */}
          <Stack spacing={1.5} direction="column" alignItems="center">
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.68rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--foreground-muted)',
              }}
            >
              Temperature
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.72rem',
                color: 'var(--foreground)',
                opacity: 0.6,
              }}
            >
              0°C
            </span>
            <Slider
              value={temperature}
              valueLabelDisplay="on"
              valueLabelFormat={(value) => `${value}°C`}
              min={-30}
              max={0}
              step={1}
              onChange={handleTemperatureChange}
              orientation="vertical"
              sx={{
                height: 260,
                color: 'var(--accent)',
                '& .MuiSlider-thumb': {
                  backgroundColor: 'var(--accent)',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px var(--accent-muted)',
                  },
                },
                '& .MuiSlider-track': {
                  backgroundColor: 'var(--accent)',
                  border: 'none',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'var(--card-border)',
                  opacity: 1,
                },
                '& .MuiSlider-valueLabel': {
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.7rem',
                  backgroundColor: 'var(--background-elevated)',
                  color: 'var(--foreground)',
                },
              }}
            />
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.72rem',
                color: 'var(--foreground)',
                opacity: 0.6,
              }}
            >
              -30°C
            </span>
          </Stack>
        </Stack>
      </Box>

      {/* Footer credit */}
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <a
          href="https://gagarin.is/work/arctic-opposites"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.68rem',
            letterSpacing: '0.04em',
            color: 'var(--foreground-muted)',
          }}
        >
          Inspiration · Gagarin
        </a>
      </Box>
    </Container>
  );
}
