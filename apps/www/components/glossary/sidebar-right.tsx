import type * as React from "react";
import { Plus } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarRight({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className={cn("lg:flex pl-4 group-data-[side=right]:border-l-0", 
        // these custom styles ensure that we don't destroy the collapsible effect of the sidebarrail with the sticky position -- we apply it only when expanded
        // at the same time, we have to apply top-36 whenever the state is collapsed so that it doesn't span to the whole page height
        "group-data-[state=collapsed]:lg:top-36 group-data-[state=expanded]:sticky group-data-[state=expanded]:top-0 group-data-[state=expanded]:h-svh")  }
      side="right"
      // variant="inset"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        {/* <NavUser user={data.user} /> */}
        Sidebar Header
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Table of Contents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                {
                  title: "Item 1",
                  url: "#",
                  items: [{ title: "Item 1.1", url: "#", isActive: false }],
                },
              ].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="font-medium">
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={item.isActive}>
                            <a href={item.url}>{item.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>A button</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className="after:bg-sidebar-border hover:after:bg-black"/>
    </Sidebar>
  );
}
