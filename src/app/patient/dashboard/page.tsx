
'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Bot, CheckCircle, Loader2, Sparkles, Upload, Camera, Mic, Send, Stethoscope, FileText, Clock, User, LogOut, ArrowUp, File, ClipboardList, Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { validateImageUpload } from '@/ai/flows/validate-image-upload';
import { assistWithSymptomInputs } from '@/ai/flows/assist-with-symptom-inputs';
import { generateInitialReport } from '@/ai/flows/generate-initial-report';
import { auth, db } from '@/lib/firebase';
import { getUserProfile, saveReport, Report, PatientProfile, logEmergency } from '@/lib/firebase-services';
import { cn } from '@/lib/utils';
import Link from 'next/link';


export default function PatientDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<PatientProfile | null>(null);
  
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);
  const [isImageValidating, setIsImageValidating] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);
  
  const [symptomInput, setSymptomInput] = useState('');
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const [recentReports, setRecentReports] = useState<Report[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          if (profile.role === 'doctor') {
            router.push('/doctor/dashboard');
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
    setIsImageReady(false);
    setImageValidationError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const validation = await validateImageUpload({ photoDataUri: dataUrl });
        if (validation.isValid) {
          setImageDataUri(dataUrl);
          setIsImageReady(true);
          toast({
            title: "Image Uploaded!",
            description: "Your image is ready for analysis.",
          });
        } else {
          setImageValidationError(validation.reason || 'Invalid image.');
          setImageDataUri(null);
        }
      } catch (error) {
        console.error(error);
        setImageValidationError('Validation error occurred.');
        toast({ variant: "destructive", title: "Validation Error" });
      } finally {
        setIsImageValidating(false);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSymptomSubmit = async () => {
    if (!symptomInput.trim() || isChatbotLoading) return;
    setIsChatbotLoading(true);
    toast({ title: 'Message sent to AI assistant' });

    try {
      // The AI will refine the symptoms, but for this UI, we just confirm it was sent.
      // A more complex UI could show the refined symptoms back to the user.
      await assistWithSymptomInputs({ symptomQuery: symptomInput });
      toast({ title: '🤖 AI has processed your symptoms.', description: 'You can now proceed with the analysis.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not process symptoms.' });
      console.error(error);
    } finally {
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
    toast({ title: '🔬 Starting comprehensive analysis...' });
    
    try {
      const result = await generateInitialReport({
        photoDataUri: imageDataUri,
        symptomInputs: symptomInput || 'No symptoms described.',
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

  const getStatusText = (status: Report['status']) => {
    switch (status) {
        case 'pending-doctor-review': return 'Pending Doctor Review';
        case 'doctor-approved': return 'Approved by Doctor';
        case 'doctor-modified': return 'Reviewed by Doctor';
        case 'rejected': return 'Disqualified by Doctor';
        case 'pending-patient-input': return 'Ready for Doctor Consultation';
        default: return 'Unknown Status';
    }
  };
  
  const handleEmergencyClick = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await logEmergency(user.uid);
        toast({
          variant: 'destructive',
          title: '🚨 Emergency Logged',
          description: 'Your emergency has been logged. For immediate assistance, please call your local emergency number or visit the nearest hospital.',
          duration: 7000,
        });
      } catch (error) {
        console.error("Failed to log emergency:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not log emergency. Please call for help directly.',
        });
      }
    } else {
       toast({
        variant: 'destructive',
        title: '🚨 Please Log In',
        description: 'You must be logged in to report an emergency. For immediate medical emergencies, please call your local emergency number.',
        duration: 7000,
      });
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center new-dashboard-bg">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  return (
    <div className="new-dashboard-bg min-h-screen">
      <div className="container">
        {/* Header */}
        <header className="header">
            <div className="logo">
                <div className="logo-icon"><Stethoscope/></div>
                <span>MEDISKIN</span>
            </div>
            <nav className="nav">
                <Link href="/#features">Features</Link>
                <Link href="/patient/reports">My Reports</Link>
                <Link href="/patient/consult">Consult</Link>
                <Link href="/help">Contact</Link>
                <button className="emergency-btn" onClick={handleEmergencyClick}>🚨 Emergency</button>
            </nav>
        </header>

        {/* Main Content */}
        <div className="main-content">
            {/* Upload Skin Image */}
            <div className="card">
                <div className="card-title">
                    <div className="card-icon upload-icon"><Camera/></div>
                    Upload Skin Image
                </div>
                <p className="card-subtitle">Upload a clear image of your skin condition for AI analysis.</p>
                
                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                   {isImageValidating ? (
                        <>
                           <div className="upload-icon-large"><Loader2 className="animate-spin" /></div>
                           <div className="upload-text">Validating...</div>
                           <div className="upload-subtext">Please wait while we check your image.</div>
                        </>
                    ) : isImageReady ? (
                        <>
                           <div className="upload-icon-large" style={{background: 'linear-gradient(45deg, #2edc76, #02e4a0)'}}><CheckCircle/></div>
                           <div className="upload-text">Image Ready!</div>
                           <div className="upload-subtext">You can now describe symptoms or analyze.</div>
                        </>
                    ) : imageValidationError ? (
                         <>
                           <div className="upload-icon-large" style={{background: 'linear-gradient(45deg, #ff4b2b, #ff7849)'}}><Upload/></div>
                           <div className="upload-text text-red-600">{imageValidationError}</div>
                           <div className="upload-subtext">Please try another image.</div>
                        </>
                    ) : (
                        <>
                           <div className="upload-icon-large"><ArrowUp/></div>
                           <div className="upload-text">Click to upload or drag and drop</div>
                           <div className="upload-subtext">PNG, JPG up to 10MB</div>
                        </>
                    )}
                </div>
                <Input type="file" id="fileInput" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload}/>
            </div>

            {/* AI Assistant */}
            <div className="card ai-assistant">
                <div className="card-title">
                    <div className="card-icon ai-icon"><Bot/></div>
                    AI Assistant
                </div>
                <p className="card-subtitle">Chat with our AI to describe your symptoms.</p>
                
                <div className="ai-message">
                    <div className="ai-avatar">AI</div>
                    <p>Hello! I'm your MEDISKIN AI assistant. Please upload an image and describe your symptoms. The more details you provide, the better I can assist you.</p>
                </div>

                <div className="input-area">
                    <textarea 
                        className="symptom-input" 
                        placeholder="Describe your symptoms..."
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                    ></textarea>
                </div>

                <div className="input-actions">
                    <button className="voice-btn" onClick={() => setIsVoiceActive(!isVoiceActive)}>
                        {isVoiceActive ? '🔴' : <Mic/>}
                    </button>
                    <button 
                      className="send-btn" 
                      onClick={handleSymptomSubmit}
                      disabled={isChatbotLoading || !symptomInput.trim()}
                    >
                      {isChatbotLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Send'}
                    </button>
                </div>

                <button 
                  className="analyze-btn" 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !isImageReady}
                >
                  {isAnalyzing ? <Loader2 className="animate-spin mx-auto" /> : <><Sparkles className="inline-block mr-2"/> Analyze Now</>}
                </button>
            </div>
        </div>

        {/* Recent Reports */}
        <div className="reports-section">
            <div className="reports-title">
                <div className="reports-icon"><ClipboardList/></div>
                Recent Reports
            </div>
            <p className="card-subtitle">Review your past skin analysis reports.</p>
            
            {recentReports.length > 0 ? recentReports.map((report) => (
                <div key={report.id} className="report-item">
                    <div className="report-info">
                        <h3>Report from {new Date((report.createdAt as any).seconds * 1000).toLocaleDateString()}</h3>
                        <div className="report-status">{getStatusText(report.status)}</div>
                    </div>
                    <button className="view-btn" onClick={() => {
                        sessionStorage.setItem('latestReport', JSON.stringify(report));
                        router.push('/patient/report');
                    }}>View Report</button>
                </div>
            )) : (
                <p className="text-center text-gray-500 py-8">No reports found.</p>
            )}
        </div>
      </div>
    </div>
  );
}
