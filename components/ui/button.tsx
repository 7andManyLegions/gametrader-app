'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', className, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
    const styles: Record<Variant, string> = {
      primary:
        'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-600',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    };

    return (
      <button
        ref={ref}
        className={clsx(base, styles[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
