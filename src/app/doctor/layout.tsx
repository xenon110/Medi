
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firebase-services';
import type { User } from 'firebase/auth';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async (user: User) => {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile && userProfile.role === 'doctor') {
        setIsAuthorized(true);
      } else {
        // If user is logged in but not a doctor, redirect them.
        router.push('/login?role=patient');
      }
      setIsLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuth(user);
      } else {
        // If no user is logged in, redirect to login page.
        router.push('/login?role=doctor');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    // This part is mainly for the brief moment before the redirect completes.
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
