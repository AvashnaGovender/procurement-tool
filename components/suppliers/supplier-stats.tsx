"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, Clock, AlertTriangle, TrendingUp, Star } from "lucide-react"
import { useEffect, useState } from "react"

interface SupplierStats {
  totalSuppliers: {
    value: string
    change: string
    trend: 'up' | 'down'
  }
  activeSuppliers: {
    value: string
    change: string
    trend: 'up' | 'down'
  }
  pendingApproval: {
    value: string
    change: string
    trend: 'up' | 'down'
  }
  underReview: {
    value: string
    change: string
    trend: 'up' | 'down'
  }
  topPerformers: {
    value: string
    change: string
    trend: 'up' | 'down'
  }
  costSavings: {
    value: string
    change: string
    trend: 'up' | 'down'
  }
}

const statConfig = [
  {
    title: "Total Suppliers",
    key: "totalSuppliers" as keyof SupplierStats,
    icon: Users,
    color: "text-blue-500",
  },
  {
    title: "Active Suppliers",
    key: "activeSuppliers" as keyof SupplierStats,
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    title: "Pending Approval",
    key: "pendingApproval" as keyof SupplierStats,
    icon: Clock,
    color: "text-yellow-500",
  },
  {
    title: "Under Review",
    key: "underReview" as keyof SupplierStats,
    icon: AlertTriangle,
    color: "text-red-500",
  },
  {
    title: "Top Performers",
    key: "topPerformers" as keyof SupplierStats,
    icon: Star,
    color: "text-purple-500",
  },
  {
    title: "Cost Savings",
    key: "costSavings" as keyof SupplierStats,
    icon: TrendingUp,
    color: "text-green-500",
  },
]

export function SupplierStats() {
  const [stats, setStats] = useState<SupplierStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/suppliers/stats')
        const data = await response.json()
        
        if (data.success) {
          setStats(data.data)
        } else {
          setError(data.error || 'Failed to fetch statistics')
        }
      } catch (err) {
        setError('Failed to fetch supplier statistics')
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statConfig.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400 mb-2">Failed to load supplier statistics</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statConfig.map((stat) => {
        const Icon = stat.icon
        const statData = stats?.[stat.key]
        
        return (
          <Card key={stat.title} className="bg-card border-border hover:bg-accent/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{statData?.value || '0'}</div>
              <p className="text-xs text-muted-foreground mt-1">{statData?.change || 'No data'}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
