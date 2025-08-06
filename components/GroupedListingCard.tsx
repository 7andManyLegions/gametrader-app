// This is the correct code from our last conversation
// It gets unique platforms and maps over them to display all relevant logos
// This will fix the issue you showed in the image.
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Listing } from '@/types/listing';
import { PLATFORM_LOGOS } from './ListingCard';

interface Props {
  listings: Listing[];
}

export default function GroupedListingCard({ listings }: Props) {
  const firstListing = listings[0];
  const totalListings = listings.length;
  
  // Prioritize the official cover art for the grouped view
  const imageSrc = firstListing.coverImage || firstListing.imageUrls?.[0] || '/placeholder.png';

  // Get unique platforms to display multiple logos
  const uniquePlatforms = Array.from(new Set(listings.map(l => l.platform)));

  return (
    <Link
      href={`/games/${encodeURIComponent(firstListing.title)}`}
      className="block rounded-2xl border shadow-md p-4 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 mb-4">
        <Image
          src={imageSrc}
          alt={firstListing.title}
          width={400}
          height={225}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold">{firstListing.title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {totalListings} listing{totalListings > 1 ? 's' : ''} available
        </p>
        
        {/* Display multiple platform logos */}
        <div className="flex gap-2">
          {uniquePlatforms.map(platform => {
            const logoSrc = PLATFORM_LOGOS[platform];
            return logoSrc ? (
              <div key={platform} className="w-12 h-6 flex-shrink-0">
                <div className="w-12 h-6 flex items-center justify-center rounded-md bg-white shadow-md">
                  <Image
                    loading="lazy"
                    src={logoSrc}
                    alt={`${platform} logo`}
                    width={48}
                    height={24}
                    className="object-contain max-w-full max-h-full"
                  />
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </Link>
  );
}