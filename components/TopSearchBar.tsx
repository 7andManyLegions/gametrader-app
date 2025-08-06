'use client';

import { useState, Fragment } from 'react';
import { FaChevronDown, FaSearch, FaUser, FaHome } from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdvancedSearchModal from './AdvancedSearchModal';

const categories = ['Game', 'Console', 'PC', 'Controller', 'Accessory', 'Merchandise'];

export default function TopSearchBar() {
  const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } = useSearch();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const displayName = user?.displayName || user?.email || 'Guest';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/logged-out';
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-zinc-900 text-white shadow-md">
      <div className="flex items-center justify-between flex-wrap px-4 py-3 gap-4">
        {/* LEFT — Home, Logo, and Search */}
        <div className="flex items-center gap-4 flex-wrap grow">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Game');
              router.push('/');
            }}
            className="flex items-center gap-1 hover:text-purple-400 cursor-pointer"
            title="Home"
          >
            <FaHome size={18} />
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Game');
              router.push('/');
            }}
            className="font-extrabold tracking-wide text-lg hover:text-yellow-400 cursor-pointer"
          >
            GameTrader
          </button>

          {/* Search Input with Category Dropdown */}
          <div className="flex items-stretch max-w-xl min-w-[300px] ml-4 relative flex-grow">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center bg-zinc-800 px-3 py-2 rounded-l text-sm hover:bg-zinc-700 capitalize whitespace-nowrap cursor-pointer"
            >
              {selectedCategory}
              <FaChevronDown className="ml-2 text-xs" />
            </button>

            {isDropdownOpen && (
              <ul className="absolute left-0 mt-10 bg-zinc-800 rounded shadow z-10">
                {categories.map(cat => (
                  <li
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsDropdownOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-zinc-700 cursor-pointer text-sm capitalize"
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}

            <input
              className="bg-zinc-800 flex-1 py-2 px-4 text-sm border-l border-zinc-700 focus:outline-none"
              placeholder="Search all listings..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                if (searchTerm.trim().length > 1) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="bg-yellow-600 hover:bg-purple-700 px-4 py-2 rounded-r cursor-pointer"
            >
              <FaSearch />
            </button>
          </div>
          <button
            onClick={() => setIsAdvancedSearchOpen(true)}
            className="flex items-center gap-2 text-sm ml-4 hover:text-purple-400 cursor-pointer"
            title="Advanced Search"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* RIGHT — User icon toggles off-canvas drawer */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsUserMenuOpen(true)}
            className="flex items-center gap-2 text-sm hover:text-purple-400 cursor-pointer"
          >
            <FaUser />
            <span className="hidden sm:inline">
              {user ? `Hello, ${displayName.split('@')[0]}` : 'Guest'}
            </span>
          </button>
        </div>
      </div>

      {/* Off-canvas drawer for user menu */}
      <Transition show={isUserMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-hidden"
          onClose={() => setIsUserMenuOpen(false)}
        >
          {/* BACKDROP - use plain div instead of Dialog.Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/20" />
          </Transition.Child>

          {/* SLIDE-OUT PANEL */}
          <div className="fixed inset-y-0 right-0 flex max-w-full">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-screen max-w-sm bg-zinc-800 text-white flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                  <Dialog.Title className="text-lg font-semibold">
                    {user ? `Hello, ${displayName.split('@')[0]}` : 'Guest'}
                  </Dialog.Title>
                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="p-1 rounded hover:bg-zinc-700 hover:text-red-400 cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                  {!user ? (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 rounded hover:bg-zinc-700 hover:text-purple-400 cursor-pointer"
                      >
                        Log In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 rounded hover:bg-zinc-700 hover:text-purple-400 cursor-pointer"
                      >
                        Create Account
                      </Link>
                    </>
                  ) : (
                    <>
                      <div>
                        <button
                          onClick={() => setIsSubMenuOpen(prev => !prev)}
                          className="flex w-full justify-between px-4 py-2 rounded hover:bg-zinc-700 items-center cursor-pointer hover:text-purple-400"
                        >
                          {displayName.split('@')[0]}'s Profile
                          {isSubMenuOpen ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        {isSubMenuOpen && (
                          <ul className="pl-6">
                            <li>
                              <Link
                                href="/account"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="block px-4 py-2 rounded hover:bg-zinc-700 cursor-pointer hover:text-yellow-400"
                              >
                                Account
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/my-listings"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="block px-4 py-2 rounded hover:bg-zinc-700 cursor-pointer hover:text-yellow-400"
                              >
                                My Listings
                              </Link>
                            </li>
                          </ul>
                        )}
                      </div>
                      <Link
                        href="/create-listing"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 rounded hover:bg-zinc-70 cursor-pointer hover:text-purple-400"
                      >
                        Create New Listing
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 rounded hover:bg-zinc-700 cursor-pointer hover:text-purple-400"
                      >
                        Wishlist
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 rounded hover:bg-zinc-700 cursor-pointer hover:text-red-400"
                      >
                        Log Out
                      </button>
                    </>
                  )}
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <AdvancedSearchModal isOpen={isAdvancedSearchOpen} onClose={() => setIsAdvancedSearchOpen(false)} />
    </header>
  );
}