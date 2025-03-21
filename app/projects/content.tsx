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
    title: 'Satellite Segmenter',
    image: `/images/earth.jpg`, // Update with your actual image path
    link: '/projects/satellite_segmentation', // Update with your actual routes
    target: '',
    description:
      'Select a tile from the Earth map, and this app will provide a segmented version of that tile, \
      highlighting different features and regions. Ideal for analyzing satellite images and extracting valuable insights.',
  },
  {
    title: 'Chat Bot',
    image: `/images/chatbot.png`, // Update with your actual image path
    link: '/projects/chatbot', // Update with your actual routes
    target: '',
    description:
      'A chatbot you can interact with. It has been fine-tuned on my resume, previous projects, and other relevant information about me.',
  },
  {
    title: 'Snowflakes',
    image: `/images/snowflakes.jpeg`, // Update with your actual image path
    link: '/projects/snowflakes', // Update with your actual routes
    target: '',
    description:
      'Learn how snowflakes are formed, depending on conditions such as temperature and humidity levels.',
  },
  {
    title: 'ISS',
    image: `/images/iss-artwork.jpg`, // Update with your actual image path
    link: '/projects/iss', // Update with your actual routes
    target: '',
    description:
      'The ISS live information, such as position, people on board, spacecraft dockerd, etc.',
  },
  {
    title: 'Jupyter Notebooks',
    image: `/images/jupyter.jpg`, // Update with your actual image path
    link: '/projects/notebooks', // Update with your actual routes
    target: '',
    description:
      'A collection of my notebooks focused on artificial intelligence, machine learning, and algorithmic problem-solving.',
  },
  {
    title: 'Image Detection',
    image: `/images/detection.jpeg`, // Update with your actual image path
    link: '/projects/image_detection', // Update with your actual routes
    target: '',
    description:
      'Utilizing the power of YOLO (You Only Look Once), this application enables real-time object detection within images.',
  },
  {
    title: 'Code Interpreter',
    image: `/images/cmd.jpg`, // Update with your actual image path
    link: '/projects/code_interpreter', // Update with your actual routes
    target: '',
    description:
      'An advanced code editor with support for multiple programming languages including JavaScript, Python, and more. This tool allows you to write, interpret, and execute code directly within the app, making it perfect for testing and debugging.',
  },
  {
    title: 'Processing Apps',
    image: `/images/drawing.jpg`, // Update with your actual image path
    link: '/projects/processing_apps', // Update with your actual routes
    target: '',
    description:
      'Explore and interact with sketches created using the p5.js framework. This app gathers and showcases various creative and interactive visual projects, providing an engaging experience for users interested in generative art and creative coding.',
  },
  {
    title: 'Music Production',
    image: `/images/music_producer.jpg`, // Update with your actual image path
    link: '/projects/media_player', // Update with your actual routes
    target: '',
    description:
      'I produce electronic music in my free time, experimenting with different sounds and styles to create unique tracks.',
  },
  {
    title: 'Travels',
    image: `/images/traveler.jpg`, // Update with your actual image path
    link: '/projects/travels', // Update with your actual routes
    target: '',
    description:
      'I Love to travel, you can keep track with the countries i have visited until now !',
  },
  {
    title: 'Guess What',
    image: `/images/guesswhat.png`, // Update with your actual image path
    link: 'https://guess-what.onrender.com/', // Update with your actual routes
    target: '_blank',
    description:
      'In this game, you have to guess what the image is. You can play with your friends and family. The game is a classic guessing game. Play and have fun!',
  },
  {
    title: 'Richesses du Monde',
    image: `/images/richesses_du_monde.png`, // Update with your actual image path
    link: 'https://richesses-du-monde.onrender.com/', // Update with your actual routes
    target: '_blank',
    description:
      'This game is a french Monopoly-like board-game where you can play with your friends and family. Buy the resources and build your own capitalist empire ! Play and have fun!',
  },
  {
    title: 'Cognitive Game',
    image: `/images/cognitive.jpg`, // Update with your actual image path
    link: 'https://cognitive-game.netlify.app/', // Update with your actual routes
    target: '_blank',
    description:
      'In this game, you have to type as fast as you can on the matching arrows. Each pattern you get right gets you 1 point. But be careful, if you make a mistake you will lose a precious time ! Play and have fun!',
  },
  {
    title: 'Three.js website template',
    image: `/images/threejs.png`, // Update with your actual image path
    link: 'https://boat-configurator.netlify.app/', // Update with your actual routes
    target: '_blank',
    description:
      'This website was a draft for the SEAWOLF project. Its development has been stopped and replaced by the official website.',
  },
  {
    title: 'SEAWOLF Website',
    image: `/images/SEAWOLF.png`, // Update with your actual image path
    link: 'https://seawolf.netlify.app/', // Update with your actual routes
    target: '_blank',
    description:
      'This website is a work in progress for SEAWOLF, a boat manufacturing company developed by Laurent SOURDILLE who developed his own open-hull boat designed for fishing and diving.',
  },
  {
    title: 'VBSO Website',
    image: `/images/vbso.png`, // Update with your actual image path
    link: 'https://vbso.fr/', // Update with your actual routes
    target: '_blank',
    description:
      'The Saint-Orens Volleyball Club (VBSO) is a local sports association near Toulouse, offering competitive teams for men, women, and mixed groups, as well as recreational volleyball for adults. The club also focuses on youth development with training for ages 9-18.',
  },
  {
    title: 'Template',
    image: `/images/template.png`, // Update with your actual image path
    link: '/projects/template', // Update with your actual routes
    target: '',
    description:
      'A customizable template designed to kickstart your project. This app provides a flexible framework for various use cases, allowing you to quickly adapt it to your specific needs and functionalities.',
  },
];

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
      <Grid container spacing={4}>
        {apps.map((app, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Link href={app.link} target={app.target}>
              <Card className="card">
                <CardContent
                  sx={{
                    padding: 2,
                    minHeight: '40px',
                    height: '20%', // Adjust height as needed
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    justifyContent: 'center', // Center the content vertically
                  }}
                >
                  <Typography variant="h6" component="div">
                    {app.title}
                  </Typography>
                </CardContent>
                <CardMedia
                  component="img"
                  image={app.image}
                  alt={app.title}
                  sx={{
                    flexGrow: 1, // Take remaining space
                    width: '100%', // Full width of the card
                    height: 'auto',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    overflow: 'hidden',
                  }}
                />
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
