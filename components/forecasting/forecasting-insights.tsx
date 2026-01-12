import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, Target, Lightbulb } from "lucide-react"

const insights = [
  {
    title: "Q4 Demand Surge",
    description: "IT equipment demand expected to increase 35% in Q4",
    type: "forecast",
    priority: "high",
    icon: TrendingUp,
    color: "text-blue-600",
  },
  {
    title: "Supply Risk Alert",
    description: "Office supplies showing high volatility patterns",
    type: "risk",
    priority: "medium",
    icon: AlertTriangle,
    color: "text-yellow-600",
  },
  {
    title: "Budget Optimization",
    description: "Consider bulk purchasing for maintenance items",
    type: "recommendation",
    priority: "low",
    icon: Target,
    color: "text-green-600",
  },
  {
    title: "Seasonal Pattern",
    description: "Marketing spend typically peaks in March and September",
    type: "insight",
    priority: "low",
    icon: Lightbulb,
    color: "text-purple-600",
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

export function ForecastingInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>Key findings and recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
                      <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {insight.type}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
