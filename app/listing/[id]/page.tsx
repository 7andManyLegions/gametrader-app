'use client';

import ImageModal from '@/components/ImageModal';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import toast from 'react-hot-toast';

interface Props {
  params: { id: string };
}

export default function ListingDetailPage({ params }: Props) {
  const { id } = params;
  const { user } = useAuth();
  const [listing, setListing] = useState<any | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      const snap = await getDoc(doc(db, 'listings', id));
      if (snap.exists()) {
        setListing(snap.data());
      }
    };
    fetchListing();
  }, [id]);

  if (!listing) return <p className="p-8">Loading listing...</p>;

  const price = listing.price;
  const recommended = listing.gamestopRecommendedPrice;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
      <p className="text-green-600 text-xl font-semibold ">
  ${price.toFixed(2)}
  {recommended && (
    <>
      {price > recommended && (
        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
          Overpriced
        </span>
      )}
      {price < recommended && (
        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
          Underpriced
        </span>
      )}
      {price === recommended && (
        <span className="ml-4 px-2 py-1 bg-white-100 text-blue-700 text-xs font-semibold rounded">
          💎 Perfect Price
        </span>
      )}
    </>
  )}
</p>

      <p className="text-gray-500 mb-4 capitalize">{listing.category}</p>
      <p className="mb-4"><strong>Notes from the seller: </strong>{listing.description}</p>

      {Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listing.imageUrls.map((url: string, idx: number) => (
            <ImageModal key={idx} src={url} />
          ))}
        </div>
      )}

      {listing.gamestopSellPrice && listing.gamestopTradeInPrice && (
        <div className="mt-6 text-sm text-yellow-900 bg-yellow-50 border border-yellow-300 p-4 rounded space-y-1">
          <p>
            GameStop sells this item for <strong>${listing.gamestopSellPrice.toFixed(2)}</strong> and
            offers <strong>${listing.gamestopTradeInPrice.toFixed(2)}</strong> for a cash trade-in.
          </p>
        </div>
      )}

      {user && listing.userId !== user.uid && (
        <button
          onClick={async () => {
            const favoriteRef = doc(db, 'users', user.uid, 'wishlist', id);
            await setDoc(favoriteRef, {
              createdAt: new Date(),
              listingRef: doc(db, 'listings', id),
            });
            toast.success('Saved to wishlist.');
          }}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-yellow-600"
        >
          Save to Wishlist
        </button>
      )}
    </main>
  );
}
