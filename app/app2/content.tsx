import * as React from 'react';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

export default function Content() {
  return (
    <Container
      maxWidth={false} // Pass boolean false, not a string
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Button variant="outlined">Button</Button>
    </Container>
  );
}
