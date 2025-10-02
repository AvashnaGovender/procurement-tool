"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, ResponsiveContainer, Line, AreaChart, Area } from "recharts"

const leadTimeTrendData = [
  { week: "Week 1", itEquipment: 8.2, officeSupplies: 11.5, services: 14.2, maintenance: 16.8, overall: 12.7 },
  { week: "Week 2", itEquipment: 7.8, officeSupplies: 12.1, services: 13.8, maintenance: 15.9, overall: 12.4 },
  { week: "Week 3", itEquipment: 8.5, officeSupplies: 11.8, services: 14.5, maintenance: 17.2, overall: 13.0 },
  { week: "Week 4", itEquipment: 8.1, officeSupplies: 12.3, services: 13.2, maintenance: 16.1, overall: 12.4 },
  { week: "Week 5", itEquipment: 7.9, officeSupplies: 11.9, services: 14.1, maintenance: 15.8, overall: 12.2 },
  { week: "Week 6", itEquipment: 8.3, officeSupplies: 12.0, services: 13.9, maintenance: 16.5, overall: 12.7 },
  { week: "Week 7", itEquipment: 8.0, officeSupplies: 11.7, services: 13.5, maintenance: 15.6, overall: 12.2 },
  { week: "Week 8", itEquipment: 7.7, officeSupplies: 11.4, services: 13.1, maintenance: 15.2, overall: 11.9 },
]

const chartConfig = {
  itEquipment: {
    label: "IT Equipment",
    color: "#3b82f6",
  },
  officeSupplies: {
    label: "Office Supplies",
    color: "#10b981",
  },
  services: {
    label: "Services",
    color: "#f59e0b",
  },
  maintenance: {
    label: "Maintenance",
    color: "#ef4444",
  },
  overall: {
    label: "Overall Average",
    color: "#8b5cf6",
  },
}

export function LeadTimeTrends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Time Trends by Category</CardTitle>
        <CardDescription>Weekly lead time performance across different categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={leadTimeTrendData}>
              <XAxis dataKey="week" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="maintenance"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
              <Area type="monotone" dataKey="services" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              <Area
                type="monotone"
                dataKey="officeSupplies"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="itEquipment"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Line
                type="monotone"
                dataKey="overall"
                stroke="#8b5cf6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: "#8b5cf6", r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
