'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Paperclip, Send, Check, Pencil, Loader2 } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';


type Patient = {
  id: string;
  name: string;
  report: GenerateInitialReportOutput;
  createdAt: Timestamp;
  status: 'pending' | 'approved' | 'customized';
  image?: string;
  [key: string]: any;
};

export default function DoctorDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [customReportText, setCustomReportText] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Verify user is a doctor
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'doctor') {
          setUser(currentUser);
        } else {
          router.push('/login'); // Redirect if not a doctor
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return; // Don't fetch patients if no user

    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const unsubscribePatients = onSnapshot(q, (querySnapshot) => {
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Patient));
      setPatients(patientsData);
      if (selectedPatient) {
        const updatedPatient = patientsData.find(p => p.id === selectedPatient.id);
        if (updatedPatient) {
          setSelectedPatient(updatedPatient);
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching patients:", error);
      setIsLoading(false);
    });

    return () => unsubscribePatients();
  }, [user, selectedPatient?.id]);

  const handleSelectPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setCustomReportText(patient.report?.report || '');
      setPrescriptionText(patient.customReport?.prescription || '');
      setIsCustomizing(false);
    }
  };

  const handleUpdatePatient = async (status: 'approved' | 'customized') => {
    if (!selectedPatient) return;

    setIsSending(true);
    const patientRef = doc(db, 'patients', selectedPatient.id);

    try {
        const updateData: any = { status };
        if (status === 'customized') {
            updateData['customReport'] = {
                report: customReportText,
                prescription: prescriptionText,
            };
        }
        await updateDoc(patientRef, updateData);

        toast({
            title: "Success",
            description: `Patient report has been ${status}.`,
        });
        setIsCustomizing(false);
    } catch (error) {
        console.error("Error updating patient:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update patient status.",
        });
    } finally {
        setIsSending(false);
    }
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
  
  if (!user || isLoading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

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
              {patients.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">No patients yet.</div>
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
                          <div className="flex flex-col">
                            <span className="font-semibold">{patient.name || 'Anonymous'}</span>
                            <span className="text-xs text-muted-foreground capitalize">{patient.status}</span>
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
                     {selectedPatient.status === 'customized' && selectedPatient.customReport?.prescription && (
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
                      <Label htmlFor="prescription-text">Medicine Recommendations / Notes</Label>
                      <Textarea 
                        id="prescription-text" 
                        placeholder="e.g., Paracetamol 500mg twice a day..." 
                        value={prescriptionText}
                        onChange={(e) => setPrescriptionText(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="prescription-upload">Upload Prescription</Label>
                        <Input id="prescription-upload" type="file" />
                      </div>
                      <Button variant="ghost" size="icon"><Paperclip /></Button>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCustomizing(false)} disabled={isSending}>Cancel</Button>
                      <Button onClick={() => handleUpdatePatient('customized')} disabled={isSending}>
                        {isSending ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" /> Send to Patient</>}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsCustomizing(true)} disabled={isSending || selectedPatient.status !== 'pending'}>
                      <Pencil className="mr-2" /> Customize Report
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdatePatient('approved')} disabled={isSending || selectedPatient.status !== 'pending'}>
                      {isSending && selectedPatient.status === 'pending' ? <Loader2 className="animate-spin" /> : <><Check className="mr-2" /> Approve & Send</>}
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
