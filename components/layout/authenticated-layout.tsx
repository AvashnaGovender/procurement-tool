"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { UserMenu } from "@/components/user-menu"

interface AuthenticatedLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export function AuthenticatedLayout({ children, title, subtitle }: AuthenticatedLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden original:bg-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 original:bg-white original:border-slate-200">
          <div>
            {title && <h1 className="text-2xl font-bold text-foreground original:text-slate-800">{title}</h1>}
            {subtitle && <p className="text-sm text-muted-foreground original:text-slate-600">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

