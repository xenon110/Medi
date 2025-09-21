
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
            <a href="#security">Security</a>
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

    