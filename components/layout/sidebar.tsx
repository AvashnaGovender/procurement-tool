"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  TrendingUp, 
  Settings, 
  LogOut,
  Users,
  FileText,
  BarChart3,
  ClipboardList,
  CheckCircle
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  comingSoon: boolean
  roles?: string[]
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, comingSoon: false },
  { name: "Analytics", href: "/analytics", icon: TrendingUp, comingSoon: true },
  { name: "Suppliers", href: "/suppliers", icon: Users, comingSoon: false },
  { name: "Supplier Initiations", href: "/admin/supplier-initiations", icon: ClipboardList, comingSoon: false },
  { name: "Approvals", href: "/admin/approvals", icon: CheckCircle, comingSoon: false, roles: ["MANAGER", "PROCUREMENT_MANAGER"] },
  { name: "Reports", href: "/reports", icon: BarChart3, comingSoon: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }

  const handleComingSoon = (itemName: string) => {
    toast.info(`${itemName} is coming soon!`, {
      description: "This feature is currently under development.",
      duration: 3000,
    })
  }

  return (
    <div className="flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border original:bg-slate-200 original:border-slate-300">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-sidebar-border original:border-slate-300">
        <Image
          src="/logo.png"
          alt="Schauenburg Systems"
          width={200}
          height={60}
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation
          .filter((item) => {
            // Filter by role if roles are specified
            if (item.roles && session?.user?.role) {
              return item.roles.includes(session.user.role)
            }
            // Show item if no role restriction or if user has no role (shouldn't happen but safe fallback)
            return !item.roles || !session?.user?.role
          })
          .map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          
          if (item.comingSoon) {
            return (
              <button
                key={item.name}
                onClick={() => handleComingSoon(item.name)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full text-left
                  text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer opacity-75
                  original:text-slate-600 original:hover:bg-slate-300 original:hover:text-slate-800
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </button>
            )
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20 original:bg-blue-600 original:text-white original:shadow-blue-600/20" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground original:text-slate-700 original:hover:bg-slate-300 original:hover:text-slate-900"
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border original:border-slate-300">
        <Link
          href="/settings"
            className={`
              flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all
              ${pathname === "/settings" 
                ? "bg-sidebar-accent text-sidebar-accent-foreground original:bg-slate-300 original:text-slate-900" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground original:text-slate-700 original:hover:bg-slate-300 original:hover:text-slate-900"
              }
            `}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-8 py-4 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all w-full original:text-slate-700 original:hover:bg-slate-300 original:hover:text-slate-900"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}

