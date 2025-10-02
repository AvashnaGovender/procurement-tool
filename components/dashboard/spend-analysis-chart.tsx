"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"

const monthlySpendData = [
  { month: "Jan", spend: 980000, savings: 45000 },
  { month: "Feb", spend: 1100000, savings: 52000 },
  { month: "Mar", spend: 1250000, savings: 68000 },
  { month: "Apr", spend: 1180000, savings: 71000 },
  { month: "May", spend: 1320000, savings: 89000 },
  { month: "Jun", spend: 1200000, savings: 156000 },
]

const categorySpendData = [
  { category: "IT Equipment", value: 450000, color: "#3b82f6" },
  { category: "Office Supplies", value: 180000, color: "#10b981" },
  { category: "Services", value: 320000, color: "#f59e0b" },
  { category: "Maintenance", value: 150000, color: "#ef4444" },
  { category: "Other", value: 100000, color: "#8b5cf6" },
]

const chartConfig = {
  spend: {
    label: "Monthly Spend",
    color: "#3b82f6",
  },
  savings: {
    label: "Cost Savings",
    color: "#10b981",
  },
}

export function SpendAnalysisChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spend Trend</CardTitle>
          <CardDescription>Spending and savings over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySpendData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spend by Category</CardTitle>
          <CardDescription>Current month spending breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categorySpendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {categorySpendData.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.category}</span>
                </div>
                <span className="font-medium">R{(item.value / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
