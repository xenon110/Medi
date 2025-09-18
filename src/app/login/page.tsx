
'use client';

import { useState } from 'react';
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
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const role = searchParams.get('role') || 'patient';

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Dummy onSubmit function
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    // Dummy logic
    if (data.email === 'doctor@test.com') {
      toast({ title: 'Login Successful', description: 'Welcome back, Doctor!' });
      router.push('/doctor/dashboard');
    } else if (data.email === 'patient@test.com' || role === 'patient') {
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      router.push('/patient/dashboard');
    } else {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password.',
      });
    }

    setIsLoading(false);
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account. <br />
                (Use `doctor@test.com` or `patient@test.com`)
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
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
                  </Button>
                  <div className="text-center text-sm">
                    Don't have an account?{' '}
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link href={`/signup?role=${role}`}>Sign up</Link>
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}
