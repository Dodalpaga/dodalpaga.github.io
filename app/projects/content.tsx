// app/projects/content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import '../globals.css';

type App = {
  title: string;
  image: string;
  link: string;
  target: string;
  description: string;
  tags?: string[];
};

const apps: App[] = [
  {
    title: 'Chat Bot',
    image: `/images/chatbot.png`,
    link: '/projects/chatbot',
    target: '',
    description:
      'A chatbot fine-tuned on my resume, previous projects, and other relevant information about me.',
    tags: ['AI', 'LLM'],
  },
  {
    title: 'Board Game Card Printer',
    image: `/images/cardprinter.png`,
    link: 'https://dodalpaga.github.io/Board-Game-Card-Printer/',
    target: '_blank',
    description: 'A small website to print your custom cards for board games.',
    tags: ['Tool', 'External'],
  },
  {
    title: 'Analytics',
    image: `/images/analytics.jpg`,
    link: '/projects/analytics',
    target: '',
    description: 'Live analytics dashboard for this website.',
    tags: ['Data', 'Dashboard'],
  },
  {
    title: 'Image Detection',
    image: `/images/detection.jpeg`,
    link: '/projects/image_detection',
    target: '',
    description:
      'Real-time object detection within images using YOLO (You Only Look Once).',
    tags: ['AI', 'Computer Vision'],
  },
  {
    title: 'Image Generation',
    image: `/images/image_gen.jpg`,
    link: '/projects/image_generation',
    target: '',
    description: 'Image generation powered by Stable Diffusion.',
    tags: ['AI', 'Generative'],
  },
  {
    title: "What's Halfway?",
    image: `/images/whats_halfway.png`,
    link: '/projects/whats_halfway',
    target: '',
    description:
      'Find the perfect meeting spot between multiple locations based on driving time.',
    tags: ['Maps', 'Tool'],
  },
  {
    title: 'CAD',
    image: `/images/cad.jpg`,
    link: '/projects/cad',
    target: '',
    description: 'My collection of 3D models and parametric designs.',
    tags: ['3D', 'Design'],
  },
  {
    title: 'Code Interpreter',
    image: `/images/cmd.jpg`,
    link: '/projects/code_interpreter',
    target: '',
    description:
      'Advanced code editor supporting JavaScript, Python, and more — write, interpret, and execute.',
    tags: ['Dev Tool', 'Code'],
  },
  {
    title: 'Processing Apps',
    image: `/images/drawing.jpg`,
    link: '/projects/processing_apps',
    target: '',
    description:
      'Creative and interactive visual projects built with the p5.js framework.',
    tags: ['Creative', 'p5.js'],
  },
  {
    title: 'Clustering',
    image: `/images/clustering.png`,
    link: '/projects/clustering',
    target: '',
    description:
      'Draw dots on a canvas and apply K-means clustering. Watch the algorithm in action.',
    tags: ['ML', 'Interactive'],
  },
  {
    title: 'ISS Tracker',
    image: `/images/iss-artwork.png`,
    link: '/projects/iss',
    target: '',
    description:
      'Live ISS position, crew on board, docked spacecraft, and more.',
    tags: ['Space', 'Live Data'],
  },
  {
    title: 'Jupyter Notebooks',
    image: `/images/jupyter.jpg`,
    link: '/projects/notebooks',
    target: '',
    description:
      'A curated collection of notebooks on AI, machine learning, and algorithmic problem-solving.',
    tags: ['AI', 'Notebooks'],
  },
  {
    title: 'Travels',
    image: `/images/traveler.jpg`,
    link: '/projects/travels',
    target: '',
    description: "Track the countries I've visited — growing every year.",
    tags: ['Personal', 'Maps'],
  },
  {
    title: 'Mind Mapping',
    image: `/images/mind_map.jpg`,
    link: '/projects/mind_map',
    target: '',
    description:
      'A dynamic mind mapping tool to organize ideas through interconnected nodes.',
    tags: ['Tool', 'Productivity'],
  },
  {
    title: 'Snowflakes',
    image: `/images/snowflakes.jpeg`,
    link: '/projects/snowflakes',
    target: '',
    description:
      'Learn how snowflakes form based on temperature and humidity conditions.',
    tags: ['Simulation', 'Science'],
  },
  {
    title: 'Black Hole Simulator',
    image: `/images/black_hole.png`,
    link: '/projects/black_hole',
    target: '',
    description: 'An interactive gravitational lensing black hole simulation.',
    tags: ['Simulation', 'Physics'],
  },
  {
    title: 'Regex Matcher',
    image: `/images/regex.png`,
    link: '/projects/regex',
    target: '',
    description:
      'Test and validate regular expressions in real time against sample input.',
    tags: ['Dev Tool', 'Utility'],
  },
  {
    title: 'JSON Explorer',
    image: `/images/json.jpg`,
    link: '/projects/json_explorer',
    target: '',
    description:
      'Interactively explore and navigate complex JSON structures — perfect for API work.',
    tags: ['Dev Tool', 'Utility'],
  },
  {
    title: 'Music Production',
    image: `/images/music_producer.jpg`,
    link: '/projects/media_player',
    target: '',
    description:
      'Electronic music I produce in my free time, experimenting with sounds and styles.',
    tags: ['Music', 'Creative'],
  },
  {
    title: 'Satellite Segmenter',
    image: `/images/earth.jpg`,
    link: '/projects/satellite_segmentation',
    target: '',
    description:
      'Select an Earth tile and get a segmented version highlighting regions and features.',
    tags: ['AI', 'Remote Sensing'],
  },
  {
    title: 'Guess What',
    image: `/images/guesswhat.png`,
    link: 'https://guess-what.onrender.com/',
    target: '_blank',
    description:
      'A classic image guessing game — play with friends and family.',
    tags: ['Game', 'External'],
  },
  {
    title: 'Richesses du Monde',
    image: `/images/richesses_du_monde.png`,
    link: 'https://richesses-du-monde.onrender.com/',
    target: '_blank',
    description:
      'A French Monopoly-style board game — buy resources and build your empire.',
    tags: ['Game', 'External'],
  },
  {
    title: 'Cognitive Game',
    image: `/images/cognitive.jpg`,
    link: 'https://cognitive-game.netlify.app/',
    target: '_blank',
    description:
      'Type matching arrows as fast as you can. One mistake costs you time!',
    tags: ['Game', 'External'],
  },
  {
    title: 'Three.js Website Template',
    image: `/images/threejs.png`,
    link: 'https://boat-configurator.netlify.app/',
    target: '_blank',
    description:
      'A 3D boat configurator demo built as a template with Three.js.',
    tags: ['3D', 'Three.js'],
  },
  {
    title: 'SEAWOLF Website',
    image: `/images/SEAWOLF.png`,
    link: 'https://seawolf.netlify.app/',
    target: '_blank',
    description:
      'Website for SEAWOLF, an open-hull boat designed for fishing and diving.',
    tags: ['Web', 'External'],
  },
  {
    title: 'VBSO Website',
    image: `/images/vbso.png`,
    link: 'https://vbso.fr/',
    target: '_blank',
    description:
      'Website for the Saint-Orens Volleyball Club — competitive and recreational teams.',
    tags: ['Web', 'External'],
  },
  {
    title: 'Template',
    image: `/images/template.png`,
    link: '/projects/template',
    target: '',
    description:
      'A flexible project template to quickly kickstart various use cases.',
    tags: ['Dev Tool'],
  },
];

