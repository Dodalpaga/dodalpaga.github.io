import * as React from 'react';
import Container from '@mui/material/Container';
import dynamic from 'next/dynamic';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';

// Dynamically import LorentzCanvas with server-side rendering disabled
const LorentzCanvas = dynamic(() => import('./lorentz'), {
  ssr: false,
});
const FourrierCanvas = dynamic(() => import('./fourrier'), {
  ssr: false,
});
const BifurcationCanvas = dynamic(() => import('./bifurcation'), {
  ssr: false,
});
const PiApproximationCanvas = dynamic(() => import('./pi'), {
  ssr: false,
});

export default function Content() {
  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            className="card"
            sx={{
              position: 'relative',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              overflow: 'hidden',
              width: '100%', // Set width to 100% of the grid item
              aspectRatio: '1 / 1', // Maintain a 1:1 aspect ratio
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <LorentzCanvas />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            className="card"
            sx={{
              position: 'relative',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              overflow: 'hidden',
              width: '100%', // Set width to 100% of the grid item
              aspectRatio: '1 / 1', // Maintain a 1:1 aspect ratio
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <FourrierCanvas />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            className="card"
            sx={{
              position: 'relative',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              overflow: 'hidden',
              width: '100%', // Set width to 100% of the grid item
              aspectRatio: '1 / 1', // Maintain a 1:1 aspect ratio
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <BifurcationCanvas />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            className="card"
            sx={{
              position: 'relative',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              overflow: 'hidden',
              width: '100%', // Set width to 100% of the grid item
              aspectRatio: '1 / 1', // Maintain a 1:1 aspect ratio
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <PiApproximationCanvas />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
