// components/NavBar.tsx
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { List, ListItem, ListItemText } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
}

const Documentation = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: theme.spacing(1),
}));

const NavLink = styled(ListItem)(({ theme }) => ({
  textTransform: 'capitalize',
  color: 'inherit',
}));

const NavBar = ({ brandName, imageSrcPath }: NavBarProps) => (
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
            width={60}
            height={60}
            style={{ marginRight: 8 }}
          />
          <Typography variant="h6" component="div">
            {brandName}
          </Typography>
        </Box>
      </Link>
      <Box sx={{ flexGrow: 1, display: 'flex', ml: 2 }}>
        <List sx={{ display: 'flex' }}>
          {['Projects'].map((text) => (
            <NavLink
              key={text}
              component="a"
              button
              href={`/${text.toLowerCase().replace(' ', '')}`}
            >
              <ListItemText primary={text} />
            </NavLink>
          ))}
        </List>
      </Box>
      <Documentation>
        <List sx={{ display: 'flex' }}>
          <NavLink
            key="Documentation"
            button
            component="a"
            href="/documentation"
          >
            <ListItemText primary="Documentation" />
          </NavLink>
        </List>
      </Documentation>
    </Toolbar>
  </AppBar>
);

export default NavBar;
