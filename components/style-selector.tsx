"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"

interface StyleSelectorProps {
  onClose: () => void
  onChangePreferences?: () => void
}

export default function StyleSelector({ onClose, onChangePreferences }: StyleSelectorProps) {
  const [theme, setTheme] = useState("")
  const [mood, setMood] = useState("")

  const handleSubmit = () => {
    console.log("Selected preferences:", { theme, mood })
    // Here you would typically send these preferences to your backend

    // Call the onChangePreferences callback to update videos
    if (onChangePreferences) {
      onChangePreferences()
    } else {
      onClose()
    }
  }

  return (
    <DrawerContent className="bg-white rounded-t-3xl">
      <DrawerHeader className="border-b border-gray-100 pb-4">
        <DrawerTitle className="text-gray-900 text-center text-xl">Choose your Style</DrawerTitle>
      </DrawerHeader>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Theme</label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="border-gray-300 focus:ring-[#00E21B] focus:border-[#00E21B]">
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Mood</label>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger className="border-gray-300 focus:ring-[#00E21B] focus:border-[#00E21B]">
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="energetic">Energetic</SelectItem>
              <SelectItem value="relaxed">Relaxed</SelectItem>
              <SelectItem value="inspirational">Inspirational</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
              <SelectItem value="entertaining">Entertaining</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DrawerFooter className="border-t border-gray-100 pt-4 space-y-2">
        <Button onClick={handleSubmit} className="bg-[#00E21B] hover:bg-[#00C818] text-black hover:shadow-md">
          Apply Changes
        </Button>

        {onChangePreferences && (
          <Button
            variant="outline"
            onClick={() => {
              onChangePreferences()
              onClose()
            }}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            New Search
          </Button>
        )}

        <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-50">
          Cancel
        </Button>
      </DrawerFooter>
    </DrawerContent>
  )
}

