"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import VideoGrid from "@/components/video-grid"
import { ArrowRight, Play, ChevronDown, Zap, Sparkles, Settings } from "lucide-react"
import { ComingSoonDialog } from "@/components/coming-soon-dialog"
import SiteFooter from "@/components/site-footer"

export default function Home() {
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false)

  return (
    <div className="min-h-screen bg-[#F4F3F3] overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="relative min-h-screen">
        {/* Video grid background with dynamic layout - reduced opacity to 50% */}
        <div className="absolute inset-0 opacity-50">
          <VideoGrid />
        </div>

        {/* Gradient overlay for better text readability - lighter gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4F3F3]/70 via-[#F4F3F3]/40 to-[#F4F3F3]/70 z-0"></div>

        {/* Content overlay - no blurry background */}
        <div className="relative min-h-screen flex flex-col justify-center items-center px-6 z-10 pt-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero section */}
            <div className="space-y-6">
              <div className="inline-block px-4 sm:px-6 py-2 border border-[#D3D1CF] rounded-full bg-[#F8F8F7]/90 mb-4 shadow-md">
                <span className="text-[#1D1C1B] text-xs sm:text-sm font-medium">Powered by Twelve Labs</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1D1C1B] leading-tight tracking-tight [text-shadow:_0_1px_3px_rgba(255,255,255,0.7)] break-words">
                Discover Content That{" "}
                <span className="text-[#00E21B] [text-shadow:_0_1px_2px_rgba(255,255,255,0.5)]">Matters</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-[#1D1C1B] max-w-2xl mx-auto font-medium leading-relaxed [text-shadow:_0_1px_2px_rgba(255,255,255,0.7)] px-2">
                AI-powered video recommendations that understand your preferences and deliver content you&apos;ll love.
              </p>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-6">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 bg-[#00E21B] text-[#1D1C1B] px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium hover:shadow-lg hover:scale-105 transform transition-all"
                >
                  Explore Now
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <button
                  onClick={() => setShowComingSoonDialog(true)}
                  className="inline-flex items-center justify-center gap-2 bg-[#F8F8F7] text-[#1D1C1B] border border-[#D3D1CF] px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium hover:bg-[#F4F3F3] transition-all shadow-sm"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  How It Works
                </button>
              </div>
            </div>

            {/* Scroll indicator - adjust position */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="h-8 w-8 text-[#1D1C1B]" />
            </div>
          </div>
        </div>

        {/* Enhanced Features Section - improve spacing and design */}
        <div id="features" className="relative z-10 py-24 px-6 bg-[#F4F3F3]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#F8F8F7] text-[#00E21B] rounded-full text-sm font-medium mb-4 shadow-sm">
                Features
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1D1C1B] mb-4 px-2">
                Discover the Power of Semantic Video Recommendation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-3xl border border-[#D3D1CF] hover:border-[#00E21B]/30 transition-all duration-300 hover:shadow-xl bg-[#F8F8F7]">
                {/* Visual element */}
                <div className="h-40 bg-[#F4F3F3] flex items-center justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-[#00E21B] flex items-center justify-center relative shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-10 w-10 text-[#F8F8F7]" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1D1C1B] mb-2">Smart Recommendations</h3>
                  <p className="text-[#1D1C1B]/80 text-sm">
                  Marengo 3.0 multimodal embeddings power Qdrant-based content discovery that learns from your preferences and viewing habits.
                  </p>
                  <Link
                    href="https://www.twelvelabs.io/blog/video-intelligence-transforms-storage-costs-into-strategic-assets"
                    className="mt-4 inline-flex items-center text-[#00E21B] font-medium hover:text-[#00E21B]/80 text-sm"
                  >
                    Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-3xl border border-[#D3D1CF] hover:border-[#00E21B]/30 transition-all duration-300 hover:shadow-xl bg-[#F8F8F7]">
                {/* Visual element */}
                <div className="h-40 bg-[#F4F3F3] flex items-center justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-[#00E21B] flex items-center justify-center relative shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-10 w-10 text-[#F8F8F7]" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1D1C1B] mb-2">Customizable Experience</h3>
                  <p className="text-[#1D1C1B]/80 text-sm">
                    Fine-tune your content feed with personalized categories and preferences.
                  </p>
                  <Link
                    href="https://github.com/Hrishikesh332/Twelve-Labs-Content-Recommendation"
                    className="mt-4 inline-flex items-center text-[#00E21B] font-medium hover:text-[#00E21B]/80 text-sm"
                  >
                    Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-3xl border border-[#D3D1CF] hover:border-[#00E21B]/30 transition-all duration-300 hover:shadow-xl bg-[#F8F8F7]">
                {/* Visual element */}
                <div className="h-40 bg-[#F4F3F3] flex items-center justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-[#00E21B] flex items-center justify-center relative shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-10 w-10 text-[#F8F8F7]" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1D1C1B] mb-2">Lightning Fast</h3>
                  <p className="text-[#1D1C1B]/80 text-sm">
                  Instant recommendations search powered by Twelve Labs embedding and Qdrant search.
                  </p>
                  <Link
                    href="https://www.twelvelabs.io/blog/twelve-labs-and-qdrant"
                    className="mt-4 inline-flex items-center text-[#00E21B] font-medium hover:text-[#00E21B]/80 text-sm"
                  >
                    Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SiteFooter />

        <ComingSoonDialog
          isOpen={showComingSoonDialog}
          onClose={() => setShowComingSoonDialog(false)}
          title="How It Works"
          videoUrl="https://www.youtube.com/embed/0JOK1D6muIw?si=M7J1ZNMBtlPP27mi"
        />
      </div>
    </div>
  )
}
