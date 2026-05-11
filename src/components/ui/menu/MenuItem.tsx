'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type MenuItemIntent = 'default' | 'danger';

interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  intent?: MenuItemIntent;
}

export default function MenuItem({
  children,
  icon,
  active = false,
  intent = 'default',
  className = '',
  type = 'button',
  ...rest
}: MenuItemProps) {
  const colorClass =
    intent === 'danger'
      ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
      : active
        ? 'bg-purple-50 font-medium text-brand-purple'
        : 'text-gray-700 hover:bg-gray-100';

  const iconClass = intent === 'danger' ? 'text-red-400 group-hover:text-red-600' : 'text-gray-400 group-hover:text-blue-600';

  return (
    <button
      type={type}
      className={[
        'group flex w-full items-center px-4 py-2 text-left text-sm transition-colors',
        colorClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon ? <span className={['mr-3 h-5 w-5 transition-colors', iconClass].join(' ')}>{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
