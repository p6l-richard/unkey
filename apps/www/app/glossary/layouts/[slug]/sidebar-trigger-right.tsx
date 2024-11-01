"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

export function SidebarTriggerRight(props: React.ComponentProps<typeof SidebarTrigger>) {
  const { open } = useSidebar();
  return <SidebarTrigger {...props} icon={open ? <PanelRightClose /> : <PanelRightOpen />} className={cn("absolute right-full text-sidebar-border hover:text-black hover:bg-sidebar-border/50", open && "right-[calc(100%+1rem)]", props.className)} />;
}
