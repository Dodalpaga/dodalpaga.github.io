'use client';

import { Box, Typography } from '@mui/material';

interface NavBarProps {
  brandName: string;
}

export default function Footer({ brandName }: NavBarProps) {
  return (
    <Box className="footer">
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
      </Typography>
    </Box>
  );
}
