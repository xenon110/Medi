
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, CheckCircle, Pencil, Loader2, Inbox, XCircle, ThumbsUp, Search, Stethoscope, FileText, Edit3 } from 'lucide-react';
import { GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Dummy Data
const dummyPatients = [
  {
    id: 1,
    name: "Sarah Johnson",
    age: 28,
    condition: "Suspicious mole examination",
    time: "2 hours ago",
    urgent: true,
    unread: 2
  },
  {
    id: 2,
    name: "Michael Chen",
    age: 35,
    condition: "Recurring eczema flare-up",
    time: "4 hours ago",
    urgent: false,
    unread: 0
  },
  {
    id: 3,
    name: "Emma Williams",
    age: 22,
    condition: "Acne treatment follow-up",
    time: "1 day ago",
    urgent: false,
    unread: 1
  }
];

const aiReport = {
    patientName: "Sarah Johnson",
    symptoms: ["Dark spot on arm", "Irregular borders", "Recent size increase"],
    aiAnalysis: "The AI analysis suggests this could be a concerning lesion that requires immediate dermatological evaluation. The irregular borders and recent growth pattern are notable findings.",
    recommendation: "Urgent dermatologist consultation recommended within 48 hours.",
    homeRemedies: "No home remedies recommended for this condition."
};

const chatHistory = [
    { type: "system", content: "AI Report generated for Sarah Johnson's skin condition", timestamp: "10:30 AM" },
    { type: "ai-report", content: aiReport, timestamp: "10:30 AM" },
    { type: "doctor", content: "I've reviewed the AI analysis and the patient's uploaded image. I agree with the assessment.", timestamp: "11:15 AM" }
] as Array<{
    type: string;
    content: string | typeof aiReport;
    timestamp: string;
}>;


type Patient = {
  id: number;
  name: string;
  age: number;
  condition: string;
  time: string;
  urgent: boolean;
  unread: number;
};

export default function DoctorDashboard() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(dummyPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const sendMessage = () => {
    if (currentMessage.trim()) {
      // Logic to send message
      setCurrentMessage("");
    }
  };

  if (isLoading) {
     return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-background/95 backdrop-blur-sm border-b border-medical-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-medical-text">MEDISKIN Doctor Portal</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-medical-primary/10 text-medical-primary border-medical-primary/20">
              <Stethoscope className="w-3 h-3 mr-1" />
              Doctor
            </Badge>
            <Button variant="ghost" size="sm">Dr. Smith</Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Patient List Sidebar */}
        <div className="w-80 bg-white/50 backdrop-blur-sm border-r border-medical-border">
          <div className="p-4 border-b border-medical-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-text/40 w-4 h-4" />
              <Input 
                placeholder="Search patients..." 
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={`p-4 border-b border-medical-border/30 cursor-pointer transition-colors hover:bg-medical-bg/50 ${
                  selectedPatientId === patient.id ? 'bg-medical-bg border-l-4 border-l-medical-primary' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} />
                    <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-medical-text truncate">{patient.name}</h3>
                      {patient.unread > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {patient.unread}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-medical-text/70 mb-1">Age: {patient.age}</p>
                    <p className="text-sm text-medical-text/60 truncate mb-2">{patient.condition}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-medical-text/50">{patient.time}</span>
                      {patient.urgent && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedPatient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white/50 backdrop-blur-sm border-b border-medical-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPatient.name}`} />
                      <AvatarFallback>
                        {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-medical-text">
                        {selectedPatient.name}
                      </h2>
                      <p className="text-sm text-medical-text/60">
                        {selectedPatient.condition}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((message, index) => (
                  <div key={index}>
                    {message.type === 'system' && typeof message.content === 'string' && (
                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {message.content}
                        </Badge>
                        <p className="text-xs text-medical-text/40 mt-1">{message.timestamp}</p>
                      </div>
                    )}

                    {message.type === 'ai-report' && typeof message.content === 'object' && (
                      <Card className="bg-medical-bg/30 border border-medical-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            AI Analysis Report
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Symptoms Reported:</h4>
                            <ul className="text-sm text-medical-text/70 space-y-1">
                              {(message.content.symptoms as string[]).map((symptom: string, i: number) => (
                                <li key={i}>• {symptom}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">AI Analysis:</h4>
                            <p className="text-sm text-medical-text/70">{message.content.aiAnalysis}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Recommendation:</h4>
                            <p className="text-sm text-medical-text/70">{message.content.recommendation}</p>
                          </div>

                          <div className="flex justify-end space-x-2 pt-3">
                            <Button variant="outline" size="sm">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Customize Report
                            </Button>
                            <Button variant="medical" size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Send
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {message.type === 'doctor' && typeof message.content === 'string' && (
                      <div className="flex justify-end">
                        <div className="max-w-[70%] bg-gradient-primary text-white p-3 rounded-lg">
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-medical-border">
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Type your response to the patient..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-medical-text/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-medical-text mb-2">Select a Patient</h3>
                <p className="text-medical-text/60">Choose a patient from the list to view their case</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
