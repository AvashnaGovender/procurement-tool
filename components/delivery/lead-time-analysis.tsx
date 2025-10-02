"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, ResponsiveContainer, Line, ComposedChart, Bar } from "recharts"

const leadTimeData = [
  { month: "Jan", avgLeadTime: 14.2, targetLeadTime: 12, onTimeDelivery: 82, totalDeliveries: 145 },
  { month: "Feb", avgLeadTime: 13.8, targetLeadTime: 12, onTimeDelivery: 85, totalDeliveries: 132 },
  { month: "Mar", avgLeadTime: 15.1, targetLeadTime: 12, onTimeDelivery: 78, totalDeliveries: 168 },
  { month: "Apr", avgLeadTime: 13.2, targetLeadTime: 12, onTimeDelivery: 88, totalDeliveries: 156 },
  { month: "May", avgLeadTime: 12.9, targetLeadTime: 12, onTimeDelivery: 89, totalDeliveries: 174 },
  { month: "Jun", avgLeadTime: 12.3, targetLeadTime: 12, onTimeDelivery: 87, totalDeliveries: 189 },
]

const supplierLeadTimeData = [
  { supplier: "TechCorp", leadTime: 8.5, target: 10, performance: 95 },
  { supplier: "Office Plus", leadTime: 12.2, target: 12, performance: 88 },
  { supplier: "Industrial", leadTime: 15.8, target: 14, performance: 82 },
  { supplier: "Global Services", leadTime: 18.3, target: 16, performance: 75 },
  { supplier: "Creative Agency", leadTime: 9.1, target: 8, performance: 92 },
]

const chartConfig = {
  avgLeadTime: {
    label: "Avg Lead Time",
    color: "#3b82f6",
  },
  targetLeadTime: {
    label: "Target Lead Time",
    color: "#ef4444",
  },
  onTimeDelivery: {
    label: "On-Time Delivery %",
    color: "#10b981",
  },
  totalDeliveries: {
    label: "Total Deliveries",
    color: "#f59e0b",
  },
}

export function LeadTimeAnalysis() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead Time Trends</CardTitle>
          <CardDescription>Monthly lead time performance vs targets</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={leadTimeData}>
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar yAxisId="right" dataKey="totalDeliveries" fill="#f59e0b" opacity={0.3} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgLeadTime"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="targetLeadTime"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#ef4444" }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="onTimeDelivery"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Lead Time Comparison</CardTitle>
          <CardDescription>Lead time performance by supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supplierLeadTimeData.map((supplier) => (
              <div key={supplier.supplier} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{supplier.supplier}</h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>Avg: {supplier.leadTime} days</span>
                    <span>Target: {supplier.target} days</span>
                    <span className={supplier.leadTime <= supplier.target ? "text-green-600" : "text-red-600"}>
                      {supplier.leadTime <= supplier.target ? "✓ On Target" : "⚠ Over Target"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{supplier.performance}%</div>
                  <div className="text-xs text-gray-500">Performance</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
