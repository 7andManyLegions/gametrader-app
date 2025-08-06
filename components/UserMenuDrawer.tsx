'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  displayName: string;
  handleLogout: () => void;
}

export default function UserMenuDrawer({ isOpen, onClose, user, displayName, handleLogout }: Props) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-hidden" onClose={onClose}>
        <div className="absolute inset-0 overflow-hidden">
          {/* ← Manual backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-50"
            leave="ease-in duration-200"
            leaveFrom="opacity-50"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black" />
          </Transition.Child>

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
              <div className="w-screen max-w-sm bg-zinc-800 text-white flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                  <Dialog.Title className="text-lg font-semibold">
                    {user ? `Hello, ${displayName.split('@')[0]}` : 'Guest'}
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 rounded hover:bg-zinc-700">
                    <X size={24} />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                  {!user ? (
                    <>
                      <Link href="/login">
                        <a className="block px-4 py-2 rounded hover:bg-zinc-700">Log In</a>
                      </Link>
                      <Link href="/register">
                        <a className="block px-4 py-2 rounded hover:bg-zinc-700">Create Account</a>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/create-listing">
                        <a className="block px-4 py-2 rounded hover:bg-zinc-700">Create Listing</a>
                      </Link>
                      <Link href="/my-listings">
                        <a className="block px-4 py-2 rounded hover:bg-zinc-700">My Listings</a>
                      </Link>
                      <Link href="/wishlist">
                        <a className="block px-4 py-2 rounded hover:bg-zinc-700">Wishlist</a>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 rounded hover:bg-zinc-700"
                      >
                        Log Out
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
