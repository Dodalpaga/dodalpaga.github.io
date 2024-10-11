import * as React from 'react';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';

// Import your components directly
import LorentzCanvas from './lorentz';
import FourrierCanvas from './fourrier';
import BifurcationCanvas from './bifurcation';
import PiApproximationCanvas from './pi';

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
        marginTop: 6,
      }}
    >
      <Grid container spacing={4}>
        {/* Map through an array to reduce redundancy */}
        {[
          { Component: LorentzCanvas },
          { Component: FourrierCanvas },
          { Component: BifurcationCanvas },
          { Component: PiApproximationCanvas },
        ].map(({ Component }, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card className="card">
              <Component />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
