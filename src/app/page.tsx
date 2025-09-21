import Features from '@/components/landing/features';
import Footer from '@/components/landing/footer';
import Hero from '@/components/landing/hero';

export default function Home() {
  return (
    <div className="-mt-8">
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
