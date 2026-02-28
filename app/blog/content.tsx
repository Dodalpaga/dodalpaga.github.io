// app/blog/content.tsx
'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import '../globals.css';

type BlogPost = {
  title: string;
  description: string;
  slug: string;
  image: string;
  date: string;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export default function Content({ blogPosts }: { blogPosts: BlogPost[] }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const postsPerPage = 6;

  const sortedPosts = React.useMemo(
    () =>
      [...blogPosts].sort((a, b) => {
        const d = new Date(b.date).getTime() - new Date(a.date).getTime();
        return d === 0 ? a.title.localeCompare(b.title) : d;
      }),
    [blogPosts],
  );

  const filteredPosts = React.useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return sortedPosts;
    return sortedPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [sortedPosts, search]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
        <span className="section-label">Writing</span>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 8px',
          }}
        >
          Blog
        </h1>
        <p
          style={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '400px',
            margin: '0 auto 20px',
            lineHeight: 1.6,
          }}
        >
          Thoughts on AI, data science, building things, and everything in
          between.
        </p>

        {/* Search */}
        <TextField
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <span style={{ color: 'var(--foreground-muted)' }}>⌕</span>
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
            maxWidth: '380px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--card-border)' },
              '&:hover fieldset': { borderColor: 'var(--accent)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
            },
          }}
        />

        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.72rem',
            color: 'var(--foreground-muted)',
            marginTop: '10px',
          }}
        >
          {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Pagination top */}
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          size="small"
          sx={{
            mb: 3,
            '& button': {
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.75rem',
              color: 'var(--foreground-muted)',
              borderColor: 'var(--card-border)',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'var(--accent-muted)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              },
            },
            '& .Mui-selected': {
              backgroundColor: 'var(--accent) !important',
              borderColor: 'var(--accent) !important',
              color: '#fff !important',
            },
          }}
          shape="rounded"
        />
      )}

      {/* Grid */}
      <Grid container spacing={3} sx={{ width: '100%' }}>
        {currentPosts.map((post, index) => (
          <Grid item xs={12} sm={6} md={4} key={post.slug}>
            <Link href={`/blog/${post.slug}`} target="_self">
              <Card
                className="card"
                sx={{
                  opacity: 0,
                  animation: `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.07}s both`,
                  '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={post.image}
                  alt={post.title}
                  sx={{
                    height: '72%',
                    width: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transition: 'transform 0.5s ease',
                    '.card:hover &': { transform: 'scale(1.05)' },
                  }}
                />
                <CardContent
                  sx={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '28%',
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.3,
                      color: 'var(--foreground)',
                      mb: 'auto',
                    }}
                  >
                    {post.title}
                  </Typography>
                  {post.date && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.68rem',
                        color: 'var(--foreground-muted)',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginTop: '6px',
                      }}
                      title={formatDate(post.date)}
                    >
                      {timeAgo(post.date)}
                    </Typography>
                  )}
                </CardContent>

                {/* Description overlay */}
                <div className="card-overlay">
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      marginBottom: '8px',
                      fontSize: '1.1rem',
                    }}
                  >
                    {post.title}
                  </Typography>
                  {post.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--foreground-2)',
                        lineHeight: 1.6,
                        fontSize: '0.83rem',
                      }}
                    >
                      {post.description}
                    </Typography>
                  )}
                  {post.date && (
                    <span
                      className="tag"
                      style={{ marginTop: '10px', alignSelf: 'center' }}
                    >
                      {formatDate(post.date)}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: 'var(--foreground-muted)',
          }}
        >
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '2rem' }}>
            ∅
          </p>
          <p
            style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}
          >
            No posts match your search
          </p>
        </div>
      )}

      {/* Pagination bottom */}
      {totalPages > 1 && filteredPosts.length > 0 && (
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          size="small"
          sx={{
            mt: 4,
            '& button': {
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.75rem',
              color: 'var(--foreground-muted)',
              borderColor: 'var(--card-border)',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'var(--accent-muted)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              },
            },
            '& .Mui-selected': {
              backgroundColor: 'var(--accent) !important',
              borderColor: 'var(--accent) !important',
              color: '#fff !important',
            },
          }}
          shape="rounded"
        />
      )}
    </Container>
  );
}
