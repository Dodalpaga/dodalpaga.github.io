'use client';
import React from 'react';
import NavBar from '../../../components/navbar';
import Footer from '../../../components/footer';
import Content from './content';
import Loading from '../../../components/loading';

export default function Template() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <div className="flex flex-col items-center justify-between p-4">
        <NavBar
          brandName="Dorian Voydie"
          imageSrcPath={`/assets/mountain.png`}
        />
      </div>
      <div
        className="flex flex-col items-center justify-between p-4"
        // This is used when you want ti make the content fit in window height : (no scrolling)
        style={{
          height: 'calc(100vh - 146px)',
          position: 'relative',
          bottom: '0',
        }}
      >
        {isLoading ? <Loading /> : <Content />}
      </div>
      <Footer brandName="Dorian Voydie" />
    </main>
  );
}
