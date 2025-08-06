'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import { sendEmailVerification } from 'firebase/auth';

export default function CompleteRegistrationPage() {
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') ?? '';
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkVerified = async () => {
      const snap = await getDoc(doc(db, 'pendingUsers', email));
      if (snap.exists() && snap.data().verified) {
        setEmailVerified(true);
      }
    };
    if (email) checkVerified();
  }, [email]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword || password !== confirmPassword) {
      toast.error('Passwords must match.');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'users', auth.currentUser!.uid), {
        uid: auth.currentUser!.uid,
        email,
        username,
        createdAt: new Date(),
      });

      await sendEmailVerification(auth.currentUser!);
      await deleteDoc(doc(db, 'pendingUsers', email));

      toast.success('Account created! Please verify your email.');
      router.push('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Could not complete registration.');
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
          required
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          required
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          required
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm Password"
          className="w-full border p-2 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          <span className="text-sm cursor-pointer">Show Password</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer hover:bg-blue-900"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </main>
  );
}
