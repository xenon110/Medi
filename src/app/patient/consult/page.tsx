'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const dummyDoctors = [
    { id: 'doc-1', name: 'Dr. Emily Carter', specialty: 'Dermatology' },
    { id: 'doc-2', name: 'Dr. Ben Hanson', specialty: 'General Medicine' },
    { id: 'doc-3', name: 'Dr. Sarah Lee', specialty: 'Dermatology' },
];

export default function ConsultPage() {
    const { toast } = useToast();
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSendReport = async (doctorId: string) => {
        setSelectedDoctorId(doctorId);
        setIsSending(true);
        
        // Simulate sending the report
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSending(false);
        setIsSent(true);

        toast({
            title: "Report Sent!",
            description: `Your report has been successfully sent to ${dummyDoctors.find(d => d.id === doctorId)?.name}.`,
        });
    };

    if (isSent) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg text-center">
                        <CardHeader>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="font-headline text-3xl mt-4">Report Sent Successfully</CardTitle>
                            <CardDescription>
                                Your AI analysis has been forwarded to the doctor. You will be notified once they have reviewed it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/patient/dashboard">
                                    Return to Dashboard
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Consult a Doctor</CardTitle>
                        <CardDescription>
                            Select a doctor to send your AI-generated report for a professional opinion.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {dummyDoctors.map((doctor) => (
                            <Card key={doctor.id} className="hover:bg-muted/50 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{doctor.name}</CardTitle>
                                            <CardDescription>{doctor.specialty}</CardDescription>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleSendReport(doctor.id)} 
                                        disabled={isSending}
                                    >
                                        {isSending && selectedDoctorId === doctor.id ? (
                                            <Loader2 className="animate-spin" /> 
                                        ) : (
                                            'Send Report'
                                        )}
                                    </Button>
                                </CardHeader>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
