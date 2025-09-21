
'use client';

import { Shield, Lock, Zap, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

const Hero = () => {
    const router = useRouter();
  return (
    <section className="hero pt-32 pb-20 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="hero-content container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow animate-fade-in-up">
            AI-Powered Skin Health for Everyone
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90 animate-fade-in-up animation-delay-200">
            Get instant skin condition analysis, personalized treatment recommendations, and connect
            with verified dermatologists - all powered by advanced artificial intelligence.
          </p>
          <div className="flex justify-center gap-4 mb-12 flex-wrap animate-fade-in-up animation-delay-400">
            <div className="trust-badge bg-white/10 backdrop-blur-md py-3 px-6 rounded-full flex items-center gap-2 border border-white/20 text-sm">
              <Shield className="w-5 h-5" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="trust-badge bg-white/10 backdrop-blur-md py-3 px-6 rounded-full flex items-center gap-2 border border-white/20 text-sm">
              <Lock className="w-5 h-5" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="trust-badge bg-white/10 backdrop-blur-md py-3 px-6 rounded-full flex items-center gap-2 border border-white/20 text-sm">
              <Zap className="w-5 h-5" />
              <span>Instant Analysis</span>
            </div>
            <div className="trust-badge bg-white/10 backdrop-blur-md py-3 px-6 rounded-full flex items-center gap-2 border border-white/20 text-sm">
              <Globe className="w-5 h-5" />
              <span>Multi-Language</span>
            </div>
          </div>
           <div className="animate-fade-in-up animation-delay-600">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={() => router.push('/login?role=patient')}>
                    Get Your Free Analysis
                </Button>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
