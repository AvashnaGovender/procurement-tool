import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, User, DollarSign } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "requisition",
    title: "New requisition submitted",
    description: "Office supplies - R2,450",
    time: "2 hours ago",
    status: "pending",
    icon: FileText,
  },
  {
    id: 2,
    type: "supplier",
    title: "Supplier onboarded",
    description: "TechCorp Solutions approved",
    time: "4 hours ago",
    status: "completed",
    icon: User,
  },
  {
    id: 3,
    type: "contract",
    title: "Contract renewed",
    description: "Annual maintenance agreement",
    time: "1 day ago",
    status: "completed",
    icon: FileText,
  },
  {
    id: 4,
    type: "savings",
    title: "Cost savings achieved",
    description: "Negotiated 15% discount",
    time: "2 days ago",
    status: "completed",
    icon: DollarSign,
  },
  {
    id: 5,
    type: "requisition",
    title: "Requisition approved",
    description: "IT equipment - R15,200",
    time: "3 days ago",
    status: "approved",
    icon: FileText,
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest procurement activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "approved"
                            ? "secondary"
                            : "outline"
                      }
                      className="ml-2"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
