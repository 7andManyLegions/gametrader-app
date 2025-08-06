'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface OfferModalProps {
  open: boolean;
  onClose: () => void;
  listing: {
    id: string;
    ownerUid: string;
    price: number;
    [key: string]: any;
  };
}

export default function OfferModal({ open, onClose, listing }: OfferModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(listing.price);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);

    await setDoc(
      doc(db, 'offers', `${listing.id}_${user.uid}`),
      {
        listingId: listing.id,
        sellerUid: listing.ownerUid,
        buyerUid: user.uid,
        amount,
        status: 'pending',
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    setSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>Make an Offer</DialogHeader>

        <Input
          type="number"
          min={1}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="mt-2"
        />

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={submitting} onClick={submit}>
            Send Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
