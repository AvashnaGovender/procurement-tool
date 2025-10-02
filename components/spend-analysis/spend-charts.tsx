"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, ResponsiveContainer, Line, BarChart, Bar, ComposedChart } from "recharts"

const monthlySpendData = [
  { month: "Jan", spend: 980000, budget: 1200000, savings: 45000 },
  { month: "Feb", spend: 1100000, budget: 1200000, savings: 52000 },
  { month: "Mar", spend: 1250000, budget: 1300000, savings: 68000 },
  { month: "Apr", spend: 1180000, budget: 1200000, savings: 71000 },
  { month: "May", spend: 1320000, budget: 1400000, savings: 89000 },
  { month: "Jun", spend: 1200000, budget: 1300000, savings: 156000 },
  { month: "Jul", spend: 1150000, budget: 1200000, savings: 134000 },
  { month: "Aug", spend: 1280000, budget: 1350000, savings: 142000 },
  { month: "Sep", spend: 1190000, budget: 1250000, savings: 128000 },
  { month: "Oct", spend: 1340000, budget: 1400000, savings: 165000 },
  { month: "Nov", spend: 1220000, budget: 1300000, savings: 148000 },
  { month: "Dec", spend: 1380000, budget: 1450000, savings: 172000 },
]

const quarterlyComparisonData = [
  { quarter: "Q1 2023", spend: 3200000, savings: 165000 },
  { quarter: "Q2 2023", spend: 3450000, savings: 198000 },
  { quarter: "Q3 2023", spend: 3380000, savings: 215000 },
  { quarter: "Q4 2023", spend: 3620000, savings: 245000 },
  { quarter: "Q1 2024", spend: 3330000, savings: 165000 },
  { quarter: "Q2 2024", spend: 3700000, savings: 316000 },
  { quarter: "Q3 2024", speed: 3620000, savings: 404000 },
  { quarter: "Q4 2024", spend: 3940000, savings: 485000 },
]

const chartConfig = {
  spend: {
    label: "Actual Spend",
    color: "#3b82f6",
  },
  budget: {
    label: "Budget",
    color: "#e5e7eb",
  },
  savings: {
    label: "Cost Savings",
    color: "#10b981",
  },
}

export function SpendCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spend vs Budget</CardTitle>
          <CardDescription>Actual spending compared to allocated budget</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlySpendData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="budget" fill="#e5e7eb" name="Budget" />
                <Bar dataKey="spend" fill="#3b82f6" name="Actual Spend" />
                <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} name="Savings" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quarterly Spend Trends</CardTitle>
          <CardDescription>Year-over-year quarterly comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyComparisonData}>
                <XAxis dataKey="quarter" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="spend" fill="#3b82f6" name="Spend" />
                <Bar dataKey="savings" fill="#10b981" name="Savings" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
