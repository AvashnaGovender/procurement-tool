import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, BarChart3, AlertCircle } from "lucide-react"

const quickActions = [
  {
    title: "New Requisition",
    description: "Create a purchase request",
    icon: Plus,
    href: "/requisitions/new",
    variant: "default" as const,
  },
  {
    title: "Add Supplier",
    description: "Onboard new supplier",
    icon: Users,
    href: "/suppliers/onboard",
    variant: "outline" as const,
  },
  {
    title: "View Reports",
    description: "Access spend analytics",
    icon: BarChart3,
    href: "/spend-analysis",
    variant: "outline" as const,
  },
  {
    title: "Pending Items",
    description: "23 items need attention",
    icon: AlertCircle,
    href: "/approvals",
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common procurement tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.title}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                asChild
              >
                <a href={action.href}>
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </a>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
