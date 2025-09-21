'use client';

import { Shield, Lock, Zap, Globe } from 'lucide-react';

const Hero = () => {
  return (
    <section className="hero relative py-28 text-white text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow">
            AI-Powered Skin Health for Everyone
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Get instant skin condition analysis, personalized treatment recommendations, and connect
            with verified dermatologists - all powered by advanced artificial intelligence.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="trust-badge">
              <Shield className="w-5 h-5" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="trust-badge">
              <Lock className="w-5 h-5" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="trust-badge">
              <Zap className="w-5 h-5" />
              <span>Instant Analysis</span>
            </div>
            <div className="trust-badge">
              <Globe className="w-5 h-5" />
              <span>Multi-Language</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
