import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { items } = req.body; // [{ title, price, sellerStripeId }]
    
    // Group items by seller, with explicit type for the accumulator
    const sellers = items.reduce((acc: Record<string, any[]>, item: any) => {
        acc[item.sellerStripeId] = acc[item.sellerStripeId] || [];
        acc[item.sellerStripeId].push(item);
        return acc;
    }, {});

    const lineItems = Object.keys(sellers).flatMap(sellerId =>
      sellers[sellerId].map((item: any) => ({
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(item.price * 100),
          product_data: { name: item.title },
        },
        quantity: 1,
      }))
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      payment_intent_data: {
        application_fee_amount: Math.round(
          items.reduce((s: number, i: any) => s + i.price, 0) * 100 * 0.05, // 5% fee for the marketplace
        ),
        // This is a simplified approach, a real-world multi-seller cart would require
        // a more complex payment splitting logic, possibly with separate PaymentIntents.
        // For now, this will transfer to the first seller as a single transfer.
        transfer_data: {
            destination: items[0].sellerStripeId
        }
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}