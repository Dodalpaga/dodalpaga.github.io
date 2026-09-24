'use client';
import React from 'react';
import NavBar from '@/components/navbar';
import Footer from '@/components/footer';
import GlobeExplorer from '@/components/globe/GlobeExplorer';

const NAV_H = 84;
const FOOT_H = 56; // adjust to your footer's real height

export default function Template() {
  // single-page app: lock document scroll while mounted
  React.useEffect(() => {
    const { overflow: ho } = document.documentElement.style;
    const { overflow: bo } = document.body.style;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = ho;
      document.body.style.overflow = bo;
    };
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden">
      <GlobeExplorer insetTop={NAV_H} insetBottom={FOOT_H} />

      <div
        className="absolute top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none"
        style={{ height: NAV_H }}
      >
        <div className="pointer-events-auto">
          <NavBar />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{ minHeight: FOOT_H }}
      >
        <div className="pointer-events-auto">
          <Footer brandName="Dorian Voydie" />
        </div>
      </div>
    </main>
  );
}
