// app/layout.tsx  ← SERVER COMPONENT (no 'use client')
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
        {/*
          ⚡ Placed in <head> so it executes before <body> renders.
          suppressHydrationWarning on <html> covers the data-theme
          attribute difference between SSR ('dark' fallback) and client.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
