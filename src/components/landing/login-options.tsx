
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { User, Stethoscope, Check } from 'lucide-react';
import Link from 'next/link';

const LoginOptions = () => {
  const router = useRouter();

  const patientFeatures = [
    'Upload & analyze skin images',
    'AI-powered symptom assessment',
    'Personalized home remedies',
    'Connect with dermatologists',
    'Multi-language support',
    'Secure medical records',
  ];

  const doctorFeatures = [
    'Review AI-generated reports',
    'Professional verification system',
    'Secure patient communication',
    'Customize prescriptions',
    'Medical document management',
    'WhatsApp-style interface',
  ];

  return (
    <section className="login-section py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 text-gradient">Choose Your Login</h2>
        <p className="section-subtitle text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">Select how you'd like to access the MEDISKIN platform</p>
        <div className="login-options grid md:grid-cols-2 gap-8 lg:gap-12 mt-12">
          {/* Patient Card */}
          <div className="login-card bg-card rounded-3xl p-8 lg:p-12 shadow-2xl shadow-primary/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/10 text-center relative overflow-hidden border">
            <div className="card-icon w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center text-white text-4xl bg-gradient-secondary">
              <User className="w-10 h-10" />
            </div>
            <h3 className="card-title text-3xl font-bold mb-4 text-foreground">Patient Login</h3>
            <p className="card-description text-muted-foreground mb-8">
              Upload your skin condition images and get AI-powered analysis with personalized
              recommendations.
            </p>
            <ul className="card-features text-left mb-8 space-y-3">
              {patientFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="feature-bullet w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-gradient-secondary">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
             <Button size="lg" className="w-full text-lg font-semibold rounded-full transition-all duration-300 hover:-translate-y-1 py-4 bg-gradient-secondary text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30" asChild>
                <Link href="/login?role=patient">Login as Patient</Link>
            </Button>
          </div>

          {/* Doctor Card */}
          <div className="login-card bg-card rounded-3xl p-8 lg:p-12 shadow-2xl shadow-primary/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/10 text-center relative overflow-hidden border">
            <div className="card-icon w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center text-white text-4xl bg-gradient-primary">
              <Stethoscope className="w-10 h-10" />
            </div>
            <h3 className="card-title text-3xl font-bold mb-4 text-foreground">Doctor Login</h3>
            <p className="card-description text-muted-foreground mb-8">
              Verify AI-generated reports, provide professional consultation, and manage patient
              communications.
            </p>
            <ul className="card-features text-left mb-8 space-y-3">
              {doctorFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="feature-bullet w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-gradient-primary">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="w-full text-lg font-semibold rounded-full transition-all duration-300 hover:-translate-y-1 py-4 bg-gradient-primary text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30" asChild>
               <Link href="/login?role=doctor">Login as Doctor</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginOptions;
