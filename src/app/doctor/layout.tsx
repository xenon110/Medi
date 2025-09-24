
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firebase-services';
import { useToast } from '@/hooks/use-toast';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
            // User is logged in but is not a doctor
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
        // No user is logged in
        router.push('/login?role=doctor');
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
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
    // This state is briefly hit before the redirect to login completes.
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirecting...</p>
      </div>
    );
  }

  // If authorized, render the children (the actual doctor page)
  return <>{children}</>;
}
