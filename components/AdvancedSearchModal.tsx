'use client';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Check } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { CONSOLES, ITEM_TYPES } from './TitleAutocompleteInput';

export default function AdvancedSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedPlatforms,
    setSelectedPlatforms,
    clearFilters,
  } = useSearch();

  const handlePlatformToggle = (platform: string) => {
    // FIX: Construct the new array explicitly before calling the setter
    const newPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter(p => p !== platform)
      : [...selectedPlatforms, platform];

    setSelectedPlatforms(newPlatforms);
  };

  const handleApply = () => {
    onClose();
  };

  const handleClear = () => {
    clearFilters();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 " />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Advanced Search
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Price Range */}
                  <div>
                    <label className="block font-medium text-gray-700">Price Range</label>
                    <div className="flex gap-4 mt-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice ?? ''}
                        onChange={e => setMinPrice(Number(e.target.value) || null)}
                        className="w-1/2 p-2 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice ?? ''}
                        onChange={e => setMaxPrice(Number(e.target.value) || null)}
                        className="w-1/2 p-2 border rounded"
                      />
                    </div>
                  </div>

                  {/* Platforms */}
                  <div>
                    <label className="block font-medium text-gray-700">Platforms</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CONSOLES.map(platform => (
                        <button
                          key={platform}
                          onClick={() => handlePlatformToggle(platform)}
                          className={`px-3 py-2 rounded-full text-sm border transition ${
                            selectedPlatforms.includes(platform)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Item Type */}
                  <div>
                    <label className="block font-medium text-gray-700">Item Type</label>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                    >
                      {ITEM_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}