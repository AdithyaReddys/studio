'use client';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  LayoutDashboard,
  FileScan,
  Bot,
  BarChart,
} from 'lucide-react';

const links = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/media-validation',
    label: 'Media Validation',
    icon: FileScan,
  },
  {
    href: '/adversarial-detection',
    label: 'Adversarial Detection',
    icon: Bot,
  },
  {
    href: '/threat-analysis',
    label: 'Threat Analysis',
    icon: BarChart,
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-semibold text-sidebar-foreground">
            AICrimeShield
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={{
                    children: link.label,
                    className: 'bg-sidebar text-sidebar-foreground',
                  }}
                  className="justify-start"
                >
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
