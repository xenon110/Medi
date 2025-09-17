import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-semibold tracking-wide">
            MediScan AI
          </span>
        </Link>
      </div>
    </header>
  );
}
