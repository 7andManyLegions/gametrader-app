'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Head from 'next/head';

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  imageUrls?: string[];
};


export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Listing, 'id'>),
      }));
      setListings(data);
    };

    fetchListings();
  }, []);

  const filteredListings = searchTerm
  ? listings.filter((listing) =>
      listing.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

  return (
    <>
    <Head>
        <title>mama</title>
      </Head>
    
    <main className="min-h-screen bg-white text-gray-800 flex flex-col justify-between font-mono">
      
      {/* Branding + Search */}
      <div className="flex flex-col items-center justify-start text-center px-4 mt-24">
{/*}        <h1 className="text-4xl font-bold tracking-tight mb-4">GameTrader</h1>*/}
        <img
  src="/gametrader_logo.png"
  alt="GameTrader Logo"
  className="w-72 h-auto mb-8"
/>


        <input
          type="text"
          placeholder="...God of War: Ragnarok ...PlayStation 5 controller"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6 p-3 border border-gray-300 rounded w-full max-w-md"
        />
      </div>

      {/* Listings */}
      <div className="px-6 pb-12">
        <h2 className="text-xl font-semibold mb-4">Listings</h2>
        {searchTerm && filteredListings.length === 0 ? (
  <p>No listings found.</p>
) : (
  <div className="grid gap-6 md:grid-cols-2 mt-6">
    {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="border p-4 rounded shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.02]"
              >
                {listing.imageUrls?.[0] && (
                  <img
                    src={listing.imageUrls[0]}
                    alt={listing.title}
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                )}
                <h3 className="text-lg font-semibold">{listing.title}</h3>
                <p className="text-gray-600">{listing.category}</p>
                <p className="text-green-600 font-bold mb-1">${listing.price.toFixed(2)}</p>
                <p className="text-sm text-gray-700">{listing.description}</p>
                <Link
                  href={`/listing/${listing.id}`}
                  className="text-blue-600 text-sm underline mt-2 inline-block"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
    </>
  );
}
