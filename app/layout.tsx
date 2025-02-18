import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import BackendStatus from '@/components/backend_status_checker';
import MediaPlayer from '@/components/media_player';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dorian VOYDIE - Portfolio',
  description: 'Dorian VOYDIE - Portfolio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
          <MediaPlayer />
          <BackendStatus />
        </ThemeProvider>
      </body>
    </html>
  );
}
