"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Play, Volume2, VolumeX } from "lucide-react"

interface VideoPlayerProps {
  videoId: string
  startTime?: number
  fallbackUrl?: string
  autoPlay?: boolean
}

// Fallback video URLs for when the backend is unavailable
const fallbackVideos: Record<string, string> = {
  // Original fallbacks
  "fallback-1": "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/flow+1.mp4",
  "fallback-2": "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/wild+robot.mp4",
  "fallback-3": "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/Wild+robot+2.mp4",
  "fallback-10": "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/tiny.mp4",

  // New Disney videos
  ratatouille:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/08ff403a-63e7-4188-9eed-3858f4457173_078_🧑‍🍳 Experimenting With Flavors! ｜ Ratatouille ｜ Disney Kids_pwpRSNCdr6w.mp4",
  dory: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/06c17740-1b34-4af3-b1fc-c8ab586915f7_054_🚤 Dory's Next Stop! ｜ Finding Dory ｜ Disney Kids_HaL1PU3hpvY.mp4",
  "doc-mcstuffins":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/919c946b-5dd2-49b5-b100-d4e5d136d85d_006_🧼 Wash Your Hands Song! ｜ Doc McStuffins ｜ Disney Kids_pboMdDuCJFQ.mp4",
  buzz: "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1ba5cedc-9abe-4b2d-b4be-1a9e65bfcd17_001_👨‍🚀 Just Buzz being Buzz_xuWRqYuK5k0.mp4",
  "bugs-life":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/761322bf-fcd4-4041-bce0-aa42319ce0f9_062_🔥 The Show Everyone's Excited About! ｜ A Bug's Life ｜ Disney Kids_ok3z52oMv8A.mp4",
  frozen:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1203fb1a-ef99-4cc0-a212-8bf1589216ea_044_🗻 Frozen Quest： Can Anna Stop Winter？ ｜ Frozen ｜ Disney Kids_UrrHl9p2XDM.mp4",
  mulan:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/26b8a1b0-278d-459b-8504-44d01fcd4672_002_⚔️ Mulan ｜ Movies in 60 Seconds ｜ Disney Kids_R-96-CEZ100.mp4",
  incredibles:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/5d4ed77c-8385-4391-a717-689a6ef603b3_066_Syndrome's Big Plan Unleashed! 💣 ｜ The Incredibles ｜ Disney Kids_m_6w7hirrzE.mp4",
  "doc-mcstuffins-2":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1fe5cf95-805b-4f7a-aee1-c7f209ffd5a5_011_＂Get Your Pet to the Vet＂ Song #2 ｜ Doc McStuffins ｜  Disney Junior UK_2bb0prFpCU8.mp4",
  mickey:
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/365d8546-568f-4682-b336-17be6f4cdd2e_097_🎁 Bob Cratchit's Best Christmas Gift Yet!  ｜ Mickey's Christmas Carol ｜ Disney Kids_PTpP-TSCkRg.mp4",


  "31999f85-9025-4939-a362-e498b76608fc_PCA_1.mp4":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos/flow+1.mp4",
  "mock-1":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/1ba5cedc-9abe-4b2d-b4be-1a9e65bfcd17_001_👨‍🚀 Just Buzz being Buzz_xuWRqYuK5k0.mp4",
  "mock-2":
    "https://test-001-fashion.s3.eu-north-1.amazonaws.com/videos-embed/08ff403a-63e7-4188-9eed-3858f4457173_078_🧑‍🍳 Experimenting With Flavors! ｜ Ratatouille ｜ Disney Kids_pwpRSNCdr6w.mp4",
}

