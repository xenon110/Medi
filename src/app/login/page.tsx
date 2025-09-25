
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firebase-services';
import React, { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const role = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    if (!auth) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Firebase is not configured. Please check your setup.',
        });
        setIsLoading(false);
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        const userProfile = await getUserProfile(user.uid);
        
        if (!userProfile) {
          throw new Error("Unable to find user profile.");
        }
        
        // Role-based redirection logic
        if (role === 'doctor' && userProfile.role === 'doctor') {
            toast({ title: 'Login Successful', description: 'Welcome back, Doctor!' });
            router.push('/doctor/dashboard');
        } else if (role === 'patient' && userProfile.role === 'patient') {
            toast({ title: 'Login Successful', description: 'Welcome back!' });
            router.push('/patient/dashboard');
        } else {
             // If roles don't match, sign out and show an error
             await auth.signOut();
             throw new Error(`This account is not a ${role} account. Please use the correct login form.`);
        }
    } catch (error) {
        let description = 'An unexpected error occurred. Please try again.';

        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-email':
                    description = 'No account found with this email address.';
                    break;
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    description = 'Incorrect password. Please try again.';
                    break;
                case 'auth/too-many-requests':
                    description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.';
                    break;
                default:
                    description = 'An error occurred during login. Please check your credentials.';
            }
        } else if (error instanceof Error) {
            description = error.message;
        }

        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: description,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-login">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your {role} account.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
              <Button type="submit" disabled={isLoading} className="w-full bg-gradient-login text-white">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href={`/signup?role=${role}`}>Sign up</Link>
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
