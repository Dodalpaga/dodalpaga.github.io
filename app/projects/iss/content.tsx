import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Map, MapRef, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';

interface ISSData {
  lat: string;
  lon: string;
}

interface AstronautsData {
  number: number;
  names: string[];
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

export default function Content() {
  const [issData, setIssData] = useState<ISSData>({ lat: '', lon: '' });
  const [astronauts, setAstronauts] = useState<AstronautsData | null>(null);
  const [issTrail, setIssTrail] = useState<[number, number][]>([]);
  const mapRef = useRef<MapRef | null>(null);

  // Fetch the current ISS position
  const fetchISS = async () => {
    try {
      const res = await fetch('http://api.open-notify.org/iss-now.json');
      const data = await res.json();
      const { latitude, longitude } = data.iss_position;
      setIssData({ lat: latitude, lon: longitude });

      // Add the new coordinate to the trail
      setIssTrail((prevTrail) => [
        ...prevTrail,
        [parseFloat(longitude), parseFloat(latitude)],
      ]);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [parseFloat(longitude), parseFloat(latitude)],
          zoom: 2,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error fetching ISS location:', error);
    }
  };

  // Fetch the astronauts data
  const fetchAstronauts = async () => {
    try {
      const res = await fetch('http://api.open-notify.org/astros.json');
      const data = await res.json();
      setAstronauts({
        number: data.number,
        names: data.people.map((p: { name: string }) => p.name),
      });
    } catch (error) {
      console.error('Error fetching astronauts data:', error);
    }
  };

  // On mount, fetch astronauts and ISS position, then update ISS data every 5 seconds.
  useEffect(() => {
    fetchAstronauts();
    fetchISS();
    const intervalId = setInterval(() => {
      fetchISS();
      // Optionally, update the map's view when new ISS coordinates arrive
      if (issData.lat && issData.lon && mapRef.current) {
        mapRef.current.flyTo({
          center: [parseFloat(issData.lon), parseFloat(issData.lat)],
          zoom: 2,
          duration: 2100,
        });
      }
    }, 2000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set an initial view state; if no data, fallback to [0,0]
  const initialViewState = {
    latitude: issData.lat ? parseFloat(issData.lat) : 0,
    longitude: issData.lon ? parseFloat(issData.lon) : 0,
    zoom: 2,
    bearing: 0,
    pitch: 0,
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        margin: 0,
        width: '100%',
      }}
    >
      <Box
        sx={{ width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: 0 }}
      >
        <Grid container spacing={4}>
          {/* Left Column with Metrics and Astronauts */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {/* Latitude Card */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ minWidth: 150 }}>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Latitude
                    </Typography>
                    <Typography variant="body1">
                      {issData.lat ? issData.lat : 'Loading...'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {/* Longitude Card */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ minWidth: 150 }}>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Longitude
                    </Typography>
                    <Typography variant="body1">
                      {issData.lon ? issData.lon : 'Loading...'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {/* Astronauts List */}
            <Grid item xs={12} sx={{ marginTop: 4 }}>
              <Card>
                <CardContent>
                  {astronauts ? (
                    <>
                      <Typography variant="h6" component="div" gutterBottom>
                        Astronauts in Space
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        There are currently {astronauts.number} people in space.
                      </Typography>
                      <ul>
                        {astronauts.names.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Typography variant="body1">
                      Loading astronaut data...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* Right Column with Map */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ minHeight: { xs: '400px', md: '100%' } }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ padding: '0 !important', height: '100%' }}>
                <Map
                  ref={mapRef}
                  initialViewState={initialViewState}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${MAPTILER_KEY}`}
                >
                  {/* Render trail markers */}
                  {issTrail.map(([lng, lat], index) => (
                    <Marker key={index} latitude={lat} longitude={lng}>
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          background: 'transparent',
                          border: '1px dotted rgba(0, 0, 0, 0.2)',
                          borderRadius: '50%',
                        }}
                      />
                    </Marker>
                  ))}
                  {/* Render current ISS marker */}
                  {issData.lat && issData.lon && (
                    <Marker
                      latitude={parseFloat(issData.lat)}
                      longitude={parseFloat(issData.lon)}
                    >
                      <div style={{ fontSize: '24px' }}>
                        <Image
                          src="/images/iss.png"
                          alt="ISS"
                          height={0} // Fixed height
                          width={0} // Set width to 0 (ignored due to style)
                          style={{
                            width: 'auto',
                            height: '50px',
                            padding: '10px',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      </div>
                    </Marker>
                  )}
                </Map>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
