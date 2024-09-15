// content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';

import '../globals.css'; // Ensure global styles are correctly imported

const sectionStyle = {
  padding: '10px 20px 20px 20px',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: 'calc(100vh - 84px)',
  textAlign: 'center',
  position: 'relative',
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
        flexDirection: 'row', // Align the left div and the right content
        height: '100%', // Ensure full height for content
        alignItems: 'flex-start',
      }}
      style={{
        padding: 0,
      }}
    >
      {/* Fixed Left Section */}
      <div className="left-fixed">
        <div
          id="profile-picture-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            alignItems: 'center',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          <Card className="card">
            <CardMedia
              component="img"
              image={'/assets/id.png'}
              alt={'Profile Picture'}
              sx={{
                height: '100%', // Adjust height as needed
                width: '100%', // Full width of the card
                objectFit: 'contain', // Maintain aspect ratio and fit within the card
                objectPosition: 'center', // Center image horizontally and vertically
              }}
            />
          </Card>
        </div>
        <Typography color="textSecondary" variant="h5" gutterBottom>
          About
        </Typography>
        <Typography color="textPrimary" variant="body1" gutterBottom>
          I'm a Data Scientist, but i also like to build websites, and develop
          apps in Python.
        </Typography>
        <Typography color="textSecondary" variant="h5" gutterBottom>
          Get in touch
        </Typography>
        <div
          id="contact-container"
          style={{
            width: '100%',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <Stack
            spacing={{ xs: 1 }}
            direction="row"
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
            style={{
              width: '100%',
            }}
          >
            <Chip
              icon={<AlternateEmailIcon />}
              label="dorian.voydie@gmail.com"
              // Onclick send mail to the email
              onClick={() => window.open('mailto:dorian.voydie@gmail.com')}
            />
            <Chip
              icon={<LinkedInIcon />}
              label="in/dorian-voydie"
              onClick={() =>
                window.open('https://www.linkedin.com/in/dorian-voydie/')
              }
            />
            <Chip
              icon={<GitHubIcon />}
              label="Dodalpaga"
              onClick={() =>
                window.open('https://github.com/Dodalpaga?tab=repositories')
              }
            />
            <Chip
              icon={<CodeIcon />}
              label="dorianvoydie"
              onClick={() => window.open('https://www.kaggle.com/dorianvoydie')}
            />
          </Stack>
        </div>
        <Typography color="textSecondary" variant="h5" gutterBottom>
          Skill set
        </Typography>
        <div
          id="skill-set-container"
          style={{
            width: '100%',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <Stack
            spacing={{ xs: 1 }}
            direction="row"
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
            style={{
              width: '100%',
            }}
          >
            <Chip label="Machine Learning" variant="outlined" />
            <Chip label="Data Science" variant="outlined" />
            <Chip label="Generative AI" variant="outlined" />
            <Chip label="React.js" variant="outlined" />
            <Chip label="Next.js" variant="outlined" />
          </Stack>
        </div>
      </div>

      {/* Main Scrollable Content Section */}
      <div
        style={{
          marginLeft: 'calc(20%)', // The content starts after the fixed left section
          width: '80%', // Takes the remaining 80% of the width
        }}
      >
        {/* Experience Section */}
        <section id="experience" style={sectionStyle}>
          <Typography variant="h4" gutterBottom sx={titleStyle}>
            Experience
          </Typography>
          <Typography variant="body1" sx={descriptionStyle}>
            Here’s a summary of my professional experience.
          </Typography>
        </section>

        {/* Skills Section */}
        <section id="skills" style={sectionStyle}>
          <Typography variant="h4" gutterBottom sx={titleStyle}>
            Skills
          </Typography>
          <Typography variant="body1" sx={descriptionStyle}>
            These are the skills I’ve acquired over the years.
          </Typography>
        </section>

        {/* Projects Section */}
        <section id="projects" style={sectionStyle}>
          <Typography variant="h4" gutterBottom sx={titleStyle}>
            Projects
          </Typography>
          <Typography variant="body1" sx={descriptionStyle}>
            Check out some of my projects.
          </Typography>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          style={{
            ...sectionStyle, // Keep the base section styles
            height: 'calc(100vh - 134px)', // Specific height for the contact section
          }}
        >
          <Typography variant="h4" gutterBottom sx={titleStyle}>
            Contact
          </Typography>
          <Typography variant="body1" sx={descriptionStyle}>
            Feel free to get in touch with me!
          </Typography>
          <Button variant="contained" color="primary" sx={buttonStyle}>
            Get in Touch
          </Button>
        </section>
      </div>
    </Container>
  );
}
