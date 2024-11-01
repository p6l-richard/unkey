"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function SidebarProviderCustom({ children, className }: { children: React.ReactNode, className?: string }) {
  const isMobile = useIsMobile();
  const defaultClosed = false; // so that the below conditional prop is easier to read
  return <SidebarProvider defaultOpen={isMobile ? defaultClosed : true} className={cn("grid grid-cols-1 lg:flex gap-4", className)}>{children}</SidebarProvider>;
}
