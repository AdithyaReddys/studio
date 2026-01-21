import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import SidebarNav from '@/components/sidebar-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        side="left"
        variant="sidebar"
        className="w-64"
      >
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="bg-background min-h-screen">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
