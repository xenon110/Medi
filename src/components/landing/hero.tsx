
'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import { placeholderImages } from "@/lib/placeholder-images";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  const heroImage = placeholderImages.find(p => p.id === 'landing-hero');

  return (
    <section className="relative bg-gradient-subtle py-20 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 opacity-5"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-primary-light text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Dermatology Platform</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Skin Health,
                <span className="bg-gradient-primary bg-clip-text text-transparent"> AI-Analyzed</span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Upload skin condition photos and receive instant AI-powered analysis with personalized recommendations. Connect with verified dermatologists for professional consultation.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-success" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-accent" />
                <span>1000+ Verified Doctors</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>95% Accuracy Rate</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group" onClick={() => router.push('/login?role=patient')}>
                Start as Patient
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="doctor" size="xl" onClick={() => router.push('/login?role=doctor')}>
                Join as Doctor
              </Button>
            </div>

            {/* Additional Info */}
            <p className="text-sm text-muted-foreground">
              Free initial analysis • No subscription required • Secure & Private
            </p>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={2070}
                  height={1380}
                  className="w-full h-auto object-cover"
                  data-ai-hint={heroImage.imageHint}
                  priority
                />
              )}
              {/* Overlay Elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Floating Cards */}
              <div className="absolute top-6 left-6 bg-card/80 backdrop-blur rounded-lg p-4 shadow-card max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/20 text-success rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">AI Analysis Complete</p>
                    <p className="text-xs text-muted-foreground">95% match confidence</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6 bg-card/80 backdrop-blur rounded-lg p-4 shadow-card">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Secure & Private</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
