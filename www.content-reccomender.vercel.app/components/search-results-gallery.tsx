"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface SearchResultVideo {
  video_id: string
  filename: string
  score: number
  confidence: string
  url?: string
  uniqueId?: string
  aspectRatio?: number
}

interface SearchResultsGalleryProps {
  videos: SearchResultVideo[]
  className?: string
  onVideoSelect?: (video: SearchResultVideo) => void
}

const TILE_CLASSES = [
  "col-span-1 row-span-1 md:col-span-5 md:row-span-3",
  "col-span-1 row-span-1 md:col-span-3 md:row-span-2",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2",
  "col-span-1 row-span-1 md:col-span-3 md:row-span-2",
  "col-span-1 row-span-1 md:col-span-4 md:row-span-2",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2",
  "col-span-1 row-span-1 md:col-span-3 md:row-span-3",
  "col-span-1 row-span-1 md:col-span-2 md:row-span-2",
  "col-span-1 row-span-1 md:col-span-3 md:row-span-2",
]

export default function SearchResultsGallery({ videos, className, onVideoSelect }: SearchResultsGalleryProps) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const aspectRatiosRef = useRef<Record<string, number>>({})
  const [failedVideos, setFailedVideos] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const timer = window.setTimeout(() => {
      videos.forEach((video) => {
        const key = video.uniqueId ?? video.video_id
        const videoElement = videoRefs.current[key]
        if (!videoElement) {
          return
        }

        videoElement.play().catch(() => {})
      })
    }, 200)

    return () => window.clearTimeout(timer)
  }, [videos])

  return (
    <div className={cn("h-full w-full", className)}>
      <div className="grid h-full auto-flow-dense grid-cols-2 grid-rows-5 gap-3 md:grid-cols-12 md:grid-rows-6 md:gap-4">
        {videos.map((video, index) => {
          const key = video.uniqueId ?? video.video_id
          const tileClasses = TILE_CLASSES[index % TILE_CLASSES.length]
          const hasFailed = failedVideos[key]

          return (
            <button
              key={key}
              type="button"
              className={cn(
                "group relative overflow-hidden rounded-[22px] bg-black text-left shadow-[0_18px_45px_rgba(15,23,42,0.16)] ring-1 ring-black/5 md:rounded-[26px]",
                !hasFailed && video.url ? "cursor-pointer" : "cursor-default",
                tileClasses,
              )}
              onClick={() => {
                if (!hasFailed && video.url) {
                  onVideoSelect?.({
                    ...video,
                    aspectRatio: aspectRatiosRef.current[key],
                  })
                }
              }}
              disabled={!video.url}
              aria-label={`Open ${video.filename}`}
            >
              {!hasFailed && video.url ? (
                <video
                  ref={(element) => {
                    videoRefs.current[key] = element
                  }}
                  src={video.url}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  onLoadedMetadata={(event) => {
                    const element = event.currentTarget
                    if (element.videoWidth > 0 && element.videoHeight > 0) {
                      aspectRatiosRef.current[key] = element.videoWidth / element.videoHeight
                    }
                  }}
                  onError={() => {
                    setFailedVideos((current) => ({ ...current, [key]: true }))
                  }}
                />
              ) : null}

              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

              {hasFailed ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 p-4 text-center text-white">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/70">
                    Unavailable
                  </span>
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
