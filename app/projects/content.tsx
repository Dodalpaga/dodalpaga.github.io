// content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import '../globals.css'; // Ensure global styles are correctly imported

const apps = [
  {
    title: 'Satellite Imagery Segmenter',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/earth.jpg`, // Update with your actual image path
    link: '/projects/satellite_segmentation', // Update with your actual routes
    target: '',
    description:
      'Select a tile from the Earth map, and this app will provide a segmented version of that tile, \
      highlighting different features and regions. Ideal for analyzing satellite images and extracting valuable insights.',
  },
  {
    title: 'Image Detection',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/detection.jpeg`, // Update with your actual image path
    link: '/projects/image_detection', // Update with your actual routes
    target: '',
    description:
      'Utilizing the power of YOLO (You Only Look Once), this application enables real-time object detection within images. \
      By processing the uploaded images, the app identifies and highlights various objects, providing users with instant visual feedback. \
      Ideal for applications in surveillance, traffic monitoring, and inventory management, this tool transforms static images into dynamic insights, \
      enhancing the ability to analyze and interpret visual data effectively.',
  },
  {
    title: 'Code Interpreter',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/cmd.jpg`, // Update with your actual image path
    link: '/projects/code_interpreter', // Update with your actual routes
    target: '',
    description:
      'An advanced code editor with support for multiple programming languages including JavaScript, Python, and more. This tool allows you to write, interpret, and execute code directly within the app, making it perfect for testing and debugging.',
  },
  {
    title: 'Processing Apps',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/drawing.jpg`, // Update with your actual image path
    link: '/projects/processing_apps', // Update with your actual routes
    target: '',
    description:
      'Explore and interact with sketches created using the p5.js framework. This app gathers and showcases various creative and interactive visual projects, providing an engaging experience for users interested in generative art and creative coding.',
  },
  {
    title: 'Guess What',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/guesswhat.png`, // Update with your actual image path
    link: 'https://guess-what.onrender.com/', // Update with your actual routes
    target: '_blank',
    description:
      'In this game, you have to guess what the image is. You can play with your friends and family. The game is a classic guessing game. Play and have fun!',
  },
  {
    title: 'Richesses du Monde',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/richesses_du_monde.png`, // Update with your actual image path
    link: 'https://richesses-du-monde.onrender.com/', // Update with your actual routes
    target: '_blank',
    description:
      'This game is a french Monopoly-like board-game where you can play with your friends and family. Buy the resources and build your own capitalist empire ! Play and have fun!',
  },
  {
    title: 'Cognitive Game',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/cognitive.png`, // Update with your actual image path
    link: 'https://cognitive-game.netlify.app/', // Update with your actual routes
    target: '_blank',
    description:
      'In this game, you have to type as fast as you can on the matching arrows. Each pattern you get right gets you 1 point. But be careful, if you make a mistake you will lose a precious time ! Play and have fun!',
  },
  {
    title: 'Three.js website template',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/threejs.png`, // Update with your actual image path
    link: 'https://boat-configurator.netlify.app/', // Update with your actual routes
    target: '_blank',
    description:
      'This website was a draft for the SEAWOLF project. Its development has been stopped and replaced by the official website.',
  },
  {
    title: 'SEAWOLF Website',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/SEAWOLF.png`, // Update with your actual image path
    link: 'https://seawolf.netlify.app/', // Update with your actual routes
    target: '_blank',
    description:
      'This website is a work in progress for SEAWOLF, a boat manufacturing company developed by Laurent SOURDILLE who developed his own open-hull boat designed for fishing and diving for professionals and private customers.',
  },
  {
    title: 'VBSO Website',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/vbso.png`, // Update with your actual image path
    link: 'https://vbso.fr/', // Update with your actual routes
    target: '_blank',
    description:
      'The Saint-Orens Volleyball Club (VBSO) is a local sports association near Toulouse, offering competitive teams for men, women, and mixed groups, as well as recreational volleyball for adults. The club also focuses on youth development with training for ages 9-18.',
  },
  {
    title: 'Template',
    image: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/template.png`, // Update with your actual image path
    link: '/projects/template', // Update with your actual routes
    target: '',
    description:
      'A customizable template designed to kickstart your project. This app provides a flexible framework for various use cases, allowing you to quickly adapt it to your specific needs and functionalities.',
  },
];

export default function Content() {
  console.log(`${process.env.NEXT_PUBLIC_BASE_PATH}`);
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
            <Link href={app.link} target={app.target}>
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
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0) 60%)',
                    WebkitMaskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0) 60%)',
                    backgroundColor: '#e5e7eb', // Background color behind transparent areas of image
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
                  <Typography variant="body1">{app.description}</Typography>
                </div>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
