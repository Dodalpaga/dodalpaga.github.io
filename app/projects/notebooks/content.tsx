'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for the accordion
import { useState } from 'react';
import Loading from '../../../components/loading';
import '../../globals.css'; // Ensure global styles are correctly imported

const sectionStyle: React.CSSProperties = {
  padding: '10px 20px 20px 20px',
  display: 'flex',
  flexDirection: 'column', // This should be fine, but you may need to ensure TypeScript understands it
  width: '100%',
  textAlign: 'center',
  position: 'relative',
};

// General style for left panel links
const linkStyle = {
  cursor: 'pointer',
  marginLeft: '10px',
  marginBottom: '10px',
};

// Notebook structure
const notebooks = {
  CVRP: [
    { name: 'README.md', path: 'CVRP/README.html' },
    { name: 'Cluster First', path: 'CVRP/Cluster first.html' },
    { name: 'Route First', path: 'CVRP/Route first.html' },
  ],
  MeteoNet: [
    { name: 'EDA', path: 'meteonet/EDA.html' },
    { name: 'Modelling', path: 'meteonet/Modelling.html' },
  ],
  Random: [
    { name: 'DQN', path: 'random/dqn.html' },
    { name: 'ECG', path: 'random/ecg.html' },
    { name: 'Frozen Lake', path: 'random/frozen_lake.html' },
    { name: 'Machine Learning', path: 'random/ml.html' },
    { name: 'Ozone', path: 'random/ozone.html' },
    {
      name: 'Persistence Multiplicative',
      path: 'random/persistence.html',
    },
    { name: 'Taxi', path: 'random/taxi.html' },
  ],
  Kaggle: [
    { name: 'Covid 19 Vaccines', path: 'kaggle/covid-19.html' },
    { name: 'Fish recognition', path: 'kaggle/fish.html' },
    { name: 'Heart Attacks', path: 'kaggle/heart-1.html' },
    { name: 'Heart Attacks 2', path: 'kaggle/heart-2.html' },
    { name: 'Holiday Packages', path: 'kaggle/holiday.html' },
    { name: 'Mice Trisomy', path: 'kaggle/mice.html' },
    { name: 'Pokemon Stats', path: 'kaggle/pokemon.html' },
    { name: 'Road Accidents', path: 'kaggle/road-injuries.html' },
    { name: 'Stroke Detection', path: 'kaggle/stroke.html' },
    { name: 'Weather Forecasting', path: 'kaggle/weather-forecasting.html' },
  ],
};

export default function Content() {
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  );
  const [isIframeReady, setIsIframeReady] = useState<boolean>(false); // For controlling visibility after resizing

  const resizeIframe = (iframe: HTMLIFrameElement) => {
    if (iframe && iframe.contentWindow) {
      const doc = iframe.contentWindow.document.documentElement;
      if (doc) {
        iframe.style.height = doc.scrollHeight + 'px';
        setIsIframeReady(true); // Once resized, mark iframe as ready
      }
    }
  };

  const handleAccordionChange = (folder: string) => {
    setExpandedAccordion(expandedAccordion === folder ? false : folder);
  };

  const handleContentSelection = (path: string) => {
    setIsLoading(true);
    setIsIframeReady(false); // Reset iframe ready state
    setSelectedContent('/notebooks/' + path);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'flex-start',
      }}
      style={{
        padding: 0,
      }}
    >
      <div className="left-fixed">
        <div className="left-container">
          <Typography
            className="title"
            color="textSecondary"
            variant="h4"
            gutterBottom
          >
            My Notebooks
          </Typography>
        </div>

        {/* Map over notebooks to create accordions */}
        {Object.entries(notebooks).map(([folder, files]) => (
          <Accordion
            style={{ marginBottom: '16px' }}
            key={folder}
            expanded={expandedAccordion === folder}
            onChange={() => handleAccordionChange(folder)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">{folder}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="left-container">
                {files.map((file) => (
                  <Typography
                    key={file.path}
                    variant="h6"
                    onClick={() => handleContentSelection(file.path)}
                    style={linkStyle}
                  >
                    {file.name}
                  </Typography>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>

      <div className="right-scrollable">
        <section id="notebook-section" style={sectionStyle}>
          {selectedContent ? (
            <div style={{ height: 'auto', overflowY: 'hidden' }}>
              {isLoading ? (
                <Loading />
              ) : (
                <iframe
                  src={selectedContent}
                  onLoad={(event) =>
                    resizeIframe(event.target as HTMLIFrameElement)
                  }
                  title="Notebook Content"
                  style={{
                    width: '100%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    visibility: isIframeReady ? 'visible' : 'hidden', // Hide the iframe until it's resized
                    opacity: isIframeReady ? 1 : 0, // Smooth transition
                    transition: 'opacity 0.3s ease-in-out', // Fade in for a better UX
                  }}
                />
              )}
            </div>
          ) : (
            <Typography variant="h4">Select a notebook to display</Typography>
          )}
        </section>
      </div>
    </Container>
  );
}
