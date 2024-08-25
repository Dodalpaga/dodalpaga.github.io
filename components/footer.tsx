'use client';

import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface NavBarProps {
  brandName: string;
}

// Create a styled component for the footer
const FooterContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '50px', // Adjust height as needed
  zIndex: 10,
}));

export default function Footer({ brandName }: NavBarProps) {
  return (
    <FooterContainer>
      <Typography variant="body2" color="textSecondary">
        &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
      </Typography>
    </FooterContainer>
  );
}
