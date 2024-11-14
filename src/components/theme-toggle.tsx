"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle({ isMobile = false }: { isMobile?: boolean }) {
  const { theme, setTheme } = useTheme()

  if (isMobile) {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium">Dark mode</span>
        <div className="relative">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative h-8 w-16 rounded-full bg-secondary p-1 shadow-inner hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex h-full w-full items-center justify-between">
              <Sun className="h-4 w-4 text-yellow-500" />
              <Moon className="h-4 w-4 text-blue-500" />
            </div>
            <div
              className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                theme === "dark" ? "translate-x-8" : "translate-x-0"
              }`}
            />
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="hover:bg-transparent"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}