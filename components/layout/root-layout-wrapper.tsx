"use client"

import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Sidebar } from "./sidebar"
import { UserMenu } from "@/components/user-menu"

interface RootLayoutWrapperProps {
  children: React.ReactNode
}

export function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  const pathname = usePathname()
  const { status } = useSession()

  // Pages that should NOT have the sidebar
  const noSidebarPaths = ['/login', '/supplier-onboarding-form']
  const shouldShowSidebar = !noSidebarPaths.some(path => pathname.startsWith(path)) && status === 'authenticated'

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

