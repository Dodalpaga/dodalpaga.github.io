// content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { List, ListItem } from '@mui/material';
import CountUp from 'react-countup';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';
import '../globals.css'; // Ensure global styles are correctly imported

// Helper function to compute the years spent
const getYearsSpent = (startDateString: string) => {
  const startDate = new Date(startDateString);
  const currentDate = new Date();

  const yearsSpent = currentDate.getFullYear() - startDate.getFullYear();
  const monthDifference = Math.abs(
    currentDate.getMonth() - startDate.getMonth()
  );

  // If you spend more than 6 months on the project, consider it a full year
  if (monthDifference > 6) {
    return yearsSpent - 1;
  }

  return yearsSpent;
};

const sectionStyle = {
  padding: '10px 20px 20px 20px',
  display: 'flex',
  flexDirection: 'column' as 'column', // Explicitly set as one of the allowed values
  width: '100%',
  textAlign: 'center' as 'center', // TypeScript might also need this to be explicit
  position: 'relative' as 'relative', // Similar for position
};

const titleStyle = {
  marginBottom: '20px',
};

const descriptionItemStyle = {
  display: 'list-item',
  textAlign: 'left',
  padding: '4px',
};

const rgbToHex = (rgb: string) => {
  const result = rgb.match(/\d+/g);
  if (!result) return '#444444'; // Fallback color
  return result
    .slice(0, 3)
    .map((num) => {
      const hex = parseInt(num, 10).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
};

export default function Content() {
  // Thales Start Date
  const startDate = 'Dec 2022';
  const yearsSpent = getYearsSpent('2022-12-01');

  const totalExperience = getYearsSpent('2021-09-01');

  const [foreground, setForeground] = React.useState('#444444'); // Default color

  React.useEffect(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const color = rootStyle.getPropertyValue('--foreground').trim();
    if (color) {
      setForeground(rgbToHex(color));
    }
  }, []);

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
      <div className="left-fixed left-profile">
        <div className="introduction left-container">
          <div className="profile-picture-container">
            <Card
              className="card"
              sx={{
                width: 'auto',
              }}
            >
              <CardMedia
                component="img"
                image={`/assets/id.png`}
                alt={'Profile Picture'}
                sx={{
                  height: '100%', // Adjust height as needed
                  objectFit: 'contain', // Maintain aspect ratio and fit within the card
                  objectPosition: 'center', // Center image horizontally and vertically
                }}
              />
            </Card>
          </div>
          <Typography className="title" variant="h5" gutterBottom>
            About
          </Typography>
          <Typography variant="body1" gutterBottom>
            I&apos;m a Data Scientist, but i also like to build websites, and
            develop apps in Python.
          </Typography>
        </div>

        <div className="left-container">
          {' '}
          <Typography className="title" variant="h5" gutterBottom>
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
          <Typography className="title" variant="h5" gutterBottom>
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
              <Chip label="Python" variant="outlined" />
              <Chip label="Data Science" variant="outlined" />
              <Chip label="Generative AI" variant="outlined" />
              <Chip label="React.js" variant="outlined" />
              <Chip label="Next.js" variant="outlined" />
              <Chip label="Typescript" variant="outlined" />
            </Stack>
          </div>
          <Typography className="title" variant="h5" gutterBottom>
            Coding Stats
          </Typography>
          <Stack
            id="skill-set-container"
            direction="row"
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <img
              src={`https://github-readme-stats.vercel.app/api?username=Dodalpaga&title_color=${encodeURIComponent(foreground)}&text_color=${encodeURIComponent(foreground)}&hide_rank=true&include_all_commits=true&show_icons=true&theme=transparent&count_private=true&hide=contribs,issues`}
              alt="GitHub Stats"
            />
            <img
              src={`https://github-readme-stats.vercel.app/api/top-langs/?username=Dodalpaga&title_color=${encodeURIComponent(foreground)}&text_color=${encodeURIComponent(foreground)}&layout=compact&theme=transparent&count_private=true&hide=c,java,c%2B%2B,css,procfile`}
              alt="Top Languages"
            />
            <img
              src={`https://github-readme-streak-stats.herokuapp.com?user=Dodalpaga&theme=transparent&currStreakLabel=${encodeURIComponent(foreground)}&currStreakNum=EB5454&fire=EB5454&ring=${encodeURIComponent(foreground)}&sideNums=${encodeURIComponent(foreground)}&sideLabels=${encodeURIComponent(foreground)}`}
              alt="GitHub Streak"
            />
          </Stack>
        </div>
      </div>

      {/* Main Scrollable Content Section */}
      <div className="right-scrollable">
        {/* Experience Section */}
        <section id="experience-section" style={sectionStyle}>
          <Typography variant="h4">Experience</Typography>
          <Typography variant="body1" gutterBottom sx={titleStyle}>
            ({totalExperience}+ years)
          </Typography>

          {/* Experience Thales */}
          <div className="experience">
            {/* Dates and location */}
            <Typography variant="body2">
              {startDate} - Present (~{yearsSpent} years)
            </Typography>
            <Typography variant="body2">Toulouse Area, France</Typography>

            {/* Company Name */}
            <Typography variant="h5">Thales Services Numériques</Typography>

            {/* Description */}
            <Typography variant="body1">
              Participated in various{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                international projects
              </Typography>
              , initially as a Data Engineer on the European{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                Galileo
              </Typography>{' '}
              system software, and then as a Python Developer on the ground
              segment of the{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                Euclid
              </Typography>{' '}
              satellite. I contributed to numerous proposal writings and studies
              for{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                CNES
              </Typography>{' '}
              and achieved a strong{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                mastery of Python
              </Typography>
              .
            </Typography>

            {/* Detailed responsibilities */}
            <List
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: 'calc(100% - 40px)',
                marginLeft: 'auto' /* Pushes the List to the right */,
              }}
            >
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  -{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    Applied AI
                  </Typography>{' '}
                  and{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    data science
                  </Typography>{' '}
                  expertise in the fields of{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    satellite image analysis
                  </Typography>
                  ,{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    generative AI
                  </Typography>{' '}
                  and{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    signal processing
                  </Typography>
                  .
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Developed and{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    deployed pipelines
                  </Typography>{' '}
                  to automate data processing workflows,
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    {' '}
                    reducing processing time by 50%
                  </Typography>{' '}
                  in some cases.
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Created{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    AI-based
                  </Typography>{' '}
                  conversational agents to improve user interactions.
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Built full-stack{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    containerized
                  </Typography>{' '}
                  applications using{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    Docker
                  </Typography>
                  , deploying{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    APIs
                  </Typography>{' '}
                  and monitoring solutions, leading to real-time data analysis
                  capabilities.
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Collaborated with cross-functional teams to{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    respond to CFTs
                  </Typography>{' '}
                  (Call for Tenders) and deliver studies for the CNES.
                </Typography>
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ padding: 1 }}>
              Projects developed :{' '}
              <Typography
                variant="body2"
                component="span"
                sx={{ fontWeight: 'bold' }}
              >
                <CountUp
                  end={4}
                  duration={5}
                  enableScrollSpy={true} // set this to true
                  scrollSpyOnce={true} // set this to true
                />
              </Typography>
            </Typography>

            <Stack
              spacing={{ xs: 1, sm: 2 }}
              direction="row"
              useFlexGap
              sx={{
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Box
                style={{
                  textAlign: 'left',
                }}
                sx={{ p: 2, border: '1px dashed grey', borderRadius: '15px' }}
              >
                <Typography variant="body1">Python</Typography>
                <Chip label="Pandas" />
                <Chip label="Numpy" />
                <Chip label="Pytorch" />
              </Box>
              <Box
                style={{
                  textAlign: 'left',
                }}
                sx={{ p: 2, border: '1px dashed grey', borderRadius: '15px' }}
              >
                <Typography variant="body1">Artificial Intelligence</Typography>
                <Chip label="Machine Learning" />
                <Chip label="Deep Learning" />
                <Chip label="NLP" />
                <Chip label="LLM" />
              </Box>
              <Box
                style={{
                  textAlign: 'left',
                }}
                sx={{ p: 2, border: '1px dashed grey', borderRadius: '15px' }}
              >
                <Typography variant="body1">Backend</Typography>
                <Chip label="REST APIs" />
                <Chip label="Docker" />
                <Chip label="SQL" />
                <Chip label="Prometheus" />
              </Box>
              <Box
                style={{
                  textAlign: 'left',
                }}
                sx={{ p: 2, border: '1px dashed grey', borderRadius: '15px' }}
              >
                <Typography variant="body1">Projects Management</Typography>
                <Chip label="GitLab (& CI)" />
                <Chip label="Confluence" />
                <Chip label="JIRA" />
              </Box>
            </Stack>
          </div>

          <Divider sx={{ m: 2 }} />

          {/* Experience Atos */}
          <div className="experience">
            {/* Dates and location */}
            <Typography variant="body2">
              Sep 2021 - Nov 2022 (~1 year)
            </Typography>
            <Typography variant="body2">Toulouse Area, France</Typography>

            {/* Company Name */}
            <Typography variant="h5">Atos France</Typography>

            {/* Description */}
            <Typography variant="body1">
              In parallel with my{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                MsC
              </Typography>{' '}
              (called VALDOM, in apprenticeship contract between INSA Toulouse &
              ENSEEIHT), I contributed to various{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                AI and embedded machine learning
              </Typography>{' '}
              projects, including{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                predictive maintenance
              </Typography>{' '}
              of physical systems and{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                defect detection
              </Typography>{' '}
              on aircraft fuselages.
            </Typography>

            {/* Detailed responsibilities */}
            <List
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: 'calc(100% - 40px)',
                marginLeft: 'auto',
              }}
            >
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Developed{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    embedded instrumentation
                  </Typography>{' '}
                  and conducted experiments on{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    Raspberry Pi
                  </Typography>{' '}
                  and{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    Jetson Nano
                  </Typography>
                  .
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  -{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    Analyzed
                  </Typography>{' '}
                  and{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    structured
                  </Typography>{' '}
                  data, and designed architectures for{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    machine learning models
                  </Typography>
                  .
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Developed{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    computer vision AI models
                  </Typography>{' '}
                  to visually detect defects on aircraft fuselages.
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Created dashboards for{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    data visualization
                  </Typography>{' '}
                  of model predictions.
                </Typography>
              </ListItem>
            </List>
            <Typography variant="body1">
              Authored a paper for the{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                IFAC 2023 conference
              </Typography>{' '}
              and contributed to a{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                patent
              </Typography>
              .
            </Typography>

            {/* Skills Stack */}
            <Stack
              spacing={{ xs: 1, sm: 2 }}
              direction="row"
              useFlexGap
              sx={{
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Box
                style={{
                  textAlign: 'left',
                }}
                sx={{ p: 2, border: '1px dashed grey', borderRadius: '15px' }}
              >
                <Typography variant="body1">Embedded Systems</Typography>
                <Chip label="Raspberry Pi" />
                <Chip label="Jetson Nano" />
              </Box>
              <Box
                style={{
                  textAlign: 'left',
                }}
                sx={{ p: 2, border: '1px dashed grey', borderRadius: '15px' }}
              >
                <Typography variant="body1">Machine Learning</Typography>
                <Chip label="Computer Vision" />
                <Chip label="Data Analysis" />
              </Box>
              <Box
                style={{
                  textAlign: 'left',
                }}
                sx={{ p: 2, border: '1px dashed grey', borderRadius: '15px' }}
              >
                <Typography variant="body1">Data Visualization</Typography>
                <Chip label="Dashboards" />
                <Chip label="Grafana" />
                <Chip label="Predictive Models" />
              </Box>
            </Stack>
          </div>
        </section>

        {/* Education Section */}
        <section
          id="education"
          style={{
            ...sectionStyle, // Keep the base section styles
          }}
        >
          <Typography variant="h4" gutterBottom sx={titleStyle}>
            Education
          </Typography>
          <Typography variant="body1">Coming soon...</Typography>
        </section>
      </div>
    </Container>
  );
}
