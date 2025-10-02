import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, AlertTriangle, DollarSign, Calendar } from "lucide-react"

const contractStats = [
  {
    title: "Total Contracts",
    value: "156",
    change: "+8 this month",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    title: "Active Contracts",
    value: "134",
    change: "86% of total",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Expiring Soon",
    value: "12",
    change: "Next 90 days",
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    title: "Overdue Renewals",
    value: "3",
    change: "Require attention",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  {
    title: "Contract Value",
    value: "$24.8M",
    change: "Annual commitment",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Avg Duration",
    value: "2.3 years",
    change: "Contract length",
    icon: Calendar,
    color: "text-blue-600",
  },
]

export function ContractOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {contractStats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
