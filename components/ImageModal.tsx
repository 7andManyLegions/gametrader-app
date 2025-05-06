'use client';
import { useState } from 'react';

export default function ImageModal({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        onClick={() => setOpen(true)}
        className="cursor-zoom-in w-full h-48 object-cover rounded mb-2"
      />
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <img
            src={src}
            className="max-h-[90vh] max-w-[90vw] rounded shadow-lg cursor-zoom-out"
          />
        </div>
      )}
    </>
  );
}
