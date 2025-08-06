'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Listing } from '@/types/listing';
import { Trash2 } from 'lucide-react';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';

export const PLATFORM_LOGOS: Record<string, string> = {
  PlayStation: '/PlayStation/PS1.png',
  'PlayStation 2': '/PlayStation/PS2.png',
  'PlayStation 3': '/PlayStation/PS3.png',
  'PlayStation 4': '/PlayStation/PS4.png',
  'PlayStation 5': '/PlayStation/PS5.png',
  'PlayStation Portable (PSP)': '/PlayStation/psp.png',
  'PlayStation Vita (PS Vita)': '/PlayStation/psvita.png',
  Xbox: '/Xbox/xbox.png',
  'Xbox 360': '/Xbox/xbox360.png',
  'Xbox One': '/Xbox/xboxone.png',
  'Xbox Series S': '/Xbox/xboxxs.png',
  'Xbox Series X': '/Xbox/xboxxs.png',
  'Nintendo DS': '/Nintendo/ninds.png',
  'Nintendo DSi': '/Nintendo/nindsi.png',
  'Nintendo 3DS': '/Nintendo/nin3ds.png',
  PC: '/pc.png',
  'Super Nintendo': '/Nintendo/supernintendo.png', // Corrected typo
  GameCube: '/Nintendo/ningamecube.png',
  'Nintendo Switch': '/Nintendo/ninswitch.png',
  'Wii U': '/Wii/wiiu.png',
  Wii: '/Wii/wii.png',
  'Game Boy': '/Nintendo/ningameboy.png',
  'Game Boy Advance': '/Nintendo/ningameboyadv.png',
  'Nintendo 64': '/Nintendo/nin64.png',
};

export interface ListingCardProps {
  listing: Listing;
  isDeleting?: boolean;
  onDelete?: (id: string) => void;
}

export default function ListingCard({ listing, isDeleting, onDelete }: ListingCardProps) {
  const { id, title, price, coverImage, imageUrls, platform } = listing;

  const imageSrc =
    coverImage ||
    (Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls[0]
      : '/placeholder.png');

  const logoSrc = PLATFORM_LOGOS[platform];

  return (
    <div className="relative group">
      {/* Delete button if user is owner */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(id);
          }}
          disabled={isDeleting}
          className="absolute top-2 right-2 z-10 bg-red-100 hover:bg-red-200 p-2 rounded-full transition-all cursor-pointer"
          title="Delete Listing"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={16} className="text-red-600" />
          )}
        </button>
      )}

      <Link
        href={`/listing/${id}`}
        className="block rounded-2xl border shadow-md p-4 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      >
        {/* Main listing image */}
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 mb-4">
          <Image
            loading="lazy"
            src={imageSrc}
            alt={title}
            width={400}
            height={225}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Title, Price, and Logo Row */}
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)' }}
            >
              {title}
            </h3>
            <p
              className="text-green-800 font-semibold text-2xl"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)' }}
            >
              ${Number(price).toFixed(2)}
            </p>
          </div>

          {logoSrc && (
            <div className="w-24 h-12 flex-shrink-0">
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
        </div>
      </Link>
    </div>
  );
}