"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const categoryData = [
  {
    category: "IT Equipment",
    spend: 4500000,
    percentage: 32,
    change: "+12%",
    trend: "up",
    budget: 5000000,
    utilization: 90,
    topSupplier: "TechCorp Solutions",
  },
  {
    category: "Professional Services",
    spend: 3200000,
    percentage: 23,
    change: "+8%",
    trend: "up",
    budget: 3500000,
    utilization: 91,
    topSupplier: "Global Services Inc",
  },
  {
    category: "Office Supplies",
    spend: 1800000,
    percentage: 13,
    change: "-5%",
    trend: "down",
    budget: 2000000,
    utilization: 90,
    topSupplier: "Office Plus Ltd",
  },
  {
    category: "Maintenance",
    spend: 1500000,
    percentage: 11,
    change: "+15%",
    trend: "up",
    budget: 1600000,
    utilization: 94,
    topSupplier: "Industrial Supply Co",
  },
  {
    category: "Marketing",
    spend: 1200000,
    percentage: 8,
    change: "+3%",
    trend: "up",
    budget: 1300000,
    utilization: 92,
    topSupplier: "Creative Agency",
  },
  {
    category: "Transportation",
    spend: 980000,
    percentage: 7,
    change: "-8%",
    trend: "down",
    budget: 1100000,
    utilization: 89,
    topSupplier: "Logistics Pro",
  },
  {
    category: "Other",
    spend: 820000,
    percentage: 6,
    change: "+2%",
    trend: "up",
    budget: 900000,
    utilization: 91,
    topSupplier: "Various",
  },
]

export function CategoryAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend by Category</CardTitle>
        <CardDescription>Detailed breakdown of spending across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryData.map((category) => (
            <div key={category.category} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{category.category}</h4>
                  <Badge variant="outline">{category.percentage}%</Badge>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  {category.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={category.trend === "up" ? "text-green-600" : "text-red-600"}>{category.change}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spend: ${(category.spend / 1000000).toFixed(1)}M</span>
                  <span className="text-gray-600">Budget: ${(category.budget / 1000000).toFixed(1)}M</span>
                </div>
                <Progress value={category.utilization} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Utilization: {category.utilization}%</span>
                  <span>Top Supplier: {category.topSupplier}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
