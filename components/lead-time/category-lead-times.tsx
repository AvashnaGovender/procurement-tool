import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"

const categoryData = [
  {
    category: "IT Equipment",
    avgLeadTime: 14,
    target: 12,
    trend: "up",
    change: "+2 days",
    orders: 45,
    onTime: 78,
  },
  {
    category: "Office Supplies",
    avgLeadTime: 8,
    target: 10,
    trend: "down",
    change: "-1 day",
    orders: 89,
    onTime: 92,
  },
  {
    category: "Services",
    avgLeadTime: 21,
    target: 18,
    trend: "up",
    change: "+3 days",
    orders: 23,
    onTime: 65,
  },
  {
    category: "Maintenance",
    avgLeadTime: 16,
    target: 15,
    trend: "down",
    change: "-2 days",
    orders: 34,
    onTime: 85,
  },
]

export function CategoryLeadTimes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span>Lead Times by Category</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryData.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-foreground">{category.category}</span>
                  <div className="flex items-center space-x-1 text-sm">
                    {category.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    )}
                    <span className={category.trend === "up" ? "text-red-600" : "text-green-600"}>
                      {category.change}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-foreground">{category.avgLeadTime} days</div>
                  <div className="text-xs text-muted-foreground">Target: {category.target} days</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>On-time delivery</span>
                  <span>{category.onTime}%</span>
                </div>
                <Progress value={category.onTime} className="h-2" />
              </div>
              <div className="text-xs text-muted-foreground">{category.orders} orders this month</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
