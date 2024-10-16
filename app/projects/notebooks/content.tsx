'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for the accordion
import { useState, useRef } from 'react';
import Loading from '../../../components/loading';
import '../../globals.css'; // Ensure global styles are correctly imported
import './styles.css';
import { useThemeContext } from '../../../context/ThemeContext';

// General style for left panel links
const linkStyle = {
  cursor: 'pointer',
  margin: '5px',
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
    { name: 'Persistence Multiplicative', path: 'random/persistence.html' },
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
  const { theme } = useThemeContext(); // Access the current theme from context
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  );
  const [isIframeReady, setIsIframeReady] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const resizeIframe = (iframe: HTMLIFrameElement) => {
    if (iframe && iframe.contentWindow) {
      const doc = iframe.contentWindow.document.documentElement;
      if (doc) {
        iframe.style.height = doc.scrollHeight + 'px';
        setIsIframeReady(true); // Mark iframe as ready
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
    setExpandedAccordion(false); // Close the accordion
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Inject styles into the iframe's document
  const injectStyles = (iframe: HTMLIFrameElement, theme: 'light' | 'dark') => {
    const style = document.createElement('style');

    // Set the styles based on the theme
    if (theme === 'dark') {
      style.textContent = `
        thead,
        caption,
        div.text_cell_render,
        p,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        li {
          color: white !important; /* Override color for dark theme */
        }
        .jp-OutputArea-output pre {
          color: white !important; /* Override color for dark theme */
        }
      `;
    } else {
      style.textContent = `
        thead,
        caption,
        div.text_cell_render,
        p,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        li {
          color: black !important; /* Override color for light theme */
        }
        .jp-OutputArea-output pre {
          color: black !important; /* Override color for light theme */
        }
      `;
    }

    // Append the style element to the iframe's head
    iframe.contentDocument?.head.appendChild(style);
  };

  React.useEffect(() => {
    // Check if iframe is available
    if (iframeRef.current) {
      // Inject styles based on the current theme
      injectStyles(iframeRef.current, theme);
    }
  }, [theme]); // Dependency on theme

  return (
    <Container maxWidth={false} className="content-container">
      <div className="left-fixed left-notebook">
        <Grid className="accordion-grid" container spacing={2}>
          {Object.entries(notebooks).map(([folder, files]) => (
            <Grid
              className="accordion-grid-item"
              item
              xs={12}
              sm={6}
              md={3}
              key={folder}
            >
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
                  <div className="left-container left-notebook-container">
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
            </Grid>
          ))}
        </Grid>
      </div>

      <div className="right-scrollable">
        <section id="notebook-section">
          {selectedContent ? (
            <div style={{ height: 'auto', overflowY: 'hidden' }}>
              {isLoading ? (
                <Loading />
              ) : (
                <iframe
                  ref={iframeRef}
                  src={selectedContent}
                  onLoad={(event) => {
                    const iframe = event.target as HTMLIFrameElement;
                    resizeIframe(iframe);
                    injectStyles(iframe, theme); // Inject styles after resizing
                  }}
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
