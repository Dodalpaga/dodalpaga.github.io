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
  marginLeft: '10px', // Add a margin to separate links
};

export default function Content() {
  // State to track which notebook to display
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resizeIframe = (iframe: HTMLIFrameElement) => {
    if (iframe) {
      iframe.style.height =
        iframe.contentWindow.document.documentElement.scrollHeight + 'px';
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
  const notebook1 = {
    name: 'Cluster First.ipynb',
    path:
      process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/CVRP/Cluster first.html',
  };

  const notebook2 = {
    name: 'Route First.ipynb',
    path:
      process.env.NEXT_PUBLIC_BASE_PATH + '/notebooks/CVRP/Route first.html',
  };

  const readme = {
    name: 'README.md',
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
                onClick={() => handleContentSelection(readme.path)}
                style={linkStyle} // Apply general link style
              >
                {readme.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(notebook1.path)}
                style={linkStyle} // Apply general link style
              >
                {notebook1.name}
              </Typography>
              <Typography
                variant="h6"
                onClick={() => handleContentSelection(notebook2.path)}
                style={linkStyle} // Apply general link style
              >
                {notebook2.name}
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
