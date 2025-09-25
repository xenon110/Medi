
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { FileUp, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/lib/firebase-services';
import { indianStates } from '@/lib/indian-states';


const patientSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  age: z.coerce.number().min(1, 'Age is required.').max(120),
  gender: z.string().min(1, 'Gender is required.'),
  skinTone: z.string().min(1, 'Skin tone is required.'),
  region: z.string().min(1, 'Region is required.'),
});

const doctorSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  age: z.coerce.number().min(18, 'You must be at least 18.').max(100),
  gender: z.string().min(1, 'Gender is required.'),
  experience: z.coerce.number().min(0, 'Experience cannot be negative.'),
  degree: z.any().refine(file => file?.length == 1, 'Degree certificate is required.'),
  additionalFile: z.any().optional(),
});

type PatientSignupForm = z.infer<typeof patientSignupSchema>;
type DoctorSignupForm = z.infer<typeof doctorSignupSchema>;


export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const role = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';

  const form = useForm<PatientSignupForm | DoctorSignupForm>({
    resolver: zodResolver(role === 'doctor' ? doctorSignupSchema : patientSignupSchema),
    defaultValues: role === 'doctor' 
      ? { name: '', email: '', password: '', age: 30, gender: 'Other', experience: 5 }
      : { name: '', email: '', password: '', age: 30, gender: '', skinTone: '', region: '' },
  });

  const onSubmit = async (data: PatientSignupForm | DoctorSignupForm) => {
    setIsLoading(true);
     if (!auth) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Firebase is not configured. Please check your setup.',
        });
        setIsLoading(false);
        return;
    }

    try {
        // Check if email already exists
        const signInMethods = await fetchSignInMethodsForEmail(auth, data.email);
        if (signInMethods.length > 0) {
            toast({
                title: 'Account Exists',
                description: 'This email is already registered. Redirecting to payment page.',
            });
            if (role === 'doctor') {
                router.push('/doctor/payment');
            } else {
                router.push('/payment');
            }
            setIsLoading(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        const profileData = {
          email: user.email!,
          role: role,
          name: data.name,
          age: data.age,
          gender: data.gender,
          ...(role === 'patient' && { skinTone: (data as PatientSignupForm).skinTone, region: (data as PatientSignupForm).region }),
          ...(role === 'doctor' && { experience: (data as DoctorSignupForm).experience }),
        };

        // TODO: Add file upload logic here for doctor's degree and additional files.
        
        await createUserProfile(user.uid, profileData);

        toast({ title: 'Account Created', description: 'You have been successfully signed up!' });

        if (role === 'doctor') {
            router.push('/doctor/dashboard');
        } else {
            router.push('/patient/dashboard');
        }
    } catch (error: any) {
        console.error('Signup error:', error);
        let description = 'An unexpected error occurred. Please try again.';
        // This specific error might not be needed anymore due to the check above, but it's good for fallback.
        if (error.code === 'auth/email-already-in-use') {
          description = 'This email address is already in use. Please log in or use a different email.';
        }
        toast({
            variant: 'destructive',
            title: 'Signup Failed',
            description: description,
        });
    } finally {
        setIsLoading(false);
    }
  };

  const renderPatientForm = () => (
    <>
      <FormField control={form.control} name="name" render={({ field }) => (
        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="email" render={({ field }) => (
        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="password" render={({ field }) => (
        <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="age" render={({ field }) => (
          <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="gender" render={({ field }) => (
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <FormField control={form.control} name="skinTone" render={({ field }) => (
        <FormItem>
          <FormLabel>Skin Tone (Fitzpatrick scale)</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="Select your skin tone" /></SelectTrigger></FormControl>
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
      <FormField control={form.control} name="region" render={({ field }) => (
        <FormItem>
          <FormLabel>Region</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl>
            <SelectContent>
              {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
    </>
  );

  const renderDoctorForm = () => {
      const degreeRef = form.register("degree");
      const additionalFileRef = form.register("additionalFile");

      return (
        <>
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Dr. Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@hospital.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="experience" render={({ field }) => (
                    <FormItem><FormLabel>Experience (years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="degree" render={({ field }) => (
                <FormItem>
                    <FormLabel>Degree Certificate</FormLabel>
                    <FormControl>
                        <div className="relative flex items-center justify-center w-full">
                            <label htmlFor="degree-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> your degree</p>
                                </div>
                                <Input id="degree-upload" type="file" className="hidden" {...degreeRef} />
                            </label>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="additionalFile" render={({ field }) => (
                <FormItem>
                    <FormLabel>Additional Verification (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative flex items-center justify-center w-full">
                            <label htmlFor="additional-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> e.g. license, etc.</p>
                                </div>
                                <Input id="additional-upload" type="file" className="hidden" {...additionalFileRef} />
                            </label>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-subtle">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Create a {role === 'doctor' ? 'Doctor' : 'Patient'} Account</CardTitle>
          <CardDescription>Join MEDISKIN to get started on your health journey.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
                {role === 'doctor' ? renderDoctorForm() : renderPatientForm()}
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href={`/login?role=${role}`}>Login</Link>
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
