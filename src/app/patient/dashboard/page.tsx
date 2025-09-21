
'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { AlertCircle, Bot, CheckCircle, Clock, Download, FileText, FileUp, Loader2, MessageSquarePlus, Mic, RefreshCw, Send, Sparkles, Stethoscope, User, X, Upload, Camera } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
    const handleTranslate = async (language: string) => {
    if (!originalReportRef.current) return;

    toast({ title: 'Translating report...' });
    try {
      const translated = await translateReport({
        report: originalReportRef.current,
        language: language,
      });

      // We need to merge the translated text fields with the original non-text fields
      setAnalysisResult(prev => {
        if (!prev) return null;
        const updatedConditions = prev.potentialConditions.map((pc, index) => ({
          ...pc,
          name: translated.potentialConditions[index]?.name || pc.name,
          description: translated.potentialConditions[index]?.description || pc.description,
        }));

        return {
          ...prev,
          potentialConditions: updatedConditions,
          report: translated.report,
          homeRemedies: translated.homeRemedies,
          medicalRecommendation: translated.medicalRecommendation,
        };
      });

      toast({ title: 'Translation Complete!', description: `Report translated to ${language}.` });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Translation Failed' });
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-r from-[#667eea] to-[#764ba2]">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }
  
  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <Loader2 className="animate-spin text-primary" size={64} />
        <p className="mt-4 text-xl font-semibold text-foreground">Analyzing Your Image...</p>
        <p className="text-muted-foreground">The AI is processing your information. This may take a moment.</p>
      </div>
    );
  }
  
   if (analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
         <header className="bg-background/95 backdrop-blur-sm border-b border-medical-border sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-secondary rounded-xl">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient-primary">MEDISKIN</h1>
                </div>
              </div>
              <Button onClick={() => setAnalysisResult(null)} variant="outline">
                <RefreshCw className="mr-2"/> Start New Analysis
              </Button>
            </div>
        </header>

        <div className="container mx-auto py-8">
          <Card className="shadow-elevated border-primary/20">
            <CardHeader className="bg-gradient-subtle rounded-t-lg p-6">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-3xl font-headline text-foreground">AI Analysis Report</CardTitle>
                     <Select onValueChange={handleTranslate}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Translate Report" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="hi">हिन्दी</SelectItem>
                        <SelectItem value="bn">বাংলা</SelectItem>
                        <SelectItem value="ta">தமிழ்</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              <CardDescription>This is a preliminary analysis. Always consult a qualified dermatologist.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Conditions & Analysis */}
                <div className="space-y-6">
                   <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Potential Conditions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysisResult.potentialConditions.map((cond, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-primary">{cond.name}</h4>
                            <Badge variant={cond.likelihood === 'High' ? 'destructive' : cond.likelihood === 'Medium' ? 'secondary' : 'default'} className="capitalize">{cond.likelihood}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{cond.description}</p>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Confidence:</Label>
                            <Progress value={cond.confidence * 100} className="w-1/2 h-2" />
                            <span className="text-xs font-mono">{(cond.confidence * 100).toFixed(1)}%</span>
                          </div>
                          { i < analysisResult.potentialConditions.length - 1 && <Separator className="mt-4"/>}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Summary Report</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-foreground/80 whitespace-pre-wrap">{analysisResult.report}</p></CardContent>
                  </Card>
                </div>

                {/* Right Column: Recommendations */}
                <div className="space-y-6">
                   <Card className="bg-primary/5 border-primary/20">
                    <CardHeader><CardTitle className="text-xl text-primary">Medical Recommendation</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{analysisResult.medicalRecommendation}</p>
                      {analysisResult.doctorConsultationSuggestion && (
                        <Button asChild className="w-full" size="lg">
                          <Link href="/patient/consult"><Stethoscope className="mr-2"/> Consult a Doctor</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader><CardTitle className="text-xl">Home Remedies</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-foreground/80 whitespace-pre-wrap">{analysisResult.homeRemedies}</p></CardContent>
                  </Card>
                   <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Disclaimer</AlertTitle>
                      <AlertDescription>
                        This AI analysis is for informational purposes only and is not a substitute for professional medical advice.
                      </AlertDescription>
                    </Alert>
                </div>
              </div>
            </CardContent>
             <CardFooter className="p-4 bg-muted/50 flex justify-end gap-2">
                <Button variant="outline"><Download className="mr-2" /> Download PDF</Button>
                <Button><Send className="mr-2"/> Share with Doctor</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
       <header className="header">
        <div className="logo-section">
            <div className="logo"><Stethoscope className="w-5 h-5"/></div>
            <div>
                <div className="brand-text">MEDISKIN</div>
                <div className="tagline">AI Dermatology</div>
            </div>
        </div>
        <nav className="nav-links">
            <a href="/#features">Features</a>
            <a href="/#how-it-works">How It Works</a>
            <a href="/#security">Security</a>
            <a href="/help">Help</a>
        </nav>
        <Button className="login-btn" onClick={() => router.push('/login?role=patient')}>Login as Patient</Button>
    </header>
    
    <div className="sub-header">
        <div className="portal-title">
            <Stethoscope/>
            <span>MEDISKIN Patient Portal</span>
        </div>
        <div className="profile-section">
            <div className="status-badge">Patient</div>
            <Button className="profile-btn" onClick={() => router.push('/patient/profile')}>Profile</Button>
        </div>
    </div>


      <div className="main-container">
          
        <div className="card">
            <div className="card-header">
                <div className="card-icon"><Camera /></div>
                <div>
                    <div className="card-title">Upload Skin Image</div>
                    <div className="card-subtitle">Upload a clear image for AI analysis</div>
                </div>
            </div>
            <div 
                className="upload-area"
                onClick={() => fileInputRef.current?.click()}
            >
              {isImageValidating ? (
                 <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-primary">Validating...</p>
                 </div>
              ) : imageValidationError ? (
                <div className="flex flex-col items-center justify-center h-full text-destructive">
                    <XCircle className="w-12 h-12 mb-4" />
                    <p className="font-semibold">Invalid Image</p>
                    <p className="text-sm mb-4">{imageValidationError}</p>
                    <Button className="upload-btn" variant="destructive">Try Again</Button>
                </div>
              ) : imageDataUri ? (
                 <div className="flex flex-col items-center justify-center h-full text-success">
                    <CheckCircle className="w-12 h-12 mb-4" />
                    <p className="font-semibold">Image Ready!</p>
                    <p className="text-sm mb-4">You can now proceed with the analysis.</p>
                    <Button className="upload-btn" onClick={handleAnalyze} disabled={isAnalyzing}>
                      {isAnalyzing ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                      Analyze Now
                    </Button>
                 </div>
              ) : (
                <>
                  <div className="upload-icon"><Upload /></div>
                  <div className="upload-text">Click to upload or drag and drop</div>
                  <div className="upload-subtext">PNG, JPG up to 10MB</div>
                  <Button className="upload-btn">Select Image</Button>
                  <Input
                      ref={fileInputRef}
                      type="file"
                      id="fileInput"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                  />
                </>
              )}
            </div>
        </div>

        <div className="card">
            <div className="card-header">
                <div className="card-icon"><Bot /></div>
                <div>
                    <div className="card-title">AI Assistant</div>
                    <div className="card-subtitle">Chat with our AI to describe your symptoms</div>
                </div>
            </div>
            <div className="chat-container">
                <div className="ai-message">
                    <div className="ai-message-header">
                        <div className="ai-avatar">AI</div>
                        <strong>MEDISKIN AI Assistant</strong>
                    </div>
                    <p>Hello! I'm your MEDISKIN AI assistant. Please upload an image of your skin condition and describe any symptoms you're experiencing.</p>
                </div>
                 <div className="chat-input-area">
                    <Textarea
                        placeholder="Describe your symptoms..."
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSymptomSubmit())}
                        className="chat-input"
                    />
                    <Button onClick={handleSymptomSubmit} className="chat-btn" disabled={!symptomInput.trim() || isChatbotLoading}>
                      <Send className="w-4 h-4" />
                      {isChatbotLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                </div>
            </div>
        </div>

        <div className="card reports-section">
            <div className="card-header">
                <div className="card-icon"><FileText /></div>
                <div>
                    <div className="card-title">Recent Reports</div>
                    <div className="card-subtitle">Your latest skin analysis reports</div>
                </div>
            </div>
             {dummyPreviousReports.map((report) => (
                <div key={report.id} className="report-item">
                    <div className="report-info">
                        <h4>{report.title}</h4>
                        <div className="date">{report.date}</div>
                    </div>
                    <Button className="view-btn" onClick={() => router.push('/patient/reports')}>View</Button>
                </div>
              ))}
        </div>

      </div>
    </div>
  );
}

    