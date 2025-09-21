'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { User, Stethoscope, Check } from 'lucide-react';

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
        <h2 className="section-title">Choose Your Login</h2>
        <p className="section-subtitle">Select how you'd like to access the MEDISKIN platform</p>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mt-12">
          {/* Patient Card */}
          <div className="login-card">
            <div className="card-icon patient-icon">
              <User className="w-10 h-10" />
            </div>
            <h3 className="card-title">Patient Login</h3>
            <p className="card-description">
              Upload your skin condition images and get AI-powered analysis with personalized
              recommendations.
            </p>
            <ul className="card-features">
              {patientFeatures.map((feature) => (
                <li key={feature}>
                  <div className="feature-bullet patient-bullet">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="w-full login-btn patient-login"
              onClick={() => router.push('/login?role=patient')}
            >
              Login as Patient
            </Button>
          </div>

          {/* Doctor Card */}
          <div className="login-card">
            <div className="card-icon doctor-icon">
              <Stethoscope className="w-10 h-10" />
            </div>
            <h3 className="card-title">Doctor Login</h3>
            <p className="card-description">
              Verify AI-generated reports, provide professional consultation, and manage patient
              communications.
            </p>
            <ul className="card-features">
              {doctorFeatures.map((feature) => (
                <li key={feature}>
                  <div className="feature-bullet doctor-bullet">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="w-full login-btn doctor-login"
              onClick={() => router.push('/login?role=doctor')}
            >
              Login as Doctor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginOptions;
