"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

// Define the video data structure
interface VideoData {
  id: string
  title: string
  category: string
  duration: string
  views: string
  videoSrc: string
  aspectRatio: "portrait" | "landscape" | "square"
}

interface VideoGridProps {
  videos?: VideoData[]
  loading?: boolean
  columnCount?: number
}

// Function to distribute videos into columns
const distributeVideosIntoColumns = (videos: VideoData[], columnCount: number) => {
  const columns: VideoData[][] = Array.from({ length: columnCount }, () => [])

  videos.forEach((video, index) => {
    const columnIndex = index % columnCount
    columns[columnIndex].push(video)
  })

  return columns
}

export default function OptimizedVideoGrid({
  videos = [],
  loading = false,
  columnCount: initialColumnCount = 6,
}: VideoGridProps) {
  const [mounted, setMounted] = useState(false)
  const [animationPosition, setAnimationPosition] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)
  const [columnCount, setColumnCount] = useState(initialColumnCount)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  // Responsive column count
  useEffect(() => {
    const updateColumnCount = () => {
      if (window.innerWidth < 640) {
        setColumnCount(2)
      } else if (window.innerWidth < 768) {
        setColumnCount(3)
      } else if (window.innerWidth < 1024) {
        setColumnCount(4)
      } else {
        setColumnCount(initialColumnCount)
      }
    }

    updateColumnCount()
    window.addEventListener("resize", updateColumnCount)
    return () => window.removeEventListener("resize", updateColumnCount)
  }, [initialColumnCount])

  useEffect(() => {
    setMounted(true)

    // Smooth animation using requestAnimationFrame
    const animate = () => {
      setAnimationPosition((prev) => (prev + 0.2) % 1000)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Start playing all videos when component mounts
  useEffect(() => {
    if (mounted && videos.length > 0) {
      // Small delay to ensure videos are loaded
      const timer = setTimeout(() => {
        Object.values(videoRefs.current).forEach((videoRef) => {
          if (videoRef) {
            videoRef.play().catch((err) => {
              console.warn("Autoplay prevented:", err)
              // If autoplay is prevented, we'll try again on user interaction
              const handleUserInteraction = () => {
                videoRef.play().catch((e) => console.error("Error playing video after interaction:", e))
                document.removeEventListener("click", handleUserInteraction)
              }
              document.addEventListener("click", handleUserInteraction, { once: true })
            })
          }
        })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [mounted, videos])

  if (!mounted) return null

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 h-full w-full p-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-800/50 rounded-lg animate-pulse"
            style={{
              aspectRatio: index % 3 === 0 ? "9/16" : index % 3 === 1 ? "16/9" : "1/1",
            }}
          />
        ))}
      </div>
    )
  }

  // Show empty state
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full p-4">
        <p className="text-gray-600">No videos available</p>
      </div>
    )
  }

  // Distribute videos into columns
  const videoColumns = distributeVideosIntoColumns(videos, columnCount)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 h-full w-full p-4">
      {videoColumns.map((column, colIndex) => (
        <div
          key={colIndex}
          className="flex flex-col gap-3"
          style={{
            transform: `translateY(${colIndex % 2 === 0 ? -animationPosition % 100 : animationPosition % 100}px)`,
            transition: "transform 0.1s linear",
          }}
        >
          {column.map((video) => (
            <div
              key={video.id}
              className="relative overflow-hidden rounded-lg transition-all duration-300"
              style={{
                aspectRatio:
                  video.aspectRatio === "portrait" ? "9/16" : video.aspectRatio === "landscape" ? "16/9" : "1/1",
                transform: hoverIndex === video.id ? "scale(1.05)" : "scale(1)",
              }}
              onMouseEnter={() => setHoverIndex(video.id)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <video
                ref={(el) => (videoRefs.current[video.id] = el)}
                src={video.videoSrc}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                muted
                playsInline
                autoPlay
                preload="auto"
              />

              {/* Category badge */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-10">
                {video.category}
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded z-10">
                {video.duration}
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 z-[1]" />

              {/* Video info */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 p-2 transform transition-transform duration-300 z-10",
                  hoverIndex === video.id ? "translate-y-0" : "translate-y-full",
                )}
              >
                <div className="text-white text-xs font-medium line-clamp-2">{video.title}</div>
                <div className="text-white/70 text-xs mt-1">{video.views}</div>
              </div>

              {/* Play button overlay (only on hover) */}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10",
                  hoverIndex === video.id ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="h-10 w-10 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="h-0 w-0 border-t-[6px] border-b-[6px] border-l-[10px] border-transparent border-l-black ml-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

