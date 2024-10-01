// content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import '../../globals.css'; // Ensure global styles are correctly imported

const sectionStyle = {
  padding: '10px 20px 20px 20px',
  display: 'flex',
  flexDirection: 'column' as 'column', // Explicitly set as one of the allowed values
  width: '100%',
  textAlign: 'center' as 'center', // TypeScript might also need this to be explicit
  position: 'relative' as 'relative', // Similar for position
};

export default function Content() {
  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column', // Align the left div and the right content
        height: '100%', // Ensure full height for content
        alignItems: 'flex-start',
      }}
      style={{
        padding: 0,
      }}
    >
      {/* Fixed Left Section */}
      <div className="left-fixed">
        <div className="left-container">
          <Typography
            className="title"
            color="textSecondary"
            variant="h4"
            gutterBottom
          >
            Notebooks
          </Typography>
        </div>

        <div className="left-container">
          <Typography variant="h6">Notebook 1</Typography>
          <Typography variant="h6">Notebook 2</Typography>
          <Typography variant="h6">Notebook 3</Typography>
        </div>
      </div>

      {/* Main Scrollable Content Section */}
      <div className="right-scrollable">
        {/* Experience Section */}
        <section id="notebook-section" style={sectionStyle}>
          <Typography variant="h4">Notebook</Typography>
        </section>
      </div>
    </Container>
  );
}
