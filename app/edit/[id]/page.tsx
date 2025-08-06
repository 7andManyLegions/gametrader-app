'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { db, storage } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import TitleAutocompleteInput, { ITEM_TYPES } from '@/components/TitleAutocompleteInput';

export default function EditListingPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();

  const [itemType, setItemType] = useState('Game');
  const [platform, setPlatform] = useState('');
  const [title, setTitle] = useState('');
  const [rawgMeta, setRawgMeta] = useState<{ id: number; image: string } | null>(null);
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchListing = async () => {
      const snap = await getDoc(doc(db, 'listings', id));
      if (!snap.exists()) {
        toast.error('Listing not found');
        router.push('/account');
        return;
      }

      const data = snap.data();
      setItemType(data.itemType || data.category || 'Game');
      setPlatform(data.platform || '');
      setTitle(data.title || '');
      setRawgMeta(data.rawgId ? { id: data.rawgId, image: data.coverImage } : null);
      setPrice(data.price || '');
      setDescription(data.description || '');
      setExistingImages(data.imageUrls || []);
    };

    fetchListing();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages(files);
    setPreviewUrls(files.map(file => URL.createObjectURL(file)));
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }

    const newImageUrls: string[] = [...existingImages];

    for (const file of newImages) {
      const storagePath = `listing-images/${id}/${file.name}`;
      const imageRef = ref(storage, storagePath);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      newImageUrls.push(url);
    }

    await updateDoc(doc(db, 'listings', id), {
      title,
      price: Number(price),
      platform,
      description,
      itemType,
      category: itemType,
      imageUrls: newImageUrls,
      rawgId: rawgMeta?.id || null,
      coverImage: rawgMeta?.image || null,
      updatedAt: serverTimestamp(),
    });

    toast.success('Listing updated!');
    router.push(`/listing/${id}`);
  };

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Title & Platform */}
        {itemType === 'Game' ? (
          <>
            <div>
              <label className="block font-medium mb-1">Console</label>
              <TitleAutocompleteInput
                category="Console"
                initialValue={platform}
                onSelect={(val) => setPlatform(val)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Game Title</label>
              <TitleAutocompleteInput
                category="Game"
                initialValue={title}
                onSelect={(val, meta) => {
                  setTitle(val);
                  setRawgMeta(meta || null);
                }}
              />
              {rawgMeta?.image && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">🎮 Suggested Game Cover</p>
                  <div className="relative">
                    <img
                      src={rawgMeta.image}
                      alt="Suggested cover"
                      className="w-full h-auto rounded border"
                    />
                    <div className="absolute top-0 left-0 w-full text-center text-white font-anton text-4xl tracking-wider py-3">
                      <p>{title}</p>
                    </div>
                  </div>
                  <p className="font-roboto font-thin italic text-black text-right">
                    <span className="italic">Cover Art Credit: </span>
                    <a
                      href="https://rawg.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="not-italic font-normal underline hover:text-purple-700"
                    >
                      RAWG
                    </a>
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <label className="block font-medium mb-1">Title</label>
            <TitleAutocompleteInput
              category={itemType}
              initialValue={title}
              onSelect={(val, meta) => {
                setTitle(val);
                setRawgMeta(meta || null);
              }}
            />
          </div>
        )}

        {/* Price */}
        <div>
          <label className="block font-medium mb-1">Price (USD)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
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
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {existingImages.map((url, i) => (
              <div key={i} className="relative border rounded overflow-hidden">
                <img src={url} alt={`Image ${i}`} className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(url)}
                  className="absolute top-2 right-2 bg-white text-red-500 text-xs px-2 py-1 rounded shadow z-10 cursor-pointer hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New Image Upload */}
        <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition text-sm text-gray-600">
          Upload New Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {previewUrls.length > 0 && (
          <img src={previewUrls[0]} alt="Preview" className="w-full h-auto rounded border mt-4" />
        )}

        {/* Save Button */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full cursor-pointer"
        >
          Update Listing  
        </button>
      </form>
    </main>
  );
}
