// app/games/[title]/page.tsx
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing } from '@/types/listing';
import ListingCard from '@/components/ListingCard';
import Head from 'next/head';

interface Props {
  params: { title: string };
}

export default async function ListingsByTitlePage({ params }: Props) {
  const title = decodeURIComponent(params.title);

  const q = query(collection(db, 'listings'), where('title', '==', title));
  const snapshot = await getDocs(q);

  const listings = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // FIX: Manually convert the Timestamp object to a serializable string
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    } as Listing;
  });

  return (
    <>
      <Head>
        <title>{title} Listings – GameTrader</title>
      </Head>
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">{title} Listings</h1>
        {listings.length === 0 ? (
          <p>No listings found for this game.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}