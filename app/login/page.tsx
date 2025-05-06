'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        if (sellRedirect) {
          router.push('/sell');
        } else {
          router.push('/');
        }
      }
    });
    return () => unsub();
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const sellRedirect = searchParams?.get('sellRedirect') === 'true';
  
  const inputStyle =
  "w-full border border-gray-300 rounded-lg mb-4 p-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";


  const handleAuth = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert((err as Error).message);
    }
  };
  
  

  return (
    <div className="p-8 max-w-sm mx-auto">
      <h1 className="text-xl text-center mb-7">Login</h1>
      <input
        className={inputStyle}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={inputStyle}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth} className="bg-blue-600 text-white px-4 py-2 w-full mb-2">
  Login
</button>

<div className="mt-4">
<button
  onClick={handleGoogleLogin}
  className="w-full flex items-center justify-center gap-3 border border-gray-300 text-sm py-2 rounded hover:bg-gray-100 transition"
>
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="Google"
    className="w-5 h-5"
  />
  <span>Sign in with Google</span>
</button>
<div className="text-sm text-center mt-8">
  No account?{' '}
  <a href="/register" className="text-blue-600 underline">
    Register here
  </a>
</div>
</div>
    </div>
  );
}