export default function VideoPlayer({ videoId, startTime = 0, fallbackUrl, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string>("")
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false) //  audio on by default
  const [showControls, setShowControls] = useState(true)

  // Debug the component rendering
  console.log("VideoPlayer rendering:", { videoId, fallbackUrl, autoPlay })

  // Hide controls after a delay
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showControls])

  useEffect(() => {
    // Reset states when videoId changes
    setIsPlaying(false)
    setLoadAttempt(0)
    setIsLoading(true)
    setShowControls(true)

    console.log("VideoPlayer: Setting up video for ID:", videoId, "with fallback:", fallbackUrl)

    // Process the fallback URL if provided
    let processedUrl = fallbackUrl
    if (processedUrl) {
      try {
        processedUrl = decodeURIComponent(processedUrl)
        const urlObj = new URL(processedUrl)
        processedUrl = urlObj.toString()
        console.log("Processed URL:", processedUrl)
      } catch (e) {
        console.error("Error processing fallback URL:", e)
      }
    }

    if (processedUrl) {
      // If a direct fallback URL is provided, use it
      setVideoSrc(processedUrl)
      console.log("Using provided fallback URL:", processedUrl)
    } else if (fallbackVideos[videoId]) {
      // If we have a specific fallback for this video ID, use it
      setVideoSrc(fallbackVideos[videoId])
      console.log("Using specific fallback for video ID:", videoId)
    } else {
      // Try a random fallback from the Disney videos
      const disneyKeys = Object.keys(fallbackVideos).filter(
        (key) =>
          key !== "fallback-1" &&
          key !== "fallback-2" &&
          key !== "fallback-3" &&
          key !== "fallback-10" &&
          key !== "31999f85-9025-4939-a362-e498b76608fc_PCA_1.mp4" &&
          key !== "mock-1" &&
          key !== "mock-2",
      )
      const randomFallback = fallbackVideos[disneyKeys[Math.floor(Math.random() * disneyKeys.length)]]
      setVideoSrc(randomFallback)
      console.log("Using random Disney fallback video:", randomFallback)
    }

    if (videoRef.current) {
      videoRef.current.currentTime = startTime
    }

    // Set loading to false after a short delay
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(loadingTimer)
  }, [videoId, startTime, fallbackUrl])

  // Try to autoplay as soon as video source is set
  useEffect(() => {
    if (videoSrc && videoRef.current && !isLoading && autoPlay) {
      console.log("Attempting to autoplay video:", videoSrc)

      const playTimer = setTimeout(() => {
        if (videoRef.current) {
          const playPromise = videoRef.current.play()

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Autoplay successful")
                setIsPlaying(true)
              })
              .catch((err) => {
                console.error("Error auto-playing video:", err)
                // If autoplay fails, mark that we need user interaction

                // Try again with muted (browsers allow muted autoplay)
                if (!isMuted) {
                  console.log("Trying muted autoplay as fallback")
                  if(videoRef?.current) {
                    videoRef.current.muted = true
                  }
                  setIsMuted(true)
                  videoRef?.current?.play().catch((e) => console.error("Even muted autoplay failed:", e))
                }
              })
          }
        }
      }, 300)

      return () => clearTimeout(playTimer)
    } else if (videoSrc && videoRef.current && !isLoading && !autoPlay) {
      // If autoPlay is false, pause the video
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [videoSrc, isLoading, isMuted, autoPlay])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }

    const handleUserInteraction = () => {
      // Try to play the video if it's not already playing
      if (videoRef.current && !isPlaying && !isLoading) {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video after interaction:", err)
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("click", handleUserInteraction, { once: true })
    document.addEventListener("touchstart", handleUserInteraction, { once: true })

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }
  }, [isPlaying, isLoading])

  const togglePlay = () => {
    // Mark that user has interacted
    setShowControls(true)

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err)
        })
        setIsPlaying(true)
      }
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowControls(true)

    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoError = () => {
    console.error(`Video failed to load: ${videoSrc}. Attempt: ${loadAttempt + 1}`)

    const disneyKeys = Object.keys(fallbackVideos).filter(
      (key) =>
        key !== "fallback-1" &&
        key !== "fallback-2" &&
        key !== "fallback-3" &&
        key !== "fallback-10" &&
        key !== "31999f85-9025-4939-a362-e498b76608fc_PCA_1.mp4" &&
        key !== "mock-1" &&
        key !== "mock-2",
    )

    const nextFallbackIndex = (loadAttempt + 1) % disneyKeys.length
    const nextFallback = fallbackVideos[disneyKeys[nextFallbackIndex]]

    console.log("Video load error. Trying next fallback:", nextFallback)
    setVideoSrc(nextFallback)
    setLoadAttempt((prev) => prev + 1)

    if (loadAttempt > 3) {
      // Use Buzz video as the most reliable fallback
      const reliableFallback = fallbackVideos["buzz"]
      console.log("Multiple failures. Using most reliable fallback:", reliableFallback)
      setVideoSrc(reliableFallback)
    }
  }

  return (
    <div
      className="relative h-full w-full bg-black rounded-lg overflow-hidden"
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-[#00E21B] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {videoSrc && (
            <video
              ref={videoRef}
              src={videoSrc}
              className="h-full w-full object-cover"
              playsInline
              loop
              muted={isMuted}
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={handleVideoError}
              onCanPlay={() => console.log("Video can play:", videoSrc)}
            />
          )}

          {/* Video controls overlay */}
          <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlay}>
            {!isPlaying && (
              <div className="h-16 w-16 bg-white/70 rounded-full flex items-center justify-center shadow-lg">
                <Play className="h-8 w-8 text-gray-800 ml-1" />
              </div>
            )}
          </div>

          {/* SUPER PROMINENT AUDIO CONTROLS - Always visible at the top */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-30">
            {/* Audio status indicator */}
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              {isMuted ? (
                <>
                  <VolumeX className="h-5 w-5" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  <span>Audio On</span>
                </>
              )}
            </div>

            {/* Large, very visible mute toggle button */}
            <button
              onClick={toggleMute}
              className="flex items-center gap-2 bg-white text-black font-medium px-4 py-2 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
            >
              {isMuted ? (
                <>
                  <Volume2 className="h-5 w-5" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-5 w-5" />
                  <span>Mute</span>
                </>
              )}
            </button>
          </div>

          <div
            className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 z-20 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex justify-between items-center">
              {/* Play/Pause button */}
              <button onClick={togglePlay} className="bg-white/90 text-black rounded-full p-2 shadow-lg">
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="bg-white/90 text-black rounded-full p-2 shadow-lg flex items-center gap-2"
              >
                {isMuted ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

