'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  MultiFactorResolver,
  RecaptchaVerifier,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaVerificationId, setMfaVerificationId] = useState('');
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);

  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    if (!email || !password) {
      toast.error('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      // Clear any previous MFA state
      setShowMfaInput(false);
      setMfaResolver(null);

      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/multi-factor-auth-required') {
        const resolver: MultiFactorResolver = err.resolver;
        setMfaResolver(resolver);
        setShowMfaInput(true);
        console.log('🔐 MFA required, beginning second factor flow.');
        
        if (!resolver?.hints?.length) {
          console.error('❌ MFA resolver hints missing or empty');
          setLoading(false);
          return toast.error('MFA setup is incomplete. Please contact support.');
        }

        const phoneInfo = {
          multiFactorHint: resolver.hints[0],
          session: resolver.session,
        };

        try {
          const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });

          await recaptchaVerifier.render();
          console.log('✅ reCAPTCHA rendered');

          const phoneAuthProvider = new PhoneAuthProvider(auth);
          const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfo, recaptchaVerifier);
          setMfaVerificationId(verificationId);
          console.log('✅ SMS sent. Verification ID:', verificationId);

          toast.success('A verification code has been sent to your phone.');

        } catch (mfaError) {
          console.error('❌ MFA failed', mfaError);
          toast.error('Multi-factor authentication failed.');
        }
      } else {
        console.error('❌ Login error:', err);
        toast.error((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSignIn = async () => {
    if (!mfaCode) {
      toast.error('Verification code is required.');
      return;
    }
    setLoading(true);
    try {
      if (!mfaResolver) throw new Error('MFA resolver not found.');

      const cred = PhoneAuthProvider.credential(mfaVerificationId, mfaCode);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await mfaResolver.resolveSignIn(assertion);
      router.push('/');
    } catch (err: any) {
      console.error('❌ MFA sign-in failed', err);
      toast.error('Multi-factor authentication failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-sm mx-auto">
      <h1 className="font-roboto font-bold text-black-900 text-2xl text-center mb-7">
        Login to GameTrader
      </h1>

      <div className="space-y-4">
        {!showMfaInput ? (
          <>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 w-full mb-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 text-sm py-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Sign in with Google</span>
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700">
              Enter the 6-digit code sent to your phone.
            </p>
            <input
              placeholder="MFA Code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            <button
              onClick={handleMfaSignIn}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </>
        )}
      </div>

      <div className="text-sm text-center mt-8 cursor-pointer hover:bg-green-100">
        New to GameTrader?{' '}
        <a href="/register" className="text-blue-600 underline">
          Register here
        </a>
      </div>

      <div id="recaptcha-container" className="hidden" />
    </div>
  );
}