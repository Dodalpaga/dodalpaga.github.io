import * as React from 'react';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import Image from 'next/image';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useThemeContext } from '@/context/ThemeContext';
import { Map, MapRef, Marker, Source, Layer } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import { notify } from '@/components/toast';

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
const MAX_TRAIL_POINTS = 50; // Reduced to 50 points (~8 minutes)

// Memoized Metrics Cards Component
const MetricsCards = memo(({ issData }: { issData: ISSData | null }) => (
  <>
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
    <Grid item xs={6}>
      <Card>
        <CardContent>
          <Typography variant="h6">Altitude</Typography>
          <Typography>
            {issData ? `${issData.altitude.toFixed(2)} km` : 'Loading...'}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={6}>
      <Card>
        <CardContent>
          <Typography variant="h6">Velocity</Typography>
          <Typography>
            {issData ? `${issData.velocity.toFixed(2)} km/h` : 'Loading...'}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6">Visibility</Typography>
          <Typography>{issData ? issData.visibility : 'Loading...'}</Typography>
        </CardContent>
      </Card>
    </Grid>
  </>
));

MetricsCards.displayName = 'MetricsCards';

// Memoized Astronauts Section
const AstronautsSection = memo(
  ({ astronauts }: { astronauts: AstronautsData | null }) => (
    <Grid item xs={12} sx={{ marginTop: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Astronauts in Space : {astronauts?.number ?? '...'}
      </Typography>

      {astronauts ? (
        <Grid container spacing={2} wrap="wrap">
          {astronauts.people.map((astronaut) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={astronaut.id}>
              <Card
                sx={{
                  height: '100%',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      marginBottom: 2,
                      willChange: 'transform',
                    }}
                  >
                    <Image
                      src={astronaut.image}
                      alt={astronaut.name}
                      width={64}
                      height={64}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'translateZ(0)',
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
  )
);

AstronautsSection.displayName = 'AstronautsSection';

// Memoized Spacecraft Section
const SpacecraftSection = memo(
  ({ dockedSpacecraft }: { dockedSpacecraft: DockedSpacecraftData | null }) => (
    <Grid item xs={12} sx={{ marginTop: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Docked Spacecrafts : {dockedSpacecraft?.number ?? '...'}
      </Typography>

      {dockedSpacecraft ? (
        <Grid container spacing={2} wrap="wrap">
          {dockedSpacecraft.spacecraft.map((craft) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={craft.id}>
              <Card
                sx={{
                  height: '100%',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      marginBottom: 2,
                      willChange: 'transform',
                    }}
                  >
                    <Image
                      src={craft.image}
                      alt={craft.name}
                      width={64}
                      height={64}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'translateZ(0)',
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
  )
);

SpacecraftSection.displayName = 'SpacecraftSection';

// Memoized Map Component
const ISSMap = memo(
  ({
    issData,
    issTrail,
    mapStyle,
    trailColor,
  }: {
    issData: ISSData | null;
    issTrail: [number, number][];
    mapStyle: string;
    trailColor: string;
  }) => {
    const mapRef = useRef<MapRef | null>(null);

    const initialViewState = useMemo(
      () => ({
        latitude: issData ? issData.lat : 0,
        longitude: issData ? issData.lon : 0,
        zoom: 2,
        bearing: 0,
        pitch: 0,
      }),
      [issData?.lat, issData?.lon]
    );

    const trailGeoJSON = useMemo(() => {
      if (issTrail.length < 2) return null;

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: issTrail,
        },
        properties: {},
      };
    }, [issTrail]);

    const trailLayerStyle = useMemo(
      () => ({
        id: 'iss-trail-layer',
        type: 'line' as const,
        paint: {
          'line-color': trailColor,
          'line-width': 2,
          'line-opacity': 0.8,
        },
      }),
      [trailColor]
    );

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ padding: '0 !important', height: '100%' }}>
          <Map
            ref={mapRef}
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyle}
          >
            {trailGeoJSON && (
              <Source id="iss-trail" type="geojson" data={trailGeoJSON}>
                <Layer {...trailLayerStyle} />
              </Source>
            )}

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
    );
  }
);

ISSMap.displayName = 'ISSMap';

export default function Content() {
  const { theme } = useThemeContext();
  const [issData, setIssData] = useState<ISSData | null>(null);
  const [astronauts, setAstronauts] = useState<AstronautsData | null>(null);
  const [dockedSpacecraft, setDockedSpacecraft] =
    useState<DockedSpacecraftData | null>(null);
  const [issTrail, setIssTrail] = useState<[number, number][]>([]);

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

      setIssTrail((prevTrail) => {
        const newTrail: [number, number][] = [
          ...prevTrail,
          [longitude, latitude],
        ];
        return newTrail.slice(-MAX_TRAIL_POINTS) as [number, number][];
      });
    } catch (error) {
      notify('Error fetching ISS location:' + error, 'error');
      console.error('Error fetching ISS location:', error);
    }
  };

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
      notify('Error fetching astronauts data:' + error, 'error');
      console.error('Error fetching astronauts data:', error);
    }
  };

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
      notify('Error fetching docked spacecraft data:' + error, 'error');
      console.error('Error fetching docked spacecraft data:', error);
    }
  };

  useEffect(() => {
    fetchAstronauts();
    fetchISS();
    fetchDockedSpacecraft();

    const intervalId = setInterval(() => {
      fetchISS();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const mapStyle = useMemo(() => {
    const mapType = theme === 'dark' ? 'ocean' : 'landscape-v4';
    return `https://api.maptiler.com/maps/${mapType}/style.json?key=${MAPTILER_KEY}`;
  }, [theme]);

  const trailColor = useMemo(() => {
    return theme === 'dark' ? '#f4ff58' : '#1e3a8a';
  }, [theme]);

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
          <ISSMap
            issData={issData}
            issTrail={issTrail}
            mapStyle={mapStyle}
            trailColor={trailColor}
          />
        </Grid>

        <Grid
          item
          className="metrics"
          xs={12}
          md={6}
          sx={{
            overflowY: 'auto',
            height: '100%',
            WebkitOverflowScrolling: 'touch',
            willChange: 'scroll-position',
          }}
        >
          <Grid container spacing={2}>
            <MetricsCards issData={issData} />
            <AstronautsSection astronauts={astronauts} />
            <SpacecraftSection dockedSpacecraft={dockedSpacecraft} />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
