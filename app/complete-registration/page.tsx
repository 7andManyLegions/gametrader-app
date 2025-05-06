'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useIdleLogout } from '@/hooks/useIdleLogout';

export default function CompleteRegistrationPage() {
  useIdleLogout();

  const searchParams = useSearchParams();
  const email = searchParams?.get('email') ?? '';
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      const snap = await getDoc(doc(db, 'pendingUsers', email));
      if (snap.exists() && snap.data().verified) {
        setEmailVerified(true);
      }
    };
    if (email) checkVerification();
  }, [email]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
  
      // 🔄 Wait for auth state to update
      await new Promise<void>((resolve) => {
        const unsub = auth.onAuthStateChanged((user) => {
          if (user) {
            unsub();
            resolve();
          }
        });
      });
  
      // ✅ Now request.auth.uid will be set properly
      await setDoc(doc(db, 'users', auth.currentUser!.uid), {
        uid: auth.currentUser!.uid,
        email,
        username,
        createdAt: new Date(),
      });
  
      await deleteDoc(doc(db, 'pendingUsers', email));
  
      toast.success('Account created!');
      router.push('/');
    } catch (err) {
      console.error(err);
      toast.error('Registration failed.');
    } finally {
      setLoading(false);
    }
  };
  

  if (!email) return <p className="p-8">Missing email parameter</p>;
  if (!emailVerified) return <p className="p-8">Email not verified yet.</p>;

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl mb-4 font-bold">Create Account</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
  type="password"
  placeholder="Confirm Password"
  className="w-full border p-2 rounded"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
/>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </main>
  );
}
