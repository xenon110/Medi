
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
            toast({
              variant: 'destructive',
              title: 'Access Denied',
              description: 'This account is not authorized for the doctor dashboard.',
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
        // No user is signed in.
        router.push('/login?role=doctor');
        // No need to set loading to false, as the redirect will happen
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
    // This state is hit if the user is not a doctor or an error occurred.
    // The useEffect hook has already initiated a redirect.
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}

    