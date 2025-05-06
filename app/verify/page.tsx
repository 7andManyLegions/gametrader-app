'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'error'>('checking');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email) {
        setStatus('error');
        return;
      }

      const ref = doc(db, 'pendingUsers', email);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setStatus('error');
        return;
      }

      await updateDoc(ref, { verified: true });
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
