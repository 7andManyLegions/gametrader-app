'use client';

import Spinner from '@/components/Spinner';
import { useEffect, useState } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ContactButtons from '@/components/ContactButtons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { PLATFORM_LOGOS } from '@/components/ListingCard';

type Props = {
  listing?: any;
  id: string;
}

export default function ListingDetailClient({ listing: initial, id }: Props) {
  const [listing, setListing] = useState<any>(initial);
  const [timedOut, setTimedOut] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const listingId = id || initial?.id;

  useEffect(() => {
    if (listing) return;
    if (!listingId) return;

    let didCancel = false;
    const timeoutHandle = setTimeout(() => {
      if (!didCancel && !listing) {
        setTimedOut(true);
        setTimeout(() => router.push('/'), 3000);
      }
    }, 3000);

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'listings', listingId));
        if (!didCancel && snap.exists()) {
          clearTimeout(timeoutHandle);
          const data = snap.data();
          // FIX: Convert Firestore Timestamp to ISO string before setting state
          const correctedListing = {
            id: snap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
          };
          setListing(correctedListing);
        }
      } catch {}
    })();

    return () => {
      didCancel = true;
      clearTimeout(timeoutHandle);
    };
  }, [listing, listingId, router]);

  if (timedOut) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white px-6 py-4 rounded-lg shadow-md">
          <p className="text-center text-lg text-red-600">Listing Not Found.</p>
          <p className="text-center text-sm text-gray-600">Going Home</p>
          <img 
            src="/gametrader_logo_angry.png" 
            alt="Angry GameTrader" 
            className="w-72 h-auto mb-8" 
          />
        </div>
      </div>
    );
  }

  if (!listing) return <Spinner />;

  const {
    title,
    price,
    category,
    platform,
    description,
    imageUrls = [],
    userId,
    gamestopSellPrice,
    gamestopTradeInPrice,
    gamestopRecommendedPrice
  } = listing;

  const isOwner = user?.uid === userId;
  const logoSrc = PLATFORM_LOGOS[platform];


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden transition hover:shadow-lg">
        <div className="relative">
          {(imageUrls[0] || listing.coverImage) && (
            <img
              src={imageUrls[0] || listing.coverImage}
              alt={title}
              className="max-w-full w-auto h-auto object-contain mx-auto"
            />
          )}
          {!imageUrls[0] && listing.coverImage && (
            <p className="text-xs text-right italic text-gray-400 mt-1 px-2">
              Cover image from RAWG.io
            </p>
          )}
            <div className="absolute top-0 left-0 w-full text-center text-white font-poppins text-4xl tracking-wider py-3">
              <p>{title}</p>
              </div>
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-1" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)' }}>{title}
            <br /><div className="h-4" />

            {logoSrc && (
              <div className="w-28 h-14 flex-shrink-0">
<div className="w-24 h-12 flex items-center justify-center rounded-md bg-white shadow-md">
  <Image
    loading="lazy"
    src={logoSrc}
    alt={`${platform} logo`}
    width={96}
    height={48}
    className="object-contain max-w-full max-h-full"
  />
</div>
              </div>
            )}
          </h1>

<div className="h-2" />
        <p className="text-4xl text-green-800 font-semibold mb-1"
        style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)'}}>${Number(price).toFixed(2)}</p>
        <div className="h-1" />
        <p className="text-sm text-gray-500 mb-2">
          </p>

          {/* GameStop Pricing */}
          {(gamestopSellPrice || gamestopTradeInPrice || gamestopRecommendedPrice) && (
            <div className="bg-gray-100 p-3 rounded-md mb-4">
              <p className="text-sm mb-1">
                {gamestopSellPrice ? `GameStop Sells For: $${gamestopSellPrice.toFixed(2)}` : ''}
              </p>
              <p className="text-sm mb-1">
                {gamestopTradeInPrice ? `Trade-In: $${gamestopTradeInPrice.toFixed(2)}` : ''}
              </p>
              <p className="text-sm font-medium">
                {gamestopRecommendedPrice ? `Suggested: $${gamestopRecommendedPrice.toFixed(2)}` : ''}
              </p>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="mb-4">
              <h2 className="font-semibold mb-1">Notes from the seller:</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">{description}</p>
            </div>
          )}

          {/* Actions */}
          {isOwner ? (
            <div className="mt-4">
              <Link
                href={`/edit/${listingId}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Listing
              </Link>
              {/* Add other buttons later */}
            </div>
          ) : (
            <ContactButtons listing={listing} />
          )}
        </div>
      </div>
    </div>
  );
}