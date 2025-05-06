'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { db, storage } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  params: { id: string };
}

export default function EditListingPage({ params }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const id = params.id;
  const [editing, setEditing] = useState(false);
  const [listing, setListing] = useState<DocumentData | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('game');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setListing(data);
        setTitle(data.title);
        setPrice(data.price);
        setCategory(data.category);
        setDescription(data.description);
        setExistingImages(data.imageUrls || []);
      }
    };
    fetchListing();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to edit this listing');
      return;
    }
    
    setEditing(true);
  
    try {
      const newImageUrls: string[] = [...existingImages];
  
      for (const file of images) {
        const imageRef = ref(storage, `listings/${user.uid}/${uuidv4()}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        newImageUrls.push(url);
      }
  
      await updateDoc(doc(db, 'listings', id), {
        title,
        price: parseFloat(price),
        category,
        description,
        imageUrls: newImageUrls,
        updatedAt: serverTimestamp(),
      });
  
      toast.success('Listing updated!');
      router.push('/account');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update listing');
    } finally {
      setEditing(false);
    }
  };
  

  if (!listing) return <p className="p-8">Loading listing...</p>;

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl mb-4">Edit Listing</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
          type="number"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <select
          className="border p-2 w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="game">Game</option>
          <option value="merch">Merch</option>
        </select>
        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {existingImages.map((url, idx) => (
              <div key={idx} className="relative border rounded overflow-hidden">
                <img
                  src={url}
                  alt={`Current Image ${idx}`}
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(url)}
                  className="absolute top-2 right-2 bg-white text-red-500 text-xs px-2 py-1 rounded shadow z-10"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New image uploads */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="block w-full border p-2"
        />
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {imagePreviews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Preview ${i}`}
                className="w-full h-32 object-cover border rounded"
              />
            ))}
          </div>
        )}
        <button
  type="submit"
  className="bg-blue-600 text-white px-4 py-2 w-full disabled:opacity-50"
  disabled={editing}
>
  {editing ? 'Saving...' : 'Save Changes'}
</button>

      </form>
    </main>
  );
}
