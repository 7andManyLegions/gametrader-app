'use client';

import { useState } from 'react';

type Props = {
  url: string;
  onCancel: () => void;
  onOpen: () => void;
};

export default function RedirectConfirmationModal({ url, onCancel, onOpen }: Props) {
  const nohttp = url.split('https://')[1];
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-black font-roboto">
        <h2 className="text-xl font-semibold mb-2">You are about to leave GameTrader.com</h2>
        <p className="text-sm mb-4">
          You are attempting to navigate to: 
          <span className="text-red-800 break-all"> {nohttp}</span>
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            Cancel Navigation
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(url);
              onCancel(); 
            }}
            className="px-4 py-2 bg-yellow-300 rounded hover:bg-yellow-400 text-sm"
          >
            Copy Link
          </button>
          <button
            onClick={onOpen}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            Open Link
          </button>
        </div>
      </div>
    </div>
  );
}
