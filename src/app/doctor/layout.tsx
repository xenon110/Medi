
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firebase-services';
import { useToast } from '@/hooks/use-toast';
import DoctorDashboard from './dashboard/page';
import DoctorAnalytics from './analytics/page';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile && userProfile.role === 'doctor') {
            setIsAuthorized(true);
          } else {
            toast({
              variant: 'destructive',
              title: 'Access Denied',
              description: 'This account is not authorized to view the doctor dashboard.',
            });
            await auth.signOut();
            router.push('/login?role=patient'); 
          }
        } catch (error) {
           console.error("Authorization check failed:", error);
           toast({
              variant: 'destructive',
              title: 'Authorization Error',
              description: 'Could not verify your role. Please try logging in again.',
           });
           await auth.signOut();
           router.push('/login?role=doctor');
        } finally {
            setIsLoading(false);
        }
      } else {
        router.push('/login?role=doctor');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, toast]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirecting...</p>
      </div>
    );
  }

  const isDashboardPage = pathname === '/doctor/dashboard';

  // Render DoctorDashboard directly for its specific route and children for others
  if (isDashboardPage) {
    return <DoctorDashboard />;
  }

  return <>{children}</>;
}

    