
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
      </Button>
      <h1 className="text-3xl font-bold mb-6">Doctor Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Professional Details</CardTitle>
          <CardDescription>
            This page will allow doctors to view and edit their personal details, medical credentials, and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
            <User size={48} className="text-gray-400" />
            <h3 className="font-semibold mt-4 text-lg">Profile & Credentials</h3>
            <p>Your details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
