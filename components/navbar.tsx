// components/NavBar.tsx
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      return storedTheme === 'light' || storedTheme === 'dark'
        ? storedTheme
        : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      className="navbar"
      style={{
        margin: '10px',
        width: 'calc(100% - 20px)',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.3s ease',
      }}
    >
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
            <img
              src={imageSrcPath}
              alt="Logo"
              width={60}
              height={60}
              style={{ marginRight: 8 }}
            />
            <Typography variant="h6" component="div" noWrap={true}>
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
                <NavLink>
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
                <NavLink>
                  <ListItemText primary={text} />
                </NavLink>
              </Link>
            ))}
          </List>
          <IconButton
            onClick={toggleTheme}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-800"
            sx={{
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
