"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Drawer } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Settings, Search, ArrowUp, ArrowDown } from "lucide-react"
import VideoPlayer from "@/components/video-player"
import StyleSelector from "@/components/style-selector"
import Navbar from "@/components/navbar"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const fallbackVideos = [
  {
    video_id: "ratatouille",
    filename: "ratatouille.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.95,
    confidence: "high",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/08ff403a-63e7-4188-9eed-3858f4457173_078_🧑‍🍳 Experimenting With Flavors! ｜ Ratatouille ｜ Disney Kids_pwpRSNCdr6w.mp4",
  },
  {
    video_id: "dory",
    filename: "dory.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.92,
    confidence: "high",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/06c17740-1b34-4af3-b1fc-c8ab586915f7_054_🚤 Dory's Next Stop! ｜ Finding Dory ｜ Disney Kids_HaL1PU3hpvY.mp4",
  },
  {
    video_id: "buzz",
    filename: "buzz.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.9,
    confidence: "high",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1ba5cedc-9abe-4b2d-b4be-1a9e65bfcd17_001_👨‍🚀 Just Buzz being Buzz_xuWRqYuK5k0.mp4",
  },
  {
    video_id: "bugs-life",
    filename: "bugs-life.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.88,
    confidence: "high",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/761322bf-fcd4-4041-bce0-aa42319ce0f9_062_🔥 The Show Everyone's Excited About! ｜ A Bug's Life ｜ Disney Kids_ok3z52oMv8A.mp4",
  },
  {
    video_id: "frozen",
    filename: "frozen.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.86,
    confidence: "high",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1203fb1a-ef99-4cc0-a212-8bf1589216ea_044_🗻 Frozen Quest： Can Anna Stop Winter？ ｜ Frozen ｜ Disney Kids_UrrHl9p2XDM.mp4",
  },
  {
    video_id: "mulan",
    filename: "mulan.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.84,
    confidence: "high",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/26b8a1b0-278d-459b-8504-44d01fcd4672_002_⚔️ Mulan ｜ Movies in 60 Seconds ｜ Disney Kids_R-96-CEZ100.mp4",
  },
  {
    video_id: "incredibles",
    filename: "incredibles.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.82,
    confidence: "high",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/5d4ed77c-8385-4391-a717-689a6ef603b3_066_Syndrome's Big Plan Unleashed! 💣 ｜ The Incredibles ｜ Disney Kids_m_6w7hirrzE.mp4",
  },
  {
    video_id: "doc-mcstuffins",
    filename: "doc-mcstuffins.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.8,
    confidence: "high",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/919c946b-5dd2-49b5-b100-d4e5d136d85d_006_🧼 Wash Your Hands Song! ｜ Doc McStuffins ｜ Disney Kids_pboMdDuCJFQ.mp4",
  },
  {
    video_id: "doc-mcstuffins-2",
    filename: "doc-mcstuffins-2.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.78,
    confidence: "high",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1fe5cf95-805b-4f7a-aee1-c7f209ffd5a5_011_＂Get Your Pet to the Vet＂ Song #2 ｜ Doc McStuffins ｜  Disney Junior UK_2bb0prFpCU8.mp4",
  },
  {
    video_id: "mickey",
    filename: "mickey.mp4",
    start_time: 0,
    end_time: 30,
    score: 0.75,
    confidence: "medium",
    url: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/365d8546-568f-4682-b336-17be6f4cdd2e_097_🎁 Bob Cratchit's Best Christmas Gift Yet!  ｜ Mickey's Christmas Carol ｜ Disney Kids_PTpP-TSCkRg.mp4",
  },
]

