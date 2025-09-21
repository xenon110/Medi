
'use client';

import { Button } from '@/components/ui/button';
import { Stethoscope, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../theme-toggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MEDISKIN</h1>
              <p className="text-xs text-muted-foreground leading-none">AI Dermatology</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/#features" className="text-foreground hover:text-primary transition-all">
              Features
            </a>
            <a href="/#how-it-works" className="text-foreground hover:text-primary transition-all">
              How It Works
            </a>
            <a href="/#security" className="text-foreground hover:text-primary transition-all">
              Security
            </a>
             <a href="/help" className="text-foreground hover:text-primary transition-all">
              Help
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Button 
              variant="outline-medical" 
              size="sm"
              onClick={() => router.push('/login?role=doctor')}
            >
              Login as Doctor
            </Button>
            <Button 
              variant="patient" 
              size="sm"
              onClick={() => router.push('/login?role=patient')}
            >
              Login as Patient
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border mt-2">
            <nav className="flex flex-col space-y-4">
              <a
                href="/#features"
                className="text-foreground hover:text-primary transition-all px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="text-foreground hover:text-primary transition-all px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="/#security"
                className="text-foreground hover:text-primary transition-all px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Security
              </a>
               <a
                href="/help"
                className="text-foreground hover:text-primary transition-all px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Help
              </a>
              <div className="flex justify-center py-2">
                <ThemeToggle />
              </div>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="outline-medical" size="sm" onClick={() => { router.push('/login?role=doctor'); setIsMenuOpen(false); }}>
                  Doctor Login
                </Button>
                <Button variant="patient" size="sm" onClick={() => { router.push('/login?role=patient'); setIsMenuOpen(false); }}>
                  Patient Login
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
