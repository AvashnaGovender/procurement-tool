import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, TrendingUp, Clock, DollarSign } from "lucide-react"

const topSuppliers = [
  {
    name: "TechCorp Solutions",
    rating: 4.8,
    onTimeDelivery: 95,
    costSavings: 12,
    status: "excellent",
    orders: 45,
  },
  {
    name: "Office Plus Ltd",
    rating: 4.6,
    onTimeDelivery: 88,
    costSavings: 8,
    status: "good",
    orders: 32,
  },
  {
    name: "Industrial Supply Co",
    rating: 4.2,
    onTimeDelivery: 82,
    costSavings: 15,
    status: "good",
    orders: 28,
  },
  {
    name: "Global Services Inc",
    rating: 3.9,
    onTimeDelivery: 75,
    costSavings: 5,
    status: "average",
    orders: 19,
  },
]

export function SupplierPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Supplier Performance</CardTitle>
        <CardDescription>Key metrics for your best suppliers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSuppliers.map((supplier) => (
            <div key={supplier.name} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{supplier.rating}</span>
                    <span className="text-sm text-gray-400">({supplier.orders} orders)</span>
                  </div>
                </div>
                <Badge
                  variant={
                    supplier.status === "excellent" ? "default" : supplier.status === "good" ? "secondary" : "outline"
                  }
                >
                  {supplier.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-1 text-gray-600 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>On-time</span>
                  </div>
                  <Progress value={supplier.onTimeDelivery} className="h-2" />
                  <span className="text-xs text-gray-500">{supplier.onTimeDelivery}%</span>
                </div>

                <div>
                  <div className="flex items-center space-x-1 text-gray-600 mb-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Savings</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-600 font-medium">{supplier.costSavings}%</span>
                  </div>
                </div>

                <div>
                  <div className="text-gray-600 mb-1">Orders</div>
                  <div className="font-medium">{supplier.orders}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
