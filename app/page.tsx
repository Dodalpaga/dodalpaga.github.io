'use client';
import Link from 'next/link';
import Image from 'next/image';
import NavBar from '@/components/navbar';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div
        className="flex flex-col items-center justify-between p-4"
        style={{ height: '84px', width: '100%' }}
      >
        <NavBar />
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-2 items-center justify-center">
        <Image
          src="/images/D2_transparent.png"
          alt="logo_shadowed"
          height={0} // Fixed height
          width={0} // Set width to 0 (ignored due to style)
          style={{
            width: 'auto', // Maintain aspect ratio
            maxHeight: 'calc(100vh - 300px)',
            height: 'auto',
            padding: '10px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-3 lg:text-left  items-center justify-center">
          <a
            href={'/profile'}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Profile{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Learn about me !
            </p>
          </a>

          <a
            href={'/projects'}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Projects{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Learn about my projects in a one and only place !
            </p>
          </a>

          <a
            href={'/template'}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Templates{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Nothing to see here, just a template for my projects.
            </p>
          </a>
        </div>
      </div>

      <div className="z-10 w-full max-w-3xl items-center justify-between font-mono text-sm">
        <p className="api-banner flex w-full justify-center border-b border-gray-300 from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto lg:rounded-xl">
          You can check the backend API&nbsp;
          <Link
            href={`${process.env.NEXT_PUBLIC_API_URL_DOCS}`}
            target="_blank"
          >
            <code className="font-mono font-bold">here</code>
          </Link>
        </p>
      </div>
    </main>
  );
}
