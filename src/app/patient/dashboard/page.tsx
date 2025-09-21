
'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { AlertCircle, Bot, CheckCircle, Clock, Download, FileText, FileUp, Loader2, MessageSquarePlus, Mic, RefreshCw, Send, Sparkles, Stethoscope, User, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

import { validateImageUpload } from '@/ai/flows/validate-image-upload';
import { assistWithSymptomInputs } from '@/ai/flows/assist-with-symptom-inputs';
import { generateInitialReport, GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';
import { translateReport } from '@/ai/flows/translate-report';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { auth } from '@/lib/firebase';
import { getUserProfile, saveReport } from '@/lib/firebase-services';
import type { User as FirebaseUser, UserInfo } from 'firebase/auth';
import { useRouter } from 'next/navigation';

type ChatMessage = {
  sender: 'user' | 'ai' | 'system';
  text: string | React.ReactNode;
};

// Dummy data for previous reports
const dummyPreviousReports = [
  { id: 'rep-001', title: 'Follow-up on Rash', date: '2023-10-24'},
  { id: 'rep-002', title: 'Initial Mole Check', date: '2023-10-22'},
  { id: 'rep-003', title: 'Eczema Flare-up', date: '2023-10-18'},
];


export default function PatientDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<(UserInfo & { age?: number; region?: string, skinTone?: string, gender?: string }) | null>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);
  const [isImageValidating, setIsImageValidating] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
     { sender: 'ai', text: "Hello! I'm your MEDISKIN AI assistant. Please upload an image of your skin condition and describe any symptoms you're experiencing." }
  ]);
  const [symptomInput, setSymptomInput] = useState('');
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GenerateInitialReportOutput | null>(null);
  
  const originalReportRef = useRef<GenerateInitialReportOutput | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUser({ ...firebaseUser, ...profile });
        } else {
          setUser(firebaseUser);
        }
      } else {
        router.push('/login?role=patient');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageValidating(true);
    setImageValidationError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      try {
        const validation = await validateImageUpload({ photoDataUri: dataUrl });
        if (validation.isValid) {
          setImageDataUri(dataUrl);
        } else {
          setImageValidationError(validation.reason || 'Invalid image.');
          setImageDataUri(null);
        }
      } catch (error) {
        console.error(error);
        setImageValidationError('Error validating image.');
      } finally {
        setIsImageValidating(false);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSymptomSubmit = async () => {
    if (!symptomInput.trim() || isChatbotLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: symptomInput };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatbotLoading(true);
    
    try {
      const response = await assistWithSymptomInputs({ symptomQuery: symptomInput });
      const aiMessage: ChatMessage = {
        sender: 'ai',
        text: (
          <div className="space-y-2">
            <p>{response.refinedSymptoms}</p>
            <p className="font-semibold">Any of these apply?</p>
            <div className="flex flex-col items-start gap-1">
              {response.suggestedQuestions.map((q, i) => (
                <Button key={i} size="sm" variant="outline" className="h-auto py-1 px-2 text-xs" onClick={() => setSymptomInput(q)}>{q}</Button>
              ))}
            </div>
          </div>
        ),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { sender: 'system', text: 'Sorry, I had trouble understanding. Please try again.' };
      setChatMessages(prev => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setSymptomInput('');
      setIsChatbotLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUri || !user?.uid) return;

    setIsAnalyzing(true);
    const allSymptoms = chatMessages.filter(m => m.sender === 'user').map(m => m.text).join('. ');

    try {
      const result = await generateInitialReport({
        photoDataUri: imageDataUri,
        symptomInputs: allSymptoms,
        age: user.age || 30,
        gender: user.gender || 'not specified',
        region: user.region || 'not specified',
        skinTone: user.skinTone || 'not specified',
      });
      setAnalysisResult(result);
      originalReportRef.current = result;
      
      await saveReport(user.uid, result);

      toast({
        title: "Analysis Complete",
        description: "Your AI-powered report has been generated and saved.",
      });
      // Potentially switch view to show results here
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "An error occurred while analyzing your data.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-medical-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-medical-text">MEDISKIN Patient Portal</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-medical-success/10 text-medical-success border-medical-success/20">
              <User className="w-3 h-3 mr-1" />
              Patient
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => router.push('/patient/profile')}>Profile</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-medical-border bg-white/50 backdrop-blur-sm shadow-medical">
              <CardHeader>
                <CardTitle className="text-medical-primary flex items-center">
                  <FileUp className="w-5 h-5 mr-2" />
                  Upload Skin Image
                </CardTitle>
                <CardDescription>
                  Upload a clear image of your skin condition for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-medical-border rounded-lg p-8 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <Image 
                        src={imagePreview} 
                        alt="Uploaded skin condition"
                        width={256}
                        height={256}
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-medical-subtle object-contain"
                      />
                       {isImageValidating && <div className="flex items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validating...</div>}
                       {imageValidationError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Invalid Image</AlertTitle><AlertDescription>{imageValidationError}</AlertDescription></Alert>}
                       {imageDataUri && !imageValidationError && <div className="flex items-center justify-center text-green-600"><CheckCircle className="mr-2 h-4 w-4" />Image is valid.</div>}

                      <Button variant="outline" size="sm" onClick={() => { setImagePreview(null); setImageDataUri(null); setImageValidationError(null); }}>
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-medical-accent mx-auto" />
                      <div>
                        <p className="text-medical-text mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-medical-text/60">PNG, JPG up to 10MB</p>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button variant="medical" asChild>
                          <span>Choose File</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {imageDataUri && !imageValidationError && (
                  <Button className="w-full" size="lg" onClick={handleAnalyze} disabled={isAnalyzing}>
                     {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Analyze Image
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-medical-border bg-white/50 backdrop-blur-sm shadow-medical">
              <CardHeader>
                <CardTitle className="text-medical-primary flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dummyPreviousReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-medical-bg rounded-lg border border-medical-border/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-medical-text">{report.title}</p>
                          <p className="text-sm text-medical-text/60">{report.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push('/patient/reports')}>View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-medical-border bg-white/50 backdrop-blur-sm shadow-medical h-[calc(100vh-14rem)] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-medical-primary flex items-center">
                  <MessageSquarePlus className="w-5 h-5 mr-2" />
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  Chat with our AI to describe your symptoms
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 -mr-6 pr-6 mb-4">
                  <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.sender !== 'user' && <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>}
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'user' 
                            ? 'bg-gradient-primary text-primary-foreground' 
                            : 'bg-medical-bg border border-medical-border text-medical-text'
                        }`}>
                            {message.text}
                        </div>
                        {message.sender === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><User /></AvatarFallback></Avatar>}
                    </div>
                  ))}
                  { isChatbotLoading && 
                     <div className="flex items-end gap-2 justify-start">
                        <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>
                        <div className="max-w-[80%] p-3 rounded-lg bg-medical-bg border border-medical-border text-medical-text">
                            <Loader2 className="animate-spin w-5 h-5" />
                        </div>
                    </div>
                  }
                  </div>
                </ScrollArea>
                
                <Separator className="my-3" />

                <div className="space-y-3">
                  <Textarea
                    placeholder="Describe your symptoms..."
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSymptomSubmit())}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleSymptomSubmit} className="flex-1" disabled={!symptomInput.trim() || isChatbotLoading}>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                    <Button variant="outline" size="icon" disabled>
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
