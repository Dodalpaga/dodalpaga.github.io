'use client';
import React from 'react';
import NavBar from '../../../components/navbar';
import Footer from '../../../components/footer';
import Content from './content';
import Loading from '../../../components/loading';
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
    <main className="flex min-h-screen flex-col justify-between">
      <div
        className="flex flex-col items-center justify-between p-4"
        style={{
          height: '84px',
        }}
      >
        <NavBar
          brandName="Dorian Voydie"
          imageSrcPath={`/assets/mountain.png`}
        />
      </div>

      {/* Main Content: Ensure it's aligned at the top */}
      <div
        className="flex flex-col p-4"
        id="page-content"
        style={{
          flexGrow: 1, // Allow content to grow and take up available space
          marginTop: '0', // Align content right below the navbar
          justifyContent: 'flex-start', // Align content at the top
        }}
      >
        {isLoading ? <Loading /> : <Content />}
      </div>
      <Footer brandName="Dorian Voydie" />
    </main>
  );
}
