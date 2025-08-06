'use client';

import { useEffect, useState } from 'react';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useIdleLogout } from '@/hooks/useIdleLogout';
import Head from 'next/head';
import ListingCard from '@/components/ListingCard';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import toast from 'react-hot-toast';

type Listing = {
  id: string;
  title: string;
  platform: string;
  price: number;
  category: string;
  description: string;
  imageUrls: string[];
  gamestopSellPrice?: number;
  gamestopTradeInPrice?: number;
  gamestopRecommendedPrice?: number;
};

export default function MyListingsPage() {
  useIdleLogout();
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchListings = async () => {
      const q = query(
        collection(db, 'listings'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const userListings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Listing, 'id'>),
      }));
      setListings(userListings);
    };
    fetchListings();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <span className="animate-pulse text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <p className="p-8">Please log in to view your listings.</p>;
  }

  return (
    <>
      <Head>
        <title>GameTrader – My Listings</title>
      </Head>

      <main className="p-8">
        <h1 className="text-2xl mb-6">My Listings</h1>

        <input
          type="text"
          placeholder="Search your listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6 p-3 border border-gray-300 rounded w-full max-w-md"
        />

        {listings.length === 0 ? (
          <p>You have no listings yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {listings
              .filter((listing) =>
                listing.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isDeleting={deletingId === listing.id}
                  onDelete={() => setPendingDeleteId(listing.id)}
                />
              ))}
          </div>
        )}
      </main>

      <ConfirmDeleteModal
        isOpen={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={async () => {
          if (!pendingDeleteId) return;
          setDeletingId(pendingDeleteId);
          setPendingDeleteId(null);

          try {
            const listing = listings.find((l) => l.id === pendingDeleteId);
            if (listing?.imageUrls?.length) {
              await Promise.all(
                listing.imageUrls.map(async (url) => {
                  try {
                    const path = decodeURIComponent(
                      url.split('/o/')[1].split('?')[0]
                    );
                    await deleteObject(storageRef(storage, path));
                  } catch (e) {
                    console.warn('Failed to delete image', e);
                  }
                })
              );
            }

            await deleteDoc(doc(db, 'listings', pendingDeleteId));
            toast.success('✅ Listing deleted successfully');
            setListings((prev) =>
              prev.filter((l) => l.id !== pendingDeleteId)
            );
          } catch (err) {
            console.error(err);
            toast.error('❌ Failed to delete listing');
          } finally {
            setDeletingId(null);
          }
        }}
      />
    </>
  );
}
