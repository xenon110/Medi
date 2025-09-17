'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Paperclip, Send, Check, Pencil } from 'lucide-react';

const mockPatients = [
  { id: 1, name: 'Anjali Sharma', time: '10:42 AM', report: {
      report: 'The analysis suggests a possible case of mild eczema, characterized by red, inflamed, and itchy patches of skin. The condition appears localized and does not show signs of severe infection.',
      homeRemedies: 'Apply a cold compress to the affected area. Use over-the-counter hydrocortisone cream. Keep the skin moisturized with a gentle, fragrance-free lotion.',
      medicalRecommendation: 'While home remedies may provide relief, it is advisable to monitor the condition. If symptoms persist or worsen, consult a dermatologist.',
      doctorConsultationSuggestion: true,
  }},
  { id: 2, name: 'Ben Carter', time: '9:15 AM', report: {
    report: 'Initial analysis points towards Psoriasis, indicated by the presence of thick, red, scaly patches. The lesion appears well-demarcated.',
    homeRemedies: 'No home remedy available for this condition. Medical consultation is strongly advised.',
    medicalRecommendation: 'It is highly recommended to consult a dermatologist for a definitive diagnosis and a proper treatment plan. Avoid using any harsh soaps or chemicals on the affected area.',
    doctorConsultationSuggestion: true,
  }},
  { id: 3, name: 'Chen Wei', time: 'Yesterday', report: {
    report: 'The image shows signs of a common fungal infection, likely Tinea Corporis (ringworm). It presents as a circular rash that is red and itchy.',
    homeRemedies: 'Over-the-counter antifungal creams can be effective. Keep the area clean and dry.',
    medicalRecommendation: 'If the rash does not improve with OTC treatments within two weeks, see a doctor.',
    doctorConsultationSuggestion: false,
  }},
];

type Patient = typeof mockPatients[0];

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [reportText, setReportText] = useState('');

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setReportText(patient.report.report);
    setIsCustomizing(false);
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
              <div className="flex flex-col gap-2">
                {mockPatients.map((patient) => (
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
                           <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold">{patient.name}</span>
                          <span className="text-xs text-muted-foreground">Report received</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{patient.time}</span>
                    </div>
                  </button>
                ))}
              </div>
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
                        <p className="text-foreground/80">{selectedPatient.report.report}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Home Remedies</h3>
                      <p className="text-foreground/80">{selectedPatient.report.homeRemedies}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Medical Recommendation</h3>
                      <p className="text-foreground/80">{selectedPatient.report.medicalRecommendation}</p>
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
