"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"

const performanceData = [
  { metric: "Quality", techCorp: 4.8, officePlus: 4.6, industrial: 4.2, global: 3.9, average: 4.4 },
  { metric: "Delivery", techCorp: 4.5, officePlus: 4.4, industrial: 4.1, global: 3.7, average: 4.2 },
  { metric: "Cost", techCorp: 4.2, officePlus: 4.6, industrial: 4.5, global: 4.2, average: 4.4 },
  { metric: "Service", techCorp: 4.9, officePlus: 4.5, industrial: 4.2, global: 4.1, average: 4.4 },
  { metric: "Compliance", techCorp: 4.7, officePlus: 4.6, industrial: 4.4, global: 4.0, average: 4.4 },
]

const chartConfig = {
  techCorp: {
    label: "TechCorp Solutions",
    color: "#3b82f6",
  },
  officePlus: {
    label: "Office Plus Ltd",
    color: "#10b981",
  },
  industrial: {
    label: "Industrial Supply Co",
    color: "#f59e0b",
  },
  global: {
    label: "Global Services Inc",
    color: "#ef4444",
  },
  average: {
    label: "Industry Average",
    color: "#8b5cf6",
  },
}

export function PerformanceMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Performance Comparison</CardTitle>
        <CardDescription>Radar chart comparing top suppliers across key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={performanceData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 5]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Radar
                name="TechCorp Solutions"
                dataKey="techCorp"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Office Plus Ltd"
                dataKey="officePlus"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Industrial Supply Co"
                dataKey="industrial"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Radar
                name="Industry Average"
                dataKey="average"
                stroke="#8b5cf6"
                fill="none"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
