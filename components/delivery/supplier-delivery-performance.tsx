import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react"

const supplierPerformance = [
  {
    name: "TechCorp Solutions",
    onTimeDelivery: 95,
    avgLeadTime: 8.5,
    targetLeadTime: 10,
    deliveries: 45,
    trend: "up",
    change: "+3%",
    rating: "excellent",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Office Plus Ltd",
    onTimeDelivery: 88,
    avgLeadTime: 12.2,
    targetLeadTime: 12,
    deliveries: 32,
    trend: "up",
    change: "+1%",
    rating: "good",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Industrial Supply Co",
    onTimeDelivery: 82,
    avgLeadTime: 15.8,
    targetLeadTime: 14,
    deliveries: 28,
    trend: "down",
    change: "-2%",
    rating: "needs-improvement",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Global Services Inc",
    onTimeDelivery: 75,
    avgLeadTime: 18.3,
    targetLeadTime: 16,
    deliveries: 19,
    trend: "down",
    change: "-5%",
    rating: "poor",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Creative Agency",
    onTimeDelivery: 92,
    avgLeadTime: 9.1,
    targetLeadTime: 8,
    deliveries: 15,
    trend: "up",
    change: "+2%",
    rating: "good",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const getRatingColor = (rating: string) => {
  switch (rating) {
    case "excellent":
      return "default"
    case "good":
      return "secondary"
    case "needs-improvement":
      return "outline"
    case "poor":
      return "destructive"
    default:
      return "outline"
  }
}

export function SupplierDeliveryPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Delivery Performance</CardTitle>
        <CardDescription>On-time delivery rates and lead time performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {supplierPerformance.map((supplier) => (
            <div key={supplier.name} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={supplier.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {supplier.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{supplier.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getRatingColor(supplier.rating)} className="text-xs">
                        {supplier.rating.replace("-", " ")}
                      </Badge>
                      <span className="text-xs text-gray-500">{supplier.deliveries} deliveries</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  {supplier.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={supplier.trend === "up" ? "text-green-600" : "text-red-600"}>{supplier.change}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-gray-600">On-Time Delivery</span>
                    </div>
                    <span className="font-medium">{supplier.onTimeDelivery}%</span>
                  </div>
                  <Progress value={supplier.onTimeDelivery} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center space-x-1 text-gray-600 mb-1">
                      <Clock className="h-3 w-3" />
                      <span>Avg Lead Time</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{supplier.avgLeadTime} days</span>
                      <span
                        className={supplier.avgLeadTime <= supplier.targetLeadTime ? "text-green-600" : "text-red-600"}
                      >
                        (Target: {supplier.targetLeadTime})
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Performance</div>
                    <div className="font-medium">
                      {supplier.avgLeadTime <= supplier.targetLeadTime ? "✓ On Target" : "⚠ Over Target"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
