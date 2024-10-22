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
import Button from '@mui/material/Button'; // For pagination buttons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Pagination from '@mui/material/Pagination'; // MUI Pagination component
import '../globals.css';

type BlogPost = {
  title: string;
  description: string;
  slug: string;
  image: string;
};

export default function Content({ blogPosts }: { blogPosts: BlogPost[] }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const postsPerPage = 6;

  // Get the current posts for the page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Calculate the total number of pages
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to handle page changes via the Pagination component
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
        padding: 4,
      }}
    >
      {/* MUI Pagination Component */}
      <Pagination
        count={totalPages} // Total number of pages
        page={currentPage} // Current active page
        onChange={handlePageChange} // Handle page change
        color="primary" // Styling
        size="large" // Make it larger for better visibility
        sx={{ marginBottom: '20px' }} // Add margin below the pagination
      />

      {/* Blog posts grid */}
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
