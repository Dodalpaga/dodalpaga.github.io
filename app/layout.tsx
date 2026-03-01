import './globals.css';
import { Syne, DM_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import Providers from '@/components/providers';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

// Minified — runs synchronously before first paint, prevents theme flash.
const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var p=s?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',p);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${dmMono.variable} ${plusJakarta.variable}`}
    >
      <head>
        {/* ⚡ Theme init — before body renders, prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        {/*
          Adaptive favicon — browser picks based on OS color scheme.
          logo-dark.ico  → used when OS is in light mode (dark icon on light bg)
          logo-light.ico → used when OS is in dark mode  (light icon on dark bg)
        */}
        <link
          rel="icon"
          href="/images/logo/logo-dark.ico"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/images/logo/logo-light.ico"
          media="(prefers-color-scheme: dark)"
        />

        {/*
          SVG favicon — best modern format, handles its own dark/light
          via an internal @media query (see /images/logo/favicon.svg).
          Listed last so supporting browsers prefer it over .ico.
        */}
        <link rel="icon" type="image/svg+xml" href="/images/logo/favicon.svg" />

        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/images/logo/logo-dark.png" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
