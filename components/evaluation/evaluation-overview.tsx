import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Users, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"

const evaluationStats = [
  {
    title: "Avg Supplier Score",
    value: "4.3",
    change: "+0.2 vs last quarter",
    icon: Star,
    color: "text-yellow-600",
  },
  {
    title: "Suppliers Evaluated",
    value: "76",
    change: "85% of active suppliers",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Top Performers",
    value: "23",
    change: "4.5+ rating",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    title: "Need Improvement",
    value: "8",
    change: "Below 3.5 rating",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  {
    title: "Evaluations Complete",
    value: "89%",
    change: "This quarter",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Evaluation Criteria",
    value: "5",
    change: "Key metrics tracked",
    icon: BarChart3,
    color: "text-purple-600",
  },
]

export function EvaluationOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {evaluationStats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
