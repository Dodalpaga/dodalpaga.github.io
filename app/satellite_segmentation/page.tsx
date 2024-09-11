'use client';
import React from 'react';
import imagePath from '../../public/assets/mountain.png';
import NavBar from '../../components/navbar';
import Footer from '../../components/footer';
import Content from './content';
import Loading from '../../components/loading';

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
      <div className="flex flex-col items-center justify-between p-4">
        <NavBar brandName="My Brand" imageSrcPath={imagePath.src} />
      </div>
      <div className="flex flex-col items-center justify-between p-4">
        {isLoading ? <Loading /> : <Content />}
      </div>
      <Footer brandName="My Brand" />
    </main>
  );
}
