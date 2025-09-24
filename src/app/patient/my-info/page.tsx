
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User, ChevronLeft, Inbox, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Report, getReportsForPatient, DoctorProfile } from '@/lib/firebase-services';
import { auth } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';

type ReportsByDoctor = {
  [key: string]: {
    doctor: DoctorProfile;
    reports: Report[];
  };
};

export default function MyInfoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [reportsByDoctor, setReportsByDoctor] = useState<ReportsByDoctor>({});
  const [unassignedReports, setUnassignedReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoading(true);
        try {
          const allReports = await getReportsForPatient(user.uid);

          const reportsByDoc: ReportsByDoctor = {};
          const unassigned: Report[] = [];
          let pendingCount = 0;
          let approvedCount = 0;
          let rejectedCount = 0;

          allReports.forEach(report => {
            if (report.status === 'pending-doctor-review') pendingCount++;
            if (report.status === 'doctor-approved' || report.status === 'doctor-modified') approvedCount++;
            if (report.status === 'rejected') rejectedCount++;

            if (report.doctorId && report.doctorProfile) {
              if (!reportsByDoc[report.doctorId]) {
                reportsByDoc[report.doctorId] = {
                  doctor: report.doctorProfile,
                  reports: [],
                };
              }
              reportsByDoc[report.doctorId].reports.push(report);
            } else {
              unassigned.push(report);
            }
          });
          
          setStats({ pending: pendingCount, approved: approvedCount, rejected: rejectedCount });
          setReportsByDoctor(reportsByDoc);
          setUnassignedReports(unassigned);

        } catch (error) {
          console.error("Failed to fetch reports:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your report history.' });
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push('/login?role=patient');
      }
    });

    return () => unsubscribe();
  }, [router, toast]);

  const getStatusConfig = (status: Report['status']) => {
    const config = {
      'pending-doctor-review': { label: 'Pending Review', icon: Clock, color: 'text-blue-500' },
      'doctor-approved': { label: 'Approved', icon: CheckCircle, color: 'text-green-500' },
      'doctor-modified': { label: 'Reviewed & Modified', icon: CheckCircle, color: 'text-green-500' },
      'rejected': { label: 'Disqualified by Doctor', icon: XCircle, color: 'text-red-500' },
      'pending-patient-input': { label: 'Ready to Send', icon: Inbox, color: 'text-amber-500' },
    };
    return config[status] || { label: 'Unknown', icon: Inbox, color: 'text-gray-500' };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="ml-4 text-lg">Loading Your Info...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.push('/patient/dashboard')} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold">My Info & Consultation History</h1>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">reports awaiting doctor feedback</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved / Reviewed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
             <p className="text-xs text-muted-foreground">reports reviewed by doctors</p>
          </CardContent>
        </Card>
         <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disqualified by Doctor</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
             <p className="text-xs text-muted-foreground">reports marked as needing more info</p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(reportsByDoctor).length === 0 && unassignedReports.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
              <Inbox size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No Consultation History</h3>
              <p>You haven't sent any reports to a doctor yet.</p>
               <Button onClick={() => router.push('/patient/consult')} className="mt-4">Consult a Doctor</Button>
          </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(reportsByDoctor).map(([doctorId, data]) => (
            <Card key={doctorId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User /> Dr. {data.doctor.name}
                </CardTitle>
                <CardDescription>{data.doctor.specialization || 'Dermatology'}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {data.reports.map(report => {
                     const StatusIcon = getStatusConfig(report.status).icon;
                     const statusColor = getStatusConfig(report.status).color;
                    return (
                    <AccordionItem value={report.id} key={report.id}>
                      <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4 items-center">
                            <span>{report.reportName}</span>
                             <Badge variant="outline" className={statusColor}>
                                <StatusIcon className="mr-2 h-4 w-4"/>
                                {getStatusConfig(report.status).label}
                            </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Sent on: {new Date((report.createdAt as any).seconds * 1000).toLocaleString()}</p>
                        {report.doctorNotes ? (
                           <Card className="bg-muted/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2"><MessageSquare /> Doctor's Comments</CardTitle>
                                </CardHeader>
                               <CardContent>
                                    <p className="italic">"{report.doctorNotes}"</p>
                               </CardContent>
                           </Card>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No comments from the doctor yet.</p>
                        )}
                        <Button variant="link" onClick={() => {
                            sessionStorage.setItem('latestReport', JSON.stringify(report));
                            router.push('/patient/report');
                        }}>View Full Report</Button>
                      </AccordionContent>
                    </AccordionItem>
                  )})}
                </Accordion>
              </CardContent>
            </Card>
          ))}
          {unassignedReports.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Unassigned Reports</CardTitle>
                    <CardDescription>These reports are ready to be sent for a consultation.</CardDescription>
                </CardHeader>
                <CardContent>
                    {unassignedReports.map(report => (
                         <div key={report.id} className="flex items-center justify-between p-4 rounded-md bg-muted/50">
                            <p>{report.reportName}</p>
                            <Button onClick={() => router.push('/patient/consult')}>Send to Doctor</Button>
                         </div>
                    ))}
                </CardContent>
             </Card>
          )}
        </div>
      )}
    </div>
  );
}

