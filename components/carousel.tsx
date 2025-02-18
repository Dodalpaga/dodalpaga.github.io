import { useState } from 'react';

export default function Carousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={images[currentIndex]}
        alt={`Memory ${currentIndex + 1}`}
        style={{ width: '200px', height: 'auto', borderRadius: '8px' }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '24px',
          marginTop: '16px',
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
    </div>
  );
}
