"use client";

import type * as React from "react";

import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { allGlossaries } from "@/.content-collections/generated";
import { FilterableCommand } from "./search";
import TermsRolodexDesktop from "./terms-rolodex-desktop";
import TermsStepperMobile from "./terms-stepper-mobile";

export function SidebarLeft({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="lg:pr-4 border-r-0 w-full lg:w-[--sidebar-width]" side="left" collapsible="none" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        {/* <NavMain items={data.navMain} /> */}
      </SidebarHeader>
      <SidebarContent >
        <p className="w-full lg:my-4 mb-4 font-semibold text-left blog-heading-gradient">Terms</p>
        <div className="lg:gap-2 gap-8 flex flex-col">
          <FilterableCommand
            placeholder="Search for e.g. 'API Security'"
            className="rounded-lg lg:mb-4 border-[.75px] border-white/20"
            terms={allGlossaries}
          />
          <div className="flex-grow">
            <TermsRolodexDesktop
              className="flex-grow hidden lg:block"
              terms={allGlossaries.map((term) => ({ slug: term.slug, title: term.title }))}
            />
            <TermsStepperMobile
              className="flex-grow lg:hidden"
              terms={allGlossaries.map((term) => ({ slug: term.slug, title: term.title }))}
            />
          </div>
        </div>
        {/* <NavFavorites favorites={data.favorites} /> */}
        {/* <NavWorkspaces workspaces={data.workspaces} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
    </Sidebar>
  );
}
