
import Header from '@/components/layout/header';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent } from '@/components/ui/sidebar';
import Link from 'next/link';
import { LayoutDashboard, Users, User, Settings, LifeBuoy, GraduationCap } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/doctor/dashboard">
                    <SidebarMenuButton>
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/doctor/dashboard">
                    <SidebarMenuButton>
                      <Users />
                      <span>Patient Cases</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/doctor/profile">
                    <SidebarMenuButton>
                      <User />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="#">
                    <SidebarMenuButton>
                      <GraduationCap />
                      <span>Medical Resources</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/doctor/settings">
                    <SidebarMenuButton>
                      <Settings />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/help">
                    <SidebarMenuButton>
                      <LifeBuoy />
                      <span>Help</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
