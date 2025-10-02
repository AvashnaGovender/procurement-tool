import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, Star } from "lucide-react"

const supplierSpendData = [
  {
    name: "TechCorp Solutions",
    spend: 2800000,
    percentage: 20,
    change: "+15%",
    trend: "up",
    rating: 4.8,
    orders: 145,
    category: "IT Equipment",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Global Services Inc",
    spend: 2100000,
    percentage: 15,
    change: "+8%",
    trend: "up",
    rating: 4.2,
    orders: 89,
    category: "Professional Services",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Office Plus Ltd",
    spend: 1650000,
    percentage: 12,
    change: "-3%",
    trend: "down",
    rating: 4.6,
    orders: 234,
    category: "Office Supplies",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Industrial Supply Co",
    spend: 1420000,
    percentage: 10,
    change: "+12%",
    trend: "up",
    rating: 4.1,
    orders: 67,
    category: "Maintenance",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Creative Agency",
    spend: 980000,
    percentage: 7,
    change: "+5%",
    trend: "up",
    rating: 4.5,
    orders: 23,
    category: "Marketing",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Logistics Pro",
    spend: 850000,
    percentage: 6,
    change: "-8%",
    trend: "down",
    rating: 3.9,
    orders: 156,
    category: "Transportation",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export function SupplierSpendAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Suppliers by Spend</CardTitle>
        <CardDescription>Highest spending suppliers and their performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {supplierSpendData.map((supplier, index) => (
            <div
              key={supplier.name}
              className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-sm font-medium text-gray-500 w-6">#{index + 1}</div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={supplier.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {supplier.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">{supplier.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {supplier.percentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{supplier.category}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{supplier.rating}</span>
                    </div>
                    <span>{supplier.orders} orders</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-gray-900 text-sm">${(supplier.spend / 1000000).toFixed(1)}M</div>
                <div className="flex items-center space-x-1 text-xs">
                  {supplier.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={supplier.trend === "up" ? "text-green-600" : "text-red-600"}>{supplier.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
