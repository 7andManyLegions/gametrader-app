'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { Combobox } from '@headlessui/react';
import { gamesByPlatform } from '@/utils/gameLists';

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // const [title, setTitle] = useState('');
  const [title, setTitle] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [filteredGames, setFilteredGames] = useState<string[]>([]);
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [itemType, setItemType] = useState('Game');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [overpriceConfirmed, setOverpriceConfirmed] = useState(false);
  const [platform, setPlatform] = useState('');
  const [gamestopPrice, setGamestopPrice] = useState<{
    sellPrice?: number;
    tradeInPrice?: number;
    recommendedPrice?: number;
    loading: boolean;
    error?: string;
  }>({ loading: false });

  const fullGameList = gamesByPlatform[platform] || [];

  useEffect(() => {
    if (
      gamestopPrice.recommendedPrice &&
      typeof price === 'number' &&
      price <= gamestopPrice.recommendedPrice
    ) {
      setOverpriceConfirmed(false);
    }
  }, [price, gamestopPrice.recommendedPrice]);

  //useEffect(() => {
  //  const filtered = query
  //    ? fullGameList
  //        .filter(game =>
  //          game.toLowerCase().includes(query.toLowerCase())
  //        )
  //        .slice(0, 10)
  //    : fullGameList.slice(0, 10);
//
  //  setFilteredGames(filtered);
//  }, [query, fullGameList]);

  useEffect(() => {
    const list = gamesByPlatform[platform] || [];
    const filtered = query
      ? list.filter(game =>
          game.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10)
      : list.slice(0, 10);

    setFilteredGames(filtered);
  }, [query, platform]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const fetchRecommendedPrice = async (selectedTitle: string) => {
    const searchTitle = `${selectedTitle} ${itemType === 'Game' ? platform : ''}`.trim();
    if (!searchTitle) return;
    setGamestopPrice({ loading: true });
    try {
      const res = await fetch(`/api/recommend-price?title=${encodeURIComponent(searchTitle)}`);
      const data = await res.json();
      if (res.ok) {
        setGamestopPrice({
          sellPrice: data.sellPrice,
          tradeInPrice: data.tradeInPrice,
          recommendedPrice: data.recommendedPrice,
          loading: false,
        });
        setPrice(data.recommendedPrice);
      } else {
        setGamestopPrice({ loading: false, error: data.error || 'Failed to fetch' });
      }
    } catch (err) {
      setGamestopPrice({ loading: false, error: 'Request failed' });
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a listing.');
      return;
    }
    const id = uuidv4();
    const listing = {
      id,
      title,
      price: Number(price),
      description,
      category,
      itemType,
      platform: itemType === 'Game' ? platform : '',
      gamestopSellPrice: gamestopPrice.sellPrice ?? null,
      gamestopTradeInPrice: gamestopPrice.tradeInPrice ?? null,
      gamestopRecommendedPrice: gamestopPrice.recommendedPrice ?? null,
      createdAt: new Date(),
      userId: user.uid,
      imageUrls: [],
    };
    await setDoc(doc(db, 'listings', id), listing);
    toast.success('Listing created!');
    router.push(`/listing/${id}`);
  };

  const isOverpriced =
    gamestopPrice.recommendedPrice &&
    typeof price === 'number' &&
    price > gamestopPrice.recommendedPrice;

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Item Type</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={itemType}
            onChange={e => {
              setItemType(e.target.value);
              setPlatform('');
              setGamestopPrice({ loading: false });
            }}>
            <option>Game</option>
            <option>Console</option>
            <option>Accessory</option>
            <option>Other</option>
          </select>
        </div>
        {itemType === 'Game' && (
          <div>
            <label className="block font-medium mb-1">Platform</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={platform}
              onChange={e => setPlatform(e.target.value)}>
              <option value="">Select Platform</option>
              <option>PlayStation 5</option>
              <option>PlayStation 4</option>
              <option>PlayStation 3</option>
              <option>Xbox Series X</option>
              <option>Nintendo Switch</option>
              <option>PC</option>
              <option>Xbox One</option>
            </select>
          </div>
        )}
        <div>
          <label className="block font-medium mb-1">Title</label>
              <Combobox
                value={title}
                onChange={(selected) => {
                  const selectedTitle = selected ?? '';
                  setTitle(selectedTitle);
                  if (filteredGames.includes(selectedTitle)) {
                    fetchRecommendedPrice(selectedTitle);
                  }
                }}
              >
            <Combobox.Input
              className="w-full border px-3 py-2 rounded"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Start typing a game title..."
              // onBlur={fetchRecommendedPrice}
            />
            <Combobox.Options className="bg-white border mt-1 rounded shadow">
              {filteredGames.map((game) => (
                <Combobox.Option
                  key={game}
                  value={game}
                  className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                >
                  {game}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
        </div>
        {gamestopPrice.loading && <p className="text-sm text-gray-500">Checking GameStop prices...</p>}
        {gamestopPrice.recommendedPrice && (
          <div className="mt-4 rounded-xl border border-black-300 bg-blue-50 p-4 shadow-sm space-y-2">
            <div className="text-base font-medium text-yellow-900">
              <span className="text-sm font-semibold text-gray-600">GameStop sells for:</span>{' '}${gamestopPrice.sellPrice?.toFixed(2)}
            </div>
            <div className="text-base font-medium text-yellow-900">
              <span className="text-sm font-semibold text-gray-600">GameStop trade-in value:</span>{' '}${gamestopPrice.tradeInPrice?.toFixed(2)}
            </div>
            <div className="text-base font-semibold text-green-800 bg-green-100 border border-green-300 px-3 py-2 rounded-md">
            Recommended Listing Price: ${gamestopPrice.recommendedPrice?.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 italic">
              This price splits the difference between GameStop's buy and sell rates, ensuring the best deal for both the buyer and seller. Buy for ess, sell for more.
            </p>
          </div>
        )}
        {gamestopPrice.error && <div className="text-sm text-red-600">Couldn’t fetch GameStop pricing: {gamestopPrice.error}</div>}
        <div>
          <label className="block font-medium mb-1">Price (USD)</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded disabled:bg-gray-100 disabled:text-gray-500"
            value={price}
            onChange={e => setPrice(parseFloat(e.target.value))}
            disabled={gamestopPrice.loading}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Points of Interest</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            placeholder="Is there anything the buyer should know?"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition text-sm font-medium text-gray-600">
          <span>📤 Upload Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
        {images.length > 0 && (
          <ul className="mt-2 text-sm text-gray-500">
            {images.map((file, idx) => (
              <li key={idx}>{'✅ ' + file.name + ' uploaded successfully'}</li>
            ))}
          </ul>
        )}
        {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-auto rounded border" />}

        {isOverpriced && (
          <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800 mt-4">
            ⚠️ This price is higher than our recommendation of ${gamestopPrice.recommendedPrice?.toFixed(2)}.
            Your listing will be marked as <strong>Overpriced</strong> on the marketplace.
          </div>
        )}

        {isOverpriced && (
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              checked={overpriceConfirmed}
              onChange={e => setOverpriceConfirmed(e.target.checked)}
              className="mr-2"
              required
            />
            <label className="text-sm text-red-800">I understand and want to proceed anyway</label>
          </div>
        )}

        <button
          type="submit"
          disabled={Boolean(isOverpriced && !overpriceConfirmed)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
        >
          Create Listing
        </button>
      </form>
    </main>
  );
}
