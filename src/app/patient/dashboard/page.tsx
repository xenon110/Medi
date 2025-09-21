
'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Bot, CheckCircle, Loader2, Mic, Send, Sparkles, Stethoscope, User, XCircle, Upload, Camera, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserInfo } from 'firebase/auth';

import { validateImageUpload } from '@/ai/flows/validate-image-upload';
import { assistWithSymptomInputs } from '@/ai/flows/assist-with-symptom-inputs';
import { generateInitialReport, GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';
import { auth } from '@/lib/firebase';
import { getUserProfile, saveReport } from '@/lib/firebase-services';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translateReport, TranslateReportOutput } from '@/ai/flows/translate-report';


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
      setImagePreview(dataUrl); // For previewing the selected image
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
        symptomInputs: allSymptoms || 'No symptoms described.', // Ensure it's not empty
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

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-primary">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen text-foreground">
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
                    <div className="flex flex-col items-center justify-center text-center h-full">
                        <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
                        <p className="text-lg font-semibold text-primary">Validating Image...</p>
                        <p className="text-sm text-muted-foreground">Please wait while we check your photo.</p>
                    </div>
                ) : imageValidationError ? (
                    <div className="flex flex-col items-center justify-center text-center h-full text-destructive">
                        <XCircle className="w-16 h-16 mb-4" />
                        <p className="text-lg font-semibold">Image Invalid</p>
                        <p className="text-sm mb-4">{imageValidationError}</p>
                        <Button className="upload-btn" variant="destructive">Try Again</Button>
                    </div>
                ) : imageDataUri ? (
                    <div className="flex flex-col items-center justify-center text-center h-full text-success">
                        <CheckCircle className="w-16 h-16 mb-4" />
                        <p className="text-lg font-semibold">Image Ready!</p>
                        <p className="text-sm mb-4">You can now describe your symptoms or proceed to analysis.</p>
                        <Button className="upload-btn" onClick={handleAnalyze} disabled={isAnalyzing}>
                            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
                      {isChatbotLoading ? 'Thinking...' : 'Send Message'}
                    </Button>
                </div>
            </div>
        </div>

        <div className="card reports-section">
            <div className="card-header">
                <div className="card-icon"><Clock /></div>
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
                    <Button className="view-btn" onClick={() => router.push('/patient/reports')}>View Report</Button>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

    