'use client';

import Image from 'next/image';
import Link from 'next/link';
import FormLabel from '@/components/ui/FormLabel';
import TextInput from '@/components/ui/TextInput';
import PasswordInput from '@/components/ui/PasswordInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import InlineErrorText from '@/components/ui/InlineErrorText';
import AuthBackLink from '@/components/ui/AuthBackLink';
import AuthCard from '@/components/ui/AuthCard';

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

function LoginHeader() {
  return (
    <>
      <div className="absolute top-0 right-7">
        <Image
          src="/images/login/login-logo.png"
          alt="Kis points logo"
          width={180}
          height={180}
          priority
          className="h-auto w-auto max-w-[180px]"
        />
      </div>

      <div className="mb-8 mt-2">
        <h1 className="text-6xl font-extrabold text-brand-purple font-spartan">
          Login
        </h1>
      </div>
    </>
  );
}

function LoginFooter() {
  return (
    <div className="mt-6 text-center text-sm text-[18px]">
      <span className="text-gray-600 font-spartan">Don&apos;t have an account? </span>
      <Link href="/signup" className="text-brand-pink text-[18px] font-semibold font-spartan hover:underline">
        Sign up
      </Link>
    </div>
  );
}

export default function LoginForm({
  email,
  password,
  isLoading,
  error,
  success,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <>
      <AuthBackLink
        className="text-gray-300 flex-shrink-0"
        style={{
          left: 'max(calc(50% - 400px - 48px), 24px)',
          top: 'calc(50% - 220px)',
        }}
        strokeWidth={3}
      />
      <AuthCard className="w-full max-w-[800px] px-8 py-10">
        <LoginHeader />
        <form
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit({ email, password });
          }}
        >
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
            <PrimaryButton
              type="submit"
              disabled={isLoading}
              className="h-12 w-[750px] px-8 rounded-[12px] bg-brand-pink text-white font-bold text-2xl tracking-tight hover:brightness-95 transition focus:outline-none focus:ring-4 focus:ring-brand-pink/30 font-spartan disabled:opacity-60"
            >
              {isLoading ? 'Logging in…' : 'Login'}
            </PrimaryButton>
          </div>

          {error && (
            <InlineErrorText className="text-sm text-red-600 text-center">{error}</InlineErrorText>
          )}
          {success && (
            <InlineErrorText className="text-sm text-green-600 text-center">{success}</InlineErrorText>
          )}
        </form>
        <LoginFooter />
      </AuthCard>
    </>
  );
}
