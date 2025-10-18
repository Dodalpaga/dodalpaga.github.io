import * as React from 'react';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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
      <Typography variant="h4" gutterBottom sx={{ mb: 2, color: '#333' }}>
        Welcome to My Cool Template
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
        This is a stylish and modern content section. Explore the features and
        enjoy the aesthetics!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{
          padding: '10px 20px',
          fontSize: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        Documentation
      </Button>
    </Container>
  );
}
