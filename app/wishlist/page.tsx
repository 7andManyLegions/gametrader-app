// /app/wishlist/page.tsx
'use client';
import ImageModal from '@/components/ImageModal';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';


type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  imageUrls?: string[];
};

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState<Listing[]>([]);

  // const handleRemoveFavorite = async (listingId: string) => {
  //   try {
  //     await deleteDoc(doc(db, 'users', user!.uid, 'wishlist', listingId));
  //     toast.success('Removed from wishlist.');
  //     setFavorites((prev) => prev.filter((l) => l.id !== listingId));
  //   } catch (err) {
  //     toast.error('Failed to remove favorite');
  //     console.error(err);
  //   }
  // };

  const handleRemoveFavorite = async (listingId: string) => {
    // Optimistically update the UI
    setFavorites((prev) => prev.filter((l) => l.id !== listingId));
  
    try {
      await deleteDoc(doc(db, 'users', user!.uid, 'wishlist', listingId));
      toast.success('Removed from wishlist.');
    } catch (err) {
      // Revert the UI update if deletion fails
      setFavorites((prev) => [...prev, favorites.find((l) => l.id === listingId)!]);
      toast.error('Failed to remove favorite');
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      const favRef = collection(db, 'users', user.uid, 'wishlist');
      const favSnap = await getDocs(favRef);

      const listingPromises = favSnap.docs.map(async (favDoc) => {
        const listingRef = favDoc.data().listingRef;
        const listingSnap = await getDoc(listingRef);
        const data = listingSnap.data() as Omit<Listing, 'id'>;
        return { id: listingSnap.id, ...data };
    });

      const listings = await Promise.all(listingPromises);
      setFavorites(listings);
    };

    fetchFavorites();
  }, [user]);

  if (loading) return (
    <div className="p-8 text-center">
      <span className="animate-pulse text-gray-500">Loading...</span>
    </div>
  );
    if (!user) return <p className="p-8">Please log in to view wishlist.</p>;

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-6">Wishlist</h1>
      {favorites.length === 0 ? (
        <p>Nothing here yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favorites.map((listing) => (
            <Link
            key={listing.id}
            href={`/listing/${listing.id}`}
            className="block border p-4 rounded shadow-md transition-transform transform hover:scale-[1.02] hover:shadow-lg duration-200"          >
            {listing.imageUrls?.[0] && (
              <ImageModal src={listing.imageUrls[0]} />

            )}
            <h3 className="text-lg font-semibold">{listing.title}</h3>
            <p className="text-gray-600">{listing.category}</p>
            {typeof listing.price === 'number' && (
              <p className="text-green-600 font-bold mb-2">
                ${listing.price.toFixed(2)}
              </p>
            )}
            <p className="text-sm">{listing.description}</p>
          
            {/* ❌ Remove button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // prevent Link navigation
                handleRemoveFavorite(listing.id);
              }}
              className="absolute top-2 right-2 bg-white text-red-600 text-xs px-2 py-1 rounded shadow z-10 hover:bg-red-50"
            >
              ✕ Remove
            </button>
          </Link>
          
          ))}
        </div>
      )}
    </main>
  );
}
