// components/NavBar.tsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeContext } from '@/context/ThemeContext';
import './navbar.css';

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
}

const NavLink = styled(ListItem)(() => ({
  textTransform: 'capitalize',
  color: 'inherit',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
}));

const NavBar = ({ brandName, imageSrcPath }: NavBarProps) => {
  const { theme, toggleTheme } = useThemeContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <AppBar className="navbar">
      <Toolbar>
        <Link
          href="/"
          passHref
          style={{ textDecoration: 'none', width: '300px' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Image
              src={imageSrcPath}
              alt="Logo"
              width={60}
              height={60}
              style={{
                marginRight: 8,
                filter: isClient
                  ? theme === 'dark'
                    ? 'invert(1)'
                    : 'invert(0)'
                  : 'none',
              }}
            />

            <Typography
              variant="h6"
              component="div"
              className="brandName"
              noWrap={true}
              sx={{
                color: 'var(--foreground)',
              }}
            >
              {brandName}
            </Typography>
          </Box>
        </Link>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            ml: 2,
            justifyContent: 'right',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <List sx={{ display: 'flex' }}>
            {['Profile'].map((text) => (
              <Link
                key={text}
                href={`/${text.toLowerCase().replace(' ', '')}`}
                passHref
              >
                <NavLink
                  sx={{
                    '&:hover': {
                      backgroundColor: 'var(--background-2)',
                    },
                  }}
                >
                  <ListItemText primary={text} />
                </NavLink>
              </Link>
            ))}
          </List>
          <List sx={{ display: 'flex' }}>
            {['Projects'].map((text) => (
              <Link
                key={text}
                href={`/${text.toLowerCase().replace(' ', '')}`}
                passHref
              >
                <NavLink
                  sx={{
                    '&:hover': {
                      backgroundColor: 'var(--background-2)',
                    },
                  }}
                >
                  <ListItemText primary={text} />
                </NavLink>
              </Link>
            ))}
          </List>
          <List sx={{ display: 'flex' }}>
            {['Blog'].map((text) => (
              <Link
                key={text}
                href={`/${text.toLowerCase().replace(' ', '')}`}
                passHref
              >
                <NavLink
                  sx={{
                    '&:hover': {
                      backgroundColor: 'var(--background-2)',
                    },
                  }}
                >
                  <ListItemText primary={text} />
                </NavLink>
              </Link>
            ))}
          </List>
          <IconButton
            onClick={toggleTheme}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            sx={{
              '&:hover': {
                backgroundColor: 'var(--background-2)',
              },
              color: 'var(--foreground-2)',
            }}
          >
            {isClient ? (
              theme === 'light' ? (
                <DarkModeIcon />
              ) : (
                <LightModeIcon />
              )
            ) : null}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
