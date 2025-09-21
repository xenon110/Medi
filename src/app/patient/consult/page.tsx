
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDoctors, getReportsForPatient, sendReportToDoctor, DoctorProfile, Report } from '@/lib/firebase-services';
import { auth } from '@/lib/firebase';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";


export default function ConsultPage() {
    const { toast } = useToast();
    const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState<string | null>(null);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [targetDoctorId, setTargetDoctorId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const fetchedDoctors = await getDoctors();
                setDoctors(fetchedDoctors);

                const user = auth.currentUser;
                if (user) {
                    const fetchedReports = await getReportsForPatient(user.uid);
                    // Only show reports that haven't been sent to a doctor yet
                    setReports(fetchedReports.filter(r => r.status === 'pending-patient-input'));
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch doctors or reports. Please try again later.' });
            } finally {
                setIsLoading(false);
            }
        };

        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchData();
            } else {
                setIsLoading(false);
            }
        });
        
        return () => unsubscribe();
    }, [toast]);

    const handleSendClick = (doctorId: string) => {
        if (reports.length > 0) {
            setTargetDoctorId(doctorId);
            setIsDialogOpen(true);
        } else {
            toast({
                title: "No Reports to Send",
                description: "You don't have any new reports ready to be sent for consultation.",
            });
        }
    };
    
    const handleConfirmSend = async () => {
        if (!selectedReportId || !targetDoctorId) return;

        setIsSending(targetDoctorId);
        setIsDialogOpen(false);
        
        try {
            await sendReportToDoctor(selectedReportId, targetDoctorId);
            toast({
                title: "Report Sent!",
                description: `Your report has been sent for review.`,
            });
            // Remove the sent report from the list to prevent re-sending
            setReports(reports.filter(r => r.id !== selectedReportId));
            setSelectedReportId(null);
        } catch (error) {
            console.error("Failed to send report:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not send the report.' });
        } finally {
            setIsSending(null);
            setTargetDoctorId(null);
        }
    };


    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="container mx-auto py-8">
                <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Consult a Doctor</CardTitle>
                        <CardDescription>
                            Send a new report to our network of professionals for review.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {doctors.map((doctor) => (
                            <Card key={doctor.uid} className="bg-muted/30 hover:bg-muted/40 transition-colors shadow-lg hover:shadow-primary/20">
                                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-16 h-16">
                                            <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-xl">{doctor.name}</CardTitle>
                                            <CardDescription>{doctor.specialization || 'Dermatology'}</CardDescription>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleSendClick(doctor.uid)} 
                                        disabled={!!isSending || reports.length === 0}
                                        className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
                                    >
                                        {isSending === doctor.uid ? (
                                            <Loader2 className="animate-spin" /> 
                                        ) : (
                                            <><Send className="mr-2 h-4 w-4" /> Send New Report</>
                                        )}
                                    </Button>
                                </CardHeader>
                            </Card>
                        ))}
                         {doctors.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No doctors are currently available. Please check back later.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select a Report to Send</DialogTitle>
                        <DialogDescription>
                            Choose which of your pending reports you would like to send for a professional consultation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                         <Select onValueChange={setSelectedReportId} value={selectedReportId || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a report..." />
                            </SelectTrigger>
                            <SelectContent>
                                {reports.map(report => (
                                     <SelectItem key={report.id} value={report.id}>
                                        Report from {new Date((report.createdAt as any).seconds * 1000).toLocaleDateString()}
                                     </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmSend} disabled={!selectedReportId || !!isSending}>
                            {isSending ? <Loader2 className="animate-spin" /> : 'Confirm & Send'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </div>
        </Dialog>
    );
}
