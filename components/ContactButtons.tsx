import { Button } from '@/components/ui/button';
import { useState } from 'react';
import OfferModal from './OfferModal';
import { useAuth } from '@/context/AuthContext';

export default function ContactButtons({ listing }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || user.uid === listing.ownerUid) return null;

  return (
    <>
      <Button onClick={() => openThread(listing.ownerUid)}>Contact Seller</Button>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Make an Offer
      </Button>
      <OfferModal open={open} onClose={() => setOpen(false)} listing={listing} />
    </>
  );

  function openThread(sellerUid: string) {
    // TODO: push(`/messages/${sellerUid}`)
  }
}
