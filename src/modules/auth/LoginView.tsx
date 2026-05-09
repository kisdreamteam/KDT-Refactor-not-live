'use client';

import type { FC } from 'react';

import AuthLayout from '@/components/dashboard/shell/AuthLayout';
import LoginForm from '@/components/ui/auth/LoginForm';
import { useAuthFlow } from '@/hooks/useAuthFlow';

const LoginView: FC = () => {
  const {
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    handleLogin,
    isLoading,
    error,
    success,
  } = useAuthFlow();

  return (
    <AuthLayout>
      <LoginForm
        email={loginEmail}
        password={loginPassword}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </AuthLayout>
  );
};

export default LoginView;