// Map of video categories to fallback videos - updated with Disney content
const categoryFallbacks = {
  music:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/919c946b-5dd2-49b5-b100-d4e5d136d85d_006_🧼 Wash Your Hands Song! ｜ Doc McStuffins ｜ Disney Kids_pboMdDuCJFQ.mp4",
  travel:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/06c17740-1b34-4af3-b1fc-c8ab586915f7_054_🚤 Dory's Next Stop! ｜ Finding Dory ｜ Disney Kids_HaL1PU3hpvY.mp4",
  food: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/08ff403a-63e7-4188-9eed-3858f4457173_078_🧑‍🍳 Experimenting With Flavors! ｜ Ratatouille ｜ Disney Kids_pwpRSNCdr6w.mp4",
  fashion:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/26b8a1b0-278d-459b-8504-44d01fcd4672_002_⚔️ Mulan ｜ Movies in 60 Seconds ｜ Disney Kids_R-96-CEZ100.mp4",
  technology:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1ba5cedc-9abe-4b2d-b4be-1a9e65bfcd17_001_👨‍🚀 Just Buzz being Buzz_xuWRqYuK5k0.mp4",
  education:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1fe5cf95-805b-4f7a-aee1-c7f209ffd5a5_011_＂Get Your Pet to the Vet＂ Song #2 ｜ Doc McStuffins ｜  Disney Junior UK_2bb0prFpCU8.mp4",
  animation:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/5d4ed77c-8385-4391-a717-689a6ef603b3_066_Syndrome's Big Plan Unleashed! 💣 ｜ The Incredibles ｜ Disney Kids_m_6w7hirrzE.mp4",
  kids: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/365d8546-568f-4682-b336-17be6f4cdd2e_097_🎁 Bob Cratchit's Best Christmas Gift Yet!  ｜ Mickey's Christmas Carol ｜ Disney Kids_PTpP-TSCkRg.mp4",
  winter:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1203fb1a-ef99-4cc0-a212-8bf1589216ea_044_🗻 Frozen Quest： Can Anna Stop Winter？ ｜ Frozen ｜ Disney Kids_UrrHl9p2XDM.mp4",
}

