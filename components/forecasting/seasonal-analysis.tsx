"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"

const seasonalData = [
  { category: "IT Equipment", q1: 850000, q2: 920000, q3: 780000, q4: 1450000 },
  { category: "Office Supplies", q1: 320000, q2: 280000, q3: 310000, q4: 420000 },
  { category: "Services", q1: 680000, q2: 750000, q3: 690000, q4: 580000 },
  { category: "Maintenance", q1: 450000, q2: 380000, q3: 520000, q4: 350000 },
  { category: "Marketing", q1: 280000, q2: 320000, q3: 450000, q4: 380000 },
]

const chartConfig = {
  q1: {
    label: "Q1",
    color: "#3b82f6",
  },
  q2: {
    label: "Q2",
    color: "#10b981",
  },
  q3: {
    label: "Q3",
    color: "#f59e0b",
  },
  q4: {
    label: "Q4",
    color: "#ef4444",
  },
}

export function SeasonalAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seasonal Demand Patterns</CardTitle>
        <CardDescription>Quarterly spending patterns by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonalData} layout="horizontal">
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="q1" stackId="a" fill="#3b82f6" />
              <Bar dataKey="q2" stackId="a" fill="#10b981" />
              <Bar dataKey="q3" stackId="a" fill="#f59e0b" />
              <Bar dataKey="q4" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
