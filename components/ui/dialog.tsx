'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface DialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      {/* stopPropagation so inner clicks don’t close */}
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function DialogContent({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold mb-4">{children}</h3>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className={clsx('mt-6 flex justify-end gap-2', 'sm:justify-end')}>
      {children}
    </div>
  );
}
