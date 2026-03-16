import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import SidebarNav from '@/components/sidebar-nav';
import { FirebaseClientProvider } from '@/firebase';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
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
    </FirebaseClientProvider>
  );
}
