
'use client';

import { Button } from '@/components/ui/button';
import { Stethoscope, Menu, X, Moon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../theme-toggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm border-b border-black/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-secondary rounded-xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">MEDISKIN</h1>
              <p className="text-xs text-gray-500 leading-none mt-[-2px]">AI Dermatology</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/#features" className="text-gray-600 font-medium hover:text-primary transition-all">
              Features
            </a>
            <a href="/#how-it-works" className="text-gray-600 font-medium hover:text-primary transition-all">
              How It Works
            </a>
            <a href="/#security" className="text-gray-600 font-medium hover:text-primary transition-all">
              Security
            </a>
             <a href="/help" className="text-gray-600 font-medium hover:text-primary transition-all">
              Help
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              className="bg-gradient-primary text-white rounded-full px-6 py-2.5 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              onClick={() => router.push('/login?role=patient')}
            >
              Login as Patient
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/80 mt-2">
            <nav className="flex flex-col space-y-4">
              <a
                href="/#features"
                className="text-gray-700 hover:text-primary transition-all px-2 py-1 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="text-gray-700 hover:text-primary transition-all px-2 py-1 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="/#security"
                className="text-gray-700 hover:text-primary transition-all px-2 py-1 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Security
              </a>
               <a
                href="/help"
                className="text-gray-700 hover:text-primary transition-all px-2 py-1 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Help
              </a>
              <div className="flex justify-center py-2">
                <ThemeToggle />
              </div>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200/80">
                <Button className="bg-gradient-primary text-white rounded-full shadow-md" size="sm" onClick={() => { router.push('/login?role=patient'); setIsMenuOpen(false); }}>
                  Patient Login
                </Button>
                <Button variant="outline" className="rounded-full" size="sm" onClick={() => { router.push('/login?role=doctor'); setIsMenuOpen(false); }}>
                  Doctor Login
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
