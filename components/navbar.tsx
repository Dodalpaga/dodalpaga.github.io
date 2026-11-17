'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import { useSiteTools } from './site-tools';
import { useThemeContext } from '@/context/ThemeContext';
import './navbar.css';

const NAV_ITEMS = [
  { label: 'Profile', href: '/profile' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
];

const NAV_ITEM_PADDING = '12px 14px';
const NAV_ICON_PADDING = '12px';
const NAV_CONTENT_HEIGHT = '20px';

const NavPillLink = styled(Link)(() => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  fontWeight: 600,
  lineHeight: NAV_CONTENT_HEIGHT,
  textTransform: 'capitalize',
  textDecoration: 'none',
  color: 'rgba(240, 232, 216, 0.9)',
  cursor: 'pointer',
  borderRadius: '999px',
  padding: NAV_ITEM_PADDING,
  transition: 'background-color 0.2s ease, color 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(240, 232, 216, 0.08)',
    color: 'var(--on-prussian)',
    opacity: 1,
  },
  '&[aria-current="page"]': {
    color: 'var(--on-prussian)',
  },
  '&[aria-current="page"]::after': {
    content: '""',
    position: 'absolute',
    left: '50%',
    bottom: '3px',
    width: '4px',
    height: '4px',
    marginLeft: '-2px',
    borderRadius: '50%',
    backgroundColor: 'var(--lobster)',
  },
}));

const navIconSx = {
  padding: NAV_ICON_PADDING,
  color: 'rgba(240, 232, 216, 0.9)',
  borderRadius: '999px',
  '&:hover': {
    backgroundColor: 'rgba(240, 232, 216, 0.08)',
    color: 'var(--on-prussian)',
  },
};

const NavBar = () => {
  const openTools = useSiteTools();
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/');
  const { theme, toggleTheme } = useThemeContext();
  const [isClient, setIsClient] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('.navbar-menu-btn')
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close on route change / resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // The nav sits on Prussian Blue in both themes, so the light logo always applies.
  const logoSrc = '/images/logo/logo-light.png';

  return (
    <>
      <div className="navbar-cluster">
        
        <Link
          href="/"
          passHref
          aria-label="Home"
          className="navbar-logo-circle"
        >
          <Image src={logoSrc} alt="Logo" width={26} height={26} />
        </Link>

        
        <nav className="navbar-pill">
          <div
            className="navbar-desktop-links"
            style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            {NAV_ITEMS.map(({ label, href }) => (
              <NavPillLink
                key={href}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
              </NavPillLink>
            ))}
          </div>

          <IconButton
            onClick={toggleTheme}
            className="navbar-desktop-links"
            aria-label="Toggle colour theme"
            sx={navIconSx}
          >
            {isClient ? (
              theme === 'light' ? (
                <DarkModeIcon sx={{ fontSize: NAV_CONTENT_HEIGHT }} />
              ) : (
                <LightModeIcon sx={{ fontSize: NAV_CONTENT_HEIGHT }} />
              )
            ) : null}
          </IconButton>

          <button
            className="navbar-tools-btn"
            onClick={() => {
              setMenuOpen(false);
              openTools?.();
            }}
            aria-label="Open site tools"
            title="Chat, music and settings"
          >
            <TuneIcon sx={{ fontSize: 18 }} />
            <span>Tools</span>
          </button>
          
          <IconButton
            className="navbar-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            sx={navIconSx}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </nav>
      </div>

      
      <div
        className={`navbar-overlay${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      
      <div
        ref={drawerRef}
        className={`navbar-mobile-drawer${menuOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="navbar-mobile-links">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="navbar-mobile-link"
              aria-current={isActive(href) ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="navbar-mobile-divider" />

        <div className="navbar-mobile-theme-row">
          <span className="navbar-mobile-theme-label">
            {isClient
              ? theme === 'light'
                ? 'Light mode'
                : 'Dark mode'
              : 'Theme'}
          </span>
          <IconButton
            onClick={toggleTheme}
            size="small"
            sx={{
              color: 'var(--foreground-2)',
              borderRadius: '8px',
              border: '1px solid var(--card-border)',
              '&:hover': {
                backgroundColor: 'var(--background-2)',
                color: 'var(--foreground)',
              },
            }}
          >
            {isClient ? (
              theme === 'light' ? (
                <DarkModeIcon sx={{ fontSize: NAV_CONTENT_HEIGHT }} />
              ) : (
                <LightModeIcon sx={{ fontSize: NAV_CONTENT_HEIGHT }} />
              )
            ) : null}
          </IconButton>
        </div>
      </div>
    </>
  );
};

export default NavBar;
