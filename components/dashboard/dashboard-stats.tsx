import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const stats = [
  {
    title: "Total Requisitions",
    value: "247",
    change: "+12%",
    trend: "up",
    icon: FileText,
    description: "vs last month",
    progress: 75,
    target: "300 target",
  },
  {
    title: "Monthly Spend",
    value: "R1.2M", // Converted from $$ to Rands
    change: "-8%",
    trend: "down",
    icon: DollarSign,
    description: "vs last month",
    progress: 60,
    target: "R2M budget", // Converted from $$ to Rands
  },
  {
    title: "Active Suppliers",
    value: "89",
    change: "+5%",
    trend: "up",
    icon: Users,
    description: "vs last month",
    progress: 90,
    target: "100 planned",
  },
  {
    title: "Avg Lead Time",
    value: "12 days",
    change: "-2 days",
    trend: "up",
    icon: Clock,
    description: "improvement",
    progress: 70,
    target: "10 days target",
  },
  {
    title: "Pending Approvals",
    value: "23",
    change: "-15%",
    trend: "up",
    icon: FileText,
    description: "vs last week",
    progress: 25,
    target: "0 ideal",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 text-left">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 flex-shrink-0" />
                )}
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
                <span className="text-gray-500">{stat.description}</span>
              </div>
              <div className="space-y-2">
                <Progress value={stat.progress} className="h-2" />
                <p className="text-xs text-gray-500 text-left">{stat.target}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
