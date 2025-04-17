"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Drawer } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Settings, Search, ArrowUp, ArrowDown } from "lucide-react"
import VideoPlayer from "@/components/video-player"
import StyleSelector from "@/components/style-selector"
import Navbar from "@/components/navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Add this interface at the top of the file, after the imports
interface VideoItem {
  video_id: string
  filename: string
  start_time: number
  end_time: number
  score: number
  confidence: string
  url?: string
  uniqueId?: string
}

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

// Map of video categories to fallback videos with generic content
const categoryFallbacks = {
  animation:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/5d4ed77c-8385-4391-a717-689a6ef603b3_066_Syndrome's Big Plan Unleashed! 💣 ｜ The Incredibles ｜ Disney Kids_m_6w7hirrzE.mp4",
  "3d-animation":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/5d4ed77c-8385-4391-a717-689a6ef603b3_066_Syndrome's Big Plan Unleashed! 💣 ｜ The Incredibles ｜ Disney Kids_m_6w7hirrzE.mp4",
  "traditional-animation":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/26b8a1b0-278d-459b-8504-44d01fcd4672_002_⚔️ Mulan ｜ Movies in 60 Seconds ｜ Disney Kids_R-96-CEZ100.mp4",
  "stop-motion":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/761322bf-fcd4-4041-bce0-aa42319ce0f9_062_🔥 The Show Everyone's Excited About! ｜ A Bug's Life ｜ Disney Kids_ok3z52oMv8A.mp4",
  anime:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1ba5cedc-9abe-4b2d-b4be-1a9e65bfcd17_001_👨‍🚀 Just Buzz being Buzz_xuWRqYuK5k0.mp4",
  cartoon:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/919c946b-5dd2-49b5-b100-d4e5d136d85d_006_🧼 Wash Your Hands Song! ｜ Doc McStuffins ｜ Disney Kids_pboMdDuCJFQ.mp4",
  kids: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/365d8546-568f-4682-b336-17be6f4cdd2e_097_🎁 Bob Cratchit's Best Christmas Gift Yet!  ｜ Mickey's Christmas Carol ｜ Disney Kids_PTpP-TSCkRg.mp4",
  family:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/08ff403a-63e7-4188-9eed-3858f4457173_078_🧑‍🍳 Experimenting With Flavors! ｜ Ratatouille ｜ Disney Kids_pwpRSNCdr6w.mp4",
  adventure:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/06c17740-1b34-4af3-b1fc-c8ab586915f7_054_🚤 Dory's Next Stop! ｜ Finding Dory ｜ Disney Kids_HaL1PU3hpvY.mp4",
  comedy:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1fe5cf95-805b-4f7a-aee1-c7f209ffd5a5_011_＂Get Your Pet to the Vet＂ Song #2 ｜ Doc McStuffins ｜  Disney Junior UK_2bb0prFpCU8.mp4",
  fantasy:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1203fb1a-ef99-4cc0-a212-8bf1589216ea_044_🗻 Frozen Quest： Can Anna Stop Winter？ ｜ Frozen ｜ Disney Kids_UrrHl9p2XDM.mp4",
  "sci-fi":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1ba5cedc-9abe-4b2d-b4be-1a9e65bfcd17_001_👨‍🚀 Just Buzz being Buzz_xuWRqYuK5k0.mp4",
  // Add these for backward compatibility with existing code
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
  winter:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1203fb1a-ef99-4cc0-a212-8bf1589216ea_044_🗻 Frozen Quest： Can Anna Stop Winter？ ｜ Frozen ｜ Disney Kids_UrrHl9p2XDM.mp4",
}

