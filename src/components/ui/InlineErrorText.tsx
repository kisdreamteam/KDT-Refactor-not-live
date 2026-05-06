import type { FC, ReactNode } from 'react';

type InlineErrorTextProps = {
  children: ReactNode;
  className?: string;
};

const InlineErrorText: FC<InlineErrorTextProps> = ({ children, className = '' }) => {
  return <p className={className}>{children}</p>;
};

export default InlineErrorText;
