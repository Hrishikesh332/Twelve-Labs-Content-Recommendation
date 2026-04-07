"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Search,
  ArrowUp,
  ArrowDown,
  Rocket,
  Clapperboard,
  Baby,
  Users,
  Compass,
  Sparkles,
  Drama,
  Zap,
  Smile,
  Frown,
  Ghost,
  Heart,
  CarFront,
  Swords,
  Shield,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import SearchResultsGallery from "@/components/search-results-gallery"
import VideoPlayer from "@/components/video-player"
import Navbar from "@/components/navbar"
import { API_BASE_URL } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
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
  aspectRatio?: number
}

type ViewMode = "vertical" | "gallery"

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
  thriller:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/5d4ed77c-8385-4391-a717-689a6ef603b3_066_Syndrome's Big Plan Unleashed! 💣 ｜ The Incredibles ｜ Disney Kids_m_6w7hirrzE.mp4",
  action:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/26b8a1b0-278d-459b-8504-44d01fcd4672_002_⚔️ Mulan ｜ Movies in 60 Seconds ｜ Disney Kids_R-96-CEZ100.mp4",
  happy:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/08ff403a-63e7-4188-9eed-3858f4457173_078_🧑‍🍳 Experimenting With Flavors! ｜ Ratatouille ｜ Disney Kids_pwpRSNCdr6w.mp4",
  sad: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1203fb1a-ef99-4cc0-a212-8bf1589216ea_044_🗻 Frozen Quest： Can Anna Stop Winter？ ｜ Frozen ｜ Disney Kids_UrrHl9p2XDM.mp4",
  scary:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/5d4ed77c-8385-4391-a717-689a6ef603b3_066_Syndrome's Big Plan Unleashed! 💣 ｜ The Incredibles ｜ Disney Kids_m_6w7hirrzE.mp4",
  uplifting:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/365d8546-568f-4682-b336-17be6f4cdd2e_097_🎁 Bob Cratchit's Best Christmas Gift Yet!  ｜ Mickey's Christmas Carol ｜ Disney Kids_PTpP-TSCkRg.mp4",
  "car-chases":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/06c17740-1b34-4af3-b1fc-c8ab586915f7_054_🚤 Dory's Next Stop! ｜ Finding Dory ｜ Disney Kids_HaL1PU3hpvY.mp4",
  fighting:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/26b8a1b0-278d-459b-8504-44d01fcd4672_002_⚔️ Mulan ｜ Movies in 60 Seconds ｜ Disney Kids_R-96-CEZ100.mp4",
  "child-friendly":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/919c946b-5dd2-49b5-b100-d4e5d136d85d_006_🧼 Wash Your Hands Song! ｜ Doc McStuffins ｜ Disney Kids_pboMdDuCJFQ.mp4",
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
  thriller: "Thriller - Suspenseful and Tense",
  action: "Action - Fast-Paced and Energetic",
  happy: "Happy - Joyful and Positive",
  sad: "Sad - Emotional and Reflective",
  scary: "Scary - Frightening and Intense",
  uplifting: "Uplifting - Inspiring and Hopeful",
  "car-chases": "Car Chases - Vehicles and Pursuits",
  fighting: "Fighting - Combat and Battles",
  "child-friendly": "Child Friendly - Safe and Playful",
}

const ALL_TAGS_VALUE = "__all__"

