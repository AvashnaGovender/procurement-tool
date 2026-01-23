import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, MapPin, Clock, DollarSign, Lightbulb, AlertTriangle } from "lucide-react"

const optimizationInsights = [
  {
    title: "Route Consolidation",
    description: "Combine 3 Chicago deliveries to save $180 in shipping costs",
    type: "cost-saving",
    priority: "high",
    savings: 180,
    icon: MapPin,
    color: "text-green-600",
  },
  {
    title: "Lead Time Alert",
    description: "Industrial Supply Co consistently exceeds target by 2.5 days",
    type: "performance",
    priority: "medium",
    impact: "2.5 days",
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    title: "Bulk Shipping Opportunity",
    description: "Schedule weekly bulk shipments to reduce per-unit costs by 15%",
    type: "optimization",
    priority: "medium",
    savings: 450,
    icon: TrendingUp,
    color: "text-blue-600",
  },
  {
    title: "Supplier Diversification",
    description: "Consider backup suppliers for critical items with long lead times",
    type: "risk-mitigation",
    priority: "low",
    impact: "Risk reduction",
    icon: AlertTriangle,
    color: "text-orange-600",
  },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive"
    case "medium":
      return "secondary"
    case "low":
      return "outline"
    default:
      return "outline"
  }
}

export function OptimizationInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span>Optimization Insights</span>
        </CardTitle>
        <CardDescription>AI-powered recommendations for delivery optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {optimizationInsights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                      <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {insight.type.replace("-", " ")}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        {insight.savings && (
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <DollarSign className="h-3 w-3" />
                            <span>${insight.savings}</span>
                          </div>
                        )}
                        {insight.impact && !insight.savings && (
                          <span className="text-xs text-gray-600">{insight.impact}</span>
                        )}
                        <Button size="sm" variant="outline" className="h-6 text-xs bg-transparent">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 text-sm mb-1">Optimization Summary</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <div className="flex justify-between">
              <span>Potential Monthly Savings:</span>
              <span className="font-medium">$1,260</span>
            </div>
            <div className="flex justify-between">
              <span>Lead Time Improvement:</span>
              <span className="font-medium">-2.1 days avg</span>
            </div>
            <div className="flex justify-between">
              <span>Route Efficiency Gain:</span>
              <span className="font-medium">+8%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