export default function ExplorePage() {
  const [videos, setVideos] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)
  const [useFallback, setUseFallback] = useState(true)

  const [showRecommendationForm, setShowRecommendationForm] = useState(true)
  const [category, setCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")

  const fetchVideos = async (query: string) => {
    setIsLoading(true)
    setError(null)
    setCurrentQuery(query)

    try {
      console.log("Fetching videos for query:", query)

      // Try to fetch from backend
      const response = await fetch("https://twelve-labs-content-recommendation.onrender.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
        }),
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Received data from backend:", data)

      if (Array.isArray(data) && data.length > 0) {
        const validVideos = data.filter(
          (video) => video && typeof video === "object" && "video_id" in video && "start_time" in video,
        )

        console.log("Valid videos after filtering:", validVideos)

        if (validVideos.length > 0) {
          const processedVideos = validVideos.map((video, index) => {
            const videoUrl =
              video.url ||
              fallbackVideos.find((fb) => fb.video_id === video.video_id)?.url ||
              (category && categoryFallbacks[category.toLowerCase()]) ||
              fallbackVideos[index % fallbackVideos.length].url

            return {
              ...video,
              url: videoUrl,
              uniqueId: `${video.video_id}-${index}-${Date.now()}`,
            }
          })

          console.log("Final processed videos:", processedVideos)
          setVideos(processedVideos)
          setCurrentIndex(0) 
          setHasSearched(true)
          return
        } else {
          console.warn("No valid videos after filtering")
        }
      } else {
        console.warn("No array or empty array returned from backend")
      }

      // If we get here, we didn't get valid videos from the API
      throw new Error("No valid videos returned from the API")
    } catch (error: any) {
      console.error("Using fallback videos due to error:", error)

      // Create category-specific fallbacks if a category is selected
      if (category && categoryFallbacks[category.toLowerCase()]) {
        const categoryUrl = categoryFallbacks[category.toLowerCase()]
        const customFallbacks = Array.from({ length: 5 }).map((_, index) => ({
          ...fallbackVideos[index % fallbackVideos.length],
          url: categoryUrl,
          video_id: `${category.toLowerCase()}-${index + 1}`,
          uniqueId: `${category.toLowerCase()}-${index + 1}-${Date.now()}`,
        }))

        // Always include a few Disney videos for variety
        const disneyVideos = fallbackVideos.slice(0, 3).map((video, index) => ({
          ...video,
          uniqueId: `disney-${index}-${Date.now()}`,
        }))

        setVideos([...customFallbacks, ...disneyVideos])
        setCurrentIndex(0) // Reset to first video
        setError(`Using ${category} videos with Disney content`)
      } else {
        // Use Disney videos as fallbacks
        const uniqueFallbacks = fallbackVideos.map((video, index) => ({
          ...video,
          uniqueId: `disney-${index}-${Date.now()}`,
        }))

        setVideos(uniqueFallbacks)
        setCurrentIndex(0) // Reset to first video
        setError(`Using Disney videos as fallbacks`)
      }

      setUseFallback(true)
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    let query = searchQuery.trim()

    if (category && !query) {
      query = `${category} videos`
    } else if (category && query) {
      query = `${query} ${category}`
    }

    if (!query) {
      query = "recommended videos"
    }

    fetchVideos(query)
    setShowRecommendationForm(false)
  }

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Touch handlers for swipe gestures - improved sensitivity
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchEndY - touchStartY.current

    // Reduced threshold for more sensitive swiping (30px instead of 50px)
    if (Math.abs(deltaY) > 30) {
      if (deltaY < 0) {
        // Swipe up - go to next video
        handleNext()
      } else {
        // Swipe down - go to previous video
        handlePrevious()
      }
    }

    touchStartY.current = null
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        handlePrevious()
      } else if (e.key === "ArrowDown") {
        handleNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, videos.length])

  // Get current video with fallback
  const currentVideo = videos.length > 0 ? videos[currentIndex] : null

  // Reset recommendation form
  const resetSearch = () => {
    setShowRecommendationForm(true)
    setHasSearched(false)
    setVideos([])
    setCurrentIndex(0)
  }

  // Handle style change from drawer
  const handleStyleChange = () => {
    // Close the drawer
    setIsDrawerOpen(false)

    // If we have a current query, fetch new videos with it
    if (currentQuery) {
      fetchVideos(currentQuery)
    } else {
      // Otherwise, reset to the form
      resetSearch()
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-[#F4F3F3] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image src="/background.png" alt="Background" fill className="object-cover" priority />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main content - centered with flex */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 pt-16 pb-20 min-h-[calc(100vh-80px)]">
        {showRecommendationForm ? (
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">What would you like to watch?</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-gray-300 focus:ring-[#00E21B] focus:border-[#00E21B]">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="animation">Animation</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E21B] focus:border-[#00E21B]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch()
                      }
                    }}
                  />
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full bg-[#00E21B] text-black hover:bg-[#00E21B]/90">
                <Search className="mr-2 h-4 w-4" />
                Find Videos
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-[#00E21B] rounded-full animate-spin mb-4" />
            <p className="text-lg text-gray-800">Loading videos...</p>
          </div>
        ) : hasSearched && videos.length > 0 ? (
          <>
            {/* Main content layout with portrait video container - centered */}
            <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center">
              {/* Swipe instruction - now above the video */}
              <div className="mb-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <p className="text-sm font-medium text-gray-800">Swipe up/down to change videos</p>
              </div>

              {/* Video navigation indicator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentIndex + 1}</span>
                  <span className="text-xs text-gray-500">of</span>
                  <span className="text-sm font-medium">{videos.length}</span>
                </div>
              </div>

              {/* Portrait video container with fixed aspect ratio */}
              <div
                ref={videoContainerRef}
                className="relative mx-auto rounded-2xl overflow-hidden shadow-xl"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "80vh",
                  maxHeight: "calc(100vh - 160px)",
                  aspectRatio: "9/16",
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {currentVideo && (
                  <VideoPlayer
                    key={`video-${currentIndex}-${currentVideo.uniqueId || Date.now()}-${Math.random().toString(36).substring(2, 9)}`}
                    videoId={currentVideo.video_id || "fallback-1"}
                    startTime={currentVideo.start_time || 0}
                    fallbackUrl={useFallback ? currentVideo.url : undefined}
                    autoPlay={true}
                  />
                )}

                {/* Large swipe areas for easier navigation */}
                <div className="absolute top-0 left-0 right-0 h-1/2 z-10 opacity-0" onClick={handlePrevious} />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 z-10 opacity-0" onClick={handleNext} />

                {/* Navigation buttons - centered at bottom */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/80 shadow-md hover:bg-white"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/80 shadow-md hover:bg-white"
                    onClick={handleNext}
                    disabled={currentIndex === videos.length - 1}
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Change Suggestion button - fixed at bottom center */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
              <Button
                variant="default"
                className="bg-[#00E21B] text-black hover:bg-[#00E21B]/90 shadow-md"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Change Preferences
              </Button>
            </div>

            {/* Style selector drawer */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <StyleSelector onClose={() => setIsDrawerOpen(false)} onChangePreferences={handleStyleChange} />
            </Drawer>
          </>
        ) : hasSearched ? (
          <div className="text-center bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg mb-4 text-gray-800">No videos found</p>
            <Button
              onClick={resetSearch}
              variant="outline"
              className="bg-white shadow-md hover:bg-gray-50 text-gray-800"
            >
              Try Again
            </Button>
          </div>
        ) : null}

        {error && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white px-4 py-2 rounded-full text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

