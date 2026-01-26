"use client"

import { Suspense, useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Sidebar } from "./sidebar"
import { UserMenu } from "@/components/user-menu"

interface RootLayoutWrapperProps {
  children: React.ReactNode
}

function RootLayoutWrapperContent({ children }: RootLayoutWrapperProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { status } = useSession()
  const [isInIframe, setIsInIframe] = useState(false)

  // Check if we're running inside an iframe
  useEffect(() => {
    setIsInIframe(window.self !== window.top)
  }, [])

  // Check if page is embedded (e.g., in an iframe) via query param or actual iframe detection
  const isEmbedded = searchParams.get('embedded') === 'true' || isInIframe

  // Pages that should NOT have the sidebar
  const noSidebarPaths = ['/login', '/supplier-onboarding-form']
  const shouldShowSidebar = !noSidebarPaths.some(path => pathname.startsWith(path)) && status === 'authenticated' && !isEmbedded

  if (!shouldShowSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden original:bg-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <RootLayoutWrapperContent>{children}</RootLayoutWrapperContent>
    </Suspense>
  )
}

