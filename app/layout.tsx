import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../context/ThemeContext'; // Adjust path if necessary

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
        </ThemeProvider>
      </body>
    </html>
  );
}
