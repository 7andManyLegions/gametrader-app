'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearch } from '@/context/SearchContext';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function SearchPopup() {
  const { searchTerm, selectedCategory } = useSearch();
  const [results, setResults] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setResults([]);
        setVisible(false);
        return;
      }

      const q = query(
        collection(db, 'listings'),
        where('category', '==', selectedCategory)
      );

      const snapshot = await getDocs(q);
      const matches = snapshot.docs
        .map(doc => doc.data())
        .filter(doc =>
          doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      setResults(matches);
      setVisible(matches.length > 0);
    };

    fetchResults();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={popupRef}
      className="absolute top-[60px] left-0 right-0 mx-auto max-w-2xl z-[9999] bg-white text-black rounded shadow-lg border border-zinc-200 p-4"
    >
      <div className="text-sm font-medium mb-2">Search Results:</div>
        <ul className="space-y-2">
          {results.map((item, i) => {
            const thumbnail =
              item.coverImage ||
              (Array.isArray(item.imageUrls) && item.imageUrls.length > 0
                ? item.imageUrls[0]
                : null);

            return (
              <li key={i}>
              <button
                onClick={() => {
                  setVisible(false);
                  router.push(`/listing/${item.id}`);
                }}
                className="w-full text-left flex items-center gap-4 p-3 rounded border border-transparent hover:border-zinc-300 hover:bg-zinc-50 transition cursor-pointer"
              >
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt="thumbnail"
                    className="w-12 h-12 object-cover rounded border"
                  />
                )}
                <div className="text-sm font-medium">
                  {item.title} — ${item.price}
                </div>
              </button>

              </li>
            );
          })}
        </ul>

    </div>
  );
}
