import Link from 'next/link';
import Image from 'next/image';
import { User, Stethoscope, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from './layout/header';

export function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'landing-hero');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full h-96 text-white">
          {heroImage && (
             <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
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
                <Button asChild size="lg" className="w-full md:w-auto">
                  <Link href="/patient/dashboard">
                    Patient Login <ArrowRight className="ml-2" />
                  </Link>
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
                <Button asChild size="lg" variant="secondary" className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/doctor/dashboard">
                    Doctor Login <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
