'use client';

import Image from 'next/image';
import Link from 'next/link';
import FormLabel from '@/components/ui/FormLabel';
import PasswordInput from '@/components/ui/PasswordInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import InlineErrorText from '@/components/ui/InlineErrorText';
import AuthBackLink from '@/components/ui/AuthBackLink';
import AuthCard from '@/components/ui/AuthCard';

type ResetPasswordFormProps = {
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error?: string;
  success?: string;
  isSessionChecked: boolean;
  hasSession: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (data: { password: string; confirmPassword: string }) => void | Promise<void>;
};

function ResetHeader() {
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
          Reset password
        </h1>
        <p className="mt-4 text-lg text-black/70 font-spartan">
          Choose a new password for your account.
        </p>
      </div>
    </>
  );
}

export default function ResetPasswordForm({
  password,
  confirmPassword,
  isLoading,
  error,
  success,
  isSessionChecked,
  hasSession,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ResetPasswordFormProps) {
  return (
    <>
      <AuthBackLink
        className="text-gray-300 flex-shrink-0"
        style={{
          left: 'max(calc(50% - 400px - 48px), 24px)',
          top: 'calc(50% - 220px)',
        }}
        href="/login"
        strokeWidth={3}
      />
      <AuthCard className="w-full max-w-[800px] px-8 py-10">
        <ResetHeader />

        {!isSessionChecked ? (
          <p className="text-center text-brand-purple font-spartan">Checking your session...</p>
        ) : !hasSession ? (
          <div className="grid gap-4 text-center">
            <p className="text-black/80 font-spartan">
              This link is invalid or has expired. Request a new reset link.
            </p>
            <Link
              href="/forgot-password"
              className="text-brand-pink font-semibold font-spartan hover:underline"
            >
              Forgot password
            </Link>
          </div>
        ) : (
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmit({ password, confirmPassword });
            }}
          >
            <div className="grid gap-2">
              <FormLabel
                htmlFor="new-password"
                className="text-base font-semibold text-black text-[24px] font-spartan"
              >
                New password
              </FormLabel>
              <PasswordInput
                id="new-password"
                name="password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                className="h-12 w-full rounded-[12px] border border-black/20 bg-white px-4 pr-12 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 font-sans disabled:opacity-60"
                placeholder=""
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <FormLabel
                htmlFor="confirm-password"
                className="text-base font-semibold text-black text-[24px] font-spartan"
              >
                Confirm new password
              </FormLabel>
              <PasswordInput
                id="confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                disabled={isLoading}
                className="h-12 w-full rounded-[12px] border border-black/20 bg-white px-4 pr-12 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 font-sans disabled:opacity-60"
                placeholder=""
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
              />
            </div>

            <div className="flex justify-center gap-3">
              <PrimaryButton
                type="submit"
                disabled={isLoading}
                className="h-12 w-full max-w-[750px] px-8 rounded-[12px] bg-brand-pink text-white font-bold text-2xl tracking-tight hover:brightness-95 transition focus:outline-none focus:ring-4 focus:ring-brand-pink/30 font-spartan disabled:opacity-60"
              >
                {isLoading ? 'Saving…' : 'Update password'}
              </PrimaryButton>
            </div>

            {error && (
              <InlineErrorText className="text-sm text-red-600 text-center">{error}</InlineErrorText>
            )}
            {success && (
              <InlineErrorText className="text-sm text-green-600 text-center">{success}</InlineErrorText>
            )}
          </form>
        )}
      </AuthCard>
    </>
  );
}
