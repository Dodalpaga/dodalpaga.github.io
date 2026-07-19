'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useThemeContext } from '@/context/ThemeContext';
import './navbar.css';

const NAV_ITEMS = [
  { label: 'Profile', href: '/profile' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
];

const NAV_ITEM_PADDING = '10px';
const NAV_CONTENT_HEIGHT = '20px';

const NavPillLink = styled(Link)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  fontWeight: 500,
  lineHeight: NAV_CONTENT_HEIGHT, // fixe la hauteur du texte = hauteur d'une icône small
  textTransform: 'capitalize',
  textDecoration: 'none',
  color: 'var(--foreground-2)',
  cursor: 'pointer',
  borderRadius: '999px',
  padding: NAV_ITEM_PADDING,
  transition: 'background-color 0.4s ease, color 0.4s ease',
  '&:hover': {
    backgroundColor: 'var(--accent-muted)',
    color: 'var(--accent)',
  },
}));

const NavBar = () => {
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

  const logoSrc = isClient
    ? theme === 'light'
      ? '/images/logo/logo-dark.png'
      : '/images/logo/logo-light.png'
    : '/images/logo/logo-dark.png';

  return (
    <>
      <div className="navbar-cluster">
        {/* ── Logo — standalone circle ─────────────────────── */}
        <Link
          href="/"
          passHref
          aria-label="Home"
          className="navbar-logo-circle"
        >
          <Image src={logoSrc} alt="Logo" width={26} height={26} />
        </Link>

        {/* ── Pill nav ─────────────────────────────────────── */}
        <nav className="navbar-pill">
          <div
            className="navbar-desktop-links"
            style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            {NAV_ITEMS.map(({ label, href }) => (
              <NavPillLink key={href} href={href}>
                {label}
              </NavPillLink>
            ))}
          </div>

          <IconButton
            onClick={toggleTheme}
            className="navbar-desktop-links"
            sx={{
              padding: NAV_ITEM_PADDING,
              color: 'var(--foreground-2)',
              borderRadius: '999px',
              '&:hover': {
                backgroundColor: 'var(--accent-muted)',
                color: 'var(--accent)',
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

          {/* ── Mobile hamburger ───────────────────────────── */}
          <IconButton
            className="navbar-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            sx={{ borderRadius: '999px' }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </nav>
      </div>

      {/* ── Mobile overlay scrim ───────────────────────────── */}
      <div
        className={`navbar-overlay${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* ── Mobile dropdown drawer ─────────────────────────── */}
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
                backgroundColor: 'var(--accent-muted)',
                color: 'var(--accent)',
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
