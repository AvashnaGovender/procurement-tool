"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

const trendData = [
  { month: "Jan", itEquipment: 450000, services: 320000, supplies: 180000, maintenance: 150000 },
  { month: "Feb", itEquipment: 520000, services: 340000, supplies: 165000, maintenance: 175000 },
  { month: "Mar", itEquipment: 480000, services: 380000, supplies: 190000, maintenance: 200000 },
  { month: "Apr", itEquipment: 610000, services: 290000, supplies: 170000, maintenance: 110000 },
  { month: "May", itEquipment: 580000, services: 420000, supplies: 200000, maintenance: 120000 },
  { month: "Jun", itEquipment: 650000, services: 350000, supplies: 180000, maintenance: 220000 },
]

const insights = [
  {
    title: "IT Equipment Spending Surge",
    description: "40% increase in Q2 due to infrastructure upgrades",
    type: "warning",
    icon: AlertTriangle,
    color: "text-yellow-600",
  },
  {
    title: "Services Cost Optimization",
    description: "15% reduction through contract renegotiation",
    type: "success",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Maintenance Budget Variance",
    description: "Seasonal fluctuation within expected range",
    type: "info",
    icon: TrendingUp,
    color: "text-blue-600",
  },
]

const chartConfig = {
  itEquipment: {
    label: "IT Equipment",
    color: "#3b82f6",
  },
  services: {
    label: "Services",
    color: "#10b981",
  },
  supplies: {
    label: "Supplies",
    color: "#f59e0b",
  },
  maintenance: {
    label: "Maintenance",
    color: "#ef4444",
  },
}

export function SpendTrends() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Spend Trends</CardTitle>
            <CardDescription>Monthly spending patterns by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="itEquipment"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="services"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="supplies"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="maintenance"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Important spending trends and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon
                return (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm mb-1">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="pt-4 border-t">
                <h4 className="font-medium text-foreground text-sm mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Monthly Spend</span>
                    <span className="font-medium">$1.18M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Highest Category</span>
                    <span className="font-medium">IT Equipment</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost Savings Rate</span>
                    <span className="font-medium text-green-600">12.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
