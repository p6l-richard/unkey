"use client";

import type * as React from "react";

import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { allGlossaries } from "@/.content-collections/generated";
import { FilterableCommand } from "./search";
import TermsRolodexDesktop from "./terms-rolodex-desktop";
import TermsStepperMobile from "./terms-stepper-mobile";

export function SidebarLeft({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      // these custom styles ensure that we don't destroy the collapsible effect of the sidebarrail with the sticky position -- we apply it only when expanded
      // at the same time, we have to apply top-36 whenever the state is collapsed so that it doesn't span to the whole page height
      className="pr-8 border-r-0 group-data-[state=collapsed]:lg:top-36 group-data-[state=expanded]:sticky group-data-[state=expanded]:top-0 group-data-[state=expanded]:h-svh"
      side="left"
      {...props}
    >
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        {/* <NavMain items={data.navMain} /> */}
      </SidebarHeader>
      <SidebarContent>
        <p className="w-full mb-4 font-semibold text-left blog-heading-gradient">Find a term</p>
        <FilterableCommand
          placeholder="Search"
          className="rounded-lg mb-4 border-[.75px] border-white/20"
          terms={allGlossaries}
        />
        <div className="flex-grow">
          <p className="w-full my-4 font-semibold text-left blog-heading-gradient">Terms</p>
          <TermsRolodexDesktop
            className="flex-grow hidden lg:block"
            terms={allGlossaries.map((term) => ({ slug: term.slug, title: term.title }))}
          />
          <TermsStepperMobile
            className="flex-grow lg:hidden"
            terms={allGlossaries.map((term) => ({ slug: term.slug, title: term.title }))}
          />
        </div>
        {/* <NavFavorites favorites={data.favorites} /> */}
        {/* <NavWorkspaces workspaces={data.workspaces} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarRail className="after:bg-sidebar-ring" />
    </Sidebar>
  );
}
