'use client';

import type { HTMLAttributes, ReactNode } from 'react';

interface MenuSurfaceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
}

export default function MenuSurface({ children, className = '', ...rest }: MenuSurfaceProps) {
  return (
    <div
      className={[
        'min-w-[200px] rounded-lg border-4 border-brand-purple bg-blue-100 py-2 shadow-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
