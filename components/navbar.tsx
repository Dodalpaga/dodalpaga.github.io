// components/NavBar.tsx
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';

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

const NavBar = ({ brandName, imageSrcPath }: NavBarProps) => (
  <AppBar
    position="fixed"
    color="default"
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
      </Box>
    </Toolbar>
  </AppBar>
);

export default NavBar;
