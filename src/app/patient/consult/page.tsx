
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, ChevronLeft, Star, FileDown, Home, Settings, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDoctors, getReportsForPatient, sendReportToDoctor, DoctorProfile, Report } from '@/lib/firebase-services';
import { auth } from '@/lib/firebase';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from 'next/link';


export default function ConsultPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState<string | null>(null);
    const [sentStatus, setSentStatus] = useState<{[key: string]: boolean}>({});
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [targetDoctor, setTargetDoctor] = useState<DoctorProfile | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoading(true);
                try {
                    const fetchedDoctors = await getDoctors();
                    setDoctors(fetchedDoctors);
                } catch (error) {
                    console.error("Failed to fetch doctors:", error);
                    toast({ variant: 'destructive', title: 'Error Fetching Doctors', description: 'Could not retrieve the list of available doctors.' });
                }

                try {
                    const fetchedReports = await getReportsForPatient(user.uid);
                    setReports(fetchedReports.filter(r => r.status === 'pending-patient-input'));
                } catch (error) {
                    console.error("Failed to fetch reports:", error);
                    toast({ variant: 'destructive', title: 'Error Fetching Reports', description: 'Could not retrieve your pending reports.' });
                }

                setIsLoading(false);
            } else {
                setIsLoading(false);
                router.push('/login?role=patient');
            }
        });
        
        return () => unsubscribe();
    }, [toast, router]);

    const handleSendClick = (doctor: DoctorProfile, event: React.MouseEvent) => {
        event.stopPropagation();
        if (reports.length > 0) {
            setTargetDoctor(doctor);
            setIsDialogOpen(true);
        } else {
            toast({
                title: "No Reports to Send",
                description: "You don't have any new reports ready to be sent for consultation.",
                variant: "destructive"
            });
        }
    };
    
    const handleConfirmSend = async () => {
        if (!selectedReportId || !targetDoctor) return;

        setIsSending(targetDoctor.uid);
        setIsDialogOpen(false);
        
        try {
            await sendReportToDoctor(selectedReportId, targetDoctor.uid);
            setSentStatus(prev => ({...prev, [targetDoctor.uid]: true}));
            toast({
                title: "Report Sent!",
                description: `Your report has been successfully sent to ${targetDoctor.name}.`,
            });
            // Remove the sent report from the list of available reports
            setReports(reports.filter(r => r.id !== selectedReportId));
            setSelectedReportId(null);

            setTimeout(() => {
                 setSentStatus(prev => ({...prev, [targetDoctor.uid]: false}));
            }, 2000);

        } catch (error) {
            console.error("Failed to send report:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not send the report.' });
        } finally {
            setIsSending(null);
            setTargetDoctor(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center new-consult-bg">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="new-consult-bg min-h-screen">
                <div className="container">
                    <main className="main-content">
                        <button onClick={() => router.back()} className="back-button">
                            <ChevronLeft size={20} /> Back
                        </button>

                        <div className="page-header">
                            <h1 className="page-title">Consult a Doctor</h1>
                            <p className="page-subtitle">Send a new report to our network of professionals for review.</p>
                        </div>

                        <div className="doctors-grid">
                            {doctors.length > 0 ? (
                                doctors.map((doctor) => (
                                    <div key={doctor.uid} className="doctor-card">
                                        <div className="status-indicator"></div>
                                        <div className="doctor-info">
                                            <div className="flex items-center gap-6">
                                                <div className="doctor-avatar">{doctor.name.split(' ').map(n => n[0]).join('')}</div>
                                                <div className="doctor-details">
                                                    <h3 className="doctor-name">{doctor.name}</h3>
                                                    <p className="doctor-specialty">{doctor.specialization || 'Dermatology'}</p>
                                                    <div className="doctor-rating">
                                                        <div className="stars">
                                                            <Star size={14} className="star fill-current" />
                                                            <Star size={14} className="star fill-current" />
                                                            <Star size={14} className="star fill-current" />
                                                            <Star size={14} className="star fill-current" />
                                                            <Star size={14} className="star" />
                                                        </div>
                                                        <span className="rating-text">4.8 • {Math.floor(Math.random() * 100 + 50)} reviews</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                className="send-report-btn" 
                                                onClick={(e) => handleSendClick(doctor, e)}
                                                disabled={isSending === doctor.uid || sentStatus[doctor.uid]}
                                                style={sentStatus[doctor.uid] ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
                                            >
                                                {isSending === doctor.uid ? (
                                                    <><Loader2 size={16} className="animate-spin" /> Sending...</>
                                                ) : sentStatus[doctor.uid] ? (
                                                    <>✅ Sent!</>
                                                ) : (
                                                    <><Send size={16} /> Send New Report</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No doctors are currently available. Please check back later.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>


            <DialogContent className="bg-background border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Select a report to send to {targetDoctor?.name}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Choose one of your pending reports for consultation.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedReportId} value={selectedReportId || undefined}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a report..." />
                        </SelectTrigger>
                        <SelectContent>
                            {reports.map(report => (
                                <SelectItem key={report.id} value={report.id}>
                                    Report from {new Date((report.createdAt as any).seconds * 1000).toLocaleString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmSend} disabled={!selectedReportId || !!isSending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isSending ? <Loader2 className="animate-spin" /> : 'Confirm & Send'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
