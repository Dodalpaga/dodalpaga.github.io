'use client';

import dynamic from 'next/dynamic';

// The upstream viewer reads matchMedia while its module initializes and relies
// on browser-only WebGL APIs, so load its entry point only in the browser.
const CogViewerApp = dynamic(() => import('./App'), { ssr: false });

export default function CogViewer() {
  return <CogViewerApp />;
}
