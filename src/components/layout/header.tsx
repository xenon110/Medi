'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, Bell, LayoutDashboard, FileText, User, Settings, LifeBuoy, ChevronDown, LogOut, GraduationCap, Users } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '../ui/dropdown-menu';

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!userEmail;

  useEffect(() => {
    setIsLoading(true);
    const publicPaths = ['/', '/login', '/signup', '/help'];
    if (!publicPaths.includes(pathname) && !pathname.startsWith('/help')) {
      const role = pathname.includes('/doctor') ? 'doctor' : 'patient';
      setUserRole(role);
      setUserEmail(`${role}@test.com`);
    }
    setIsLoading(false);
  }, [pathname]);

  const handleLogout = async () => {
    setUserEmail(null);
    setUserRole(null);
    router.push('/');
  };

  const renderPatientMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          Menu <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Patient Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/patient/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/patient/reports')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>My Reports</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/patient/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuItem onClick={() => router.push('/patient/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/help')}>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

    const renderDoctorMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          Menu <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Doctor Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/doctor/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => router.push('/doctor/dashboard')}>
            <Users className="mr-2 h-4 w-4" />
            <span>Patient Cases</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/doctor/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => router.push('#')}>
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Medical Resources</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuItem onClick={() => router.push('/doctor/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/help')}>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-semibold tracking-wide hidden sm:inline">
            MediScan AI
          </span>
        </Link>
        
        <nav className="flex-1 flex justify-end items-center gap-4">
          <Button variant="link" asChild><Link href="/">Home</Link></Button>
          
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : isLoggedIn ? (
            <>
              {userRole === 'patient' && <Button variant="link" asChild><Link href="/patient/dashboard">Dashboard</Link></Button>}
              {userRole === 'doctor' && <Button variant="link" asChild><Link href="/doctor/dashboard">Dashboard</Link></Button>}
              <Button variant="link" asChild><Link href="/help">Help</Link></Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <Bell />
                <span className="sr-only">Notifications</span>
              </Button>
              {userRole === 'patient' && renderPatientMenu()}
              {userRole === 'doctor' && renderDoctorMenu()}
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
        </nav>
      </div>
    </header>
  );
}
