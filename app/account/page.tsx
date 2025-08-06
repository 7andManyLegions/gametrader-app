'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileModal from '@/components/ProfileModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';


export default function AccountPage() {
  
  const router = useRouter();
  const [open, setOpen] = useState(true); // modal opens immediately

  useEffect(() => {
    if (!open) router.back(); // Close modal -> go back
  }, [open, router]);

  return <ProfileModal isOpen={open} onClose={() => setOpen(false)} />;
}