// Map of category values to their full descriptions
const categoryDescriptions: Record<string, string> = {
  animation: "Animation - General Animated Content",
  "3d-animation": "3D Animation - Computer-Generated Graphics",
  "traditional-animation": "Traditional Animation - Hand-Drawn Style",
  "stop-motion": "Stop Motion - Frame-by-Frame Physical Animation",
  anime: "Anime - Japanese Animation Style",
  cartoon: "Cartoon - Stylized Short-Form Animation",
  kids: "Kids - Educational & Child-Friendly",
  family: "Family - All-Ages Entertainment",
  adventure: "Adventure - Exciting Journeys & Quests",
  comedy: "Comedy - Humorous & Lighthearted",
  fantasy: "Fantasy - Magical Worlds & Creatures",
  "sci-fi": "Sci-Fi - Futuristic & Technology-Based",
}

export default function ExplorePage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)
  const [useFallback, setUseFallback] = useState(true)
  const [swipeDirection, setSwipeDirection] = useState<"none" | "up" | "down">("none")
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [showRecommendationForm, setShowRecommendationForm] = useState(true)
  const [category, setCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")

  // State for theme and mood
  const [theme, setTheme] = useState("")
  const [mood, setMood] = useState("")

  const [isVideoPlaying, setIsVideoPlaying] = useState(true)

  // Show swipe instruction when a new video loads or when changing videos

  // Debug logging for API calls
  const logApiCall = (method: string, url: string, body: Record<string, unknown>) => {
    console.log(`API ${method} to ${url}:`, body)
  }

  // Create a fresh search query based on the base query and preferences
  const createSearchQuery = (baseQuery: string, themeValue?: string, moodValue?: string) => {
    // Start with just the base query
    let finalQuery = baseQuery.trim()

    // For theme/mood searches, we'll create a completely new query
    // rather than appending to avoid query getting too long
    if (themeValue || moodValue) {
      const parts = []

      // Add the base query
      parts.push(finalQuery)

      // Add theme if provided - use quotes to keep multi-word themes together
      if (themeValue) {
        parts.push(`"${themeValue}"`)
      }

      // Add mood if provided - use quotes to keep multi-word moods together
      if (moodValue) {
        parts.push(`"${moodValue}"`)
      }

      // Join with spaces to create a clean query
      finalQuery = parts.join(" ")
    }

    console.log("Created fresh search query:", finalQuery)
    return finalQuery
  }

  // Update the fetchVideos function to use the new createSearchQuery function
  const fetchVideos = async (query: string, themeValue?: string, moodValue?: string) => {
    setIsLoading(true)
    setError(null)
    // Don't update currentQuery here - it should only be set in handleSearch
    // setCurrentQuery(query);

    try {
      // Create a fresh search query
      const freshQuery = createSearchQuery(query, themeValue, moodValue)

      console.log("Fetching videos with query:", freshQuery)

      // Log the API call we're about to make
      const requestBody = { query: freshQuery }
      console.log("URL ", `${process.env.NEXT_PUBLIC_URL}/search` || "")

      logApiCall("POST", `${process.env.NEXT_PUBLIC_URL}/search` || "", requestBody)

      // Try to fetch from backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/search` || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000),
      })

      console.log("Backend response status:", response.status)

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
              (category && Object.prototype.hasOwnProperty.call(categoryFallbacks, category.toLowerCase())
                ? categoryFallbacks[category.toLowerCase() as keyof typeof categoryFallbacks]
                : undefined) ||
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
    } catch (error) {
      console.error("Using fallback videos due to error:", error)

      // Create category-specific fallbacks if a category is selected
      const lowerCategory = category.toLowerCase()
      if (category && Object.prototype.hasOwnProperty.call(categoryFallbacks, lowerCategory)) {
        const categoryUrl = categoryFallbacks[lowerCategory as keyof typeof categoryFallbacks]
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
      } else if (themeValue) {
        const lowerTheme = themeValue.toLowerCase()
        if (Object.prototype.hasOwnProperty.call(categoryFallbacks, lowerTheme)) {
          // Use theme-specific fallbacks if available
          const themeUrl = categoryFallbacks[lowerTheme as keyof typeof categoryFallbacks]

          const themeFallbacks = Array.from({ length: 5 }).map((_, index) => ({
            ...fallbackVideos[index % fallbackVideos.length],
            url: themeUrl,
            video_id: `${themeValue.toLowerCase()}-${index + 1}`,
            uniqueId: `${themeValue.toLowerCase()}-${index + 1}-${Date.now()}`,
          }))

          setVideos(themeFallbacks)
          setCurrentIndex(0)
          setError(`Using ${themeValue} themed videos`)
        }
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

    if (category) {
      // Get the full description for the selected category
      const fullCategoryText = categoryDescriptions[category] || category

      if (query) {
        // If there's already a search query, add the full category text in quotes
        query = `${query} "${fullCategoryText}"`
      } else {
        // If there's no search query, just use the full category text in quotes
        query = `"${fullCategoryText}" videos`
      }
    }

    if (!query) {
      query = "recommended videos"
    }

    // Store the original query without any theme/mood enhancements
    setCurrentQuery(query)

    // Reset theme and mood when doing a new search
    setTheme("")
    setMood("")

    fetchVideos(query)
    setShowRecommendationForm(false)
  }

  const handleNext = useCallback(() => {
    if (currentIndex < videos.length - 1 && !isTransitioning) {
      setIsTransitioning(true)
      setSwipeDirection("up")

      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setSwipeDirection("none")
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    }
  }, [currentIndex, videos.length, isTransitioning])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true)
      setSwipeDirection("down")

      setTimeout(() => {
        setCurrentIndex(currentIndex - 1)
        setSwipeDirection("none")
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    }
  }, [currentIndex, isTransitioning])

  // Touch handlers for swipe gestures - improved for better detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || isTransitioning) return

    const touchY = e.touches[0].clientY
    const deltaY = touchY - touchStartY.current

    // Show visual feedback during swipe
    if (Math.abs(deltaY) > 20) {
      if (deltaY < 0 && currentIndex < videos.length - 1) {
        setSwipeDirection("up")
      } else if (deltaY > 0 && currentIndex > 0) {
        setSwipeDirection("down")
      }
    }
  }

  const toggleVideoPlayback = () => {
    setIsVideoPlaying(!isVideoPlaying)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchEndY - touchStartY.current

    if (Math.abs(deltaY) > 30) {
      if (deltaY < 0) {
        handleNext()
        // Reset video playing state when changing videos
        setIsVideoPlaying(true)
      } else {
        handlePrevious()
        // Reset video playing state when changing videos
        setIsVideoPlaying(true)
      }
    }

    touchStartY.current = null
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        handlePrevious()
        setIsVideoPlaying(true)
      } else if (e.key === "ArrowDown") {
        handleNext()
        setIsVideoPlaying(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNext, handlePrevious])

  // Get current video with fallback
  const currentVideo = videos.length > 0 ? videos[currentIndex] : null

  // Reset recommendation form
  const resetSearch = () => {
    console.log("Resetting search and showing form")
    setShowRecommendationForm(true)
    setHasSearched(false)
    setVideos([])
    setCurrentIndex(0)
    setTheme("")
    setMood("")
    setCurrentQuery("")
    setSearchQuery("")
    setCategory("")
  }

  // Update the handleStyleChange function to handle the showSearchForm flag
  const handleStyleChange = (newTheme?: string, newMood?: string, showSearchForm?: boolean) => {
    console.log("Style change requested:", { newTheme, newMood, showSearchForm })

    // If showSearchForm is true, reset to search form
    if (showSearchForm) {
      resetSearch()
      return
    }

    // Update theme and mood if provided
    const updatedTheme = newTheme !== undefined ? newTheme : theme
    const updatedMood = newMood !== undefined ? newMood : mood

    setTheme(updatedTheme)
    setMood(updatedMood)

    // Close the drawer
    setIsDrawerOpen(false)

    // If we have a current query, fetch new videos with it and the new preferences
    // But make sure we're using the original query without previous enhancements
    if (currentQuery) {
      console.log("Fetching new videos with updated preferences:", {
        query: currentQuery, // Use the original query
        theme: updatedTheme,
        mood: updatedMood,
      })
      fetchVideos(currentQuery, updatedTheme, updatedMood)
    } else {
      // If no current query, reset to the form
      resetSearch()
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-[#F4F3F3] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image src="/background.png" alt="Background" fill priority className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4F3F3]/80 via-[#F8F8F7]/60 to-[#F4F3F3]/80"></div>
      </div>

      {/* Navbar - using the updated component */}
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
                    <SelectItem value="animation">Animation - General Animated Content</SelectItem>
                    <SelectItem value="3d-animation">3D Animation - Computer-Generated Graphics</SelectItem>
                    <SelectItem value="traditional-animation">Traditional Animation - Hand-Drawn Style</SelectItem>
                    <SelectItem value="stop-motion">Stop Motion - Frame-by-Frame Physical Animation</SelectItem>
                    <SelectItem value="anime">Anime - Japanese Animation Style</SelectItem>
                    <SelectItem value="cartoon">Cartoon - Stylized Short-Form Animation</SelectItem>
                    <SelectItem value="kids">Kids - Educational & Child-Friendly</SelectItem>
                    <SelectItem value="family">Family - All-Ages Entertainment</SelectItem>
                    <SelectItem value="adventure">Adventure - Exciting Journeys & Quests</SelectItem>
                    <SelectItem value="comedy">Comedy - Humorous & Lighthearted</SelectItem>
                    <SelectItem value="fantasy">Fantasy - Magical Worlds & Creatures</SelectItem>
                    <SelectItem value="sci-fi">Sci-Fi - Futuristic & Technology-Based</SelectItem>
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
              {/* Video navigation indicator */}
              <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentIndex + 1}</span>
                  <span className="text-xs text-gray-500">of</span>
                  <span className="text-sm font-medium">{videos.length}</span>
                </div>
              </div>

              {/* Portrait video container with fixed aspect ratio */}
              <div
                ref={videoContainerRef}
                className={cn(
                  "relative mx-auto rounded-2xl overflow-hidden shadow-xl transition-all duration-300",
                  swipeDirection === "up" && "transform -translate-y-8 scale-95 opacity-90",
                  swipeDirection === "down" && "transform translate-y-8 scale-95 opacity-90",
                )}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "80vh",
                  maxHeight: "calc(100vh - 160px)",
                  aspectRatio: "9/16",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {currentVideo && (
                  <div onClick={toggleVideoPlayback}>
                    <VideoPlayer
                      key={`video-${currentIndex}-${currentVideo.uniqueId || Date.now()}-${Math.random().toString(36).substring(2, 9)}`}
                      videoId={currentVideo.video_id || "fallback-1"}
                      startTime={currentVideo.start_time || 0}
                      fallbackUrl={useFallback ? currentVideo.url : undefined}
                      autoPlay={isVideoPlaying}
                    />
                  </div>
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

            {/* Change Preferences button - MOVED TO LEFT */}
            <div className="fixed bottom-6 left-6 z-50">
              <Button
                variant="default"
                className="bg-[#00E21B] text-black hover:bg-[#00E21B]/90 shadow-md"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Change Preferences
              </Button>
            </div>

            {/* New Search button - ADDED TO RIGHT */}
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                variant="outline"
                className="bg-white text-gray-800 hover:bg-gray-50 shadow-md"
                onClick={resetSearch}
              >
                <Search className="mr-2 h-4 w-4" />
                New Search
              </Button>
            </div>

            {/* Style selector drawer */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <StyleSelector
                onClose={() => setIsDrawerOpen(false)}
                onChangePreferences={handleStyleChange}
                initialMood={mood}
              />
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
