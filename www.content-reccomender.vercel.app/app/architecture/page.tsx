import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clapperboard, Database, Search } from "lucide-react"
import Navbar from "@/components/navbar"
import SiteFooter from "@/components/site-footer"

const overviewCards = [
  {
    title: "Video Understanding",
    description: "Videos are embedded with Twelve Labs so the platform understands more than titles or keywords.",
    icon: Clapperboard,
  },
  {
    title: "Vector Retrieval",
    description: "Embeddings and metadata are organized in Qdrant for fast semantic search across the catalog.",
    icon: Database,
  },
  {
    title: "Intent-Based Search",
    description: "User queries are matched against the indexed content to return more relevant recommendations.",
    icon: Search,
  },
]

const architectureSections = [
  {
    label: "Architecture",
    title: "System Architecture",
    description:
      "A high-level view of how the interface, backend search endpoint, Twelve Labs embeddings, and Qdrant retrieval connect across the recommendation pipeline.",
    imageSrc: "/Architecture.png",
    imageAlt: "System architecture diagram for the content recommendation platform",
    imageWidth: 1500,
    imageHeight: 1049,
  },
  {
    label: "Workflow",
    title: "Recommendation Workflow",
    description:
      "A cleaner look at how videos are indexed, how preferences are translated into embeddings, and how relevant content is returned to the user.",
    imageSrc: "/Workflow.png",
    imageAlt: "Recommendation workflow diagram for the content recommendation platform",
    imageWidth: 1536,
    imageHeight: 1024,
  },
]

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#F4F3F3]">
      <Navbar />

      <main className="px-6 pb-24 pt-32">
        <div className="max-w-7xl mx-auto">
          <section className="text-center">
            <span className="inline-block rounded-full border border-[#D3D1CF] bg-[#F8F8F7] px-4 py-1.5 text-sm font-medium text-[#1D1C1B]/75 shadow-sm">
              Architecture
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#1D1C1B] sm:text-5xl md:text-6xl">
              Architecture & Workflow
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#1D1C1B]/72 sm:text-lg">
              A dedicated view of how the content recommendation system indexes video, interprets user intent, and returns meaningful results through semantic retrieval.
            </p>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {overviewCards.map((card) => {
                const Icon = card.icon

                return (
                  <div
                    key={card.title}
                    className="rounded-[1.6rem] border border-[#D3D1CF] bg-[#F8F8F7] p-6 text-left shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Icon className="h-5 w-5 text-[#00E21B]" />
                    </div>
                    <h2 className="mt-5 text-xl font-semibold text-[#1D1C1B]">{card.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#1D1C1B]/68">{card.description}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="mt-20 space-y-16">
            {architectureSections.map((section, index) => (
              <article
                key={section.title}
                className={index === 0 ? "space-y-7" : "space-y-7 border-t border-[#D3D1CF] pt-16"}
              >
                <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="pt-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1D1C1B]/45">
                      {section.label}
                    </span>
                    <div className="mt-3 h-px w-16 bg-[#D3D1CF]" />
                  </div>

                  <div className="max-w-3xl">
                    <h2 className="text-3xl font-bold text-[#1D1C1B] sm:text-4xl">{section.title}</h2>
                    <p className="mt-4 text-sm leading-7 text-[#1D1C1B]/72 sm:text-base">{section.description}</p>
                  </div>
                </div>

                <div className="mx-auto max-w-[1040px] rounded-[1.7rem] border border-dashed border-[#CBC7C4] p-3 sm:p-4">
                  <div className="overflow-hidden rounded-[1.35rem] border border-[#DDD9D6] bg-white">
                    <Image
                      src={section.imageSrc}
                      alt={section.imageAlt}
                      width={section.imageWidth}
                      height={section.imageHeight}
                      sizes="(min-width: 1536px) 1040px, (min-width: 1024px) 86vw, 100vw"
                      className="block h-auto w-full"
                      priority={index === 0}
                    />
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-20 rounded-[2rem] border border-[#D3D1CF] bg-[#F8F8F7] p-8 shadow-sm sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#1D1C1B]/75 shadow-sm">
                  Explore The Product
                </span>
                <h2 className="mt-5 text-3xl font-bold text-[#1D1C1B] sm:text-4xl">
                  See the recommendation experience in action
                </h2>
                <p className="mt-4 text-base leading-7 text-[#1D1C1B]/70 sm:text-lg">
                  Move from the system blueprint into the live discovery flow and explore how the recommendation engine behaves with real prompts.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00E21B] px-6 py-3 text-base font-medium text-[#1D1C1B] transition-all hover:shadow-md hover:scale-[1.02]"
                >
                  Open Explore
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-[#D3D1CF] bg-white px-6 py-3 text-base font-medium text-[#1D1C1B] transition-colors hover:bg-[#F4F3F3]"
                >
                  Back Home
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
