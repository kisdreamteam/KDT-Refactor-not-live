import AuthPageLayout from '@/layouts/auth/AuthPageLayout';
import LoginForm from '@/components/ui/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
