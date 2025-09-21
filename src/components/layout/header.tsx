
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
    <header className="header">
        <div className="logo-section">
            <div className="logo"><Stethoscope className="w-5 h-5"/></div>
            <div>
                <div className="brand-text">MEDISKIN</div>
                <div className="tagline">AI Dermatology</div>
            </div>
        </div>
        <nav className="nav-links">
            <a href="/#features">Features</a>
            <a href="/#how-it-works">How It Works</a>
            <a href="/#security">Security</a>
            <a href="/help">Help</a>
            <ThemeToggle />
        </nav>
        <Button className="login-btn" onClick={() => router.push('/login?role=patient')}>Login as Patient</Button>
    </header>
  );
};

export default Header;

    