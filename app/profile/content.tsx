'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Link, List, ListItem } from '@mui/material';
import Image from 'next/image';
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
import '../globals.css';
import './styles.css';
import { useThemeContext } from '@/context/ThemeContext';
import InfoCard from '@/components/infocard';
import CustomChip from '@/components/customchip';
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
import type { IconType } from 'react-icons';

// Helper component to safely render icons
const SafeIcon: React.FC<{ Icon: IconType; [key: string]: any }> = ({
  Icon,
  ...props
}) => {
  const IconComponent = Icon as React.ComponentType<any>;
  return <IconComponent {...props} />;
};

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
  const foreground = theme === 'dark' ? 'ffffff' : '000000';

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
                image={`/images/pp.jpeg`}
                alt={'Profile Picture'}
                sx={{
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
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
            <Image
              src="/images/capsule/Capsule.png"
              alt="Capsule"
              width={0}
              height={0}
              style={{
                width: '60%',
                height: 'auto',
                display: 'block',
                margin: '1rem auto',
              }}
            />
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
            {/* <Image
              src={`https://github-readme-stats.vercel.app/api/top-langs/?username=Dodalpaga&title_color=${encodeURIComponent(foreground)}&text_color=${encodeURIComponent(foreground)}&layout=compact&theme=transparent&count_private=true&hide=java,css,procfile,html,jupyter%20notebook`}
              alt="Top Languages"
              width={500}
              height={200}
            /> */}
            <Image
              src={`https://github-readme-streak-stats.herokuapp.com?user=Dodalpaga&theme=transparent&currStreakLabel=${encodeURIComponent(foreground)}&currStreakNum=EB5454&fire=EB5454&ring=${encodeURIComponent(foreground)}&sideNums=${encodeURIComponent(foreground)}&sideLabels=${encodeURIComponent(foreground)}`}
              alt="GitHub Streak"
              width={500}
              height={200}
            />
          </Stack>
        </div>
      </div>

      {/* Main Scrollable Content Section */}
      <div className="right-scrollable">
        {/* Experience Section */}
        <section id="profile-section">
          <Typography variant="h3">Experience</Typography>
          <Typography variant="body1" sx={titleStyle}>
            ({totalExperience}+ years)
          </Typography>

          {/* Experience Thales */}
          <div className="experience">
            <InfoCard
              startDate={startDate}
              yearsSpent={yearsSpent}
              companyName="Thales Services Numériques"
              location="Toulouse Area, France"
              imageSrc={
                theme === 'dark'
                  ? '/images/thales-inverted.png'
                  : '/images/thales.png'
              }
            />
            {/* Description */}
            <Typography variant="body1">
              Participated in multiple{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                international projects
              </Typography>
              , initially as a Data Engineer on the European{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                Galileo
              </Typography>{' '}
              navigation system software, then as a Data Scientist on the{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                Euclid
              </Typography>{' '}
              satellite ground segment for{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                CNES - Centre National d’Etudes Spatiales
              </Typography>{' '}
              (Toulouse, France). Developed strong expertise in{' '}
              <Typography component="span" sx={{ fontWeight: 'bold' }}>
                Data Science, Python, LLM, and AI
              </Typography>
              , including participation in competitive coding challenges (ranked
              4/200 in corporate competitions).
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
                  - Applied{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    AI and data science techniques
                  </Typography>{' '}
                  to satellite image analysis, delivering insights for Earth
                  Observation applications.
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Designed and implemented{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    machine learning pipelines
                  </Typography>{' '}
                  for large-scale data processing.
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Created full-stack{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    containerized applications
                  </Typography>{' '}
                  (via{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    Docker
                  </Typography>
                  ) including APIs, monitoring solutions, and user interfaces.
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Managed projects end-to-end, coordinating{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    stakeholders, timelines, and deliverables
                  </Typography>
                  .
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Contributed to numerous{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    tenders and technical studies
                  </Typography>{' '}
                  for CNES.
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Developed{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    conversational agents
                  </Typography>{' '}
                  using advanced AI and LLM technologies.
                </Typography>
              </ListItem>
            </List>

            <Typography variant="h5">
              Total projects developed :{' '}
              <CountUp
                end={6}
                duration={5}
                enableScrollSpy={true}
                scrollSpyOnce={true}
              />
            </Typography>

            {/* Selected Project Experience */}
            <Typography variant="h6" sx={{ marginTop: '20px' }}>
              Selected Project Experience
            </Typography>
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
                  -{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    Technical Lead
                  </Typography>{' '}
                  for a 3–4 person cross-functional team (PM, Data Scientist,
                  DevOps, Security) on a €1.5M, 2-year{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    Generative AI project
                  </Typography>{' '}
                  for{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    ESRIN – ESA Centre for Earth Observation
                  </Typography>{' '}
                  (Frascati, Italy).
                </Typography>
              </ListItem>
              <ListItem sx={descriptionItemStyle}>
                <Typography variant="body1">
                  - Designed and delivered a{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    specialized scalable conversational assistant
                  </Typography>{' '}
                  using cutting-edge{' '}
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>
                    AI Agents and LLM
                  </Typography>{' '}
                  to help users navigate over 200+ Earth Observation collections
                  (tens of millions of data products), providing intelligent
                  recommendations, visualizations, access guidance, and more.
                </Typography>
              </ListItem>
            </List>

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
                  height: 'fit-content',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Scientific Development</Typography>
                <CustomChip
                  label="Pandas"
                  icons={[<SafeIcon Icon={SiPandas} key="skill" />]}
                />
                <CustomChip
                  label="Numpy"
                  icons={[<SafeIcon Icon={SiNumpy} key="skill" />]}
                />
                <CustomChip
                  label="Pytorch"
                  icons={[<SafeIcon Icon={SiPytorch} key="skill" />]}
                />
                <CustomChip
                  label="Streamlit"
                  icons={[<SafeIcon Icon={SiStreamlit} key="skill" />]}
                />
                <CustomChip
                  label="Folium"
                  icons={[<SafeIcon Icon={SiFolium} key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                  height: 'fit-content',
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
                  icons={[
                    <SafeIcon Icon={SiFastapi} key="skill1" />,
                    <SafeIcon Icon={SiDjango} key="skill2" />,
                  ]}
                />
                <CustomChip
                  label="Docker"
                  icons={[<SafeIcon Icon={SiDocker} key="skill" />]}
                />
                <CustomChip
                  label="SQL"
                  icons={[<SafeIcon Icon={SiPostgresql} key="skill" />]}
                />
                <CustomChip
                  label="Prometheus"
                  icons={[<SafeIcon Icon={SiPrometheus} key="skill" />]}
                />
                <CustomChip
                  label="Postman"
                  icons={[<SafeIcon Icon={SiPostman} key="skill" />]}
                />
                <CustomChip
                  label="Jenkins"
                  icons={[<SafeIcon Icon={SiJenkins} key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                  height: 'fit-content',
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
                  icons={[<SafeIcon Icon={SiScikitlearn} key="skill" />]}
                />
                <CustomChip
                  label="Tensorflow"
                  icons={[<SafeIcon Icon={SiTensorflow} key="skill" />]}
                />
                <CustomChip
                  label="LangChain"
                  icons={[<SafeIcon Icon={SiLangchain} key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                  height: 'fit-content',
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
                  icons={[<SafeIcon Icon={SiNextdotjs} key="skill" />]}
                />
                <CustomChip
                  label="React"
                  icons={[<SafeIcon Icon={SiReact} key="skill" />]}
                />
                <CustomChip
                  label="Grafana"
                  icons={[<SafeIcon Icon={SiGrafana} key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                  height: 'fit-content',
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
                  icons={[<SafeIcon Icon={SiElasticsearch} key="skill" />]}
                />
                <CustomChip
                  label="Kibana"
                  icons={[<SafeIcon Icon={SiKibana} key="skill" />]}
                />
                <CustomChip
                  label="Logstash"
                  icons={[<SafeIcon Icon={SiLogstash} key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                  height: 'fit-content',
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
                  icons={[<SafeIcon Icon={SiGitlab} key="skill" />]}
                />
                <CustomChip
                  label="Confluence"
                  icons={[<SafeIcon Icon={SiConfluence} key="skill" />]}
                />
                <CustomChip
                  label="JIRA"
                  icons={[<SafeIcon Icon={SiJira} key="skill" />]}
                />
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
              imageSrc="/images/atos.png"
            />
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
                  height: 'fit-content',
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
                  icons={[<SafeIcon Icon={SiRaspberrypi} key="skill" />]}
                />
                <CustomChip
                  label="Jetson Nano"
                  icons={[<SafeIcon Icon={SiNvidia} key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                  height: 'fit-content',
                }}
                sx={{
                  p: '0 5px',
                  border: '1px dashed grey',
                  borderRadius: '15px',
                }}
              >
                <Typography variant="h6">Machine Learning</Typography>
                <CustomChip
                  label="OpenCV"
                  icons={[<SafeIcon Icon={SiOpencv} key="skill" />]}
                />
                <CustomChip
                  label="Data Analysis"
                  icons={[<SafeIcon Icon={VscGraphScatter} key="skill" />]}
                />
                <CustomChip
                  label="Predictive Models"
                  icons={[<SafeIcon Icon={GiHistogram} key="skill" />]}
                />
              </Box>
              <Box
                style={{
                  textAlign: 'center',
                  height: 'fit-content',
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
                  icons={[<SafeIcon Icon={SiPlotly} key="skill" />]}
                />
                <CustomChip
                  label="Grafana"
                  icons={[<SafeIcon Icon={SiGrafana} key="skill" />]}
                />
              </Box>
            </Stack>
          </div>
        </section>

        {/* Education Section */}
        <section id="profile-section">
          <Typography variant="h3" sx={titleStyle}>
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
                    image="/images/insa-toulouse.webp"
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
                    image="/images/ensmm.png"
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