const CATEGORY_OPTIONS = [
  { value: "sci-fi", label: "Sci-Fi - Futuristic & Technology-Based", shortLabel: "Sci-Fi", icon: Rocket },
  { value: "cartoon", label: "Cartoon - Stylized Short-Form Animation", shortLabel: "Cartoon", icon: Clapperboard },
  { value: "kids", label: "Kids - Educational & Child-Friendly", shortLabel: "Kids", icon: Baby },
  { value: "family", label: "Family - All-Ages Entertainment", shortLabel: "Family", icon: Users },
  { value: "adventure", label: "Adventure - Exciting Journeys & Quests", shortLabel: "Adventure", icon: Compass },
  { value: "fantasy", label: "Fantasy - Magical Worlds & Creatures", shortLabel: "Fantasy", icon: Sparkles },
  { value: "thriller", label: "Thriller - Suspenseful and Tense", shortLabel: "Thriller", icon: Drama },
  { value: "action", label: "Action - Fast-Paced and Energetic", shortLabel: "Action", icon: Zap },
  { value: "happy", label: "Happy - Joyful and Positive", shortLabel: "Happy", icon: Smile },
  { value: "sad", label: "Sad - Emotional and Reflective", shortLabel: "Sad", icon: Frown },
  { value: "scary", label: "Scary - Frightening and Intense", shortLabel: "Scary", icon: Ghost },
  { value: "uplifting", label: "Uplifting - Inspiring and Hopeful", shortLabel: "Uplifting", icon: Heart },
  { value: "car-chases", label: "Car Chases - Vehicles and Pursuits", shortLabel: "Car", icon: CarFront },
  { value: "fighting", label: "Fighting - Combat and Battles", shortLabel: "Fighting", icon: Swords },
  { value: "child-friendly", label: "Child Friendly - Safe and Playful", shortLabel: "Child", icon: Shield },
] as const satisfies ReadonlyArray<{
  value: string
  label: string
  shortLabel: string
  icon: LucideIcon
}>

const getCategoryOption = (value: string) =>
  CATEGORY_OPTIONS.find((option) => option.value === value) ?? null

const EXPLORE_QUICK_PROMPTS = [
  {
    title: "Edge-of-seat",
    description: "Tense turns, suspense, and thriller energy.",
    tag: "thriller",
    query: "suspenseful thriller scenes with tension",
  },
  {
    title: "Action burst",
    description: "Fighting, speed, and sharp momentum.",
    tag: "action",
    query: "action scenes with fighting and fast pacing",
  },
  {
    title: "Family lift",
    description: "Child-friendly stories with warm, uplifting beats.",
    tag: "child-friendly",
    query: "uplifting child friendly adventures",
  },
  {
    title: "Fast pursuit",
    description: "Car chases, escapes, and chase-heavy movement.",
    tag: "car-chases",
    query: "fast car chases and dramatic pursuits",
  },
] as const

const EXPLORE_MOOD_CHIPS = ["Happy", "Scary", "Uplifting", "Child Friendly", "Fighting"] as const

function VerticalViewIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4 transition-colors", active ? "text-black" : "text-slate-500")}
      aria-hidden="true"
    >
      <rect x="7" y="3.5" width="10" height="17" rx="2.5" />
      <path d="M10 7.5h4" />
      <path d="M10 16.5h4" />
    </svg>
  )
}

function GalleryViewIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4 transition-colors", active ? "text-black" : "text-slate-500")}
      aria-hidden="true"
    >
      <rect x="3.5" y="4" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="4" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export default function ExplorePage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<"none" | "up" | "down">("none")
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [showRecommendationForm, setShowRecommendationForm] = useState(true)
  const [category, setCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")

  const [viewMode, setViewMode] = useState<ViewMode>("vertical")
  const [activeGalleryVideo, setActiveGalleryVideo] = useState<VideoItem | null>(null)
  const [currentVideoAspectRatio, setCurrentVideoAspectRatio] = useState<number | null>(null)

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

      const requestBody = { query: freshQuery }
      const searchEndpoint = `${API_BASE_URL}/search`

      // Try to fetch from backend
      const response = await fetch(searchEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        const validVideos = data.filter(
          (video) => video && typeof video === "object" && "video_id" in video && "start_time" in video,
        )

        if (validVideos.length > 0) {
          const processedVideos = validVideos.map((video) => {
            return {
              ...video,
              url: typeof video.url === "string" && video.url.trim() ? video.url.trim() : undefined,
              uniqueId: `${video.video_id}-${Date.now()}`,
            }
          })
          setVideos(processedVideos)
          setCurrentIndex(0)
          setHasSearched(true)
          return
        }
      }

      // If we get here, we didn't get valid videos from the API
      throw new Error("No valid videos returned from the API")
    } catch {
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

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchEndY - touchStartY.current

    if (Math.abs(deltaY) > 30) {
      if (deltaY < 0) {
        handleNext()
      } else {
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
  }, [handleNext, handlePrevious])

  // Get current video with fallback
  const currentVideo = videos.length > 0 ? videos[currentIndex] : null
  const hasResults = hasSearched && videos.length > 0
  const selectedCategoryValue = category || ALL_TAGS_VALUE
  const selectedCategoryOption = getCategoryOption(category)
  const isGalleryView = hasResults && viewMode === "gallery"
  const isCurrentVideoLandscape = (currentVideoAspectRatio ?? 0) > 1.05
  const activeGalleryAspectRatio =
    activeGalleryVideo?.aspectRatio && Number.isFinite(activeGalleryVideo.aspectRatio) && activeGalleryVideo.aspectRatio > 0
      ? activeGalleryVideo.aspectRatio
      : 16 / 9
  const activeGalleryWidth =
    activeGalleryAspectRatio < 1 ? `min(92vw, calc(82vh * ${activeGalleryAspectRatio}))` : "min(92vw, 1100px)"
  const verticalPlayerStyle = isCurrentVideoLandscape
    ? {
        width: "min(94vw, 880px)",
        maxHeight: "calc(100vh - 180px)",
        aspectRatio: currentVideoAspectRatio ?? 16 / 9,
      }
    : {
        width: "100%",
        maxWidth: "400px",
        height: "80vh",
        maxHeight: "calc(100vh - 160px)",
        aspectRatio: "9 / 16",
      }

  useEffect(() => {
    setCurrentVideoAspectRatio(null)
  }, [currentIndex, currentVideo?.uniqueId, currentVideo?.video_id])

  const applyExplorePrompt = (query: string, nextCategory?: string) => {
    setSearchQuery(query)
    if (nextCategory !== undefined) {
      setCategory(nextCategory)
    }
  }

  const applyPreferenceChanges = () => {
    handleSearch()
    setIsDrawerOpen(false)
  }

  const handlePreferenceReset = () => {
    setIsDrawerOpen(false)
    resetSearch()
  }

  // Reset recommendation form
  const resetSearch = () => {
    setShowRecommendationForm(true)
    setHasSearched(false)
    setVideos([])
    setCurrentIndex(0)
    setCurrentQuery("")
    setSearchQuery("")
    setCategory("")
    setViewMode("vertical")
    setActiveGalleryVideo(null)
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#F4F3F3]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image src="/background.png" alt="Background" fill priority className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4F3F3]/80 via-[#F8F8F7]/60 to-[#F4F3F3]/80"></div>
      </div>

      {/* Navbar - using the updated component */}
      <Navbar />

      {hasResults ? (
        <div className="fixed right-4 top-20 z-50 md:right-6">
          <div className="flex items-center gap-1 rounded-full border border-white/70 bg-white/85 p-1 shadow-[0_14px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors md:px-4",
                viewMode === "vertical" ? "bg-[#00E21B] text-black" : "text-slate-600 hover:bg-slate-100/80",
              )}
              onClick={() => setViewMode("vertical")}
              aria-pressed={viewMode === "vertical"}
            >
              <VerticalViewIcon active={viewMode === "vertical"} />
              <span>Vertical</span>
            </button>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors md:px-4",
                viewMode === "gallery" ? "bg-[#00E21B] text-black" : "text-slate-600 hover:bg-slate-100/80",
              )}
              onClick={() => setViewMode("gallery")}
              aria-pressed={viewMode === "gallery"}
            >
              <GalleryViewIcon active={viewMode === "gallery"} />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Main content - centered with flex */}
      <div
        className={cn(
          "relative z-10 w-full px-4",
          isGalleryView
            ? "flex h-[100dvh] flex-col items-center justify-start overflow-hidden pb-28 pt-24 md:px-6 md:pb-32 md:pt-28"
            : "flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-12 pt-28 md:px-6 md:pb-16 md:pt-32",
        )}
      >
        {showRecommendationForm ? (
          <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-stretch">
              <section className="relative overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.76),rgba(240,250,242,0.94))] p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,226,27,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.10),_transparent_30%)]" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#00E21B]" />
                    Explore
                  </div>

                  <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    What would you like to watch?
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 md:text-base">
                    Start with a feeling, a genre, or a kind of moment. We’ll turn it into a video feed that feels
                    more curated than searched.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {EXPLORE_QUICK_PROMPTS.map((prompt) => {
                      const promptOption = getCategoryOption(prompt.tag)

                      return (
                        <button
                          key={prompt.title}
                          type="button"
                          onClick={() => applyExplorePrompt(prompt.query, prompt.tag)}
                          className="group rounded-[24px] border border-white/70 bg-white/72 p-4 text-left shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_22px_55px_rgba(15,23,42,0.12)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-slate-900">{prompt.title}</p>
                              <p className="mt-1 text-sm leading-5 text-slate-600">{prompt.description}</p>
                            </div>
                            <span className="mt-0.5 text-slate-700">
                              {promptOption ? <promptOption.icon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                            </span>
                          </div>
                          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900/[0.04] px-3 py-1.5 text-xs font-medium text-slate-600">
                            <span>{promptOption ? promptOption.shortLabel : "All Tags"}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {EXPLORE_MOOD_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSearchQuery(chip.toLowerCase())}
                        className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-white/70 bg-white/84 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-6">
                <div className="flex h-full flex-col">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Build Your Feed</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Pick a tag, add a scene or mood, and jump straight into results.
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <Select
                      value={selectedCategoryValue}
                      onValueChange={(value) => setCategory(value === ALL_TAGS_VALUE ? "" : value)}
                    >
                      <SelectTrigger className="h-14 rounded-full border-0 bg-slate-900/[0.04] px-4 text-sm text-slate-700 shadow-none ring-1 ring-slate-900/6">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-4 w-4 items-center justify-center text-slate-700">
                            {selectedCategoryOption ? (
                              <selectedCategoryOption.icon className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </span>
                          <span className="font-medium">
                            {selectedCategoryOption ? selectedCategoryOption.shortLabel : "All Tags"}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_TAGS_VALUE}>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>All Tags</span>
                          </div>
                        </SelectItem>
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              <span>{option.shortLabel}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex h-14 items-center gap-3 rounded-full bg-slate-900/[0.04] pl-5 pr-3 ring-1 ring-slate-900/6">
                      <input
                        type="text"
                        placeholder="Describe the scene, mood, or story beat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00E21B] text-black shadow-[0_14px_30px_rgba(0,226,27,0.24)] transition hover:bg-[#00E21B]/90"
                        aria-label="Find videos"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[24px] bg-slate-900/[0.04] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Try prompts like</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <button
                        type="button"
                        onClick={() => applyExplorePrompt("uplifting child friendly adventures", "child-friendly")}
                        className="block text-left transition hover:text-slate-950"
                      >
                        “uplifting child friendly adventures”
                      </button>
                      <button
                        type="button"
                        onClick={() => applyExplorePrompt("fast car chases and dramatic pursuits", "car-chases")}
                        className="block text-left transition hover:text-slate-950"
                      >
                        “fast car chases and dramatic pursuits”
                      </button>
                      <button
                        type="button"
                        onClick={() => applyExplorePrompt("happy family moments with playful energy", "happy")}
                        className="block text-left transition hover:text-slate-950"
                      >
                        “happy family moments with playful energy”
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-[#00E21B] rounded-full animate-spin mb-4" />
            <p className="text-lg text-gray-800">Loading videos...</p>
          </div>
        ) : hasResults ? (
          viewMode === "vertical" ? (
            <div
              className="relative mx-auto flex w-full flex-col items-center justify-center"
              style={{ maxWidth: isCurrentVideoLandscape ? "min(94vw, 880px)" : "400px" }}
            >
              <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentIndex + 1}</span>
                  <span className="text-xs text-gray-500">of</span>
                  <span className="text-sm font-medium">{videos.length}</span>
                </div>
              </div>

              <div
                ref={videoContainerRef}
                className={cn(
                  "relative mx-auto overflow-hidden rounded-2xl shadow-xl transition-all duration-300",
                  isCurrentVideoLandscape
                    ? "bg-[radial-gradient(circle_at_top,_rgba(0,226,27,0.18),_rgba(15,23,42,0.92)_56%)]"
                    : "",
                  swipeDirection === "up" && "transform -translate-y-8 scale-95 opacity-90",
                  swipeDirection === "down" && "transform translate-y-8 scale-95 opacity-90",
                )}
                style={verticalPlayerStyle}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {currentVideo && (
                  <VideoPlayer
                    key={`video-${currentIndex}-${currentVideo.uniqueId ?? currentVideo.video_id ?? "fallback-1"}`}
                    videoId={currentVideo.video_id || "fallback-1"}
                    startTime={currentVideo.start_time || 0}
                    fallbackUrl={currentVideo.url}
                    autoPlay
                    fitMode="smart"
                    onAspectRatioChange={setCurrentVideoAspectRatio}
                  />
                )}

                <div className="absolute top-0 left-0 right-0 h-1/2 z-10 opacity-0" onClick={handlePrevious} />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 z-10 opacity-0" onClick={handleNext} />

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
          ) : (
            <div className="flex h-full w-full max-w-7xl flex-1 min-h-0 items-stretch">
              <SearchResultsGallery
                videos={videos}
                className="flex-1"
                onVideoSelect={(video) => {
                  const matchedVideo = videos.find((item) => (item.uniqueId ?? item.video_id) === (video.uniqueId ?? video.video_id))
                  setActiveGalleryVideo(matchedVideo ? { ...matchedVideo, aspectRatio: video.aspectRatio } : null)
                }}
              />
            </div>
          )
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

        {isGalleryView ? (
          <div className="fixed inset-x-4 bottom-5 z-50 mx-auto w-auto max-w-4xl md:inset-x-6 md:bottom-6">
            <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-[28px] bg-white/82 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.16)] ring-1 ring-white/75 backdrop-blur-xl md:flex-row md:items-center">
              <Select
                value={selectedCategoryValue}
                onValueChange={(value) => setCategory(value === ALL_TAGS_VALUE ? "" : value)}
              >
                <SelectTrigger className="h-12 w-full rounded-full border-0 bg-slate-900/[0.04] px-3.5 text-sm text-slate-700 shadow-none ring-1 ring-slate-900/6 md:w-[172px]">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center text-slate-700">
                      {selectedCategoryOption ? (
                        <selectedCategoryOption.icon className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </span>
                    <span className="font-medium">
                      {selectedCategoryOption ? selectedCategoryOption.shortLabel : "All Tags"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_TAGS_VALUE}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>All Tags</span>
                    </div>
                  </SelectItem>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.shortLabel}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex h-12 w-full items-center gap-2 rounded-full bg-slate-900/[0.04] pl-4 pr-2 ring-1 ring-slate-900/6">
                <input
                  type="text"
                  placeholder={currentQuery || "Describe the next set of videos..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00E21B] text-black shadow-[0_14px_30px_rgba(0,226,27,0.24)] transition hover:bg-[#00E21B]/90"
                  aria-label="Search videos"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {hasResults && !isGalleryView ? (
          <>
            <div
              className={cn(
                "fixed z-50",
                isGalleryView ? "left-4 top-20 md:left-6 md:top-24" : "bottom-6 left-6",
              )}
            >
              <Button
                variant="default"
                className="bg-[#00E21B] text-black hover:bg-[#00E21B]/90 shadow-md"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Change Preferences
              </Button>
            </div>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerContent className="mx-auto w-[calc(100%-1rem)] max-w-[38rem] rounded-[30px] border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,250,242,0.96))] shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
                <DrawerHeader className="px-4 pb-1 pt-4 sm:px-5">
                  <DrawerTitle className="text-center text-lg text-slate-950">Change Preferences</DrawerTitle>
                  <DrawerDescription className="text-center text-sm text-slate-600">
                    Update the tag or rewrite the search to refresh the vertical feed.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="space-y-3 px-4 pb-2 pt-3 sm:px-5">
                  <div className="grid gap-3 sm:grid-cols-[168px_minmax(0,1fr)]">
                    <Select
                      value={selectedCategoryValue}
                      onValueChange={(value) => setCategory(value === ALL_TAGS_VALUE ? "" : value)}
                    >
                      <SelectTrigger className="h-11 w-full rounded-full border-0 bg-slate-900/[0.04] px-3 text-sm text-slate-700 shadow-none ring-1 ring-slate-900/6">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-4 w-4 items-center justify-center text-slate-700">
                            {selectedCategoryOption ? (
                              <selectedCategoryOption.icon className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </span>
                          <span className="font-medium">
                            {selectedCategoryOption ? selectedCategoryOption.shortLabel : "All Tags"}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_TAGS_VALUE}>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>All Tags</span>
                          </div>
                        </SelectItem>
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              <span>{option.shortLabel}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex h-11 w-full items-center gap-2 rounded-full bg-slate-900/[0.04] pl-4 pr-2 ring-1 ring-slate-900/6">
                      <input
                        type="text"
                        placeholder={currentQuery || "Describe the next set of videos..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            applyPreferenceChanges()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={applyPreferenceChanges}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00E21B] text-black shadow-[0_14px_30px_rgba(0,226,27,0.24)] transition hover:bg-[#00E21B]/90"
                        aria-label="Search videos"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <DrawerFooter className="gap-2 px-4 pb-4 pt-3 sm:grid sm:grid-cols-2 sm:px-5">
                  <Button
                    onClick={applyPreferenceChanges}
                    className="bg-[#00E21B] text-black hover:bg-[#00E21B]/90 shadow-[0_18px_40px_rgba(0,226,27,0.2)]"
                  >
                    Update Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePreferenceReset}
                    className="border-slate-300 bg-white/70 text-slate-700 hover:bg-white"
                  >
                    Start New Search
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </>
        ) : null}

        <Dialog
          open={Boolean(activeGalleryVideo)}
          onOpenChange={(open) => {
            if (!open) {
              setActiveGalleryVideo(null)
            }
          }}
        >
          <DialogContent className="w-auto max-w-[96vw] gap-0 overflow-hidden border-[#00E21B]/25 bg-[radial-gradient(circle_at_top,_rgba(0,226,27,0.22),_rgba(7,17,31,0.97)_54%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-3 text-white shadow-[0_30px_100px_rgba(15,23,42,0.45)] sm:rounded-[32px] md:p-4 [&>button:last-child]:right-2.5 [&>button:last-child]:top-2.5 [&>button:last-child]:z-50 [&>button:last-child]:flex [&>button:last-child]:h-9 [&>button:last-child]:w-9 [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:rounded-full [&>button:last-child]:border [&>button:last-child]:border-white/20 [&>button:last-child]:bg-white/92 [&>button:last-child]:text-slate-900 [&>button:last-child]:opacity-100 [&>button:last-child]:shadow-[0_16px_40px_rgba(15,23,42,0.2)] hover:[&>button:last-child]:bg-white [&>button:last-child>svg]:h-3.5 [&>button:last-child>svg]:w-3.5">
            <DialogTitle className="sr-only">
              {activeGalleryVideo?.filename ?? "Selected video"}
            </DialogTitle>
            {activeGalleryVideo ? (
              <div className="mx-auto flex max-h-[82vh] items-center justify-center">
                <div
                  className="overflow-hidden rounded-[26px] border border-white/12 bg-[radial-gradient(circle_at_top,_rgba(0,226,27,0.22),_rgba(4,10,24,0.95)_58%)] shadow-[0_24px_60px_rgba(0,0,0,0.32)]"
                  style={{ aspectRatio: activeGalleryAspectRatio, width: activeGalleryWidth }}
                >
                  <VideoPlayer
                    key={`dialog-${activeGalleryVideo.uniqueId ?? activeGalleryVideo.video_id}`}
                    videoId={activeGalleryVideo.video_id}
                    startTime={activeGalleryVideo.start_time || 0}
                    fallbackUrl={activeGalleryVideo.url}
                    autoPlay
                    fitMode="contain"
                    showNativeControls
                  />
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {error && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white px-4 py-2 rounded-full text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
