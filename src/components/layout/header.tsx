
'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // In a real app, you'd get this from context or a client-side store
    // For this dummy setup, we'll determine role from URL
    setTimeout(() => {
      const publicPaths = ['/', '/login', '/signup'];
      if (!publicPaths.includes(pathname)) {
        const role = pathname.includes('/doctor') ? 'doctor' : 'patient';
        setUserRole(role);
        setUserEmail(`${role}@test.com`);
      }
      setIsLoading(false);
    }, 500);
  }, [pathname]);

  const handleLogout = async () => {
    setUserEmail(null);
    setUserRole(null);
    router.push('/');
  };
  
  const navLinks = [
    { href: '/', label: 'Home' },
    ...(userRole ? [{ href: `/${userRole}/dashboard`, label: 'Dashboard' }] : []),
  ];


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-semibold tracking-wide hidden sm:inline">
            MediScan AI
          </span>
        </Link>
        
        <nav className="flex-1 flex justify-center items-center">
            <div className="flex items-center gap-4 md:gap-6">
                {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} legacyBehavior passHref>
                        <a className={cn("text-sm font-medium transition-colors hover:text-primary", 
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                        )}>
                            {link.label}
                        </a>
                    </Link>
                ))}
            </div>
        </nav>

        <div className="flex items-center gap-4 w-auto justify-end" style={{minWidth: '150px'}}>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : userEmail ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">Welcome!</span>
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
