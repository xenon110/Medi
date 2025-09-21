
'use client';

import { Button } from '@/components/ui/button';
import { Stethoscope, Siren } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '../theme-toggle';
import { auth } from '@/lib/firebase';
import { logEmergency } from '@/lib/firebase-services';

const Header = () => {
  const { toast } = useToast();

  const handleEmergencyClick = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await logEmergency(user.uid);
        toast({
          variant: 'destructive',
          title: '🚨 Emergency Logged',
          description:
            'Your emergency has been logged. For immediate assistance, please call your local emergency number or visit the nearest hospital.',
          duration: 7000,
        });
      } catch (error) {
        console.error("Failed to log emergency:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not log emergency. Please call for help directly.',
        });
      }
    } else {
       toast({
        variant: 'destructive',
        title: '🚨 Please Log In',
        description:
          'You must be logged in to report an emergency. For immediate medical emergencies, please call your local emergency number.',
        duration: 7000,
      });
    }
  };

  return (
    <header className="header fixed top-0 w-full bg-background/95 backdrop-blur-xl p-4 px-8 z-50 transition-all duration-300 border-b border-border/20">
      <nav className="nav max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="logo-section flex items-center gap-3 cursor-pointer">
          <div className="logo w-11 h-11 bg-gradient-secondary rounded-xl flex items-center justify-center text-white font-bold text-lg">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="brand-text text-2xl font-bold text-gradient">MEDISKIN</div>
          </div>
        </Link>
        <div className="nav-links hidden md:flex gap-8 items-center">
          <Link href="/#features" className="text-muted-foreground font-medium transition-colors duration-300 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full">Features</Link>
          <Link href="/#about" className="text-muted-foreground font-medium transition-colors duration-300 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full">About</Link>
          <Link href="/#security" className="text-muted-foreground font-medium transition-colors duration-300 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full">Security</Link>
          <Link href="/help" className="text-muted-foreground font-medium transition-colors duration-300 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
            variant="destructive"
            className="rounded-full font-semibold bg-red-500/90 hover:bg-red-500"
            onClick={handleEmergencyClick}
            >
            <Siren className="w-4 h-4 mr-2" /> Emergency
            </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
