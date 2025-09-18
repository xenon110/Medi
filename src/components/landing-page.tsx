
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, Stethoscope, ArrowRight, Hand, Bug, Syringe, CircleDot, Dna, ShieldAlert, Layers, UserCheck, Microscope, Bone, CircleSlash, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';


export function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'landing-hero');
  const resourceCenterImage = PlaceHolderImages.find(img => img.id === 'resource-center-banner');
  const legUlcerImage = PlaceHolderImages.find(img => img.id === 'dermatology-leg-ulcer');
  const molluscumImage = PlaceHolderImages.find(img => img.id === 'dermatology-molluscum');
  const keratosisImage = PlaceHolderImages.find(img => img.id === 'dermatology-keratosis');

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePatientClick = () => {
    if (user && userRole === 'patient') {
      router.push('/patient/dashboard');
    } else {
      router.push('/login?role=patient');
    }
  };

  const handleDoctorClick = () => {
    if (user && userRole === 'doctor') {
      router.push('/doctor/dashboard');
    } else {
      router.push('/login?role=doctor');
    }
  };
  
    const conditionCategories = [
    { name: 'Reactions', icon: Hand },
    { name: 'Infections', icon: Bug },
    { name: 'Treatments', icon: Syringe },
    { name: 'Lesions (cancerous)', icon: CircleDot },
    { name: 'Lesions (benign)', icon: CircleSlash },
    { name: 'Genetic', icon: Dna },
    { name: 'Systemic diseases', icon: UserCheck },
    { name: 'Autoimmune', icon: ShieldAlert },
    { name: 'Rashes', icon: Layers },
    { name: 'Follicular disorder', icon: Microscope },
    { name: 'Infestations', icon: Bone },
    { name: 'Eczemas', icon: Hand },
    { name: 'Blood vessel problems', icon: Dna },
    { name: 'Pigmentary disorders', icon: Layers },
  ];

  const commonConditions = [
    'Acne', 'Athlete\'s foot', 'Cellulitis', 'Cold sores',
    'Dermatitis/Eczema', 'Heat rash', 'Hives', 'Impetigo',
    'Psoriasis', 'Ringworm', 'Rosacea', 'Seborrhoeic dermatitis',
    'Shingles', 'Vitiligo'
  ];

  return (
    <>
      <section className="relative w-full h-96 text-white -mt-8">
        {heroImage && (
           <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            width={2070}
            height={1380}
            className="object-cover w-full h-full"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight">MediScan AI</h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl">
            Your personal AI-powered skin health assistant. Upload an image, get insights, and connect with doctors securely.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl font-semibold">Choose Your Path</h2>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Whether you're seeking answers about a skin condition or a medical professional ready to help, we have a path for you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="flex flex-col text-center hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <div className="mx-auto bg-primary/10 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardTitle className="font-headline text-2xl">For Patients</CardTitle>
              <CardDescription className="mt-2">
                Get instant, AI-driven analysis of your skin condition. Receive preliminary reports and connect with verified doctors, all from the comfort of your home.
              </CardDescription>
            </CardContent>
            <CardFooter className="justify-center">
              <Button size="lg" className="w-full md:w-auto" onClick={handlePatientClick}>
                 Go to Patient Dashboard <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col text-center hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <div className="mx-auto bg-accent/10 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                  <Stethoscope className="w-10 h-10 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardTitle className="font-headline text-2xl">For Doctors</CardTitle>
              <CardDescription className="mt-2">
                Join our network of professionals. Review AI-generated reports, provide your expert opinion, and consult with patients through a secure, modern platform.
              </CardDescription>
            </CardContent>
            <CardFooter className="justify-center">
              <Button size="lg" variant="secondary" className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleDoctorClick}>
                Go to Doctor Dashboard <ArrowRight className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-24">
        <div className="container mx-auto">
          <div className="flex justify-between items-center border-b pb-4 mb-8">
            <h2 className="font-headline text-4xl font-semibold">Skin Conditions</h2>
            <Button variant="link" className="text-lg">Topics A-Z <ArrowRight className="ml-2" /></Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-xl mb-4">Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {conditionCategories.map((category) => (
                  <div key={category.name} className="flex flex-col items-center text-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center bg-primary/10 text-primary">
                      <category.icon className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center text-center gap-2 p-3 rounded-lg border-2 border-dashed hover:bg-muted transition-colors cursor-pointer justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center text-muted-foreground">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-medium">Show more categories</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-4">Common skin conditions</h3>
              <div className="flex flex-wrap gap-2">
                {commonConditions.map((condition) => (
                  <Button key={condition} variant="outline" className="rounded-full">
                    {condition}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {resourceCenterImage && (
        <section className="container mx-auto py-16 sm:py-24">
            <div className="relative rounded-lg overflow-hidden text-white h-80">
                <Image
                    src={resourceCenterImage.imageUrl}
                    alt={resourceCenterImage.description}
                    width={1200}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint={resourceCenterImage.imageHint}
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-center p-8 md:p-12">
                    <span className="text-sm font-bold tracking-widest uppercase text-accent">PRO</span>
                    <h2 className="font-headline text-4xl md:text-5xl font-bold mt-2">Student resource center</h2>
                    <p className="mt-2 max-w-lg">Dermatology resources for medical students</p>
                    <Button size="lg" className="mt-6 w-fit bg-accent text-accent-foreground hover:bg-accent/90">
                        Visit now <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </div>
        </section>
      )}

    <section className="container mx-auto pb-16 sm:pb-24">
        <div className="flex justify-between items-center border-b pb-4 mb-8">
            <h2 className="font-headline text-4xl font-semibold">Dermatology images</h2>
            <Button variant="link" className="text-lg">Images <ArrowRight className="ml-2" /></Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[legUlcerImage, molluscumImage, keratosisImage].map((image) => (
                image && (
                    <Card key={image.id} className="relative group overflow-hidden rounded-lg">
                        <Image
                            src={image.imageUrl}
                            alt={image.description}
                            width={600}
                            height={400}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                            data-ai-hint={image.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <CardHeader className="absolute bottom-0 text-white p-4">
                            <CardTitle className="font-headline text-2xl">{image.description}</CardTitle>
                        </CardHeader>
                    </Card>
                )
            ))}
        </div>
      </section>

    </>
  );
}

    