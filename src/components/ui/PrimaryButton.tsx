import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: ReactNode;
};

const PrimaryButton: FC<PrimaryButtonProps> = ({ className = '', children, ...props }) => {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export default PrimaryButton;
