import AuthPageLayout from '@/layouts/auth/AuthPageLayout';
import SignupForm from '@/components/ui/auth/SignupForm';

export default function SignupPage() {
  return (
    <AuthPageLayout>
      <SignupForm />
    </AuthPageLayout>
  );
}
