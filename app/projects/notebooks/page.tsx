'use client';
import React from 'react';
import NavBar from '@/components/navbar';
import Footer from '@/components/footer';
import Content from './content';
import Loading from '@/components/loading';

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
      <div
        className="flex flex-col items-center justify-between p-4"
        style={{ height: '84px' }}
      >
        <NavBar />
      </div>
      <div
        className="flex flex-col items-center justify-between"
        style={{ width: '100%' }}
      >
        {isLoading ? <Loading /> : <Content />}
      </div>
      <Footer brandName="Dorian Voydie" />
    </main>
  );
}
