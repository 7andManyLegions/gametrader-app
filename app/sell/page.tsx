'use client';

import { useState, useEffect } from 'react';
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('game');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputStyle =
  "w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  // Restore draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('draftListing');
    if (saved) {
      const draft = JSON.parse(saved);
      setTitle(draft.title || '');
      setPrice(draft.price || '');
      setCategory(draft.category || 'game');
      setDescription(draft.description || '');
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
  
    try {
      const imageUrls: string[] = [];
  
      for (const file of images) {
        const imageRef = ref(storage, `listings/${user!.uid}/${uuidv4()}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      if (!user) {
        toast.error('You must be logged in to create a listing.');
        return;
      }
  
      const docRef = await addDoc(collection(db, 'listings'), {
        title,
        price: parseFloat(price),
        category,
        description,
        imageUrls,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      toast.success('Listing created successfully.');
      router.push(`/listing/${docRef.id}`);
      localStorage.removeItem('draftListing');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl mb-7">Create New Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className={inputStyle}
          type="text"
          placeholder="Title ('Halo Infinite' or 'PS5')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className={inputStyle}
          type="number"
          step="0.01"
          placeholder="Price (USD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <select
className={inputStyle}
value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="game">Game</option>
          <option value="console">Console</option>
          <option value="controller">Controller</option>
          <option value="memory">Memory</option>
          <option value="accessory">Accessory</option>
          <option value="other">Other</option>


        </select>
        <textarea
className={inputStyle}
placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
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
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-auto rounded border"
          />
        )}
        <button
  type="submit"
  className="bg-blue-600 text-white px-4 py-2 w-full disabled:opacity-50"
  disabled={submitting}
>
  {submitting ? 'Submitting...' : 'List Item'}
</button>

      </form>
    </main>
  );
}
