import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Clock, Target, CheckCircle, AlertTriangle } from "lucide-react"

const leadTimeMetrics = [
  {
    title: "Overall Avg Lead Time",
    value: "12.3 days",
    change: "-1.2 days",
    trend: "up",
    icon: Clock,
    description: "vs last month",
    progress: 75,
    target: "10 days target",
  },
  {
    title: "Best Performing Category",
    value: "IT Equipment",
    change: "8.5 days avg",
    trend: "up",
    icon: TrendingUp,
    description: "fastest delivery",
    progress: 90,
    target: "Exceeds target",
  },
  {
    title: "Target Achievement",
    value: "68%",
    change: "+5%",
    trend: "up",
    icon: Target,
    description: "suppliers on target",
    progress: 68,
    target: "80% goal",
  },
  {
    title: "Critical Delays",
    value: "12",
    change: "-3",
    trend: "up",
    icon: AlertTriangle,
    description: "orders delayed >20 days",
    progress: 25,
    target: "0 ideal",
  },
  {
    title: "Fastest Supplier",
    value: "TechCorp",
    change: "6.2 days avg",
    trend: "up",
    icon: CheckCircle,
    description: "best performance",
    progress: 95,
    target: "Benchmark",
  },
]

export function LeadTimeMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {leadTimeMetrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
              <div className="flex items-center space-x-1 text-xs mb-3">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>{metric.change}</span>
                <span className="text-gray-500">{metric.description}</span>
              </div>
              <div className="space-y-1">
                <Progress value={metric.progress} className="h-2" />
                <p className="text-xs text-gray-500">{metric.target}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
