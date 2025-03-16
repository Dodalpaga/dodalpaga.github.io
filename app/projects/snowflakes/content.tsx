import * as React from 'react';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
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
    availableTemps: number[]
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
      availableTemperatures[humidity]
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
    newValue: number | number[]
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
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: 'black', // Set background color to black
      }}
    >
      <Stack
        spacing={4}
        direction="row"
        alignItems="center"
        justifyContent="center"
        width="100%"
        height="100%"
      >
        {/* Left: Humidity Selector */}
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <div style={{ color: 'white' }}>Humidity</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {['Level 3', 'Level 2', 'Level 1'].map((level, index) => (
              <div
                key={level}
                onClick={() => handleHumidityChange(3 - index)} // Set humidity level on click
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: '2px solid white',
                  margin: '5px 0',
                  backgroundColor:
                    humidity >= 3 - index ? 'white' : 'transparent',
                  cursor: 'pointer', // Show a pointer cursor on hover
                }}
              />
            ))}
          </div>
        </Stack>

        {/* Image in between Humidity and Temperature */}
        <div className="fadein" style={{ width: '90%', height: '100%' }}>
          <Image
            src={`/snowflakes/images/snowflake_${humidity}_${temperature}.jpg`}
            alt="Snowflake"
            key={imageKey}
            layout="fill" // Makes the image fit the parent div
            objectFit="contain" // Ensures the image maintains its aspect ratio
          />
        </div>

        {/* Right: Temperature Slider */}
        <Stack spacing={2} direction="column" alignItems="center">
          <div style={{ color: 'white' }}>Temperature</div>
          <div style={{ color: 'white' }}>0°C</div>
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
              height: 300,
              color: 'white',
              '& .MuiSlider-thumb': {
                backgroundColor: 'white',
              },
              '& .MuiSlider-track': {
                backgroundColor: 'white',
              },
            }}
          />
          <div style={{ color: 'white' }}>-30°C</div>
        </Stack>
      </Stack>
    </Container>
  );
}
