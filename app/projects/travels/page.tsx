'use client';
import React from 'react';
import NavBar from '@/components/navbar';
import Footer from '@/components/footer';
import Content from './content';
import Loading from '@/components/loading';
import './styles.css'; // Ensure the correct CSS file is imported

export default function App1() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex flex-col min-h-screen justify-between">
      {/* Navbar */}
      <div
        className="flex flex-col items-center justify-between p-4"
        style={{
          height: '84px', // Navbar height
        }}
      >
        <NavBar
          brandName="Dorian Voydie"
          imageSrcPath={`/assets/mountain.png`}
        />
      </div>

      {/* Main Content: Ensure it's aligned at the top */}
      <div
        className="flex flex-col items-center justify-between p-4"
        // This is used when you want ti make the content fit in window height : (no scrolling)
        style={{
          height: 'calc(100vh - 134px)',
          position: 'relative',
          bottom: '0',
        }}
      >
        {isLoading ? <Loading /> : <Content />}
      </div>

      {/* Footer */}
      <Footer brandName="Dorian Voydie" />
    </main>
  );
}
