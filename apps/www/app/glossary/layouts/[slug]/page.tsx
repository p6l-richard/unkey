import { SidebarLeft } from "@/components/glossary/sidebar-left";
import { SidebarRight } from "@/components/glossary/sidebar-right";
import { MDX } from "@/components/mdx-content";
import { ChangelogLight } from "@/components/svg/changelog";
import { MeteorLinesAngular } from "@/components/ui/meteorLines";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbList,
//   BreadcrumbPage,
// } from "@/components/ui/breadcrumb"
import { SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { FAQ } from "../../[slug]/faq";
import Takeaways from "../../[slug]/takeaways";
import { allGlossaries } from "@/.content-collections/generated";
import { notFound } from "next/navigation";
import { SidebarTriggerRight } from "./sidebar-trigger-right";
import SidebarProviderCustom from "./sidebar-provider-custom";
import { Separator } from "@/components/ui/separator";

export default function Page({ params }: { params: { slug: string } }) {
  const term = allGlossaries.find((term) => term.slug === params.slug);
  if (!term) {
    notFound();
  }

  const relatedTerms: {
    slug: string;
    term: string;
    tldr: string;
  }[] = [];
  return (
    <>
      <div className="relative mx-auto -z-100 pt-[64px]">
        <ChangelogLight className="w-full max-w-[1000px] mx-auto -top-40" />
      </div>

      <div className="w-full h-full overflow-clip -z-20">
        <MeteorLinesAngular number={1} xPos={0} speed={10} delay={5} className="overflow-hidden" />
        <MeteorLinesAngular number={1} xPos={0} speed={10} delay={0} className="overflow-hidden" />
        <MeteorLinesAngular
          number={1}
          xPos={100}
          speed={10}
          delay={7}
          className="overflow-hidden sm:hidden"
        />
        <MeteorLinesAngular
          number={1}
          xPos={100}
          speed={10}
          delay={2}
          className="overflow-hidden sm:hidden"
        />
        <MeteorLinesAngular
          number={1}
          xPos={200}
          speed={10}
          delay={7}
          className="overflow-hidden"
        />
        <MeteorLinesAngular
          number={1}
          xPos={200}
          speed={10}
          delay={2}
          className="overflow-hidden"
        />
        <MeteorLinesAngular
          number={1}
          xPos={400}
          speed={10}
          delay={5}
          className="hidden overflow-hidden md:block"
        />
        <MeteorLinesAngular
          number={1}
          xPos={400}
          speed={10}
          delay={0}
          className="hidden overflow-hidden md:block"
        />
      </div>
      <div className="container flex flex-wrap lg:mt-20 text-white/60">
        <SidebarProviderCustom className="md:pt-16 lg:pt-0">
          <SidebarLeft />
          <Separator orientation="horizontal" className="block lg:hidden bg-sidebar-border md:my-8 my-2" />
          <SidebarInset className="lg:px-8">
            <header className="sticky top-0 flex shrink-0 items-center gap-2 bg-background">
              <div className="flex flex-1 gap-8 lg:px-4 justify-between">
                {/* <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1"> */}
                <div className="flex items-center gap-5 p-0 m-0 text-xl font-medium leading-8">
                  <Link href="/glossary">
                    <span className="text-transparent bg-gradient-to-r bg-clip-text from-white to-white/60">
                      Glossary
                    </span>
                  </Link>
                  <span className="text-white/40">/</span>
                  <span className="text-transparent capitalize bg-gradient-to-r bg-clip-text from-white to-white/60">
                    MIME Types
                  </span>
                </div>
                {/* </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb> */}
              </div>
            </header>
            <div className="flex flex-1 flex-col md:gap-4 gap-2">
              <div className="lg:mt-12 mt-6 lg:mx-4 h-24 w-full rounded-xl bg-muted/50">
                <h1 className="not-prose blog-heading-gradient text-left font-medium tracking-tight md:text-4xl text-3xl whitespace-break-spaces">
                  What are MIME Types? Format IDs Explained{" "}
                </h1>
              </div>
              <div className="md:mt-6 lg:mt-12 lg:mx-4">
                <Takeaways takeaways={term.takeaways} term={term.term} />
              </div>
              <div className="mt-12 prose-sm md:prose-md text-white/60 lg:mx-4 prose-strong:text-white/90 prose-code:text-white/80 prose-code:bg-white/10 prose-code:px-2 prose-code:py-1 prose-code:border-white/20 prose-code:rounded-md prose-pre:p-0 prose-pre:m-0 prose-pre:leading-6">
                <MDX code={term.mdx} />
              </div>
              <div className="mt-12 lg:mx-4">
                <FAQ
                  items={[
                    {
                      // provide some FAQs for questions & answers about mime types:
                      question: "What is a mime type?",
                      answer:
                        "A mime type is a standard way to describe the format of a file. It is used to identify the type of data contained in a file, such as an image, a video, or a document. Mime types are essential for web browsers to correctly display and process different types of files.",
                    },
                    {
                      question: "What is the difference between a mime type and a file extension?",
                      answer:
                        "A mime type is a standard way to describe the format of a file. It is used to identify the type of data contained in a file, such as an image, a video, or a document. Mime types are essential for web browsers to correctly display and process different types of files. A file extension is a suffix added to a file name to indicate its type. It is used to help users identify the type of file and to help applications determine how to open or process the file.",
                    },
                    {
                      question: "Which mime types are supported by Unkey?",
                      answer:
                        "Unkey supports a wide range of mime types, including text, image, audio, video, and application-specific types. The full list of supported mime types can be found in the Unkey documentation.",
                    },
                  ]}
                  title={`Questions & Answers about ${term.term}`}
                  description={`We answer common questions about ${term.term}.`}
                  epigraph="FAQ"
                />
              </div>
            </div>
          </SidebarInset>
          <div className="relative">
            <SidebarTriggerRight className="" />
            <SidebarRight />
          </div>
        </SidebarProviderCustom>
      </div>
    </>
  );
}
