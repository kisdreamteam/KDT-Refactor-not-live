'use client';

import Link from 'next/link';
import type { FC } from 'react';

import FormLabel from '@/components/ui/FormLabel';
import TextInput from '@/components/ui/TextInput';
import PasswordInput from '@/components/ui/PasswordInput';
import InlineErrorText from '@/components/ui/InlineErrorText';
import AuthBackLink from '@/components/ui/auth/AuthBackLink';
import AuthCard from '@/components/ui/auth/AuthCard';
import AuthFormHeader from '@/components/ui/auth/AuthFormHeader';
import AuthFormFooter from '@/components/ui/auth/AuthFormFooter';
import AuthPrimaryButton from '@/components/ui/auth/AuthPrimaryButton';

type LoginFormProps = {
  email: string;
  password: string;
  isLoading: boolean;
  error?: string;
  success?: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (data: { email: string; password: string }) => void | Promise<void>;
};

const LoginForm: FC<LoginFormProps> = ({
  email,
  password,
  isLoading,
  error,
  success,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <>
      <AuthBackLink className="top-6 left-6" />
      <AuthCard className="w-9/10 md:w-1/3 pb-2 px-2 md:px-6">
        <AuthFormHeader title="Login" />
        <form
          className="grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit({ email, password });
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <FormLabel htmlFor="email" className="text-base font-semibold text-[24px] text-black font-spartan">
                Email address
              </FormLabel>
              <TextInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                className="h-12 rounded-[12px] border border-black/20 bg-white px-4 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 font-sans disabled:opacity-60"
                placeholder=""
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <FormLabel htmlFor="password" className="text-base font-semibold text-black text-[24px] font-spartan">
                Password
              </FormLabel>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-12 w-full rounded-[12px] border border-black/20 bg-white px-4 pr-12 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 font-sans disabled:opacity-60"
                placeholder=""
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
              />
            </div>

            <div className="text-left">
              <Link href="/forgot-password" className="text-[18px] text-sm text-gray-600 hover:underline font-spartan">
                Forgot your password?
              </Link>
            </div>

            <div className="flex justify-center gap-3">
              <AuthPrimaryButton
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in…' : 'Login'}
              </AuthPrimaryButton>
            </div>

            {error && (
              <InlineErrorText className="text-sm text-red-600 text-center">{error}</InlineErrorText>
            )}
            {success && (
              <InlineErrorText className="text-sm text-green-600 text-center">{success}</InlineErrorText>
            )}
          </div>
        </form>
        <AuthFormFooter
          promptText="Don&apos;t have an account?"
          linkText="Sign up"
          linkHref="/signup"
        />
      </AuthCard>
    </>
  );
};

export default LoginForm;
