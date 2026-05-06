import type { FC, ReactNode } from 'react';

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

const AuthCard: FC<AuthCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative bg-brand-cream rounded-[28px] shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export default AuthCard;
