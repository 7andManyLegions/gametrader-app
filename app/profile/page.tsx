'use client';

import { useAuth } from '@/lib/useAuth';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTheme } from '@/lib/ThemeContext'; 
import { Pencil } from 'lucide-react'; 


export default function ProfilePage() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

//   const { theme, toggleTheme } = useTheme(); 

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setUsername(snap.data().username || '');
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
  
      if (snap.exists()) {
        await updateDoc(userRef, {
          username: username.trim(),
        });
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          username: username.trim(),
          createdAt: new Date(),
        });
      }
  
      // ✅ Update Firebase Auth profile displayName too
      await updateProfile(auth.currentUser!, {
        displayName: username.trim(),
      });
  
      toast.success('Profile updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  

  if (!user) return <p className="p-8">Please log in to view your profile.</p>;

  return (
    <main className="p-8 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-2">User Information</h1>
        <p className="text-gray-800">
        <span className="font-semibold">Email:</span> {user.email || 'Not set'}</p>
      </div>
  
      <div className="mb-8">
  <h2 className="text-xl font-semibold mb-2">Account Settings</h2>

  {!editing ? (
    <div className="flex items-center justify-between">
      <p className="text-gray-800">
        <span className="font-semibold">Username:</span> {username || 'Not set'}
      </p>
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-blue-600 hover:underline flex items-center"
      >
        <Pencil size={16} className="mr-1" /> Edit
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <input
        className="border p-2 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        onClick={async () => {
          await handleSave();      // Save to Firestore + Auth
          setEditing(false);       // Hide input
        }}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )}
</div>

  
      <div className="mb-4">
  {/* <h2 className="text-xl font-semibold mb-2">Appearance</h2> */}
  {/* <button
    onClick={toggleTheme}
    className="px-4 py-2 border rounded hover:bg-gray-100 transition"
  >
    Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
  </button> */}
</div>
    </main>
  );
  
}
