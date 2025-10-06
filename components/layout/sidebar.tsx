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
  BarChart3
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, comingSoon: false },
  { name: "Analytics", href: "/analytics", icon: TrendingUp, comingSoon: true },
  { name: "Suppliers", href: "/suppliers", icon: Users, comingSoon: false },
  { name: "Reports", href: "/reports", icon: BarChart3, comingSoon: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

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
    <div className="flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border original:bg-slate-600 original:border-slate-500">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-sidebar-border original:border-slate-500">
        <Image
          src="/logo.png"
          alt="Schauenburg Systems"
          width={200}
          height={60}
          className="object-contain brightness-0 invert"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          
          if (item.comingSoon) {
            return (
              <button
                key={item.name}
                onClick={() => handleComingSoon(item.name)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full text-left
                  text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer opacity-75
                  original:text-slate-200 original:hover:bg-slate-500 original:hover:text-white
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
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground original:text-slate-200 original:hover:bg-slate-500 original:hover:text-white"
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
      <div className="border-t border-sidebar-border original:border-slate-500">
        <Link
          href="/settings"
            className={`
              flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all
              ${pathname === "/settings" 
                ? "bg-sidebar-accent text-sidebar-accent-foreground original:bg-slate-500 original:text-white" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground original:text-slate-200 original:hover:bg-slate-500 original:hover:text-white"
              }
            `}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-8 py-4 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all w-full original:text-slate-200 original:hover:bg-slate-500 original:hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}

