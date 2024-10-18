// content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Link, List, ListItem } from '@mui/material';
import CountUp from 'react-countup';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import CodeIcon from '@mui/icons-material/Code';
import '../globals.css'; // Ensure global styles are correctly imported
import './styles.css';
import { useThemeContext } from '../../context/ThemeContext';
import InfoCard from '../../components/infocard';
import CustomChip from '../../components/customchip';
import {
  SiPandas,
  SiNumpy,
  SiPytorch,
  SiScikitlearn,
  SiTensorflow,
  SiLangchain,
  SiFastapi,
  SiDjango,
  SiDocker,
  SiPostgresql,
  SiPrometheus,
  SiPostman,
  SiGrafana,
  SiStreamlit,
  SiReact,
  SiGitlab,
  SiConfluence,
  SiJira,
  SiNextdotjs,
  SiRaspberrypi,
  SiNvidia,
  SiOpencv,
  SiPlotly,
  SiJenkins,
  SiFolium,
  SiElasticsearch,
  SiKibana,
  SiLogstash,
} from 'react-icons/si';
import { VscGraphScatter } from 'react-icons/vsc';
import { GiHistogram } from 'react-icons/gi';

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

const titleStyle = {
  marginBottom: '20px',
};

const descriptionItemStyle = {
  display: 'list-item',
  textAlign: 'left',
  padding: '4px',
};

