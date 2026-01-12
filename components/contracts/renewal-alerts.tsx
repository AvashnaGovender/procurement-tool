import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, RefreshCw } from "lucide-react"

const renewalAlerts = [
  {
    id: "CNT-2024-003",
    title: "Maintenance Services",
    supplier: "Industrial Supply Co",
    daysToExpiry: 15,
    value: 1200000,
    priority: "high",
  },
  {
    id: "CNT-2024-001",
    title: "IT Services Agreement",
    supplier: "TechCorp Solutions",
    daysToExpiry: 45,
    value: 2400000,
    priority: "medium",
  },
  {
    id: "CNT-2024-006",
    title: "Security Services",
    supplier: "SecurePro Inc",
    daysToExpiry: 75,
    value: 680000,
    priority: "low",
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

export function RenewalAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span>Renewal Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renewalAlerts.map((alert) => (
            <div key={alert.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{alert.daysToExpiry} days</span>
                </div>
              </div>
              <h4 className="font-medium text-foreground text-sm mb-1">{alert.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{alert.supplier}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">${(alert.value / 1000000).toFixed(1)}M</span>
                <Button size="sm" variant="outline" className="h-6 text-xs bg-transparent">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Renew
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
