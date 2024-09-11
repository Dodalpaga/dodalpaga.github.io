// content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import '../globals.css'; // Ensure global styles are correctly imported

const apps = [
  {
    title: 'Satellite Imagery Segmenter',
    image: '/assets/sentinel-2.png', // Update with your actual image path
    link: '/satellite_segmentation', // Update with your actual routes
    description:
      'This is a brief description of App 1, highlighting its main features and purpose.',
  },
  {
    title: 'Code Interpreter',
    image: '/assets/template.png', // Update with your actual image path
    link: '/code_interpreter', // Update with your actual routes
    description:
      'This is a brief description of a template, showcasing its unique functionalities.',
  },
  {
    title: 'Processing Apps',
    image: '/assets/template.png', // Update with your actual image path
    link: '/processing_apps', // Update with your actual routes
    description:
      'This is a brief description of a template, showcasing its unique functionalities.',
  },
  {
    title: 'Template',
    image: '/assets/template.png', // Update with your actual image path
    link: '/template', // Update with your actual routes
    description:
      'This is a brief description of a template, showcasing its unique functionalities.',
  },
];

export default function Content() {
  const router = useRouter();

  const handleCardClick = (link: string) => {
    router.push(link);
  };

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
      <Grid container spacing={4}>
        {apps.map((app, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              className="card"
              sx={{
                position: 'relative',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                overflow: 'hidden',
                width: '100%', // Set width to 100% of the grid item
                aspectRatio: '1 / 1', // Maintain a 1:1 aspect ratio
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={() => handleCardClick(app.link)}
            >
              <CardMedia
                component="img"
                image={app.image}
                alt={app.title}
                sx={{
                  height: '80%', // Adjust height as needed
                  width: '100%', // Full width of the card
                  objectFit: 'contain', // Maintain aspect ratio and fit within the card
                  objectPosition: 'center', // Center image horizontally and vertically
                }}
              />
              <CardContent
                sx={{
                  textAlign: 'center',
                  padding: 2,
                  flexGrow: 1, // Take remaining space
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center', // Center the content vertically
                }}
              >
                <Typography variant="h6" component="div">
                  {app.title}
                </Typography>
              </CardContent>
              {/* Description overlay */}
              <div className="card-overlay">
                <Typography variant="h4">{app.title}</Typography>
                <Typography variant="body2">{app.description}</Typography>
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
