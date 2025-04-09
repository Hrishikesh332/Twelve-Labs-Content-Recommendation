"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CalendarClock } from "lucide-react"

interface ComingSoonDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  videoUrl?: string
}

export function ComingSoonDialog({ isOpen, onClose, title, description, videoUrl }: ComingSoonDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          {!videoUrl && (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F8F7] mb-4">
              <CalendarClock className="h-6 w-6 text-[#00E21B]" />
            </div>
          )}
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          {description && <DialogDescription className="text-center pt-2">{description}</DialogDescription>}
        </DialogHeader>

        {videoUrl && (
          <div className="w-full mt-2 mb-4 overflow-hidden rounded-lg" style={{ aspectRatio: "16/9" }}>
            <iframe
              width="100%"
              height="100%"
              src={videoUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="bg-[#00E21B] hover:bg-[#00E21B]/90 text-black">
            {videoUrl ? "Close" : "Got it"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
