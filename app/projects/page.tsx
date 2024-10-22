// page.tsx
'use client';
import React from 'react';
import NavBar from '../../components/navbar';
import Footer from '../../components/footer';
import Content from './content';
import Loading from '../../components/loading';

export default function Projects() {
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
        style={{ height: '84px' }}
      >
        <NavBar
          brandName="Dorian Voydie"
          imageSrcPath={`/assets/mountain.png`}
        />
      </div>
      <div className="flex flex-col items-center justify-start p-4 flex-grow">
        {isLoading ? <Loading /> : <Content />}
      </div>
      <Footer brandName="Dorian Voydie" />
    </main>
  );
}
