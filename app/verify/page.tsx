'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';


export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
if (!searchParams) {
  return <Spinner />;
}
const email = (searchParams as URLSearchParams).get('email') ?? '';

  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'error'>('checking');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email) return setStatus('error');

      const ref = doc(db, 'pendingUsers', email);
      const snap = await getDoc(ref);
      if (!snap.exists()) return setStatus('error');

      await setDoc(ref, { verified: true }, { merge: true });
      toast.success('Email verified!');
      setStatus('redirecting');
      setTimeout(() => {
        router.push(`/complete-registration?email=${encodeURIComponent(email)}`);
      }, 1500);
    };

    verifyEmail();
  }, [email, router]);

  return (
    <main className="p-8 text-center">
      {status === 'checking' && <p>Verifying your email...</p>}
      {status === 'redirecting' && <p>Redirecting to complete registration...</p>}
      {status === 'error' && <p className="text-red-600">Invalid or expired verification link.</p>}
    </main>
  );
}
