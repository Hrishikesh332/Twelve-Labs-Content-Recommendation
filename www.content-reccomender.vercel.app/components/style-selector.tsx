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
              <SelectItem value="animation">Animation</SelectItem>
              <SelectItem value="pixar">Pixar</SelectItem>
              <SelectItem value="disney">Disney</SelectItem>
              <SelectItem value="dreamworks">DreamWorks</SelectItem>
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="cartoon">Cartoon</SelectItem>
              <SelectItem value="stopmotion">Stop Motion</SelectItem>
              <SelectItem value="3d">3D Animation</SelectItem>
              <SelectItem value="classic">Classic Animation</SelectItem>
              <SelectItem value="superhero">Superhero</SelectItem>
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
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="comedy">Comedy</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="family">Family-Friendly</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="emotional">Emotional</SelectItem>
              <SelectItem value="musical">Musical</SelectItem>
              <SelectItem value="magical">Magical</SelectItem>
              <SelectItem value="nostalgic">Nostalgic</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
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

