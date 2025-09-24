
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, ChevronLeft, Edit, Mail, Briefcase, Award, Calendar, Loader2, BadgeCheck, Stethoscope, Gift, Camera } from "lucide-react";
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
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <p className="ml-4 text-lg text-white">Loading Profile...</p>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
          <p className="ml-4 text-lg text-red-200">Could not load doctor profile.</p>
      </div>
    )
  }

  return (
    <>
    <style jsx global>{`
        .profile-body-bg {
             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .pulse-animation {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
            100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
        }
    `}</style>
    <div className="profile-body-bg min-h-screen p-5">
        <div className="container mx-auto">
            <Button variant="outline" onClick={() => router.back()} className="mb-8 gap-2 rounded-full bg-white/10 text-white border-white/20 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-all">
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
            </Button>
            
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-10 mb-8 shadow-2xl border border-white/30 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#f093fb]"></div>
                <div className="relative">
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-lg pulse-animation">
                         <span className="text-5xl font-bold text-white">{getInitials(doctorProfile.name)}</span>
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{doctorProfile.name}</h1>
                    <p className="text-lg font-medium text-primary mb-4">{doctorProfile.specialization || 'Dermatologist'}</p>
                    <Button className="rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md hover:shadow-lg transition-all">
                        <Camera className="mr-2 h-4 w-4" /> Change Picture
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-white/95 backdrop-blur-2xl rounded-2xl p-8 shadow-lg border border-white/30 hover:shadow-xl transition-shadow">
                    <CardHeader className="flex-row justify-between items-center p-0 mb-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">
                               <User size={20}/>
                            </div>
                           Personal Information
                        </CardTitle>
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                            <Edit className="mr-2 h-4 w-4"/> Edit
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                            <div className="w-9 h-9 flex-shrink-0 rounded-md flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"><Mail size={16}/></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email Address</p>
                                <p className="font-semibold text-gray-800">{doctorProfile.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                            <div className="w-9 h-9 flex-shrink-0 rounded-md flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"><Gift size={16}/></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Age</p>
                                <p className="font-semibold text-gray-800">{doctorProfile.age} years old</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                            <div className="w-9 h-9 flex-shrink-0 rounded-md flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"><User size={16}/></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Gender</p>
                                <p className="font-semibold text-gray-800">{doctorProfile.gender}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="bg-white/95 backdrop-blur-2xl rounded-2xl p-8 shadow-lg border border-white/30 hover:shadow-xl transition-shadow">
                    <CardHeader className="flex-row justify-between items-center p-0 mb-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">
                               <Stethoscope size={20}/>
                            </div>
                           Medical Credentials
                        </CardTitle>
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                             <Edit className="mr-2 h-4 w-4"/> Edit
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                            <div className="w-9 h-9 flex-shrink-0 rounded-md flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"><Briefcase size={16}/></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Experience</p>
                                <p className="font-semibold text-gray-800">{doctorProfile.experience || 0} years of experience</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                            <div className="w-9 h-9 flex-shrink-0 rounded-md flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"><Award size={16}/></div>
                            <div>
                                <p className="text-xs text-muted-foreground">Specialization</p>
                                <p className="font-semibold text-gray-800">{doctorProfile.specialization || 'Dermatology'}</p>
                            </div>
                        </div>
                        {doctorProfile.verificationStatus === 'approved' && (
                             <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-2 px-4 rounded-full font-semibold text-sm mt-4 shadow-md">
                                <BadgeCheck size={16}/>
                                Verified Professional
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
    </>
  );
}
