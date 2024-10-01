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

const sectionStyle = {
  padding: '10px 20px 20px 20px',
  display: 'flex',
  flexDirection: 'column' as 'column', // Explicitly set as one of the allowed values
  width: '100%',
  textAlign: 'center' as 'center', // TypeScript might also need this to be explicit
  position: 'relative' as 'relative', // Similar for position
};

// General style for left panel links
const linkStyle = {
  cursor: 'pointer',
  marginLeft: '10px', // Add a margin to separate links from border
  marginBottom: '10px', // Add a margin to separate links from each other
};

export default function Content() {
  // State to track which notebook to display
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resizeIframe = (iframe: HTMLIFrameElement) => {
    if (iframe && iframe.contentWindow) {
      // Check if contentWindow is available
      const doc = iframe.contentWindow.document.documentElement;
      if (doc) {
        iframe.style.height = doc.scrollHeight + 'px'; // Set the height based on the document height
      }
    }
  };

  // Function to handle content selection
  const handleContentSelection = (path: string) => {
    setIsLoading(true);
    setSelectedContent(path);
    setTimeout(() => {
      setIsLoading(false);
    }, 500); // Adjust the timeout duration as needed
  };

  // Explicitly defining each notebook
  const cvrp_cluster_first = {
    name: 'Cluster First.ipynb',
    path:
      process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/CVRP/Cluster first.html',
  };

  const cvrp_route_first = {
    name: 'Route First.ipynb',
    path:
      process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/CVRP/Route first.html',
  };

  const cvrp_readme = {
    name: 'README.md',
    path: process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/CVRP/README.html', // Path to your HTML file
  };

  const dqn = {
    name: 'DQN.ipynb',
    path: process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/random/dqn.html', // Path to your HTML file
  };
  const ecg = {
    name: 'ECG.ipynb',
    path: process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/random/ecg.html', // Path to your HTML file
  };
  const frozen_lake = {
    name: 'Frozen Lake.ipynb',
    path:
      process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/random/frozen_lake.html', // Path to your HTML file
  };
  const ml = {
    name: 'Machine Learning.ipynb',
    path: process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/random/ml.html', // Path to your HTML file
  };
  const ozone = {
    name: 'Ozone.ipynb',
    path: process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/random/ozone.html', // Path to your HTML file
  };
  const persistence = {
    name: 'Persistence Multiplicative.ipynb',
    path:
      process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/random/persistence.html', // Path to your HTML file
  };
  const taxi = {
    name: 'Taxi.ipynb',
    path: process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/random/taxi.html', // Path to your HTML file
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
            Projects
          </Typography>
        </div>

        {/* Accordion for CVRP Project */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">CVRP Project</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="left-container">
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(cvrp_readme.path)}
                style={linkStyle} // Apply general link style
              >
                {cvrp_readme.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(cvrp_cluster_first.path)}
                style={linkStyle} // Apply general link style
              >
                {cvrp_cluster_first.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(cvrp_route_first.path)}
                style={linkStyle} // Apply general link style
              >
                {cvrp_route_first.name}
              </Typography>
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Accordion for Random Project */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Random Projects</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="left-container">
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(dqn.path)}
                style={linkStyle} // Apply general link style
              >
                {dqn.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(ecg.path)}
                style={linkStyle} // Apply general link style
              >
                {ecg.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(frozen_lake.path)}
                style={linkStyle} // Apply general link style
              >
                {frozen_lake.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(ml.path)}
                style={linkStyle} // Apply general link style
              >
                {ml.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(ozone.path)}
                style={linkStyle} // Apply general link style
              >
                {ozone.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(persistence.path)}
                style={linkStyle} // Apply general link style
              >
                {persistence.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(taxi.path)}
                style={linkStyle} // Apply general link style
              >
                {taxi.name}
              </Typography>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Main Scrollable Content Section */}
      <div className="right-scrollable">
        {/* Display Notebook Content */}
        <section id="notebook-section" style={sectionStyle}>
          {selectedContent ? (
            <div style={{ height: 'auto', overflowY: 'hidden' }}>
              {/* Allow full height for the iframe */}
              {isLoading ? (
                <Loading />
              ) : (
                <iframe
                  src={selectedContent}
                  onLoad={(event) =>
                    resizeIframe(event.target as HTMLIFrameElement)
                  } // Use event.target to get the iframe
                  title="Notebook Content"
                  style={{
                    width: '100%',
                    border: 'none',
                    backgroundColor: 'transparent',
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
