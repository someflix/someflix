'use client'

import { siteConfig } from "@/configs/site"
import React, { useEffect, useState } from "react"
import MainNav from "@/components/navigation/main-nav"
import MobileNavBar from "@/components/mobile-nav-bar"
import AppInstallButton from "@/components/app-install-button"

const SiteHeader = () => {
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true)
    }
  }, [])

  return (
    <>
      <header className="sticky -top-12 z-50 bg-gradient-to-t from-transparent to-black">
        <div className="flex items-center justify-between">
          <MainNav items={siteConfig.mainNav} />
          {!isStandalone && <AppInstallButton />}
        </div>
      </header>
      {isStandalone && <MobileNavBar />}
    </>
  )
}

export default SiteHeader