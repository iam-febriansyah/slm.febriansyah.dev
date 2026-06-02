import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Mini ERP</h1>
          <p className="mt-2 text-gray-600">Sistem Invoicing untuk Bisnis Anda</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
