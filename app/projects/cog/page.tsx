'use client';

import React from 'react';
import NavBar from '@/components/navbar';
import Footer from '@/components/footer';
import CogViewer from '@/components/cog/CogViewer';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/components/cog/styles.css';

const NAV_H = 84;
const FOOT_H = 56;

export default function CogProjectPage() {
  React.useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden">
      <div className="cog-viewer absolute inset-0">
        <CogViewer />
      </div>
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-[100] flex justify-center p-4"
        style={{ height: NAV_H }}
      >
        <div className="pointer-events-auto">
          <NavBar />
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[100]"
        style={{ minHeight: FOOT_H }}
      >
        <div className="pointer-events-auto">
          <Footer brandName="Dorian Voydie" />
        </div>
      </div>
    </main>
  );
}
