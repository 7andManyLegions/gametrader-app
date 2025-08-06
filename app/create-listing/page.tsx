'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useRedirectWithConfirmation } from '@/app/security/policies';
import TitleAutocompleteInput from '@/components/TitleAutocompleteInput';
import { Combobox } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';

const ITEM_TYPES = [
  'Game', 'Console', 'PC', 'Controller', 'Accessory', 'Merchandise', 'Other',
];

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { requestRedirect, modal } = useRedirectWithConfirmation();
  const [itemType, setItemType] = useState('Game');
  const [platform, setPlatform] = useState('');
  const [title, setTitle] = useState('');
  const [rawgMeta, setRawgMeta] = useState<{ id: number; image: string } | null>(null);
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState<string | undefined>(undefined);
  
  // New state to hold prices from all sources
  const [sources, setSources] = useState<any | null>(null);

  useEffect(() => {
    // No change here, this is your original logic.
    // if (
    //   gamestopPrices.recommendedPrice != null &&
    //   typeof price === 'number' &&
    //   price <= gamestopPrices.recommendedPrice
    // ) {
    //   //setOverpriceConfirmed(false);
    // }
  }, [price, sources?.gamestop?.recommendedPrice]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const fetchRecommendedPrice = async (selectedTitle: string) => {
    if (itemType !== 'Game') return;
    const search = `${selectedTitle} ${platform}`.trim();
    if (!search) return;

    setLoadingPrices(true);
    setPriceError(undefined);
    setSources(null);
    try {
      const res = await fetch(`/api/recommend-price?title=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources);
        setPrice(data.recommendedPrice);
        toast.success('Price data fetched successfully.');
      } else {
        setPriceError(data.error || 'Failed to fetch pricing data.');
        toast.error('Failed to fetch pricing data.');
      }
    } catch {
      setPriceError('Request failed.');
      toast.error('Request failed.');
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }
    if (!title) {
      toast.error('Please select a title.');
      return;
    }

    const id = uuidv4();
    let imageUrls: string[] = [];

    if (images.length) {
      imageUrls = await Promise.all(
        images.map(async file => {
          const imgRef = ref(storage, `listing-images/${id}/${file.name}`);
          await uploadBytes(imgRef, file);
          return getDownloadURL(imgRef);
        })
      );
    }

    await setDoc(doc(db, 'listings', id), {
      id,
      title,
      price: Number(price),
      description,
      category: itemType,
      itemType,
      platform,
      gamestopSellPrice: sources?.gamestop?.sellPrice ?? null,
      gamestopTradeInPrice: sources?.gamestop?.tradeInPrice ?? null,
      gamestopRecommendedPrice: sources?.gamestop?.recommendedPrice ?? null,
      coverImage: rawgMeta?.image ?? null,
      rawgId: rawgMeta?.id ?? null,
      imageUrls,
      createdAt: new Date(),
      userId: user.uid,
    });

    toast.success('Listing created!');
    router.push(`/listing/${id}`);
  };

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Type */}
        <div>
          <label className="block font-medium mb-1">Item Type</label>
          <Combobox
            as="div"
            value={itemType}
            onChange={newType => {
              if (newType == null) return;
              setItemType(newType);
              setPlatform('');
              setTitle('');
              setRawgMeta(null);
              setPrice('');
              setLoadingPrices(false);
              setPriceError(undefined);
              setSources(null);
            }}
          >
            <div className="relative">
              <Combobox.Button
                as="div"
                className="w-full border px-3 py-2 rounded flex justify-between items-center cursor-pointer"
              >
                <span className={itemType ? '' : 'text-gray-400'}>
                  {itemType || 'Select item type'}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </Combobox.Button>
              <Combobox.Options className="absolute mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto z-10">
                {ITEM_TYPES.map(type => (
                  <Combobox.Option
                    key={type}
                    value={type}
                    className={({ active }) =>
                      `px-4 py-2 cursor-pointer ${active ? 'bg-blue-100 text-blue-900' : ''}`
                    }
                  >
                    {({ selected }) => (
                      <div className="flex justify-between">
                        {type}
                        {selected && <Check size={16} className="text-blue-600" />}
                      </div>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* Conditional Title/Platform */}
        {itemType === 'Game' ? (
          <>
            <div>
              <label className="block font-medium mb-1">Console</label>
              <TitleAutocompleteInput
                category="Console"
                onSelect={(val, meta) => {
                  setTitle(val);
                  setRawgMeta(meta || null);
                  setPlatform(val);
                }}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Game Title</label>
              <TitleAutocompleteInput
                category="Game"
                onSelect={(val, meta) => {
                  setTitle(val);
                  setRawgMeta(meta || null);
                  fetchRecommendedPrice(val);
                }}
              />
              {rawgMeta?.image && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">🎮 Suggested Game Cover</p>
                  <img src={rawgMeta.image} alt="Suggested cover" className="w-full h-auto rounded border" />
                  {modal}
                  <p className="font-roboto font-thin italic text-black text-right">
                    <span className="italic">Cover Art Credit:{' '}</span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        requestRedirect('https://rawg.io');
                      }}
                      className="not-italic font-normal underline hover:text-purple-700"
                    >
                      RAWG
                    </a>
                  </p>
                </div>
              )}
            </div>
          </>
        ) : itemType === 'Console' ? (
          <div>
            <label className="block font-medium mb-1">Console</label>
            <TitleAutocompleteInput
              category="Console"
              onSelect={(val, meta) => {
                setTitle(val);
                setRawgMeta(meta || null);
                setPlatform(val);
              }}
            />
          </div>
        ) : (
          <div>
            <label className="block font-medium mb-1">Title</label>
            <TitleAutocompleteInput
              category={itemType}
              onSelect={(val, meta) => {
                setTitle(val);
                setRawgMeta(meta || null);
              }}
            />
          </div>
        )}

        {/* Pricing Display */}
        {loadingPrices && (
          <p className="text-sm text-gray-500">Checking prices…</p>
        )}

        {sources?.gamestop?.recommendedPrice != null && (
          <div className="mt-4 rounded-xl border bg-blue-50 p-4 shadow-sm space-y-2">
            <div className="text-base font-semibold text-green-800 bg-green-100 border border-green-300 px-3 py-2 rounded-md">
              Recommended Price (GameStop): ${sources.gamestop.recommendedPrice?.toFixed(2)}
            </div>
          </div>
        )}
        
        {sources && (
            <div className="mt-4 rounded-xl border bg-gray-100 p-4 shadow-sm space-y-2">
                <div className="text-base font-medium">Price Sources:</div>
                {sources.gamestop && (
                    <div className="text-sm">
                        GameStop Sells For: ${sources.gamestop.sellPrice?.toFixed(2)}
                        <br />
                        GameStop Trade-In: ${sources.gamestop.tradeInPrice?.toFixed(2)}
                    </div>
                )}
                {sources.amazon && (
                    <div className="text-sm">
                        Amazon Sells For: ${sources.amazon.sellPrice?.toFixed(2)}
                    </div>
                )}
            </div>
        )}

        {priceError && (
          <div className="text-sm text-red-600">
            Couldn’t fetch pricing: {priceError}
          </div>
        )}

        {/* Price Input */}
        <div>
          <label className="block font-medium mb-1">Price (USD)</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded disabled:bg-gray-100 disabled:text-gray-500"
            value={typeof price === 'number' ? price : ''}
            onChange={e => {
              const value = parseFloat(e.target.value);
              setPrice(isNaN(value) ? '' : Number(value.toFixed(2)));
            }}
            disabled={loadingPrices}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Points of Interest</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            placeholder="Anything buyers should know?"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Image Upload */}
        <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition text-sm text-gray-600">
          Upload Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
        {imagePreviews.length > 0 && (
          <img
            src={imagePreviews[0]}
            alt="Listing preview"
            className="w-full h-auto rounded border mt-4"
          />
        )}
        {imagePreviews.length > 0 && (
          <ul className="mt-2 text-sm text-gray-500">
            {imagePreviews.map((url, i) => (
              <li key={i}>{images[i].name}</li>
            ))}
          </ul>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-600 cursor-pointer"
        >
          Create Listing
        </button>
      </form>
    </main>
  );
}