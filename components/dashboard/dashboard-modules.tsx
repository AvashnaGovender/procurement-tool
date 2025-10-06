"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  UserPlus,
  BarChart3,
  FileText,
  PieChart,
  TrendingUp,
  Star,
  LucideContrast as FileContract,
  Truck,
  Clock,
} from "lucide-react"
import { useEffect, useState } from "react"

const modules = [
  {
    title: "Supplier Onboarding",
    icon: UserPlus,
    color: "bg-blue-500",
    href: "/suppliers/onboard",
  },
  {
    title: "Purchase Requisition",
    icon: FileText,
    color: "bg-blue-500",
    href: "/requisitions",
    comingSoon: true,
  },
  {
    title: "Price Benchmarking",
    icon: BarChart3,
    color: "bg-blue-500",
    href: "/benchmarking",
  },
  {
    title: "Spend Analysis",
    icon: PieChart,
    color: "bg-blue-500",
    href: "/spend-analysis",
  },
  {
    title: "Demand Forecasting",
    icon: TrendingUp,
    color: "bg-blue-500",
    href: "/forecasting",
  },
  {
    title: "Supplier Evaluation",
    icon: Star,
    color: "bg-blue-500",
    href: "/evaluation",
  },
  {
    title: "Contract Management",
    icon: FileContract,
    color: "bg-blue-500",
    href: "/contracts",
  },
  {
    title: "Lead Time Tracking",
    icon: Clock,
    color: "bg-blue-500",
    href: "/lead-time",
  },
  {
    title: "Delivery Optimization",
    icon: Truck,
    color: "bg-blue-500",
    href: "/delivery",
  },
]

interface DashboardStats {
  totalSuppliers: {
    value: string
    change: number
    trend: 'up' | 'down'
  }
  activeOrders: {
    value: string
    change: number
    trend: 'up' | 'down'
  }
  totalSpend: {
    value: string
    change: number
    trend: 'up' | 'down'
  }
  averageLeadTime: {
    value: string
    change: number
    trend: 'up' | 'down'
  }
}

export function DashboardModules() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard/stats')
        const data = await response.json()
        
        if (data.success) {
          setStats(data.data)
        } else {
          setError(data.message || 'Failed to fetch statistics')
        }
      } catch (err) {
        setError('Failed to fetch dashboard statistics')
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatChangeText = (change: number, trend: 'up' | 'down') => {
    const absChange = Math.abs(change)
    const sign = trend === 'up' ? '↑' : '↓'
    return `${sign} ${absChange.toFixed(1)}% from last month`
  }

  const formatLeadTimeChange = (change: number, trend: 'up' | 'down') => {
    const absChange = Math.abs(change)
    const sign = trend === 'up' ? '↓' : '↑' // For lead time, down is better
    return `${sign} ${absChange.toFixed(1)} days from last month`
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border original:bg-slate-600 original:border-slate-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                    <div className="h-8 bg-muted rounded animate-pulse w-16"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-muted animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Failed to load dashboard statistics</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="border-border text-foreground hover:bg-accent original:border-slate-500 original:text-slate-300 original:hover:bg-slate-600"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border hover:bg-accent/50 transition-all original:bg-slate-600 original:border-slate-500 original:hover:bg-slate-550">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground original:text-slate-300">Total Suppliers</p>
                <p className="text-3xl font-bold text-foreground mt-2 original:text-white">{stats?.totalSuppliers.value || '0'}</p>
                <p className={`text-xs mt-1 ${stats?.totalSuppliers.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {stats?.totalSuppliers ? formatChangeText(stats.totalSuppliers.change, stats.totalSuppliers.trend) : 'No data'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:bg-accent/50 transition-all original:bg-slate-600 original:border-slate-500 original:hover:bg-slate-550">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground original:text-slate-300">Active Orders</p>
                <p className="text-3xl font-bold text-foreground mt-2 original:text-white">{stats?.activeOrders.value || '0'}</p>
                <p className={`text-xs mt-1 ${stats?.activeOrders.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {stats?.activeOrders ? formatChangeText(stats.activeOrders.change, stats.activeOrders.trend) : 'No data'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:bg-accent/50 transition-all original:bg-slate-600 original:border-slate-500 original:hover:bg-slate-550">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground original:text-slate-300">Total Spend</p>
                <p className="text-3xl font-bold text-foreground mt-2 original:text-white">{stats?.totalSpend.value || 'R0'}</p>
                <p className={`text-xs mt-1 ${stats?.totalSpend.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {stats?.totalSpend ? formatChangeText(stats.totalSpend.change, stats.totalSpend.trend) : 'No data'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:bg-accent/50 transition-all original:bg-slate-600 original:border-slate-500 original:hover:bg-slate-550">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground original:text-slate-300">Average Lead Time</p>
                <p className="text-3xl font-bold text-foreground mt-2 original:text-white">{stats?.averageLeadTime.value || 'N/A'}</p>
                <p className={`text-xs mt-1 ${stats?.averageLeadTime.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {stats?.averageLeadTime ? formatLeadTimeChange(stats.averageLeadTime.change, stats.averageLeadTime.trend) : 'No data'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <Card className="bg-card border-border original:bg-slate-600 original:border-slate-500">
        <CardHeader>
          <CardTitle className="text-foreground original:text-white">Procurement Modules</CardTitle>
          <CardDescription className="text-muted-foreground original:text-slate-300">Access all procurement management functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => {
              const Icon = module.icon
              const isClickable = module.title === "Supplier Onboarding" && !module.comingSoon

              if (isClickable) {
                return (
                  <a
                    key={module.title}
                    href={module.href}
                    className="group p-6 rounded-lg border border-border bg-accent/30 hover:bg-accent hover:border-primary transition-all cursor-pointer original:border-slate-500 original:bg-slate-550 original:hover:bg-slate-500 original:hover:border-blue-500"
                  >
                    <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 original:text-white">{module.title}</h3>
                    <p className="text-sm text-muted-foreground original:text-slate-300">Click to access</p>
                  </a>
                )
              }

              return (
                <div
                  key={module.title}
                  className="p-6 rounded-lg border border-border bg-accent/20 opacity-50 cursor-not-allowed original:border-slate-500 original:bg-slate-550/50"
                >
                  <div className={`w-12 h-12 rounded-lg ${module.color} opacity-50 flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-muted-foreground mb-1 original:text-slate-300">{module.title}</h3>
                  <p className="text-sm text-muted-foreground/70 original:text-slate-400">{module.comingSoon ? "Coming soon" : "Coming soon"}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
