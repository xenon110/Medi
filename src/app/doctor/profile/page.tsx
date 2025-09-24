
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, ChevronLeft, Edit, Mail, Briefcase, Award, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { DoctorProfile, getUserProfile } from '@/lib/firebase-services';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile && profile.role === 'doctor') {
            setDoctorProfile(profile as DoctorProfile);
          } else {
             toast({ title: "Error", description: "Could not find doctor profile.", variant: 'destructive' });
             router.push('/login?role=doctor');
          }
        } catch (error) {
            console.error("Error fetching doctor profile:", error);
            toast({ title: "Error", description: "An issue occurred while fetching your profile.", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
      } else {
         router.push('/login?role=doctor');
      }
    });

    return () => unsubscribe();
  }, [router, toast]);
  
  const getInitials = (name: string | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('');
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Profile...</p>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
          <p className="ml-4 text-lg text-destructive">Could not load doctor profile.</p>
      </div>
    )
  }

  return (
    <div className="bg-muted/40 min-h-screen">
        <div className="container mx-auto py-8">
            <Button variant="outline" onClick={() => router.back()} className="mb-4 bg-background">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <div className="grid gap-8 md:grid-cols-3">
                {/* Left Column for Profile Picture */}
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <Avatar className="w-32 h-32 mb-4 border-4 border-primary">
                                <AvatarImage src={doctorProfile.degreeUrl} alt={doctorProfile.name} />
                                <AvatarFallback className="text-4xl bg-muted">{getInitials(doctorProfile.name)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold">{doctorProfile.name}</h2>
                            <p className="text-muted-foreground">{doctorProfile.specialization || 'Dermatologist'}</p>
                            <Button variant="outline" size="sm" className="mt-4">
                                <Edit className="mr-2 h-4 w-4" /> Change Picture
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column for Details */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                            <CardDescription>
                                Review and manage your professional information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">Personal Information</h3>
                                    <Button variant="ghost" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-4">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <span>{doctorProfile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <span>{doctorProfile.age} years old</span>
                                    </div>
                                     <div className="flex items-center gap-4">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <span>{doctorProfile.gender}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <Separator />

                             {/* Medical Credentials */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">Medical Credentials</h3>
                                     <Button variant="ghost" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-4">
                                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                                        <span>{doctorProfile.experience || 0} years of experience</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Award className="h-5 w-5 text-muted-foreground" />
                                        <span>{doctorProfile.specialization || 'Dermatology'}</span>
                                    </div>
                                     <div className="flex items-center gap-4">
                                        <p className="text-muted-foreground">Verification:</p>
                                        <span className="font-semibold text-green-600 capitalize">{doctorProfile.verificationStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
}
