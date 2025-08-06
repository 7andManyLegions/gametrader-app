import {
  getAuth,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  User,
} from 'firebase/auth';

// Important: This import is NOT used directly, but we keep it to ensure Firebase is initialized.
import { RecaptchaVerifier } from 'firebase/auth';

export async function enrollMfaWithPhone(
  user: User,
  phoneNumber: string,
  mfaDisplayName = 'Phone'
) {
  const auth = getAuth();

  if (typeof window === 'undefined') {
    throw new Error('This function must be called in the browser');
  }

  // ✅ Ensure Firebase compat is mounted to window
  const recaptchaVerifier = new RecaptchaVerifier(
  auth, // ✅ FIRST: Auth instance
  'recaptcha-container', // ✅ SECOND: container ID (string)
  { size: 'invisible' } // ✅ THIRD: config
);

  // ✅ Optional but good: manually get Enterprise token
  const recaptchaToken = await new Promise<string>((resolve, reject) => {
    const grecaptcha = (window as any).grecaptcha;
    if (!grecaptcha) return reject(new Error('reCAPTCHA not loaded'));

    grecaptcha.enterprise.ready(() => {
      grecaptcha.enterprise
        .execute('6LfiKoErAAAAAODj_xpFDmh0ltGZlGG2N-hmvxA3', { action: 'LOGIN' })
        .then(resolve)
        .catch(reject);
    });
  });

  console.log('Enterprise reCAPTCHA token:', recaptchaToken);

  // 🔐 Get MFA session
  const mfaSession = await multiFactor(user).getSession();

  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber(
    {
      phoneNumber,
      session: mfaSession,
    },
    recaptchaVerifier
  );

  const verificationCode = prompt('Enter the verification code sent to your phone');
  if (!verificationCode) throw new Error('Verification code is required');

  const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

  await multiFactor(user).enroll(multiFactorAssertion, mfaDisplayName);
}
