import { LandingPage } from '@/components/landing-page';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <LandingPage />
    </SidebarProvider>
  );
}
