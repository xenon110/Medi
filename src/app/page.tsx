import Features from '@/components/landing/features';
import Footer from '@/components/landing/footer';
import Hero from '@/components/landing/hero';
import LoginOptions from '@/components/landing/login-options';

export default function Home() {
  return (
    <div className="bg-background -mt-16">
      <Hero />
      <LoginOptions />
      <Features />
      <Footer />
    </div>
  );
}
