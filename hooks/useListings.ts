'use client';
import { useCallback, useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing } from '@/types/listing';

export function useListings(filters: { userId?: string; searchTerm?: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const { userId, searchTerm } = filters;

  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'listings'));

    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    
    // Additional filtering can be added here
    // Currently, a client-side filter is used for the search term

    return q;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setListings([]);
      return;
    }

    const unsub = onSnapshot(buildQuery(), (snapshot) => {
      let fetchedListings = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as Listing[];

      if (searchTerm) {
        fetchedListings = fetchedListings.filter((l) =>
          l.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setListings(fetchedListings);
    });

    return unsub;
  }, [buildQuery, searchTerm, userId]);

  return listings;
}