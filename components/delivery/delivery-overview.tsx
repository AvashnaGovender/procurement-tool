import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Clock, Truck, CheckCircle, AlertTriangle } from "lucide-react"

const deliveryStats = [
  {
    title: "Avg Lead Time",
    value: "12.3 days",
    change: "-1.2 days",
    trend: "up",
    icon: Clock,
    description: "vs last month",
  },
  {
    title: "On-Time Delivery",
    value: "87%",
    change: "+3%",
    trend: "up",
    icon: CheckCircle,
    description: "vs last month",
  },
  {
    title: "Active Shipments",
    value: "156",
    change: "+12",
    trend: "up",
    icon: Truck,
    description: "in transit",
  },
  {
    title: "Delayed Deliveries",
    value: "23",
    change: "-8",
    trend: "up",
    icon: AlertTriangle,
    description: "this week",
  },
  {
    title: "Route Efficiency",
    value: "92%",
    change: "+5%",
    trend: "up",
    icon: TrendingUp,
    description: "optimization score",
  },
  {
    title: "Cost per Delivery",
    value: "$45",
    change: "-$3",
    trend: "up",
    icon: TrendingDown,
    description: "average cost",
  },
]

export function DeliveryOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {deliveryStats.map((stat) => {
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
