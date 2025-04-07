import React from 'react';
import Container from '@mui/material/Container';

export default function Content() {
  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: 'calc(100vh - 80px)', // Ajustez "80px" à la hauteur de votre pied de page
        overflow: 'auto',
      }}
    >
      Work in progress. You can already check out my music in the pop up in the
      bottom right corner (Device with a width {'>'} 465px).
    </Container>
  );
}
