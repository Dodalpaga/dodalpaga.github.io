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
  lat: number;
  lon: number;
  altitude: number;
  velocity: number;
  visibility: string;
}

interface Astronaut {
  id: number;
  name: string;
  country: string;
  agency: string;
  position: string;
  spacecraft: string;
  days_in_space: number;
  image: string;
  url: string;
}

interface AstronautsData {
  number: number;
  people: Astronaut[];
}

interface Spacecraft {
  id: number;
  name: string;
  country: string;
  operator: string;
  spacecraft_name: string;
  docking_port: string;
  mission_type: string;
  image: string;
  url: string;
}

interface DockedSpacecraftData {
  number: number;
  spacecraft: Spacecraft[];
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

export default function Content() {
  const [issData, setIssData] = useState<ISSData | null>(null);
  const [astronauts, setAstronauts] = useState<AstronautsData | null>(null);
  const [dockedSpacecraft, setDockedSpacecraft] =
    useState<DockedSpacecraftData | null>(null);
  const [issTrail, setIssTrail] = useState<[number, number][]>([]);
  const mapRef = useRef<MapRef | null>(null);

  // Fetch ISS Position
  const fetchISS = async () => {
    try {
      const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      const data = await res.json();

      const { latitude, longitude, altitude, velocity, visibility } = data;

      setIssData({
        lat: latitude,
        lon: longitude,
        altitude,
        velocity,
        visibility,
      });

      setIssTrail((prevTrail) => [...prevTrail, [longitude, latitude]]);
    } catch (error) {
      console.error('Error fetching ISS location:', error);
    }
  };

  // Fetch Astronauts
  const fetchAstronauts = async () => {
    try {
      const res = await fetch(
        'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json'
      );
      const data = await res.json();

      setAstronauts({
        number: data.number,
        people: data.people,
      });
    } catch (error) {
      console.error('Error fetching astronauts data:', error);
    }
  };

  // Fetch Docked Spacecraft
  const fetchDockedSpacecraft = async () => {
    try {
      const res = await fetch(
        'https://corquaid.github.io/international-space-station-APIs/JSON/iss-docked-spacecraft.json'
      );
      const data = await res.json();

      setDockedSpacecraft({
        number: data.number,
        spacecraft: data.spacecraft,
      });
    } catch (error) {
      console.error('Error fetching docked spacecraft data:', error);
    }
  };

  useEffect(() => {
    fetchAstronauts();
    fetchISS();
    fetchDockedSpacecraft();

    const intervalId = setInterval(() => {
      fetchISS();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const initialViewState = {
    latitude: issData ? issData.lat : 0,
    longitude: issData ? issData.lon : 0,
    zoom: 2,
    bearing: 0,
    pitch: 0,
  };

  return (
    <Container
      maxWidth={false}
      className="iss-content"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        margin: 0,
      }}
    >
      <Grid className="iss-grid" container spacing={4} sx={{ height: '100%' }}>
        <Grid
          item
          className="map"
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
                mapStyle={`https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`}
              >
                {/* ISS Trail */}
                {issTrail.map(([lng, lat], index) => (
                  <Marker key={index} latitude={lat} longitude={lng}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        background: 'transparent',
                        border: '1px dotted rgba(244, 255, 88, 0.8)',
                        borderRadius: '50%',
                      }}
                    />
                  </Marker>
                ))}

                {/* ISS Current Position */}
                {issData && (
                  <Marker latitude={issData.lat} longitude={issData.lon}>
                    <div style={{ fontSize: '24px' }}>
                      <Image
                        src="/images/iss.png"
                        alt="ISS"
                        height={0}
                        width={0}
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

        <Grid item className="metrics" xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Latitude & Longitude */}
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Latitude</Typography>
                  <Typography>
                    {issData ? issData.lat.toFixed(4) : 'Loading...'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Longitude</Typography>
                  <Typography>
                    {issData ? issData.lon.toFixed(4) : 'Loading...'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Altitude */}
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Altitude</Typography>
                  <Typography>
                    {issData
                      ? `${issData.altitude.toFixed(2)} km`
                      : 'Loading...'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Velocity */}
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Velocity</Typography>
                  <Typography>
                    {issData
                      ? `${issData.velocity.toFixed(2)} km/h`
                      : 'Loading...'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Visibility */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Visibility</Typography>
                  <Typography>
                    {issData ? issData.visibility : 'Loading...'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Astronauts */}
            <Grid item xs={12} sx={{ marginTop: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Astronauts in Space : {astronauts?.number ?? '...'}
              </Typography>

              {astronauts ? (
                <Grid container spacing={2} wrap="wrap">
                  {astronauts.people.map((astronaut) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={astronaut.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column', // Ensure the card content aligns correctly in smaller sizes
                          }}
                        >
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              flexShrink: 0,
                              marginBottom: 2, // Add margin at bottom for spacing
                            }}
                          >
                            <Image
                              src={astronaut.image}
                              alt={astronaut.name}
                              width={64}
                              height={64}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{ wordBreak: 'break-word' }}
                            >
                              {astronaut.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ wordBreak: 'break-word' }}
                            >
                              {astronaut.agency}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ wordBreak: 'break-word' }}
                            >
                              {astronaut.position}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>Loading astronaut data...</Typography>
              )}
            </Grid>

            {/* Docked Spacecraft */}
            <Grid item xs={12} sx={{ marginTop: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Docked Spacecrafts : {dockedSpacecraft?.number ?? '...'}
              </Typography>

              {dockedSpacecraft ? (
                <Grid container spacing={2} wrap="wrap">
                  {dockedSpacecraft.spacecraft.map((craft) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={craft.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column', // Ensure the card content aligns correctly in smaller sizes
                          }}
                        >
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              flexShrink: 0,
                              marginBottom: 2, // Add margin at bottom for spacing
                            }}
                          >
                            <Image
                              src={craft.image}
                              alt={craft.name}
                              width={64}
                              height={64}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{ wordBreak: 'break-word' }}
                            >
                              {craft.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ wordBreak: 'break-word' }}
                            >
                              {craft.operator}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ wordBreak: 'break-word' }}
                            >
                              Docking Port: {craft.docking_port}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>Loading docked spacecraft data...</Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
