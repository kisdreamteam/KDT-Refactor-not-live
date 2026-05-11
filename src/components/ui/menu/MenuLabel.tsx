'use client';

import type { ReactNode } from 'react';

interface MenuLabelProps {
  children: ReactNode;
  className?: string;
}

export default function MenuLabel({ children, className = '' }: MenuLabelProps) {
  return (
    <div className={['px-4 py-2 text-sm font-semibold text-gray-700', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
