
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, FileDown, Eye, Send, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Report, getReportsForPatient } from '@/lib/firebase-services';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

type ReportStatusFilter = 'pending-patient-input' | 'pending-doctor-review' | 'doctor-approved' | 'doctor-modified' | 'rejected';

const statusConfig = {
  'pending-patient-input': { label: 'Pending Consultation', icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', glow: 'shadow-[0_0_15px] shadow-amber-500/50' },
  'pending-doctor-review': { label: 'Pending Review', icon: Clock, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', glow: 'shadow-[0_0_15px] shadow-blue-500/50' },
  'doctor-approved': { label: 'Approved', icon: CheckCircle, color: 'bg-green-500/10 text-green-400 border-green-500/20', glow: 'shadow-[0_0_15px] shadow-green-500/50' },
  'doctor-modified': { label: 'Reviewed', icon: CheckCircle, color: 'bg-green-500/10 text-green-400 border-green-500/20', glow: 'shadow-[0_0_15px] shadow-green-500/50' },
  'rejected': { label: 'Disqualified', icon: XCircle, color: 'bg-red-500/10 text-red-400 border-red-500/20', glow: 'shadow-[0_0_15px] shadow-red-500/50' },
};

export default function MyReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportStatusFilter>('pending-patient-input');
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoading(true);
        getReportsForPatient(user.uid)
          .then(fetchedReports => {
            setReports(fetchedReports);
            setIsLoading(false);
          })
          .catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch reports.' });
            setIsLoading(false);
          });
      } else {
        router.push('/login?role=patient');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);


  const getStatusText = (status: Report['status']) => {
    const combinedStatus: ReportStatusFilter[] = ['doctor-approved', 'doctor-modified'];
    if (combinedStatus.includes(status as any)) return 'Reviewed';
    return statusConfig[status as ReportStatusFilter]?.label || 'Unknown';
  };
  
  const getBadgeVariant = (status: Report['status']) => {
    if (status === 'doctor-approved' || status === 'doctor-modified') return 'default';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  }

  const filteredReports = reports.filter(report => {
    if (activeTab === 'doctor-approved') {
        return report.status === 'doctor-approved' || report.status === 'doctor-modified';
    }
    return report.status === activeTab;
  });

  const handleViewReport = (report: Report) => {
    sessionStorage.setItem('latestReport', JSON.stringify(report));
    router.push('/patient/report');
  };

  const TABS: ReportStatusFilter[] = [
    'pending-patient-input', 
    'pending-doctor-review', 
    'doctor-approved', 
    'rejected'
  ];

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
      </Button>
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">My Reports</CardTitle>
          <CardDescription>Track the status of your AI analyses and doctor consultations.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {TABS.map(status => {
              const config = statusConfig[status as ReportStatusFilter];
              if (!config) return null;
              
              const isActive = activeTab === status;
              const count = reports.filter(r => {
                  if (status === 'doctor-approved') {
                      return r.status === 'doctor-approved' || r.status === 'doctor-modified';
                  }
                  return r.status === status
              }).length;
              const Icon = config.icon;

              return (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-4',
                    isActive ? `${config.color} ${config.glow} border-current` : `bg-card/50 border-border hover:bg-muted/50`,
                  )}
                >
                    <Icon className="h-8 w-8" />
                    <div className="text-left">
                        <p className="text-xl font-bold">{config.label}</p>
                        <p className="text-sm text-muted-foreground">{count} Report{count !== 1 ? 's' : ''}</p>
                    </div>
                </button>
              );
            })}
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredReports.length > 0 ? (
                filteredReports.map(report => (
                    <Card key={report.id} className="bg-muted/30">
                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold">{report.reportName || `Report from ${new Date((report.createdAt as any).seconds * 1000).toLocaleDateString()}`}</h3>
                                     <Badge variant={getBadgeVariant(report.status)}>
                                        {getStatusText(report.status)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Created on {new Date((report.createdAt as any).seconds * 1000).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}><Eye className="mr-2 h-4 w-4" />View</Button>
                                {report.status === 'pending-patient-input' && (
                                  <Button variant="secondary" size="sm" onClick={() => router.push('/patient/consult')}>
                                    <Send className="mr-2 h-4 w-4" />Send to Doctor
                                  </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No {statusConfig[activeTab]?.label.toLowerCase()} reports found.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
