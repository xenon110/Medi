

'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Bot, CheckCircle, Loader2, Sparkles, Upload, Camera, Mic, Send, Stethoscope, FileText, Clock, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserInfo } from 'firebase/auth';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { validateImageUpload } from '@/ai/flows/validate-image-upload';
import { assistWithSymptomInputs } from '@/ai/flows/assist-with-symptom-inputs';
import { generateInitialReport } from '@/ai/flows/generate-initial-report';
import { auth, db } from '@/lib/firebase';
import { getUserProfile, saveReport, Report, PatientProfile } from '@/lib/firebase-services';

export default function PatientDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<PatientProfile | null>(null);
  
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);
  const [isImageValidating, setIsImageValidating] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [recentReports, setRecentReports] = useState<Report[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          if (profile.role === 'doctor') {
            router.push('/doctor/dashboard'); // Redirect doctor away
            return;
          }
          setUser(profile as PatientProfile);

          if (db) {
            const reportsRef = collection(db, 'reports');
            const q = query(reportsRef, where('patientId', '==', firebaseUser.uid));
            
            const unsubscribeSnap = onSnapshot(q, (querySnapshot) => {
              const reports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
              setRecentReports(reports);
            }, (error) => {
              console.error("Error fetching patient reports in real-time:", error);
              toast({ variant: "destructive", title: "Error", description: "Could not fetch your reports." });
            });
            
            return () => unsubscribeSnap();
          }

        } else {
          router.push('/login?role=patient');
        }
      } else {
        router.push('/login?role=patient');
      }
    });
    return () => unsubscribeAuth();
  }, [router, toast]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageValidating(true);
    setImageValidationError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const validation = await validateImageUpload({ photoDataUri: dataUrl });
        if (validation.isValid) {
          setImageDataUri(dataUrl);
          setImageValidationError(null);
          toast({
            title: "Image is valid!",
            description: "You can now describe your symptoms.",
          });
        } else {
          setImageValidationError(validation.reason || 'Invalid image. Please upload a clear photo of a skin condition.');
          setImageDataUri(null);
        }
      } catch (error) {
        console.error(error);
        setImageValidationError('An error occurred during image validation.');
        toast({ variant: "destructive", title: "Validation Error" });
      } finally {
        setIsImageValidating(false);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSymptomSubmit = async () => {
    if (!symptomInput.trim() || isChatbotLoading) return;

    const userMessage = { sender: 'user', text: symptomInput };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatbotLoading(true);
    
    try {
      const response = await assistWithSymptomInputs({ symptomQuery: symptomInput });
      const aiMessage = {
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
      const errorMessage = { sender: 'system', text: 'Sorry, I had trouble understanding. Please try again.' };
      setChatMessages(prev => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setSymptomInput('');
      setIsChatbotLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUri || !user?.uid) {
        toast({
            variant: "destructive",
            title: "Cannot Analyze",
            description: "Please upload a valid image before starting the analysis.",
        });
        return;
    }

    setIsAnalyzing(true);
    const allSymptoms = chatMessages.filter(m => m.sender === 'user').map(m => m.text).join('. ');

    try {
      const result = await generateInitialReport({
        photoDataUri: imageDataUri,
        symptomInputs: allSymptoms || 'No symptoms described.',
        age: user.age || 30,
        gender: user.gender || 'not specified',
        region: user.region || 'not specified',
        skinTone: user.skinTone || 'not specified',
      });
      
      const savedReport = await saveReport(user.uid, result);

      sessionStorage.setItem('latestReport', JSON.stringify(savedReport));

      toast({
        title: "Analysis Complete",
        description: "Redirecting to your report...",
      });
      
      router.push(`/patient/report`);

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
      <div className="flex h-screen items-center justify-center bg-gradient-subtle">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-subtle min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name || 'Patient'}!</h1>
            <p className="text-muted-foreground">Get started by uploading an image for a new analysis.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Image Upload & Reports */}
            <div className="lg:col-span-2 space-y-8">
                 <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Camera /> Upload Skin Image</CardTitle>
                        <CardDescription>Upload a clear image of your skin condition for AI analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div 
                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isImageValidating ? (
                                <>
                                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                                    <p className="font-semibold">Validating Image...</p>
                                    <p className="text-sm text-muted-foreground">Please wait while we check your photo.</p>
                                </>
                            ) : imageValidationError ? (
                                <div className="text-center text-destructive">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-semibold">Image Invalid</p>
                                    <p className="text-sm mb-4">{imageValidationError}</p>
                                    <Button variant="destructive">Try Again</Button>
                                </div>
                            ) : imageDataUri ? (
                                <div className="text-center text-green-600">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-semibold">Image Ready!</p>
                                    <p className="text-sm text-muted-foreground">You can now describe your symptoms or analyze.</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-muted-foreground mb-4"/>
                                    <p className="font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
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
                    </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> Recent Reports</CardTitle>
                        <CardDescription>Review your past skin analysis reports.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentReports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold">Report from {new Date((report.createdAt as any).seconds * 1000).toLocaleDateString()}</h4>
                                        <p className="text-sm text-muted-foreground capitalize">{report.status.replace(/-/g, ' ')}</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => router.push('/patient/report')}>View Report</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: AI Assistant */}
            <div className="lg:col-span-1">
                <Card className="shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot/> AI Assistant</CardTitle>
                        <CardDescription>Chat with our AI to describe your symptoms.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary text-primary-foreground rounded-full"><Bot size={16}/></div>
                                <div className="bg-muted p-3 rounded-lg">
                                    <p className="text-sm">Hello! I'm your MEDISKIN AI assistant. Please upload an image and describe your symptoms. The more details you provide, the better I can assist you.</p>
                                </div>
                            </div>
                            {/* Chat messages would be rendered here */}
                        </div>
                        <div className="mt-auto pt-4 border-t">
                            <Textarea
                                placeholder="Describe your symptoms..."
                                value={symptomInput}
                                onChange={(e) => setSymptomInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSymptomSubmit())}
                                className="mb-2"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon"><Mic/></Button>
                                <Button onClick={handleSymptomSubmit} disabled={!symptomInput.trim() || isChatbotLoading}>
                                    {isChatbotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                                    Send
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleAnalyze} disabled={isAnalyzing || !imageDataUri} className="w-full">
                            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Analyze Now
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}

    
