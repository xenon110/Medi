
'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-r from-[#667eea] to-[#764ba2]">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#667eea] to-[#764ba2] text-gray-800">
      <div className="bg-white/90 shadow-sm border-b border-black/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Stethoscope className="w-6 h-6 text-gray-700" />
            <span className="text-xl font-semibold text-gray-800">MEDISKIN Patient Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-secondary text-white px-4 py-1.5 rounded-full text-xs font-bold">Patient</div>
            <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white" onClick={() => router.push('/patient/profile')}>Profile</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-xl rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardHeader className="flex-row items-center gap-3">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center text-white">
                    <Camera size={24} />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">Upload Skin Image</CardTitle>
                    <CardDescription className="text-gray-500">Upload a clear image for AI analysis</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                    className="border-2 border-dashed border-blue-300 rounded-2xl p-6 md:p-12 text-center bg-gradient-to-br from-blue-50 to-cyan-50 cursor-pointer hover:border-blue-500 hover:bg-white transition-all"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-secondary rounded-full flex items-center justify-center text-white">
                        <Upload size={32} />
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 mb-6">PNG, JPG up to 10MB</p>
                    <Button className="bg-gradient-primary text-white rounded-full px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Select Image</Button>
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="fileInput"
                    />
                </div>
                {isImageValidating && <div className="text-center mt-4 flex items-center justify-center text-gray-600"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validating image...</div>}
                {imageValidationError && <Alert variant="destructive" className="mt-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Invalid Image</AlertTitle><AlertDescription>{imageValidationError}</AlertDescription></Alert>}
                {imageDataUri && !imageValidationError && (
                    <div className="mt-4 text-center">
                        <div className="text-green-600 flex items-center justify-center"><CheckCircle className="mr-2 h-4 w-4" />Image is valid and ready for analysis.</div>
                        <Button className="w-full mt-4 bg-gradient-primary text-white rounded-full shadow-lg" size="lg" onClick={handleAnalyze} disabled={isAnalyzing}>
                            {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Analyze Now
                        </Button>
                    </div>
                )}
              </CardContent>
          </Card>

          {/* Right Column */}
          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-xl rounded-2xl flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardHeader className="flex-row items-center gap-3">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center text-white">
                    <Bot size={24} />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">AI Assistant</CardTitle>
                    <CardDescription className="text-gray-500">Chat with our AI to describe your symptoms</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl mb-6 border-l-4 border-blue-400">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">AI</div>
                        <strong className="text-gray-700">MEDISKIN AI Assistant</strong>
                    </div>
                    <p className="text-gray-600 text-sm">Hello! I'm your MEDISKIN AI assistant. Please upload an image of your skin condition and describe any symptoms you're experiencing.</p>
                </div>
                <div className="mt-auto space-y-4">
                    <Textarea
                        placeholder="Describe your symptoms..."
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSymptomSubmit())}
                        className="min-h-[100px] resize-none rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                    />
                    <Button onClick={handleSymptomSubmit} className="w-full bg-gradient-secondary text-white rounded-full px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" disabled={!symptomInput.trim() || isChatbotLoading}>
                      <Send className="w-5 h-5 mr-2" />
                      {isChatbotLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                </div>
              </CardContent>
          </Card>
          
          {/* Full-width Reports Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-xl rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <CardHeader className="flex-row items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center text-white">
                        <FileText size={24} />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">Recent Reports</CardTitle>
                        <CardDescription className="text-gray-500">Your latest skin analysis reports</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dummyPreviousReports.map((report) => (
                    <div key={report.id} className="bg-white hover:bg-gray-50 p-4 rounded-2xl border border-gray-200/80 flex justify-between items-center transition-all hover:translate-x-1">
                      <div>
                        <p className="font-semibold text-gray-800">{report.title}</p>
                        <p className="text-sm text-gray-500">{report.date}</p>
                      </div>
                      <Button className="bg-gradient-primary text-white rounded-full" onClick={() => router.push('/patient/reports')}>View Report</Button>
                    </div>
                  ))}
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
