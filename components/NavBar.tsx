'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { useState } from 'react';
import { Home } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm z-50">
      {/* Left: Home Icon */}
      <Link href="/" className="text-gray-800 hover:text-blue-600">
        <Home size={24} />
      </Link>

      {/* Right: Auth/User */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-m font-medium text-gray-800 hover:text-blue-600 focus:outline-none border border-gray-300 px-2 py-1 rounded cursor-pointer"
            >
            {user.displayName || user.email || 'User'}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50"
              onMouseLeave={() => setMenuOpen(false)}
            >

              <Link
                href="/create-listing"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Create Listing
              </Link>
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
        
              <Link
                href="/wishlist"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                href="/account"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Listings
              </Link>

              <button
                onClick={async () => {
                  await signOut(auth);
                  window.location.href = '/logged-out';
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Logout
                </button>
            </div>
          )}
        </div>
      ) : pathname !== '/login' ? (
        <Link
          href="/login"
          className="text-sm text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
        >
          Login
        </Link>
      ) : null}
    </nav>
  );
}


