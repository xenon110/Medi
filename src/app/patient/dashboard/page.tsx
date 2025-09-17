'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { AlertCircle, Bot, CheckCircle, ChevronRight, FileUp, Loader2, Send, Sparkles, User, X } from 'lucide-react';
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
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { validateImageUpload, ValidateImageUploadOutput } from '@/ai/flows/validate-image-upload';
import { assistWithSymptomInputs, AssistWithSymptomInputsOutput } from '@/ai/flows/assist-with-symptom-inputs';
import { generateInitialReport, GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';
import { Badge } from '@/components/ui/badge';

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

export default function PatientDashboard() {
  const { toast } = useToast();
  const [step, setStep] = useState<'details' | 'upload' | 'analyzing' | 'result'>('details');
  
  // State for the entire flow
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);
  const [isImageValidating, setIsImageValidating] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<GenerateInitialReportOutput | null>(null);
  const [isSendingToDoctor, setIsSendingToDoctor] = useState(false);

  const form = useForm<PatientDetails>({
    resolver: zodResolver(patientDetailsSchema),
    defaultValues: { name: '', region: 'India', gender: 'male', skinTone: 'Type IV' },
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
        const validation: ValidateImageUploadOutput = await validateImageUpload({ photoDataUri: base64data });
        if (!validation.isValid) {
          setImageValidationError(validation.reason || "I can't help with this photo.");
          setImageDataUri(null); // Invalidate image data
        }
      } catch (error) {
        setImageValidationError('An error occurred during image validation.');
        console.error(error);
      } finally {
        setIsImageValidating(false);
      }
    };
  };

  const handleSymptomSubmit = async () => {
    if (!symptomInput.trim() || isChatbotLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: symptomInput };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatbotLoading(true);
    setSymptomInput('');
    
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
      setIsChatbotLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUri || !patientDetails) return;
    setStep('analyzing');
    const allSymptoms = chatMessages.filter(m => m.sender === 'user').map(m => m.text).join(', ');

    try {
      const result = await generateInitialReport({
        photoDataUri: imageDataUri,
        symptomInputs: allSymptoms,
        ...patientDetails,
      });
      setAnalysisResult(result);
      setStep('result');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "An unexpected error occurred while analyzing your data. Please try again.",
      });
      setStep('upload'); // Go back to upload step on failure
    }
  };

  const handleSendToDoctor = async () => {
    if (!patientDetails || !analysisResult || !imageDataUri) return;
    setIsSendingToDoctor(true);
    try {
      await addDoc(collection(db, 'patients'), {
        ...patientDetails,
        report: analysisResult,
        image: imageDataUri, // For simplicity, storing as data URI. In production, use Firebase Storage.
        createdAt: serverTimestamp(),
        status: 'pending',
      });
      toast({
        title: "Report Sent",
        description: "Your report has been successfully sent to the doctor's dashboard.",
      });
      // Reset for new analysis
      setStep('details');
      setPatientDetails(null);
      setImagePreview(null);
      setImageDataUri(null);
      setChatMessages([]);
      setAnalysisResult(null);
      form.reset();
    } catch (error) {
      console.error("Error sending to doctor:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not send your report to the doctor. Please try again.",
      });
    } finally {
      setIsSendingToDoctor(false);
    }
  };


  const renderStep = () => {
    switch (step) {
      case 'details':
        return (
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Welcome to MediScan AI</CardTitle>
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
                    Continue <ChevronRight className="ml-2" />
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
            {/* Center Panel: Upload & Result */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Upload Skin Image</CardTitle>
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
                    <Input id="image-upload" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} />
                  </div>
                   {isImageValidating && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validating image...</div>}
                   {imageValidationError && <Alert variant="destructive" className="animate-blink"><AlertCircle className="h-4 w-4" /><AlertTitle>Invalid Image</AlertTitle><AlertDescription>{imageValidationError}</AlertDescription></Alert>}
                   {imageDataUri && !imageValidationError && <div className="flex items-center text-green-600"><CheckCircle className="mr-2 h-4 w-4" />Image is valid.</div>}
                </CardContent>
              </Card>
              
              {/* Analysis Result */}
              {step === 'analyzing' && <Card className="flex-1"><CardContent className="h-full flex flex-col items-center justify-center gap-4 p-6"><Loader2 className="h-16 w-16 animate-spin text-primary" /><p className="text-lg text-muted-foreground">AI is analyzing your data...</p><p className="text-sm text-muted-foreground/80">This may take a moment.</p></CardContent></Card>}
              {step === 'result' && analysisResult && (
                <Card className="flex-1">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="font-headline text-2xl">AI Analysis Report</CardTitle>
                      <Select defaultValue="en">
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
                             <div className="flex justify-between items-center mb-2">
                               <h4 className="font-semibold text-base">{condition.name}</h4>
                               <Badge variant={condition.likelihood === 'High' ? 'destructive' : condition.likelihood === 'Medium' ? 'secondary' : 'outline'}>
                                 {condition.likelihood} Likelihood
                               </Badge>
                             </div>
                             <p className="text-sm text-foreground/80">{condition.description}</p>
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
                    {analysisResult.doctorConsultationSuggestion && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Consultation Recommended</AlertTitle>
                            <AlertDescription>
                            Our AI suggests consulting a doctor for a more accurate diagnosis and treatment plan.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep('upload')} className="w-full">Start New Analysis</Button>
                      <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleSendToDoctor} disabled={isSendingToDoctor}>
                        {isSendingToDoctor ? <Loader2 className="animate-spin" /> : 'Send to Doctor'}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}

            </div>
            
            {/* Right Panel: Chat & Action */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle>2. Describe Your Symptoms</CardTitle>
                    <CardDescription>Chat with our AI assistant to add more details.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <ScrollArea className="h-64 pr-4">
                        <div className="space-y-4">
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
                        />
                        <Button 
                            size="icon" 
                            className="absolute bottom-2 right-2 h-10 w-10 bg-accent hover:bg-accent/90"
                            onClick={handleSymptomSubmit}
                            disabled={isChatbotLoading || !symptomInput.trim()}
                        >
                            {isChatbotLoading ? <Loader2 className="animate-spin"/> : <Send/>}
                        </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>3. Get Your Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Once you have uploaded a valid image and described your symptoms, you can start the analysis.</p>
                        <Button 
                            className="w-full" 
                            size="lg"
                            onClick={handleAnalyze}
                            disabled={!imageDataUri || step === 'analyzing' || step === 'result'}
                        >
                            <Sparkles className="mr-2" />
                            Analyze Now
                        </Button>
                    </CardContent>
                </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8 h-[calc(100vh-80px)]">
        {renderStep()}
    </div>
  );
}
