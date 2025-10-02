"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, ResponsiveContainer, LineChart, Line, Area } from "recharts"

const demandForecastData = [
  { month: "Jan 2024", actual: 1200000, predicted: 1180000, confidence: { low: 1100000, high: 1260000 } },
  { month: "Feb 2024", actual: 1100000, predicted: 1120000, confidence: { low: 1050000, high: 1190000 } },
  { month: "Mar 2024", actual: 1350000, predicted: 1320000, confidence: { low: 1250000, high: 1390000 } },
  { month: "Apr 2024", actual: 1180000, predicted: 1200000, confidence: { low: 1120000, high: 1280000 } },
  { month: "May 2024", actual: 1420000, predicted: 1380000, confidence: { low: 1300000, high: 1460000 } },
  { month: "Jun 2024", actual: 1250000, predicted: 1280000, confidence: { low: 1200000, high: 1360000 } },
  { month: "Jul 2024", actual: null, predicted: 1320000, confidence: { low: 1240000, high: 1400000 } },
  { month: "Aug 2024", actual: null, predicted: 1280000, confidence: { low: 1200000, high: 1360000 } },
  { month: "Sep 2024", actual: null, predicted: 1450000, confidence: { low: 1360000, high: 1540000 } },
  { month: "Oct 2024", actual: null, predicted: 1520000, confidence: { low: 1420000, high: 1620000 } },
  { month: "Nov 2024", actual: null, predicted: 1680000, confidence: { low: 1580000, high: 1780000 } },
  { month: "Dec 2024", actual: null, predicted: 1750000, confidence: { low: 1650000, high: 1850000 } },
]

const chartConfig = {
  actual: {
    label: "Actual Demand",
    color: "#3b82f6",
  },
  predicted: {
    label: "Predicted Demand",
    color: "#10b981",
  },
  confidence: {
    label: "Confidence Range",
    color: "#e5e7eb",
  },
}

export function DemandPrediction() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand Prediction Model</CardTitle>
        <CardDescription>Historical data vs predicted demand with confidence intervals</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demandForecastData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="confidence.high"
                stroke="none"
                fill="#e5e7eb"
                fillOpacity={0.3}
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="confidence.low"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#10b981", r: 4 }}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
