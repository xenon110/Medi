
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Paperclip, Send, Check, Pencil, Loader2, Inbox, XCircle, ThumbsUp } from 'lucide-react';
import { GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

// Dummy Data
const dummyPatients = [
  {
    id: 'patient-1',
    name: 'Jane Doe',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000),
    report: {
      potentialConditions: [
        { name: 'Eczema', likelihood: 'High', confidence: 0.85, description: 'A condition that makes your skin red and itchy.' },
        { name: 'Psoriasis', likelihood: 'Medium', confidence: 0.45, description: 'A condition in which skin cells build up and form scales and itchy, dry patches.' },
      ],
      report: 'Based on the image and symptoms, the most likely condition is Eczema. The patient reports severe itching and redness, consistent with atopic dermatitis.',
      homeRemedies: 'Moisturize frequently, avoid harsh soaps, and use a cold compress to reduce itching.',
      medicalRecommendation: 'A consultation with a dermatologist is recommended for a definitive diagnosis and prescription of topical corticosteroids if necessary.',
      doctorConsultationSuggestion: true,
    },
    customReport: {
      report: '',
      prescription: '',
    },
  },
  {
    id: 'patient-2',
    name: 'John Smith',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2),
    report: {
      potentialConditions: [
        { name: 'Acne Vulgaris', likelihood: 'High', confidence: 0.9, description: 'Occurs when hair follicles become plugged with oil and dead skin cells.' },
      ],
      report: 'The image shows multiple comedones and pustules on the face, characteristic of acne vulgaris.',
      homeRemedies: 'Wash face twice daily with a gentle cleanser. Avoid oily cosmetics.',
      medicalRecommendation: 'Over-the-counter benzoyl peroxide or salicylic acid treatments are recommended.',
      doctorConsultationSuggestion: false,
    },
    customReport: {
      report: 'The AI diagnosis of Acne Vulgaris is accurate. The patient should start with a gentle skincare routine and consider topical treatments.',
      prescription: 'Adapalene Gel 0.1%, apply a thin layer to affected areas once daily before bed.',
    },
  },
];


type Patient = {
  id: string;
  name: string;
  report: GenerateInitialReportOutput;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'customized';
  image?: string;
  [key: string]: any;
};

export default function DoctorDashboard() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [customReportText, setCustomReportText] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');

  useEffect(() => {
    // Simulate fetching patient data
    setIsLoading(true);
    setTimeout(() => {
      setPatients(dummyPatients);
      if (dummyPatients.length > 0) {
        handleSelectPatient(dummyPatients[0].id, dummyPatients);
      }
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleSelectPatient = (patientId: string, patientList: Patient[] = patients) => {
    const patient = patientList.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setCustomReportText(patient.report?.report || '');
      setPrescriptionText(patient.customReport?.prescription || '');
      setIsCustomizing(false);
    }
  };

  const handleUpdatePatient = async (status: 'approved' | 'customized' | 'rejected') => {
    if (!selectedPatient) return;

    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === selectedPatient.id) {
        const updatedPatient = { ...p, status };
        if (status === 'customized') {
          updatedPatient.customReport = {
            report: customReportText,
            prescription: prescriptionText,
          };
        }
        setSelectedPatient(updatedPatient); // Update selected patient view
        return updatedPatient;
      }
      return p;
    }));

    toast({
        title: "Success",
        description: `Patient report has been ${status}.`,
    });

    setIsSending(false);
    setIsCustomizing(false);
  };

  const formatTimestamp = (timestamp: Date | null | undefined) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };
  
  if (isLoading) {
     return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: Patient['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
      case 'customized':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
      {/* Patient List */}
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Patients</CardTitle>
          <CardDescription>Select a patient to review their report.</CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="p-2">
            {patients.length === 0 ? (
              <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
                <Inbox size={48} className="text-gray-400" />
                <h3 className="font-semibold">No Patients Yet</h3>
                <p className="text-sm">When patients submit reports, they will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPatient?.id === patient.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{patient.name ? patient.name.charAt(0) : 'P'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">{patient.name || 'Anonymous'}</span>
                            <Badge variant={getStatusBadgeVariant(patient.status)} className="text-xs capitalize mt-1">
                              {patient.status}
                            </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(patient.createdAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Chat/Report Window */}
      <Card className="md:col-span-3 flex flex-col h-full">
        {selectedPatient ? (
          <>
            <CardHeader className="border-b">
              <CardTitle>{selectedPatient.name}</CardTitle>
              <CardDescription>AI-Generated Report Analysis</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Potential Issues</h3>
                    {isCustomizing ? (
                      <Textarea 
                        value={customReportText}
                        onChange={(e) => setCustomReportText(e.target.value)}
                        className="min-h-[150px] text-base"
                      />
                    ) : (
                      <p className="text-foreground/80">{selectedPatient.customReport?.report || selectedPatient.report?.report}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Home Remedies</h3>
                    <p className="text-foreground/80">{selectedPatient.report?.homeRemedies}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Medical Recommendation</h3>
                    <p className="text-foreground/80">{selectedPatient.report?.medicalRecommendation}</p>
                  </div>
                    {selectedPatient.status !== 'pending' && selectedPatient.customReport?.prescription && (
                      <div className="space-y-2">
                          <h3 className="font-semibold text-lg">Prescription / Notes</h3>
                          <p className="text-foreground/80 whitespace-pre-wrap">{selectedPatient.customReport.prescription}</p>
                      </div>
                  )}
              </CardContent>
            </ScrollArea>
            <CardFooter className="p-4 border-t bg-card flex flex-col items-stretch gap-4">
              {isCustomizing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="prescription-text">Medicine Recommendations / Notes (Suggestion Box)</Label>
                    <Textarea 
                      id="prescription-text" 
                      placeholder="e.g., Paracetamol 500mg twice a day..." 
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCustomizing(false)} disabled={isSending}>Cancel</Button>
                    <Button onClick={() => handleUpdatePatient('customized')} disabled={isSending}>
                      {isSending ? <Loader2 className="animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Send Custom Response</>}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex justify-end gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => setIsCustomizing(true)} 
                      disabled={isSending || selectedPatient.status !== 'pending'}>
                          <Pencil className="mr-2 h-4 w-4" /> Customize Report
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleUpdatePatient('rejected')} 
                      disabled={isSending || selectedPatient.status !== 'pending'}>
                          {isSending && selectedPatient.status === 'pending' ? <Loader2 className="animate-spin" /> : <><XCircle className="mr-2 h-4 w-4" /> Reject</>}
                    </Button>
                  <Button 
                      className="bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => handleUpdatePatient('approved')} 
                      disabled={isSending || selectedPatient.status !== 'pending'}>
                          {isSending && selectedPatient.status === 'pending' ? <Loader2 className="animate-spin" /> : <><ThumbsUp className="mr-2 h-4 w-4" /> Approve</>}
                  </Button>
                </div>
              )}
            </CardFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
              <Inbox size={64} className="text-gray-400" />
              <h3 className="font-semibold mt-4 text-lg">Select a Patient</h3>
              <p>Choose a patient from the list on the left to view their detailed report and take action.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