export default function Content() {
  const { theme } = useThemeContext();
  const startDate = 'Dec 2022';
  const yearsSpent = getYearsSpent('2022-12-01');
  const totalExperience = getYearsSpent('2021-09-01');

  // Define foreground colors based on the theme
  const foreground = theme === 'dark' ? 'ffffff' : '000000'; // Adjust colors as necessary

  return (
    <Container maxWidth={false} className="content-container">
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
        <section id="profile-section">
          <Typography variant="h4">Experience</Typography>
          <Typography variant="body1" gutterBottom sx={titleStyle}>
            ({totalExperience}+ years)
          </Typography>

          {/* Experience Thales */}
          <div className="experience">
            <InfoCard
              startDate={startDate}
              yearsSpent={yearsSpent}
              companyName="Thales Services Numériques"
              location="Toulouse Area, France"
              imageSrc="/assets/thales.png"
            />
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
                marginTop: '20px',
              }}
            >
              <Box
                style={{
                  textAlign: 'center',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Scientific Development</Typography>
                <CustomChip label="Pandas" icons={[<SiPandas key="skill" />]} />
                <CustomChip label="Numpy" icons={[<SiNumpy key="skill" />]} />
                <CustomChip
                  label="Pytorch"
                  icons={[<SiPytorch key="skill" />]}
                />
                <CustomChip
                  label="Streamlit"
                  icons={[<SiStreamlit key="skill" />]}
                />
                <CustomChip label="Folium" icons={[<SiFolium key="skill" />]} />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Software Development</Typography>
                <CustomChip
                  label="Django / FastAPI"
                  icons={[<SiFastapi key="skill" />, <SiDjango key="skill" />]}
                />
                <CustomChip label="Docker" icons={[<SiDocker key="skill" />]} />
                <CustomChip
                  label="SQL"
                  icons={[<SiPostgresql key="skill" />]}
                />
                <CustomChip
                  label="Prometheus"
                  icons={[<SiPrometheus key="skill" />]}
                />
                <CustomChip
                  label="Postman"
                  icons={[<SiPostman key="skill" />]}
                />
                <CustomChip
                  label="Jenkins"
                  icons={[<SiJenkins key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Artificial Intelligence</Typography>
                <CustomChip
                  label="Scikit Learn"
                  icons={[<SiScikitlearn key="skill" />]}
                />
                <CustomChip
                  label="Tensorflow"
                  icons={[<SiTensorflow key="skill" />]}
                />
                <CustomChip
                  label="LangChain"
                  icons={[<SiLangchain key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Frontend</Typography>
                <CustomChip
                  label="Next.js"
                  icons={[<SiNextdotjs key="skill" />]}
                />
                <CustomChip label="React" icons={[<SiReact key="skill" />]} />
                <CustomChip
                  label="Grafana"
                  icons={[<SiGrafana key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Data Management</Typography>
                <CustomChip
                  label="ElasticSearch"
                  icons={[<SiElasticsearch key="skill" />]}
                />
                <CustomChip label="Kibana" icons={[<SiKibana key="skill" />]} />
                <CustomChip
                  label="Logstash"
                  icons={[<SiLogstash key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Projects Management & CICD</Typography>
                <CustomChip
                  label="GitLab (& CI)"
                  icons={[<SiGitlab key="skill" />]}
                />
                <CustomChip
                  label="Confluence"
                  icons={[<SiConfluence key="skill" />]}
                />
                <CustomChip label="JIRA" icons={[<SiJira key="skill" />]} />
              </Box>
            </Stack>
          </div>

          <Divider sx={{ m: 2 }} />

          {/* Experience Atos */}
          <div className="experience">
            <InfoCard
              startDate="Sept 2021"
              endDate="Nov 2022"
              yearsSpent={1}
              companyName="Atos France"
              location="Toulouse Area, France"
              imageSrc="/assets/atos.png"
            />
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
                marginTop: '20px',
              }}
            >
              <Box
                style={{
                  textAlign: 'center',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Embedded Systems</Typography>
                <CustomChip
                  label="Raspberry Pi"
                  icons={[<SiRaspberrypi key="skill" />]}
                />
                <CustomChip
                  label="Jetson Nano"
                  icons={[<SiNvidia key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Machine Learning</Typography>
                <CustomChip label="OpenCV" icons={[<SiOpencv key="skill" />]} />
                <CustomChip
                  label="Data Analysis"
                  icons={[<VscGraphScatter key="skill" />]}
                />
                <CustomChip
                  label="Predictive Models"
                  icons={[<GiHistogram key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Data Visualization</Typography>
                <CustomChip
                  label="Dash Plotly"
                  icons={[<SiPlotly key="skill" />]}
                />
                <CustomChip
                  label="Grafana"
                  icons={[<SiGrafana key="skill" />]}
                />
              </Box>
            </Stack>
          </div>
        </section>

        {/* Education Section */}
        <section id="profile-section">
          <Typography variant="h4" gutterBottom sx={titleStyle}>
            Education
          </Typography>
          <Grid container spacing={2}>
            <Link></Link>
            <Grid
              item
              xs={12}
              sm={6}
              md={6}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Card
                sx={{
                  maxWidth: 345,
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              >
                <CardActionArea
                  href="https://www.insa-toulouse.fr/valorisation-des-donnees-massives/"
                  target="_blank"
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image="/assets/insa-toulouse.webp"
                    alt="insa toulouse"
                    sx={{
                      padding: '10px',
                      maxHeight: '100px',
                      objectFit: 'contain',
                    }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      INSA Toulouse
                    </Typography>
                    <Typography variant="body2">
                      MsC spécialisé VALDOM : Valorisation des données massives.
                      Compétences clef : Big Data, Machine Learning, Cloud.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={6}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Card
                sx={{
                  maxWidth: 345,
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              >
                <CardActionArea
                  href="https://www.supmicrotech.fr/"
                  target="_blank"
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image="/assets/ensmm.png"
                    alt="ensmm"
                    sx={{
                      padding: '10px',
                      maxHeight: '100px',
                      objectFit: 'contain',
                    }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Supmicrotech ENSMM
                    </Typography>
                    <Typography variant="body2">
                      Ecole d&apos;ingénieur, avec spécialisation en conception
                      et réalisation d&apos;objets connectés. Compétences clef :
                      Embedded Systems, Machine Learning, Network, Cloud, OOP.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </section>
      </div>
    </Container>
  );
}
