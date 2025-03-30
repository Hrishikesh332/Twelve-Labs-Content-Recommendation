"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"

// Update the interface to include showSearchForm parameter
interface StyleSelectorProps {
  onClose: () => void
  onChangePreferences?: (theme?: string, mood?: string, showSearchForm?: boolean) => void
  initialTheme?: string
  initialMood?: string
}

export default function StyleSelector({
  onClose,
  onChangePreferences,
  initialTheme = "",
  initialMood = "",
}: StyleSelectorProps) {
  const [theme, setTheme] = useState(initialTheme)
  const [mood, setMood] = useState(initialMood)

  // Update local state when props change
  useEffect(() => {
    setTheme(initialTheme)
    setMood(initialMood)
  }, [initialTheme, initialMood])

  const handleSubmit = () => {
    console.log("Selected preferences:", { theme, mood })
    // Call the onChangePreferences callback to update videos with the new theme and mood
    if (onChangePreferences) {
      onChangePreferences(theme, mood)
    } else {
      onClose()
    }
  }

  // Update the handleNewSearch function to properly reset and show the search form
  const handleNewSearch = () => {
    console.log("Resetting preferences and starting new search")
    // Reset theme and mood and trigger new search
    if (onChangePreferences) {
      // Pass empty strings to reset theme and mood, and add a special flag to show the search form
      onChangePreferences("", "", true)
    }
    onClose()
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
              <SelectItem value="animation">Animation - General Animated Content</SelectItem>
              <SelectItem value="3d-animation">3D Animation - Computer-Generated Graphics</SelectItem>
              <SelectItem value="traditional-animation">Traditional - Hand-Drawn Style</SelectItem>
              <SelectItem value="stop-motion">Stop Motion - Frame-by-Frame Animation</SelectItem>
              <SelectItem value="anime">Anime - Japanese Animation Style</SelectItem>
              <SelectItem value="cartoon">Cartoon - Stylized Short-Form</SelectItem>
              <SelectItem value="fantasy">Fantasy - Magical Worlds & Creatures</SelectItem>
              <SelectItem value="sci-fi">Sci-Fi - Futuristic & Technology-Based</SelectItem>
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
              <SelectItem value="adventure">Adventure - Exciting Journeys & Quests</SelectItem>
              <SelectItem value="comedy">Comedy - Humorous & Lighthearted</SelectItem>
              <SelectItem value="fantasy">Fantasy - Magical & Enchanting</SelectItem>
              <SelectItem value="family">Family - All-Ages Entertainment</SelectItem>
              <SelectItem value="action">Action - Fast-Paced & Thrilling</SelectItem>
              <SelectItem value="emotional">Emotional - Heartfelt & Moving</SelectItem>
              <SelectItem value="musical">Musical - Song & Dance Features</SelectItem>
              <SelectItem value="magical">Magical - Enchanted & Supernatural</SelectItem>
              <SelectItem value="nostalgic">Nostalgic - Reminiscent & Classic</SelectItem>
              <SelectItem value="epic">Epic - Grand Scale & Heroic</SelectItem>
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
            onClick={handleNewSearch}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset & New Search
          </Button>
        )}

        <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-50">
          Cancel
        </Button>
      </DrawerFooter>
    </DrawerContent>
  )
}

