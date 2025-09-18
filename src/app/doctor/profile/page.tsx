
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div>
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
