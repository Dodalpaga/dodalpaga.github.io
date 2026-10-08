'use client';

import NavBar from '@/components/navbar';
import Content from './content';

export default function AnalyticsPage() {
  return (
    <main className="analytics-page">
      <div className="analytics-nav"><NavBar /></div>
      <Content />
    </main>
  );
}
