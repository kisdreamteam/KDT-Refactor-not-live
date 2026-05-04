'use client';

import Image from 'next/image';
import Link from 'next/link';
import FormLabel from '@/components/ui/FormLabel';
import TextInput from '@/components/ui/TextInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import InlineErrorText from '@/components/ui/InlineErrorText';
import AuthBackLink from '@/components/ui/AuthBackLink';
import AuthCard from '@/components/ui/AuthCard';
import type { ForgotPasswordStep } from '@/hooks/useAuthFlow';

type ForgotPasswordFormProps = {
  step: ForgotPasswordStep;
  email: string;
  otp: string;
  isLoading: boolean;
  error?: string;
  success?: string;
  onEmailChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onBackToRequest: () => void;
  onRequestSubmit: (data: { email: string }) => void | Promise<void>;
  onVerifySubmit: (data: { email: string; otp: string }) => void | Promise<void>;
};

function ForgotLogo() {
  return (
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
  );
}

function ForgotHeader({ step }: { step: ForgotPasswordStep }) {
  return (
    <>
      <ForgotLogo />
      <div className="mb-8 mt-2">
        <h1 className="text-6xl font-extrabold text-brand-purple font-spartan">
          Forgot password
        </h1>
        <p className="mt-4 text-lg text-black/70 font-spartan">
          {step === 'request'
            ? "Enter your email and we'll send a 6-digit code to reset your password."
            : 'Enter the code from your email to continue.'}
        </p>
      </div>
    </>
  );
}

export default function ForgotPasswordForm({
  step,
  email,
  otp,
  isLoading,
  error,
  success,
  onEmailChange,
  onOtpChange,
  onBackToRequest,
  onRequestSubmit,
  onVerifySubmit,
}: ForgotPasswordFormProps) {
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
        <ForgotHeader step={step} />

        {step === 'request' ? (
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              void onRequestSubmit({ email });
            }}
          >
            <div className="grid gap-2">
              <FormLabel
                htmlFor="forgot-email"
                className="text-base font-semibold text-[24px] text-black font-spartan"
              >
                Email address
              </FormLabel>
              <TextInput
                id="forgot-email"
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

            <div className="flex justify-center gap-3">
              <PrimaryButton
                type="submit"
                disabled={isLoading}
                className="h-12 w-full max-w-[750px] px-8 rounded-[12px] bg-brand-pink text-white font-bold text-2xl tracking-tight hover:brightness-95 transition focus:outline-none focus:ring-4 focus:ring-brand-pink/30 font-spartan disabled:opacity-60"
              >
                {isLoading ? 'Sending…' : 'Send code'}
              </PrimaryButton>
            </div>
          </form>
        ) : (
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              void onVerifySubmit({ email, otp });
            }}
          >
            <p className="text-center text-sm text-black/80 font-spartan">
              Code sent to <span className="font-semibold text-brand-purple">{email}</span>
            </p>

            <div className="grid gap-2">
              <FormLabel
                htmlFor="recovery-otp"
                className="text-base font-semibold text-[24px] text-black font-spartan"
              >
                6-digit code
              </FormLabel>
              <TextInput
                id="recovery-otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                disabled={isLoading}
                className="h-14 rounded-[12px] border border-black/20 bg-white px-4 text-center text-2xl tracking-[0.5em] font-sans text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 disabled:opacity-60"
                placeholder="000000"
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={onBackToRequest}
                className="h-12 w-full max-w-[750px] sm:max-w-[220px] rounded-[12px] border-2 border-brand-purple bg-white px-8 text-lg font-bold text-brand-purple transition hover:bg-brand-purple/10 focus:outline-none focus:ring-4 focus:ring-brand-purple/30 font-spartan disabled:opacity-60"
              >
                Back
              </button>
              <PrimaryButton
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="h-12 w-full max-w-[750px] flex-1 px-8 rounded-[12px] bg-brand-pink text-white font-bold text-2xl tracking-tight hover:brightness-95 transition focus:outline-none focus:ring-4 focus:ring-brand-pink/30 font-spartan disabled:opacity-60 sm:max-w-none"
              >
                {isLoading ? 'Verifying…' : 'Verify'}
              </PrimaryButton>
            </div>
          </form>
        )}

        {error && (
          <InlineErrorText className="mt-4 text-sm text-red-600 text-center">{error}</InlineErrorText>
        )}
        {success && (
          <InlineErrorText className="mt-4 text-sm text-green-600 text-center">{success}</InlineErrorText>
        )}

        <div className="mt-6 text-center text-sm text-[18px]">
          <Link href="/login" className="text-brand-pink font-semibold font-spartan hover:underline">
            Back to login
          </Link>
        </div>
      </AuthCard>
    </>
  );
}
