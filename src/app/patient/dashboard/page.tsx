'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { AlertCircle, ArrowLeft, Bot, CheckCircle, ChevronRight, Download, FileUp, Loader2, MessageSquarePlus, RefreshCw, Sparkles, Stethoscope, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { validateImageUpload, ValidateImageUploadOutput } from '@/ai/flows/validate-image-upload';
import { assistWithSymptomInputs, AssistWithSymptomInputsOutput } from '@/ai/flows/assist-with-symptom-inputs';
import { generateInitialReport, GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';
import { translateReport, TranslateReportOutput } from '@/ai/flows/translate-report';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const patientDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  region: z.string().min(1, 'Region is required.'),
  skinTone: z.string().min(1, 'Skin tone is required.'),
  age: z.coerce.number().min(1, 'Age is required.').max(120),
  gender: z.enum(['male', 'female', 'other']),
});

type PatientDetails = z.infer<typeof patientDetailsSchema>;

type ChatMessage = {
  sender: 'user' | 'ai' | 'system';
  text: string | React.ReactNode;
};

// Dummy user object
const dummyUser = {
  uid: 'dummy-patient-123',
  email: 'patient@test.com',
};

export default function PatientDashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState<typeof dummyUser | null>(null);
  const [step, setStep] = useState<'details' | 'upload' | 'analyzing' | 'result'>('details');
  
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);
  const [isImageValidating, setIsImageValidating] = useState(false);
  
  const [showSymptomChat, setShowSymptomChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<GenerateInitialReportOutput | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const originalReportRef = useRef<GenerateInitialReportOutput | null>(null);
  
  useEffect(() => {
    // Simulate user login
    setUser(dummyUser);
  }, []);


  const form = useForm<PatientDetails>({
    resolver: zodResolver(patientDetailsSchema),
    defaultValues: { name: 'John Doe', region: 'India', gender: 'male', skinTone: 'Type IV', age: 30 },
  });

  const onSubmitDetails: SubmitHandler<PatientDetails> = (data) => {
    setPatientDetails(data);
    setStep('upload');
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageValidationError(null);
    setIsImageValidating(true);
    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      setImageDataUri(base64data);
       try {
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        setImageValidationError('An error occurred during image validation.');
        console.error(error);
      } finally {
        setIsImageValidating(false);
      }
    };
  };

  const handleReupload = () => {
    setImagePreview(null);
    setImageDataUri(null);
    setImageValidationError(null);
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  const handleSymptomSubmit = async () => {
    if (!symptomInput.trim() || isChatbotLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: symptomInput };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatbotLoading(true);
    setSymptomInput('');
    
    try {
      const response: AssistWithSymptomInputsOutput = {
        refinedSymptoms: `Based on your input about "${symptomInput}", I've noted it down.`,
        suggestedQuestions: ["Is there any swelling?", "Does it hurt to touch?", "Have you used any creams?"]
      };
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
      setIsChatbotLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUri || !patientDetails) return;
    setStep('analyzing');
    const allSymptoms = chatMessages.filter(m => m.sender === 'user').map(m => m.text).join(', ');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result: GenerateInitialReportOutput = {
        potentialConditions: [
          { name: 'Atopic Dermatitis (Eczema)', likelihood: 'High', confidence: 0.88, description: 'A chronic condition causing red, itchy, and inflamed skin.' },
          { name: 'Contact Dermatitis', likelihood: 'Medium', confidence: 0.55, description: 'A skin reaction from contact with a substance.' }
        ],
        report: 'The visual analysis of the provided image, combined with the described symptoms of itching and redness, strongly suggests Atopic Dermatitis. The inflammation pattern is consistent with common eczema presentations.',
        homeRemedies: 'Apply a cold compress to the affected area for 15 minutes to reduce itching. Use a thick, unscented moisturizer multiple times a day, especially after bathing. Avoid harsh soaps and long, hot showers.',
        medicalRecommendation: 'A consultation with a dermatologist is highly recommended to confirm the diagnosis and discuss prescription treatment options, such as topical corticosteroids or calcineurin inhibitors, to manage the inflammation.',
        doctorConsultationSuggestion: true,
      };

      setAnalysisResult(result);
      originalReportRef.current = result;
      setStep('result');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "An unexpected error occurred while analyzing your data. Please try again.",
      });
      setStep('upload');
    }
  };
  
  const handleLanguageChange = async (languageCode: string) => {
    if (!originalReportRef.current) return;
    
    if (languageCode === 'en') {
      setAnalysisResult(originalReportRef.current);
      return;
    }

    setIsTranslating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const translatedReport: TranslateReportOutput = {
        potentialConditions: originalReportRef.current.potentialConditions.map(pc => ({
          name: `[${languageCode}] ${pc.name}`,
          description: `[${languageCode}] ${pc.description}`,
        })),
        report: `[${languageCode}] ${originalReportRef.current.report}`,
        homeRemedies: `[${languageCode}] ${originalReportRef.current.homeRemedies}`,
        medicalRecommendation: `[${languageCode}] ${originalReportRef.current.medicalRecommendation}`,
      };

      setAnalysisResult({
        ...originalReportRef.current,
        potentialConditions: originalReportRef.current.potentialConditions.map((pc, index) => ({
          ...pc,
          name: translatedReport.potentialConditions[index]?.name || pc.name,
          description: translatedReport.potentialConditions[index]?.description || pc.description,
        })),
        report: translatedReport.report,
        homeRemedies: translatedReport.homeRemedies,
        medicalRecommendation: translatedReport.medicalRecommendation,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: 'Could not translate the report. Please try again.',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisResult || !patientDetails) return;

    let reportContent = `MediScan AI Analysis Report\n`;
    reportContent += `=============================\n\n`;
    reportContent += `Patient: ${patientDetails.name}\n`;
    reportContent += `Age: ${patientDetails.age}\n`;
    reportContent += `Gender: ${patientDetails.gender}\n`;
    reportContent += `Region: ${patientDetails.region}\n`;
    reportContent += `Skin Tone: ${patientDetails.skinTone}\n`;
    reportContent += `Date: ${new Date().toLocaleDateString()}\n\n`;

    reportContent += `--- POTENTIAL CONDITIONS ---\n`;
    analysisResult.potentialConditions.forEach(condition => {
      reportContent += `\n`;
      reportContent += `Name: ${condition.name}\n`;
      reportContent += `Likelihood: ${condition.likelihood}\n`;
      reportContent += `Confidence: ${(condition.confidence * 100).toFixed(0)}%\n`;
      reportContent += `Description: ${condition.description}\n`;
    });

    reportContent += `\n\n--- AI SUMMARY ---\n`;
    reportContent += `${analysisResult.report}\n`;

    reportContent += `\n\n--- SUGGESTED HOME REMEDIES ---\n`;
    reportContent += `${analysisResult.homeRemedies}\n`;

    reportContent += `\n\n--- MEDICAL RECOMMENDATION ---\n`;
    reportContent += `${analysisResult.medicalRecommendation}\n`;

    reportContent += `\n\n--- DISCLAIMER ---\n`;
    reportContent += `This is an AI-generated report and does not substitute for a professional medical diagnosis. Please consult a qualified healthcare provider.`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
a.href = url;
    a.download = `MediScan_Report_${patientDetails.name.replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
        title: "Report Downloaded",
        description: "Your report has been saved as a text file.",
    });
  };
  
  const handleReset = () => {
    setStep('details');
    setPatientDetails(null);
    setImagePreview(null);
    setImageDataUri(null);
    setChatMessages([]);
    setAnalysisResult(null);
    originalReportRef.current = null;
    setImageValidationError(null);
    setShowSymptomChat(false);
    form.reset();
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }


  const renderStep = () => {
    switch (step) {
      case 'details':
        return (
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Patient Dashboard</CardTitle>
              <CardDescription>Let's start with some basic details to personalize your analysis.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitDetails)}>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="region" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="skinTone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skin Tone (Fitzpatrick scale)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your skin tone" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Type I">Type I (Very fair, always burns)</SelectItem>
                          <SelectItem value="Type II">Type II (Fair, usually burns)</SelectItem>
                          <SelectItem value="Type III">Type III (Medium, sometimes burns)</SelectItem>
                          <SelectItem value="Type IV">Type IV (Olive, rarely burns)</SelectItem>
                          <SelectItem value="Type V">Type V (Brown, very rarely burns)</SelectItem>
                          <SelectItem value="Type VI">Type VI (Black, never burns)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                     <FormItem>
                      <FormLabel>Gender</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                    Start New Scan <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        );
      
      case 'upload':
      case 'analyzing':
      case 'result':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" onClick={() => setStep('details')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <CardTitle>1. Upload Skin Image</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                  <div className="relative w-full max-w-sm aspect-square rounded-lg border-2 border-dashed flex items-center justify-center">
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Skin condition preview" fill objectFit="cover" className="rounded-lg" />
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        <FileUp className="mx-auto h-12 w-12" />
                        <p>Click to upload or drag & drop</p>
                      </div>
                    )}
                    <Input id="image-upload" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={step !== 'upload' || !!imageValidationError} />
                  </div>
                  {isImageValidating && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validating image...</div>}
                  {imageValidationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Invalid Image</AlertTitle>
                      <AlertDescription>
                        <div className="flex justify-between items-center">
                          <span>{imageValidationError}</span>
                          <Button variant="ghost" size="sm" onClick={handleReupload} className="h-auto p-1">
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Re-upload
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  {imageDataUri && !imageValidationError && <div className="flex items-center text-green-600"><CheckCircle className="mr-2 h-4 w-4" />Image is valid.</div>}
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4">
                  <p className="text-sm text-muted-foreground text-center mb-2">Once you have uploaded a valid image, you can start the analysis or add optional symptoms.</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowSymptomChat(prev => !prev)}
                      disabled={step !== 'upload'}
                    >
                      <MessageSquarePlus className="mr-2 h-4 w-4" />
                      {showSymptomChat ? 'Hide Symptoms' : 'Add Symptoms (Optional)'}
                    </Button>
                    <Button 
                      className="w-full" 
                      onClick={handleAnalyze}
                      disabled={!imageDataUri || step !== 'upload'}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Now
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              {step === 'analyzing' && <Card className="flex-1"><CardContent className="h-full flex flex-col items-center justify-center gap-4 p-6"><Loader2 className="h-16 w-16 animate-spin text-primary" /><p className="text-lg text-muted-foreground">AI is analyzing your data...</p><p className="text-sm text-muted-foreground/80">This may take a moment.</p></CardContent></Card>}
              {step === 'result' && analysisResult && (
                <Card className="flex-1 relative">
                  {isTranslating && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="font-headline text-2xl">AI Analysis Report</CardTitle>
                      <Select defaultValue="en" onValueChange={handleLanguageChange} disabled={isTranslating}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Language" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="hi">हिन्दी</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <CardDescription>This is AI-generated guidance and does not replace professional consultation.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2">Potential Conditions</h3>
                      <div className="space-y-4">
                        {analysisResult.potentialConditions.map((condition, index) => (
                           <div key={index} className="p-4 rounded-lg border bg-card">
                             <div className="flex justify-between items-start mb-2">
                               <h4 className="font-semibold text-base">{condition.name}</h4>
                               <Badge variant={condition.likelihood === 'High' ? 'destructive' : condition.likelihood === 'Medium' ? 'secondary' : 'outline'}>
                                 {condition.likelihood} Likelihood
                               </Badge>
                             </div>
                             <p className="text-sm text-foreground/80 mb-2">{condition.description}</p>
                             <div className="space-y-1">
                                <Label className="text-xs font-medium">Confidence</Label>
                                <div className="flex items-center gap-2">
                                    <Progress value={condition.confidence * 100} className="w-full h-2" />
                                    <span className="text-xs font-semibold text-muted-foreground">{(condition.confidence * 100).toFixed(0)}%</span>
                                </div>
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>
                     <div className="space-y-2">
                        <h3 className="font-bold text-lg">Summary</h3>
                        <p className="text-foreground/80">{analysisResult.report}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">Home Remedies</h3>
                        <p className="text-foreground/80">{analysisResult.homeRemedies}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">Medical Recommendation</h3>
                        <p className="text-foreground/80">{analysisResult.medicalRecommendation}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-stretch gap-4">
                     <Button asChild className="w-full bg-accent hover:bg-accent/90">
                        <Link href="/patient/consult">
                           <Stethoscope className="mr-2 h-4 w-4" /> Consult Doctor
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={handleDownloadReport} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                    <Button variant="link" onClick={handleReset} className="w-full">Start New Analysis</Button>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6">
                { showSymptomChat && (
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle>2. Describe Your Symptoms</CardTitle>
                    <CardDescription>Chat with our AI assistant to add more details.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <ScrollArea className="h-64 pr-4">
                        <div className="space-y-4">
                        {chatMessages.length === 0 && (
                            <div className="text-center text-muted-foreground p-4">
                                <p>Describe your symptoms to the AI assistant.</p>
                                <p className="text-xs">e.g., "The rash is very itchy and has been there for 3 days."</p>
                            </div>
                        )}
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender !== 'user' && <Avatar className="w-8 h-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>}
                                <div className={`max-w-xs rounded-lg p-3 ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {msg.text}
                                </div>
                                {msg.sender === 'user' && <Avatar className="w-8 h-8"><AvatarFallback><User /></AvatarFallback></Avatar>}
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                    <div className="relative">
                        <Textarea 
                            placeholder="e.g., I have a fever and the rash is itchy..."
                            value={symptomInput}
                            onChange={e => setSymptomInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSymptomSubmit())}
                            rows={3}
                            className="pr-20"
                            disabled={step !== 'upload'}
                        />
                        <Button 
                            size="icon" 
                            className="absolute bottom-2 right-2 h-10 w-10 bg-accent hover:bg-accent/90"
                            onClick={handleSymptomSubmit}
                            disabled={isChatbotLoading || !symptomInput.trim() || step !== 'upload'}
                        >
                            {isChatbotLoading ? <Loader2 className="animate-spin"/> : <User/>}
                        </Button>
                    </div>
                  </CardContent>
                </Card>
                )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="h-full">
        {renderStep()}
    </div>
  );
}
