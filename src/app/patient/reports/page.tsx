
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function MyReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>
            This page will display a history of your uploaded images and the corresponding AI analysis and doctor responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
            <FileText size={48} className="text-gray-400" />
            <h3 className="font-semibold mt-4 text-lg">No Reports Yet</h3>
            <p>Your submitted reports will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
