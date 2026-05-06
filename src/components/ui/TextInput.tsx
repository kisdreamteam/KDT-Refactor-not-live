import type { FC, InputHTMLAttributes } from 'react';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

const TextInput: FC<TextInputProps> = ({ className = '', ...props }) => {
  return <input className={className} {...props} />;
};

export default TextInput;
