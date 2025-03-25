"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Github, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Features", path: "#features" },
    { name: "Blog", path: "/blog" },
  ]

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <nav
          className={cn(
            "w-full max-w-3xl transition-all duration-300 flex items-center justify-between rounded-full px-6",
            scrolled
              ? "bg-[#F4F3F3]/85 backdrop-blur-md border border-[#D3D1CF]/30 py-2 shadow-sm"
              : "bg-[#F4F3F3]/70 py-3 border border-[#D3D1CF]/20",
          )}
        >
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group">
              <svg
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 204 146.6"
                width="28px"
                height="28px"
                className="mr-2 transition-transform duration-300 group-hover:scale-105"
              >
                <defs>
                  <style>{`.st0 { fill: #1d1c1b; }`}</style>
                </defs>
                <rect className="st0" x="43.9" y="50.3" width="64.3" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" y="50.3" width="35.3" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="124.1" y="50.3" width="40.3" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="129.9" y="37.8" width="34.5" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="168.9" y="37.8" width="27.3" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="157.3" y="25" width="31.1" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="167.1" y="12.5" width="9.2" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="74.3" y="112.6" width="15.9" height="9" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="101.8" y="112.6" width="10.4" height="9" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="117" y="112.6" width="28" height="9" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="131" y="100.1" width="11.6" height="9" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="52.4" y="112.6" width="9.2" height="9" rx="2.6" ry="2.6"></rect>
                <path
                  className="st0"
                  d="M94.7,127.7c0-1.4,1.1-2.6,2.6-2.6h4c1.4,0,2.6,1.1,2.6,2.6v3.9c0,1.4-1.1,2.6-2.6,2.6h-4c-1.4,0-2.6-1.1-2.6-2.6v-3.9Z"
                ></path>
                <rect className="st0" x="85.8" y="137.6" width="8.7" height="9" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="120.4" width="11.4" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="55.8" y="37.8" width="29" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="109.7" y="12.5" width="17.6" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="98.8" y="25" width="28.5" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="187.4" y="50.3" width="16.6" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="30.6" y="62.8" width="82.1" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="105.1" y="87.8" width="32.1" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="43.9" y="75.3" width="104.3" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="27.9" y="87.8" width="38.8" height="8.7" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="63.3" y="100.1" width="12.7" height="9" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="108.1" y="100.1" width="13.7" height="9" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="39.8" y="100.1" width="12.9" height="9" rx="2.6" ry="2.6"></rect>
                <rect className="st0" x="124.1" y="62.8" width="33.1" height="8.7" rx="2.6" ry="2.6"></rect>
              </svg>
              <span className="text-[#1D1C1B] font-medium text-base tracking-tight group-hover:text-[#00E21B] transition-colors duration-300">
                Content Recommender
              </span>
            </Link>
          </div>

          {/* Centered Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center bg-[#F8F8F7]/50 backdrop-blur-sm rounded-full px-1.5 py-1 border border-[#D3D1CF]/30">
              {navItems.map((item) => {
                const isActive = pathname === item.path

                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={cn(
                      "px-4 py-1.5 mx-0.5 text-sm font-medium transition-all duration-200 rounded-full",
                      isActive
                        ? "bg-white text-[#1D1C1B] font-semibold shadow-sm"
                        : "text-[#1D1C1B]/70 hover:text-[#1D1C1B] hover:bg-white/50",
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center">
            <Link
              href="https://github.com/Hrishikesh332/Twelve-Labs-Content-Recommendation"
              target="_blank"
              className="text-[#1D1C1B]/70 hover:text-[#1D1C1B] transition-colors p-2 rounded-full hover:bg-[#F8F8F7]"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-[#1D1C1B] p-1.5 rounded-full hover:bg-[#F8F8F7] transition-all duration-200"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#F4F3F3]/95 backdrop-blur-md transform transition-all duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="pt-20 pb-6 px-6 h-full flex flex-col">
          <div className="space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                    isActive
                      ? "bg-white text-[#1D1C1B] shadow-sm"
                      : "text-[#1D1C1B]/70 hover:bg-white/50 hover:text-[#1D1C1B]",
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-[#D3D1CF]/30">
            <div className="flex items-center justify-center">
              <Link
                href="https://github.com"
                target="_blank"
                className="text-[#1D1C1B]/70 hover:text-[#1D1C1B] transition-colors p-2 rounded-full hover:bg-[#F8F8F7]"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

