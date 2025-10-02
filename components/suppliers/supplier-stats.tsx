import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, Clock, AlertTriangle, TrendingUp, Star } from "lucide-react"

const stats = [
  {
    title: "Total Suppliers",
    value: "89",
    change: "+5 this month",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Active Suppliers",
    value: "76",
    change: "85% of total",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Pending Approval",
    value: "8",
    change: "Avg 3 days",
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    title: "Under Review",
    value: "5",
    change: "Performance issues",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  {
    title: "Top Performers",
    value: "23",
    change: "4.5+ rating",
    icon: Star,
    color: "text-purple-600",
  },
  {
    title: "Cost Savings",
    value: "R156K",
    change: "+23% this month",
    icon: TrendingUp,
    color: "text-green-600",
  },
]

export function SupplierStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
