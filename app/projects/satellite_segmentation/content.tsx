import * as React from 'react';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function Content() {
  return (
    <Container
      maxWidth={false} // Pass boolean false, not a string
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 2, color: 'var(--foreground)' }}
      >
        Work in progress
      </Typography>
    </Container>
  );
}
