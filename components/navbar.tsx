// components/NavBar.tsx
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { List, ListItem, ListItemText } from '@mui/material';

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

function NavBar({ brandName, imageSrcPath }: NavBarProps) {
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Link href="/" passHref>
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
              width="60"
              height="60"
              style={{ marginRight: 8 }}
            />
            <Typography variant="h6" component="div">
              {brandName}
            </Typography>
          </Box>
        </Link>
        <Box sx={{ flexGrow: 1, display: 'flex', marginLeft: 2 }}>
          <List sx={{ display: 'flex' }}>
            <ListItem
              key={'App 1'}
              component="a"
              href="/app1"
              sx={{
                textTransform: 'capitalize',
                color: 'inherit',
              }}
            >
              <ListItemText
                primary={<Typography variant="body1">{'App 1'}</Typography>}
              />
            </ListItem>
            <ListItem
              key={'App 2'}
              component="a"
              href="/app2"
              sx={{
                textTransform: 'capitalize',
                color: 'inherit',
              }}
            >
              <ListItemText
                primary={<Typography variant="body1">{'App 2'}</Typography>}
              />
            </ListItem>
          </List>
        </Box>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
          <Button variant="outlined" color="inherit" sx={{ marginLeft: 2 }}>
            Search
          </Button>
        </Search>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
