// content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
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
          <div className="profile-picture-container">
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
          <Typography
            className="title"
            color="textSecondary"
            variant="h5"
            gutterBottom
          >
            About
          </Typography>
          <Typography color="textPrimary" variant="body1" gutterBottom>
            I'm a Data Scientist, but i also like to build websites, and develop
            apps in Python.
          </Typography>
        </div>

        <div className="left-container">
          {' '}
          <Typography
            className="title"
            color="textSecondary"
            variant="h5"
            gutterBottom
          >
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
              className="contact-stack"
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
                onClick={() =>
                  window.open('https://www.kaggle.com/dorianvoydie')
                }
              />
            </Stack>
          </div>
          <Typography
            className="title"
            color="textSecondary"
            variant="h5"
            gutterBottom
          >
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
              className="skill-stack"
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
      </div>

      {/* Main Scrollable Content Section */}
      <div className="right-scrollable">
        {/* Experience Section */}
        <section id="experience" style={sectionStyle}>
          <Typography variant="h4" gutterBottom sx={titleStyle}>
            Experience
          </Typography>
          <Typography variant="body1" sx={descriptionStyle}>
            Here’s a summary of my professional experience.
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
        </section>
      </div>
    </Container>
  );
}
