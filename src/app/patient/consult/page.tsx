
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Dummy data for doctors
const dummyDoctors = [
    { id: 'doc-1', name: 'Dr. Emily Carter', specialty: 'Dermatology' },
    { id: 'doc-2', name: 'Dr. Ben Hanson', specialty: 'General Medicine' },
    { id: 'doc-3', name: 'Dr. Sarah Lee', specialty: 'Dermatology' },
];

// Dummy data for reports to simulate patient's history with doctors
const dummyPatientReports = [
  { id: 'rep-002', doctorId: 'doc-1', status: 'Approved' },
  { id: 'rep-003', doctorId: 'doc-2', status: 'Approved' },
  { id: 'rep-004', doctorId: 'doc-1', status: 'Disqualified' },
  { id: 'rep-005', doctorId: 'doc-1', status: 'Pending' },
  { id: 'rep-006', doctorId: 'doc-3', status: 'Pending' },
  { id: 'rep-007', doctorId: 'doc-3', status: 'Pending' },
];

const statusConfig = {
  Pending: { icon: Clock, color: 'text-amber-400' },
  Approved: { icon: CheckCircle, color: 'text-green-400' },
  Disqualified: { icon: XCircle, color: 'text-red-400' },
};


export default function ConsultPage() {
    const { toast } = useToast();
    const [isSending, setIsSending] = useState<string | null>(null);

    const handleSendReport = async (doctorId: string) => {
        setIsSending(doctorId);
        
        // Simulate sending the report
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSending(null);

        toast({
            title: "Report Sent!",
            description: `A new report has been sent to ${dummyDoctors.find(d => d.id === doctorId)?.name}.`,
        });
    };

    const getReportCountsForDoctor = (doctorId: string) => {
        const counts = {
            Pending: 0,
            Approved: 0,
            Disqualified: 0,
        };
        dummyPatientReports.forEach(report => {
            if (report.doctorId === doctorId) {
                counts[report.status as keyof typeof counts]++;
            }
        });
        return counts;
    };


    return (
        <div className="container mx-auto py-8">
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Consult a Doctor</CardTitle>
                    <CardDescription>
                        Send a new report or review your case history with our network of professionals.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {dummyDoctors.map((doctor) => {
                        const reportCounts = getReportCountsForDoctor(doctor.id);
                        return (
                            <Card key={doctor.id} className="bg-muted/30 hover:bg-muted/40 transition-colors shadow-lg hover:shadow-primary/20">
                                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-16 h-16">
                                            <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-xl">{doctor.name}</CardTitle>
                                            <CardDescription>{doctor.specialty}</CardDescription>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleSendReport(doctor.id)} 
                                        disabled={!!isSending}
                                        className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
                                    >
                                        {isSending === doctor.id ? (
                                            <Loader2 className="animate-spin" /> 
                                        ) : (
                                            <><Send className="mr-2 h-4 w-4" /> Send New Report</>
                                        )}
                                    </Button>
                                </CardHeader>
                                <CardFooter className="p-4 bg-background/30 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-b-lg">
                                    {(Object.keys(statusConfig) as (keyof typeof statusConfig)[]).map(status => {
                                        const config = statusConfig[status];
                                        const count = reportCounts[status];
                                        return (
                                            <div key={status} className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/50", config.color)}>
                                                <config.icon className="h-6 w-6" />
                                                <div>
                                                    <div className="font-bold text-lg text-foreground">{count}</div>
                                                    <div className="text-sm">{status}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
