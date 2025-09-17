'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Paperclip, Send, Check, Pencil, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';
import { Label } from '@/components/ui/label';

type Patient = {
  id: string;
  name: string;
  report: GenerateInitialReportOutput;
  createdAt: Timestamp;
  [key: string]: any;
};

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Patient));
      setPatients(patientsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching patients:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    if(patient.report && patient.report.report) {
      setReportText(patient.report.report);
    } else {
      setReportText('');
    }
    setIsCustomizing(false);
  };

  const formatTimestamp = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
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
  
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
        {/* Patient List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Patients</CardTitle>
            <CardDescription>Select a patient to review their report.</CardDescription>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedPatient?.id === patient.id ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{patient.name ? patient.name.charAt(0) : 'P'}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold">{patient.name || 'Anonymous'}</span>
                            <span className="text-xs text-muted-foreground">Report received</span>
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
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          className="min-h-[150px] text-base"
                        />
                      ) : (
                        <p className="text-foreground/80">{selectedPatient.report?.report}</p>
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
                </CardContent>
              </ScrollArea>
              <CardFooter className="p-4 border-t bg-card flex flex-col items-stretch gap-4">
                {isCustomizing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="prescription-text">Medicine Recommendations / Notes</Label>
                      <Textarea id="prescription-text" placeholder="e.g., Paracetamol 500mg twice a day..." />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="prescription-upload">Upload Prescription</Label>
                        <Input id="prescription-upload" type="file" />
                      </div>
                      <Button variant="ghost" size="icon"><Paperclip /></Button>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCustomizing(false)}>Cancel</Button>
                      <Button>
                        <Send className="mr-2" /> Send to Patient
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsCustomizing(true)}>
                      <Pencil className="mr-2" /> Customize Report
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Check className="mr-2" /> Approve & Send
                    </Button>
                  </div>
                )}
              </CardFooter>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a patient to view their report.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
