
'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real app, you'd get this from context or a client-side store
    // For this dummy setup, we'll just pretend the user is logged in.
    setTimeout(() => {
      // You can change this to simulate different users
      const dummyEmail = typeof window !== 'undefined' && window.location.pathname.includes('/doctor') 
        ? 'doctor@test.com' 
        : 'patient@test.com';

      // A simple check to not show user info on landing/login/signup pages
      const publicPaths = ['/', '/login', '/signup'];
      if (!publicPaths.includes(window.location.pathname)) {
        setUserEmail(dummyEmail);
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const handleLogout = async () => {
    // Simulate logout
    setUserEmail(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-semibold tracking-wide">
            MediScan AI
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : userEmail ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {userEmail}</span>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
