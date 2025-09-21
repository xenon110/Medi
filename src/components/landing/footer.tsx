'use client';
import { Stethoscope, Mail, Phone, Shield, Heart } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";

const Footer = () => {
    const router = useRouter();
  return (
    <footer className="bg-gradient-subtle border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">MEDISKIN</h3>
                <p className="text-xs text-muted-foreground">AI Dermatology Platform</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Empowering better skin health through AI-powered analysis and expert dermatological care.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-success" />
              <span>HIPAA Compliant & Secure</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-muted-foreground hover:text-primary transition-smooth">Features</Link></li>
              <li><Link href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-smooth">How It Works</Link></li>
              <li><Link href="/#security" className="text-muted-foreground hover:text-primary transition-smooth">Security</Link></li>
              <li><Link href="/help" className="text-muted-foreground hover:text-primary transition-smooth">Help</Link></li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">For Professionals</h4>
            <ul className="space-y-2">
              <li><Link href="/login?role=doctor" className="text-muted-foreground hover:text-primary transition-smooth">Join as Doctor</Link></li>
              <li><Link href="/help" className="text-muted-foreground hover:text-primary transition-smooth">Verification Process</Link></li>
              <li><Link href="/kb/treatments" className="text-muted-foreground hover:text-primary transition-smooth">Medical Resources</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">support@mediskin.ai</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="text-sm text-muted-foreground">
                24/7 Medical Support Available
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div id="security" className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 MEDISKIN. All rights reserved. This platform provides AI-powered guidance and does not replace professional medical consultation.
            </div>
            <div className="flex items-center space-x-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                HIPAA Compliance
              </Link>
            </div>
          </div>
          
          {/* Medical Disclaimer */}
          <div className="mt-6 p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground/80">
                <strong className="font-semibold text-warning">Medical Disclaimer:</strong> MEDISKIN provides AI-powered skin analysis for educational and informational purposes only. 
                This service does not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals 
                for proper medical evaluation and treatment of skin conditions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
