
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, FileDown, Eye, Send, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type ReportStatus = 'Pending' | 'Approved' | 'Disqualified';

const dummyReports = [
  { id: 'rep-001', title: 'Analysis of Skin Lesion', date: '2023-10-26', status: 'Pending' as ReportStatus },
  { id: 'rep-002', title: 'Follow-up on Rash', date: '2023-10-24', status: 'Approved' as ReportStatus, doctor: 'Dr. Emily Carter' },
  { id: 'rep-003', title: 'Initial Mole Check', date: '2023-10-22', status: 'Approved' as ReportStatus, doctor: 'Dr. Ben Hanson' },
  { id: 'rep-004', title: 'Unclear Image', date: '2023-10-20', status: 'Disqualified' as ReportStatus, reason: 'Image was too blurry.' },
  { id: 'rep-005', title: 'Eczema Flare-up', date: '2023-10-18', status: 'Pending' as ReportStatus },
];

const statusConfig = {
  Pending: { icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', glow: 'shadow-[0_0_15px] shadow-amber-500/50' },
  Approved: { icon: CheckCircle, color: 'bg-green-500/10 text-green-400 border-green-500/20', glow: 'shadow-[0_0_15px] shadow-green-500/50' },
  Disqualified: { icon: XCircle, color: 'bg-red-500/10 text-red-400 border-red-500/20', glow: 'shadow-[0_0_15px] shadow-red-500/50' },
};

export default function MyReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportStatus>('Pending');
  const router = useRouter();

  const filteredReports = dummyReports.filter(report => report.status === activeTab);

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {(Object.keys(statusConfig) as ReportStatus[]).map(status => {
              const config = statusConfig[status];
              const isActive = activeTab === status;
              const count = dummyReports.filter(r => r.status === status).length;
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
                        <p className="text-xl font-bold">{status}</p>
                        <p className="text-sm text-muted-foreground">{count} Report{count !== 1 ? 's' : ''}</p>
                    </div>
                </button>
              );
            })}
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length > 0 ? (
                filteredReports.map(report => (
                    <Card key={report.id} className="bg-muted/30">
                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold">{report.title}</h3>
                                     <Badge variant={
                                        report.status === 'Approved' ? 'default' 
                                        : report.status === 'Disqualified' ? 'destructive' 
                                        : 'secondary'
                                    }>
                                        {report.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(report.date).toLocaleDateString()}
                                    {report.status === 'Approved' && ` - Reviewed by ${report.doctor}`}
                                    {report.status === 'Disqualified' && ` - Reason: ${report.reason}`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <Button variant="outline" size="sm" onClick={() => router.push(`/patient/report`)}><Eye className="mr-2 h-4 w-4" />View</Button>
                                <Button variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4" />Download</Button>
                                {report.status === 'Pending' && <Button variant="secondary" size="sm"><Send className="mr-2 h-4 w-4" />Send</Button>}
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No {activeTab.toLowerCase()} reports found.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
