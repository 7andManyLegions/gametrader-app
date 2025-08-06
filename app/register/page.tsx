'use client';
import { useState } from 'react';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address.');
      return;
    }
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        // Email already in use
        await setDoc(doc(db, 'emailNotify', email), {
          message: 'Someone tried to register with your email. If it was you, log in instead.',
          attemptedAt: new Date(),
        });
        toast.success('Check your email for further instructions.');
      } else {
        // Save pending user and redirect to simulated verification link
        await setDoc(doc(db, 'pendingUsers', email), {
          email,
          verified: false,
          createdAt: new Date(),
        });
        toast.success('Verification email sent.');
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl mb-4 font-bold">Register</h1>
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50 hover:bg-blue-700"
        >
          {loading ? 'Checking...' : 'Continue'}
        </button>
      </form>
    </main>
  );
}
