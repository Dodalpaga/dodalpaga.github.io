import { useState } from 'react';
import Image from 'next/image';

export default function Carousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '24px',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === 0 ? images.length - 1 : prev - 1
            )
          }
        >
          ◀
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        >
          ▶
        </button>
      </div>
      <Image
        src={images[currentIndex]}
        alt={`Memory ${currentIndex + 1}`}
        width={200}
        height={150}
        style={{ borderRadius: '8px' }}
      />
    </div>
  );
}
