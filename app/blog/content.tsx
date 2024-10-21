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
import '../globals.css';

type BlogPost = {
  title: string;
  description: string;
  slug: string;
  image: string;
};

export default function Content({ blogPosts }: { blogPosts: BlogPost[] }) {
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
        {blogPosts.map((post, index) => (
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