// Derive all unique tags
const ALL_TAGS = Array.from(new Set(apps.flatMap((a) => a.tags ?? []))).sort();

export default function Content() {
  const [search, setSearch] = React.useState('');
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(0);

  const filtered = React.useMemo(() => {
    return apps.filter((app) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        app.title.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.tags?.some((t) => t.toLowerCase().includes(q));
      const matchesTag = !activeTag || app.tags?.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [search, activeTag]);

  // Trigger staggered reveal when filter changes
  React.useEffect(() => {
    setVisibleCount(0);
    const timer = setTimeout(() => setVisibleCount(filtered.length), 50);
    return () => clearTimeout(timer);
  }, [filtered]);

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 4 },
      }}
    >
      {/* Header */}
      <div
        style={{
          width: '100%',
          marginBottom: '32px',
          textAlign: 'center',
        }}
        className="animate-fade-up"
      >
        <span className="section-label">Portfolio</span>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 8px',
          }}
        >
          Projects
        </h1>
        <p
          style={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '480px',
            margin: '0 auto 24px',
            lineHeight: 1.6,
          }}
        >
          {apps.length} projects — from AI experiments to interactive tools and
          creative demos.
        </p>

        {/* Search */}
        <TextField
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <span
                  style={{ color: 'var(--foreground-muted)', fontSize: '1rem' }}
                >
                  ⌕
                </span>
              </InputAdornment>
            ),
            style: {
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.85rem',
              borderRadius: '10px',
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
            },
          }}
          sx={{
            width: '100%',
            maxWidth: '400px',
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--card-border)' },
              '&:hover fieldset': { borderColor: 'var(--accent)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
            },
          }}
        />

        {/* Tag filters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          <Chip
            label="All"
            size="small"
            onClick={() => setActiveTag(null)}
            variant={activeTag === null ? 'filled' : 'outlined'}
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              backgroundColor:
                activeTag === null ? 'var(--accent)' : 'transparent',
              color: activeTag === null ? '#fff' : 'var(--foreground-muted)',
              borderColor:
                activeTag === null ? 'var(--accent)' : 'var(--card-border)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor:
                  activeTag === null
                    ? 'var(--accent-hover)'
                    : 'var(--accent-muted)',
              },
            }}
          />
          {ALL_TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              variant={activeTag === tag ? 'filled' : 'outlined'}
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
                backgroundColor:
                  activeTag === tag ? 'var(--accent)' : 'transparent',
                color: activeTag === tag ? '#fff' : 'var(--foreground-muted)',
                borderColor:
                  activeTag === tag ? 'var(--accent)' : 'var(--card-border)',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor:
                    activeTag === tag
                      ? 'var(--accent-hover)'
                      : 'var(--accent-muted)',
                },
              }}
            />
          ))}
        </div>

        {/* Result count */}
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.72rem',
            color: 'var(--foreground-muted)',
            marginTop: '12px',
            letterSpacing: '0.05em',
          }}
        >
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <Grid container spacing={3} sx={{ width: '100%' }}>
        {filtered.map((app, index) => (
          <Grid item xs={12} sm={6} md={4} key={app.title}>
            <Link href={app.link} target={app.target}>
              <Card
                className="card"
                sx={{
                  opacity: index < visibleCount ? 1 : 0,
                  transition: `opacity 0.4s ease ${Math.min(index * 0.04, 0.5)}s, transform 0.4s ease ${Math.min(index * 0.04, 0.5)}s`,
                }}
              >
                {/* Tags row */}
                {app.tags && app.tags.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      display: 'flex',
                      gap: '4px',
                      zIndex: 2,
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {app.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <CardContent
                  sx={{
                    padding: '12px 16px',
                    minHeight: '44px',
                    height: '18%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      letterSpacing: '-0.01em',
                      color: 'var(--foreground)',
                    }}
                  >
                    {app.title}
                  </Typography>
                </CardContent>

                <CardMedia
                  component="img"
                  image={app.image}
                  alt={app.title}
                  sx={{
                    flexGrow: 1,
                    width: '100%',
                    height: '82%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    '.card:hover &': {
                      transform: 'scale(1.05)',
                    },
                  }}
                />

                {/* Description overlay */}
                <div className="card-overlay">
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      letterSpacing: '-0.02em',
                      marginBottom: '8px',
                    }}
                  >
                    {app.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--foreground-2)',
                      lineHeight: 1.6,
                      fontSize: '0.85rem',
                    }}
                  >
                    {app.description}
                  </Typography>
                  {app.target === '_blank' && (
                    <span
                      className="tag"
                      style={{ marginTop: '12px', alignSelf: 'center' }}
                    >
                      ↗ External
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: 'var(--foreground-muted)',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '2rem',
              marginBottom: '8px',
            }}
          >
            ∅
          </p>
          <p
            style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}
          >
            No projects match your search
          </p>
        </div>
      )}
    </Container>
  );
}
