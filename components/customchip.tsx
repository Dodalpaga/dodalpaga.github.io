import React from 'react';
import { Chip, Box } from '@mui/material'; // Ensure you have MUI installed

// Définition des types pour les props
interface CustomChipProps {
  label: string; // ou 'React.ReactNode' si le label peut être un élément React
  icons: React.ReactNode[]; // Un tableau d'éléments React pour les icônes
}

const CustomChip: React.FC<CustomChipProps> = ({ label, icons }) => (
  <Chip
    sx={{
      display: 'flex',
      alignItems: 'left',
      justifyContent: 'right',
      background: 'none', // No default background for the chip
      padding: 0,
      height: '32px', // Set chip height
      '& .MuiChip-label': {
        padding: 0, // Remove padding from the label
        display: 'flex', // Ensure label flex layout
        alignItems: 'center',
      },
    }}
    label={
      <Box
        display="flex"
        width="100%"
        height="100%"
        sx={{ padding: '0 4px', fontSize: '16px' }}
      >
        {/* Text Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-color-4)',
            color: 'var(--foreground)',
            padding: '0 12px',
            borderTopLeftRadius: '16px',
            borderBottomLeftRadius: '16px',
            fontWeight: 'bold', // Make text bold
          }}
        >
          {label}
        </Box>
        {/* Icon Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-color-2)',
            padding: '0 8px',
            borderTopRightRadius: '16px',
            borderBottomRightRadius: '16px',
          }}
        >
          {icons.map((Icon, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              {Icon}
            </Box>
          ))}
        </Box>
      </Box>
    }
  />
);

export default CustomChip;
