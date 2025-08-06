import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing } from '@/types/listing';
import HomePageClient from './HomePageClient';

// This function groups listings by title
const groupListings = (listings: Listing[]) => {
  const grouped = new Map<string, Listing[]>();
  for (const listing of listings) {
    if (!grouped.has(listing.title)) {
      grouped.set(listing.title, []);
    }
    grouped.get(listing.title)?.push(listing);
  }
  return Array.from(grouped.values());
};

export default async function HomePage() {
  const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const allListings = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Fix: Manually convert both Timestamp objects to serializable strings
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || null,
    } as Listing;
  });

  const groupedListings = groupListings(allListings);

  return <HomePageClient groupedListings={groupedListings} />;
}