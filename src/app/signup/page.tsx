
import { Suspense } from 'react';
import SignupForm from './signup-form';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-subtle">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
