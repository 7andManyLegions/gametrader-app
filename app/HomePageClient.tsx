'use client';

import { useEffect, useState } from 'react';
import { useSearch } from '@/context/SearchContext';
import TopSearchBar from '@/components/TopSearchBar';
import GroupedListingCard from '@/components/GroupedListingCard';
import type { Listing } from '@/types/listing';
import Head from 'next/head';
import LogoSplash from '@/components/LogoSplash';

type Props = {
  groupedListings: Listing[][];
};

export default function HomePageClient({ groupedListings }: Props) {
  const { searchTerm, selectedCategory, minPrice, maxPrice, selectedPlatforms } = useSearch();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadySeen = sessionStorage.getItem('hasSeenSplash');
      if (alreadySeen) {
        setShowSplash(false); // Skip splash
      } else {
        const timeout = setTimeout(() => {
          setShowSplash(false);
          sessionStorage.setItem('hasSeenSplash', 'true');
        }, 7500);
        return () => clearTimeout(timeout);
      }
    }
  }, []);

  if (showSplash) return <LogoSplash />;

  const filteredGroups = groupedListings.filter((group) => {
    const listing = group[0];
    const matchesSearchTerm = searchTerm.trim() === '' || listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Game' || listing.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPrice = (minPrice === null || listing.price >= minPrice) && (maxPrice === null || listing.price <= maxPrice);
    const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(listing.platform);
    
    return matchesSearchTerm && matchesCategory && matchesPrice && matchesPlatform;
  });

  return (
    <>
      <Head>
        <title>GameTrader</title>
      </Head>
      <TopSearchBar />
      <main className="min-h-screen bg-white text-gray-800 font-mono">
        {searchTerm === '' && (
          <div className="flex flex-col items-center justify-start text-center px-4 pt-24">
            <img src="/gametrader_logo.png" alt="GameTrader Logo" className="w-72 h-auto mb-8" />
          </div>
        )}
        <div className="px-6 pb-12 pt-20">
          <h2 className="font-roboto font-normal font-bold text-gray-700 mb-4">Active Listings</h2>
          {filteredGroups.length === 0 ? (
            <p>No listings found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group, index) => (
                <GroupedListingCard key={index} listings={group} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}