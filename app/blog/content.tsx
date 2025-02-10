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
import Pagination from '@mui/material/Pagination'; // MUI Pagination component
import '../globals.css';

type BlogPost = {
  title: string;
  description: string;
  slug: string;
  image: string;
  date: string; // Add a date field in ISO format (e.g., '2024-10-22')
};

export default function Content({ blogPosts }: { blogPosts: BlogPost[] }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const postsPerPage = 6;

  // Get the current posts for the page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  // Sort blog posts by date (most recent first), and by title (alphabetically) for posts with the same date
  const sortedPosts = blogPosts.sort((a, b) => {
    const dateComparison =
      new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComparison === 0) {
      // If dates are the same, sort by title alphabetically
      return a.title.localeCompare(b.title);
    }
    return dateComparison;
  });

  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Calculate the total number of pages
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        variant="outlined"
        size="large"
        sx={{
          marginBottom: '20px',
          color: 'var(--foreground)',
          '& button': {
            color: 'var(--foreground)',
            borderColor: 'var(--foreground)',
          },
          '& .Mui-selected': {
            color: 'var(--foreground-2)',
            borderColor: 'var(--foreground-2)',
            opacity: 0.5,
          },
        }}
        shape="rounded"
      />

      <Grid container spacing={4}>
        {currentPosts.map((post, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Link href={`/blog/${post.slug}`} target="_self">
              <Card className="card">
                <CardMedia
                  component="img"
                  image={post.image}
                  alt={post.title}
                  sx={{
                    height: '80%',
                    width: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
                <CardContent
                  sx={{
                    textAlign: 'center',
                    padding: 2,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <Typography variant="h6" component="div">
                    {post.title}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
