import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, AlertTriangle, BarChart3, Calendar } from "lucide-react"

const forecastStats = [
  {
    title: "Predicted Spend",
    value: "$16.8M",
    change: "+18%",
    trend: "up",
    icon: TrendingUp,
    description: "Next 12 months",
  },
  {
    title: "Demand Accuracy",
    value: "87%",
    change: "+3%",
    trend: "up",
    icon: Target,
    description: "Model accuracy",
  },
  {
    title: "Peak Season",
    value: "Q4",
    change: "Nov-Dec",
    trend: "up",
    icon: Calendar,
    description: "Highest demand",
  },
  {
    title: "Risk Categories",
    value: "3",
    change: "High volatility",
    trend: "down",
    icon: AlertTriangle,
    description: "Require attention",
  },
  {
    title: "Forecast Horizon",
    value: "18 months",
    change: "Extended range",
    trend: "up",
    icon: BarChart3,
    description: "Prediction window",
  },
]

export function ForecastingOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {forecastStats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
