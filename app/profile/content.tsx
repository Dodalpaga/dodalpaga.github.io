// content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import '../globals.css'; // Ensure global styles are correctly imported

const sectionStyle = {
  padding: '60px 20px',
  textAlign: 'center',
};

const titleStyle = {
  marginBottom: '20px',
};

const descriptionStyle = {
  marginBottom: '40px',
  color: '#666',
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)',
  },
};
export default function Content() {
  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
      }}
    >
      <section id="experience" style={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={titleStyle}>
          Experience
        </Typography>
        <Typography variant="body1" sx={descriptionStyle}>
          Here’s a summary of my professional experience.
        </Typography>
        {/* Add experience details here */}
      </section>

      <section id="skills" style={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={titleStyle}>
          Skills
        </Typography>
        <Typography variant="body1" sx={descriptionStyle}>
          These are the skills I’ve acquired over the years.
        </Typography>
        {/* Add skills details here */}
      </section>

      <section id="projects" style={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={titleStyle}>
          Projects
        </Typography>
        <Typography variant="body1" sx={descriptionStyle}>
          Check out some of my projects.
        </Typography>
        {/* Add project details here */}
      </section>

      <section id="contact" style={sectionStyle}>
        <Typography variant="h4" gutterBottom sx={titleStyle}>
          Contact
        </Typography>
        <Typography variant="body1" sx={descriptionStyle}>
          Feel free to get in touch with me!
        </Typography>
        <Button variant="contained" color="primary" sx={buttonStyle}>
          Get in Touch
        </Button>
        {/* Add contact details or form here */}
      </section>
    </Container>
  );
}
