import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, TrendingUp } from "lucide-react"

const leadTimeAlerts = [
  {
    id: "LT-001",
    title: "Critical Delay",
    description: "Industrial Supply Co order delayed 8 days beyond target",
    severity: "high",
    category: "IT Equipment",
    impact: "High",
    action: "Contact supplier immediately",
  },
  {
    id: "LT-002",
    title: "Lead Time Increase",
    description: "Office supplies category showing 15% increase in lead times",
    severity: "medium",
    category: "Office Supplies",
    impact: "Medium",
    action: "Review supplier performance",
  },
  {
    id: "LT-003",
    title: "Performance Improvement",
    description: "Maintenance services lead time reduced by 20%",
    severity: "low",
    category: "Maintenance",
    impact: "Positive",
    action: "Document best practices",
  },
  {
    id: "LT-004",
    title: "Target Exceeded",
    description: "Services category consistently exceeding lead time targets",
    severity: "medium",
    category: "Services",
    impact: "Medium",
    action: "Evaluate alternative suppliers",
  },
]

export function LeadTimeAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Lead Time Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leadTimeAlerts.map((alert) => (
            <div key={alert.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "destructive"
                          : alert.severity === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  {alert.severity === "high" ? (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  ) : alert.severity === "medium" ? (
                    <Clock className="h-3 w-3 text-orange-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  <span>{alert.category}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Impact: {alert.impact}</span>
                <span className="text-blue-600 font-medium">{alert.action}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
