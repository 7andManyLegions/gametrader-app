// /app/account/page.tsx
'use client';
import ImageModal from '@/components/ImageModal';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/useAuth';
import Head from 'next/head';
import { useIdleLogout } from '@/hooks/useIdleLogout';

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import Link from 'next/link';

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  imageUrls?: string[];
};

export default function AccountPage() {
  useIdleLogout();
  const [searchTerm, setSearchTerm] = useState('');
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'listings', id));
      toast.success('Listing deleted');
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };


  if (loading) return (
    <div className="p-8 text-center">
      <span className="animate-pulse text-gray-500">Loading...</span>
    </div>
  );
    if (!user) return <p className="p-8">Please log in to view your listings.</p>;

  return (
<>
    <Head>
        <title>GameTrader – Buy & Sell Games</title>
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
  <div className="grid gap-4 md:grid-cols-2">
    {listings
      .filter((listing) =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((listing) => (
    <div
      key={listing.id}
      className="block border p-4 rounded shadow-md transition-transform transform hover:scale-[1.02] hover:shadow-lg duration-200"
    >
      {Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0 && (
        <ImageModal src={listing.imageUrls[0]} />
      )}
      <h2 className="text-lg font-semibold">{listing.title}</h2>
      <p className="text-gray-600">{listing.category}</p>
      <p className="text-green-600 font-bold">${listing.price.toFixed(2)}</p>
      <p className="text-sm mb-2">{listing.description}</p>

      <div className="flex gap-4 mt-2">
        <Link
          href={`/edit/${listing.id}`}
          className="text-blue-600 underline"
        >
          Edit
        </Link>
        <button
          onClick={() => handleDelete(listing.id)}
          disabled={deletingId === listing.id}
          className="text-red-600 underline disabled:opacity-50"
        >
          {deletingId === listing.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
))}

        </div>
      )}
    </main>
    </>
  );
}

