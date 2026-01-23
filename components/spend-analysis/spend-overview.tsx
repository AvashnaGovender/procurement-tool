import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Target, PieChart, BarChart3 } from "lucide-react"

const overviewStats = [
  {
    title: "Total Spend",
    value: "R14.2M",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
    description: "vs last year",
    progress: 85,
    target: "R16.7M budget",
  },
  {
    title: "Cost Savings",
    value: "R1.8M",
    change: "+23%",
    trend: "up",
    icon: TrendingUp,
    description: "vs last year",
    progress: 90,
    target: "R2M target",
  },
  {
    title: "Budget Utilization",
    value: "85%",
    change: "-5%",
    trend: "down",
    icon: Target,
    description: "of annual budget",
    progress: 85,
    target: "15% remaining",
  },
  {
    title: "Active Categories",
    value: "12",
    change: "+2",
    trend: "up",
    icon: PieChart,
    description: "spending categories",
    progress: 75,
    target: "16 total",
  },
  {
    title: "Supplier Diversity",
    value: "89",
    change: "+5",
    trend: "up",
    icon: BarChart3,
    description: "active suppliers",
    progress: 80,
    target: "110 target",
  },
]

export function SpendOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {overviewStats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs mb-3">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
                <span className="text-gray-500">{stat.description}</span>
              </div>
              <div className="space-y-1">
                <Progress value={stat.progress} className="h-2" />
                <p className="text-xs text-gray-500">{stat.target}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
