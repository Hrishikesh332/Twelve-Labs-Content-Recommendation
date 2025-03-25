"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

const sampleVideos = [
  {
    id: "video-1",
    category: "Adventure",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/flow+1.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-2",
    category: "Robot",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/wild+robot.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-3",
    category: "Nature",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/Wild+robot+2.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-4",
    category: "Base Story",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/wild+robot+3.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-5",
    category: "Funny",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/spongebob.mp4",
    aspectRatio: "square",
  },
  {
    id: "video-6",
    category: "Monster Inc",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/monster+inc.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-7",
    category: "Funny Selfie",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/Zootopia+-+Selfie's.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-8",
    category: "Funny Cooking",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/ratatoulie.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-9",
    category: "Robot",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/wild+robot+4.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-10",
    category: "Base Story",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/garfield.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-11",
    category: "Suspense",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/luck.mp4",
    aspectRatio: "square",
  },
  {
    id: "video-12",
    category: "Soothing",
    videoSrc:
      "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/The+Beauty+Of+How+To+Train+Your+Dragon+trilogy.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-13",
    category: "Ice Age",
    videoSrc:
      "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/There%E2%80%99s+a+rainbow+round+every+corner+%23shorts+%23viral+%23clips+%23iceage+%23hope.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-14",
    category: "Fish + Suspense",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/nemo.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-15",
    category: "Climax Scene",
    videoSrc:
      "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/Every+_Skadoosh_+Ever+in+Kung+Fu+Panda+%23shorts.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-16",
    category: "Happy + Tiny",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/tiny.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-17",
    category: "Happy",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/tiny.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-18",
    category: "Funny Selfie",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/Zootopia+-+Selfie's.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-19",
    category: "Climax Scene",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/panda+3.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-20",
    category: "Soothing",
    videoSrc:
      "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/The+Beauty+Of+How+To+Train+Your+Dragon+trilogy.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-21",
    category: "Base Story",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/luck.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-22",
    category: "Happy + Tiny",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/tiny.mp4",
    aspectRatio: "portrait",
  },
  {
    id: "video-23",
    category: "Fitness",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/spongebob.mp4",
    aspectRatio: "landscape",
  },
  {
    id: "video-24",
    category: "Base Story",
    videoSrc: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/luck.mp4",
    aspectRatio: "portrait",
  },
]

// Function to distribute videos into columns
const distributeVideosIntoColumns = (videos: typeof sampleVideos, columnCount: number) => {
  const columns: (typeof sampleVideos)[] = Array.from({ length: columnCount }, () => [])

  videos.forEach((video, index) => {
    const columnIndex = index % columnCount
    columns[columnIndex].push(video)
  })

  return columns
}

export default function VideoGrid() {
  const [mounted, setMounted] = useState(false)
  const [animationPosition, setAnimationPosition] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)
  const [columnCount, setColumnCount] = useState(6)
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
        setColumnCount(6)
      }
    }

    updateColumnCount()
    window.addEventListener("resize", updateColumnCount)
    return () => window.removeEventListener("resize", updateColumnCount)
  }, [])

  useEffect(() => {
    setMounted(true)

    // Smooth animation using requestAnimationFrame
    const animate = () => {
      setAnimationPosition((prev) => (prev + 0.15) % 1000) // Slightly slower animation for better visibility
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
    if (mounted) {
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
  }, [mounted])

  if (!mounted) return null

  // Distribute videos into columns
  const videoColumns = distributeVideosIntoColumns(sampleVideos, columnCount)

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
              className="relative overflow-hidden rounded-xl shadow-md transition-all duration-300"
              style={{
                aspectRatio:
                  video.aspectRatio === "portrait" ? "9/16" : video.aspectRatio === "landscape" ? "16/9" : "1/1",
                transform: hoverIndex === video.id ? "scale(1.05)" : "scale(1)",
              }}
              onMouseEnter={() => setHoverIndex(video.id)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <video
                src={video.videoSrc}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                muted
                playsInline
                autoPlay
                preload="auto"
                ref={(el) => {
                  videoRefs.current[video.id] = el
                }}
              />

              {/* Category badge */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-10 shadow-sm">
                {video.category}
              </div>
         
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 z-[1]" />

              {/* Video info */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 p-2 transform transition-transform duration-300 z-10",
                  hoverIndex === video.id ? "translate-y-0" : "translate-y-full",
                )}
              >
              </div>

              {/* Play button overlay (only on hover) */}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10",
                  hoverIndex === video.id ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="h-10 w-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
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

