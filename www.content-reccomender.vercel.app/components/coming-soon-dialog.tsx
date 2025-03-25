"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CalendarClock } from 'lucide-react'

interface ComingSoonDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
}

export function ComingSoonDialog({ isOpen, onClose, title, description }: ComingSoonDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F8F7] mb-4">
            <CalendarClock className="h-6 w-6 text-[#00E21B]" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-center pt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onClose}
            className="bg-[#00E21B] hover:bg-[#00E21B]/90 text-black"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
