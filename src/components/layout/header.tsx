'use client';

import { Button } from '@/components/ui/button';
import { Stethoscope, Siren } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { toast } = useToast();

  const handleEmergencyClick = () => {
    toast({
      variant: 'destructive',
      title: '🚨 Emergency Protocol',
      description:
        'For immediate medical emergencies, please call your local emergency number or visit the nearest hospital. This platform is for non-emergency consultations.',
    });
  };

  return (
    <header className="header fixed top-0 w-full z-50">
      <nav className="nav max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="logo-section">
          <div className="logo">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="brand-text">MEDISKIN</div>
          </div>
        </Link>
        <div className="nav-links">
          <Link href="/#features">Features</Link>
          <Link href="/#about">About</Link>
          <Link href="/#security">Security</Link>
          <Link href="/help">Contact</Link>
        </div>
        <Button
          variant="destructive"
          className="rounded-full font-semibold"
          onClick={handleEmergencyClick}
        >
          <Siren className="w-4 h-4 mr-2" /> Emergency
        </Button>
      </nav>
    </header>
  );
};

export default Header;
