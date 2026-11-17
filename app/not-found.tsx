import Link from 'next/link';
import NavBar from '@/components/navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 · Page not found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <NavBar />

      <section className="not-found-card" aria-labelledby="not-found-title">
        <p className="not-found-eyebrow">Error 404</p>
        <h1 id="not-found-title">
          Page not found
        </h1>
        <p className="not-found-copy">
          This page doesn&apos;t exist or has moved.
        </p>

        <div className="not-found-actions">
          <Link href="/" className="not-found-primary">
            Return home
          </Link>
          <Link href="/projects" className="not-found-secondary">
            See projects
          </Link>
        </div>
      </section>
    </main>
  );
}
