import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2024-04-10',
});

export const createConnectLink = functions.https.onCall(async (data, context) => {
  if (!context.auth)
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

  const uid = context.auth.uid;
  const email = context.auth.token.email;

  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
  });

  await admin
    .firestore()
    .doc(`users/${uid}`)
    .set({ stripeAccountId: account.id, stripeOnboarded: false }, { merge: true });

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: data.refresh_url,
    return_url: data.return_url,
    type: 'account_onboarding',
  });

  return { url: link.url };
});
