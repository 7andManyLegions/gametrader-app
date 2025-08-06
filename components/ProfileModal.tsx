'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';
import { Eye, EyeOff, Pencil, X } from 'lucide-react';
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
} from 'firebase/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [emailVisible, setEmailVisible] = useState(false);
  const [mfaPhone, setMfaPhone] = useState('');
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!user || !isOpen || typeof window === 'undefined') return;

    if (!recaptchaVerifierRef.current) {
   recaptchaVerifierRef.current = new RecaptchaVerifier(
  auth,                        // the Auth instance first
  'recaptcha-container',       // the HTML element ID or element
  { size: 'invisible' }        // options
);

      recaptchaVerifierRef.current.render().catch(console.error);
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        await updateDoc(userRef, { username: username.trim() });
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          username: username.trim(),
          createdAt: new Date(),
        });
      }

      await updateProfile(user, { displayName: username.trim() });
      toast.success('Profile updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollMfa = async () => {
    if (!user) return toast.error('User not found.');
    if (!user.emailVerified) return toast.error('Verify your email first.');
    if (!mfaPhone) return toast.error('Enter a valid phone number.');

    try {
      const session = await multiFactor(user).getSession();
      const phoneProvider = new PhoneAuthProvider(auth);

      const verifier = recaptchaVerifierRef.current;
      if (!verifier) return toast.error('Recaptcha not ready.');

      const verificationId = await phoneProvider.verifyPhoneNumber(
        { phoneNumber: mfaPhone, session },
        verifier
      );

      const code = prompt('Enter the 6-digit code sent to your phone');
      if (!code) return toast.error('Verification code required.');

      const cred = PhoneAuthProvider.credential(verificationId, code);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(user).enroll(assertion, 'Phone');

      toast.success('MFA enrollment complete!');
    } catch (err) {
      console.error('MFA enrollment error:', err);
      toast.error('MFA enrollment failed.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="absolute inset-0 bg-black opacity-60" />
      <div className="relative bg-white p-6 rounded-lg w-full max-w-md z-10">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          <X />
        </button>

        {!user ? (
          <p className="p-4">Please log in to view your profile.</p>
        ) : (
          <>
            <h1 className="text-xl font-semibold mb-2">User Information</h1>
            <p className="text-gray-800 mb-6 flex items-center gap-2">
              <span className="font-semibold">Email:</span>{' '}
              {emailVisible ? user.email : '•••••••••••••••'}
              <button
                onClick={() => setEmailVisible(!emailVisible)}
                className="text-blue-600 hover:text-red-400"
              >
                {emailVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </p>

            <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
            {!editing ? (
              <div className="flex items-center justify-between">
                <p className="text-gray-800">
                  <span className="font-semibold">Username:</span>{' '}
                  {username || 'Not set'}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  <Pencil size={16} className="mr-1" /> Edit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <input
                  className="border p-2 rounded w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button
                  onClick={async () => {
                    await handleSave();
                    setEditing(false);
                  }}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}

            <h2 className="text-xl font-semibold mt-6">Multi-Factor Authentication</h2>
            <div className="mt-2 flex gap-2 items-center">
              <input
                type="tel"
                placeholder="+11234567890"
                value={mfaPhone}
                onChange={(e) => setMfaPhone(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <button
                onClick={handleEnrollMfa}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Enroll MFA
              </button>
            </div>
          </>
        )}
        <div id="recaptcha-container" className="hidden" />
      </div>
    </div>
  );
}
