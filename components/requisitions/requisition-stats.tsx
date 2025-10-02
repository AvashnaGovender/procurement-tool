import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, XCircle, DollarSign, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Requisitions",
    value: "247",
    change: "+12 this month",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    title: "Pending Approval",
    value: "23",
    change: "Avg 2.5 days",
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    title: "Approved",
    value: "189",
    change: "76% approval rate",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Rejected",
    value: "8",
    change: "3% rejection rate",
    icon: XCircle,
    color: "text-red-600",
  },
  {
    title: "Total Value",
    value: "R1.2M", // converted from $ to R for South African Rand
    change: "+8% vs last month",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Avg Processing Time",
    value: "3.2 days",
    change: "-0.5 days improvement",
    icon: TrendingUp,
    color: "text-blue-600",
  },
]

export function RequisitionStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => {
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
