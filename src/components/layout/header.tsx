'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarTrigger, useSidebar } from '../ui/sidebar';
import { ThemeToggle } from '../theme-toggle';

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!userEmail;
  const sidebar = isLoggedIn ? useSidebar() : null;


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

  
  const handleDashboardClick = () => {
    if (userRole === 'doctor') {
      router.push('/doctor/dashboard');
    } else if (userRole === 'patient') {
      router.push('/patient/dashboard');
    }
  };


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center">
         {isLoggedIn && sidebar && (
          <div className="md:hidden mr-4">
            <SidebarTrigger />
          </div>
        )}
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-semibold tracking-wide hidden sm:inline">
            MediScan AI
          </span>
        </Link>
        
        <nav className="flex-1 flex justify-center items-center gap-6">
           <Button variant="link" asChild>
              <Link href="/">Home</Link>
           </Button>
          {isLoggedIn && (
             <Button variant="link" onClick={handleDashboardClick}>
              Dashboard
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : isLoggedIn ? (
            <>
               <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Bell />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <ThemeToggle />
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
