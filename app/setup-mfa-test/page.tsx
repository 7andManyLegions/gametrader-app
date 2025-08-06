'use client';

import { useState } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
} from 'firebase/auth';

export default function SetupMfaTestPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (!phone) return alert('Enter a phone number');

    const user = auth.currentUser;
    if (!user) return alert('No user logged in');

    try {
      setLoading(true);

const recaptchaVerifier = new RecaptchaVerifier(
  auth, // ✅ FIRST: Auth instance
  'recaptcha-container', // ✅ SECOND: container ID (string)
  { size: 'invisible' } // ✅ THIRD: config
);

      await recaptchaVerifier.render();

      const mfaSession = await multiFactor(user).getSession();
      const phoneAuthProvider = new PhoneAuthProvider(auth);

      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        { phoneNumber: phone, session: mfaSession },
        recaptchaVerifier
      );

      const code = prompt('Enter the code sent to your phone');
      if (!code) return;

      const cred = PhoneAuthProvider.credential(verificationId, code);
      const assertion = PhoneMultiFactorGenerator.assertion(cred);

      await multiFactor(user).enroll(assertion, 'My Phone');
      alert('✅ MFA enrolled successfully');
    } catch (err) {
      console.error(err);
      alert('MFA enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test MFA Setup</h1>
      <input
        className="border p-2 rounded w-full mb-4"
        type="tel"
        placeholder="+11234567890"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? 'Enrolling...' : 'Enroll in MFA'}
      </button>
      <div id="recaptcha-container" />
    </div>
  );
}

