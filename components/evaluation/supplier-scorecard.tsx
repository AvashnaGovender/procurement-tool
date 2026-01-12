import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, TrendingUp, TrendingDown } from "lucide-react"

const supplierScores = [
  {
    name: "TechCorp Solutions",
    overallScore: 4.8,
    quality: 95,
    delivery: 92,
    cost: 88,
    service: 96,
    compliance: 94,
    trend: "up",
    change: "+0.3",
    status: "excellent",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Office Plus Ltd",
    overallScore: 4.6,
    quality: 90,
    delivery: 88,
    cost: 92,
    service: 89,
    compliance: 91,
    trend: "up",
    change: "+0.1",
    status: "good",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Industrial Supply Co",
    overallScore: 4.2,
    quality: 85,
    delivery: 82,
    cost: 90,
    service: 84,
    compliance: 88,
    trend: "down",
    change: "-0.2",
    status: "good",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Global Services Inc",
    overallScore: 3.9,
    quality: 78,
    delivery: 75,
    cost: 85,
    service: 82,
    compliance: 80,
    trend: "down",
    change: "-0.4",
    status: "needs-improvement",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "default"
    case "good":
      return "secondary"
    case "needs-improvement":
      return "destructive"
    default:
      return "outline"
  }
}

export function SupplierScorecard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Scorecards</CardTitle>
        <CardDescription>Overall performance ratings and key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {supplierScores.map((supplier) => (
            <div key={supplier.name} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={supplier.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {supplier.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{supplier.overallScore}</span>
                      </div>
                      <Badge variant={getStatusColor(supplier.status)}>{supplier.status.replace("-", " ")}</Badge>
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

              <div className="grid grid-cols-5 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Quality</div>
                  <Progress value={supplier.quality} className="h-2" />
                  <div className="text-xs text-gray-600 mt-1">{supplier.quality}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Delivery</div>
                  <Progress value={supplier.delivery} className="h-2" />
                  <div className="text-xs text-gray-600 mt-1">{supplier.delivery}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Cost</div>
                  <Progress value={supplier.cost} className="h-2" />
                  <div className="text-xs text-gray-600 mt-1">{supplier.cost}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Service</div>
                  <Progress value={supplier.service} className="h-2" />
                  <div className="text-xs text-gray-600 mt-1">{supplier.service}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Compliance</div>
                  <Progress value={supplier.compliance} className="h-2" />
                  <div className="text-xs text-gray-600 mt-1">{supplier.compliance}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
