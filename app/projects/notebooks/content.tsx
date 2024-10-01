'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
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
  // State to track which notebook to display
  const [selectedContent, setSelectedContent] = useState<string>('');

  // Explicitly defining each notebook
  const notebook1 = {
    name: 'Cluster First',
    path:
      process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/CVRP/Cluster first.html',
  };

  const notebook2 = {
    name: 'Route First',
    path:
      process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/CVRP/Route first.html',
  };

  const readme = {
    name: 'README',
    path: process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/CVRP/README.html', // Path to your HTML file
  };

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
          <Typography
            variant="h6"
            onClick={() => setSelectedContent(notebook1.path)}
            style={{ cursor: 'pointer', color: 'blue' }}
          >
            {notebook1.name}
          </Typography>
          <Typography
            variant="h6"
            onClick={() => setSelectedContent(notebook2.path)}
            style={{ cursor: 'pointer', color: 'blue' }}
          >
            {notebook2.name}
          </Typography>
          <Typography
            variant="h6"
            onClick={() => setSelectedContent(readme.path)}
            style={{ cursor: 'pointer', color: 'blue' }}
          >
            {readme.name}
          </Typography>
        </div>
      </div>

      {/* Main Scrollable Content Section */}
      <div className="right-scrollable">
        {/* Display Notebook Content */}
        <section id="notebook-section" style={sectionStyle}>
          {selectedContent ? (
            <iframe
              src={selectedContent}
              title="Notebook Content"
              style={{ width: '100%', height: '80vh', border: 'none' }}
            />
          ) : (
            <Typography variant="h4">Select a notebook to display</Typography>
          )}
        </section>
      </div>
    </Container>
  );
}
