import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  UserPlus,
  BarChart3,
  FileText,
  PieChart,
  TrendingUp,
  Star,
  LucideContrast as FileContract,
  Truck,
  Clock,
} from "lucide-react"

const modules = [
  {
    title: "Supplier Onboarding",
    icon: UserPlus,
    color: "bg-blue-500",
    href: "/suppliers/onboard",
  },
  {
    title: "Price Benchmarking",
    icon: BarChart3,
    color: "bg-green-500",
    href: "/benchmarking",
  },
  {
    title: "Purchase Requisition",
    icon: FileText,
    color: "bg-purple-500",
    href: "/requisitions",
  },
  {
    title: "Spend Analysis",
    icon: PieChart,
    color: "bg-orange-500",
    href: "/spend-analysis",
  },
  {
    title: "Demand Forecasting",
    icon: TrendingUp,
    color: "bg-indigo-500",
    href: "/forecasting",
  },
  {
    title: "Supplier Evaluation",
    icon: Star,
    color: "bg-yellow-500",
    href: "/evaluation",
  },
  {
    title: "Contract Management",
    icon: FileContract,
    color: "bg-red-500",
    href: "/contracts",
  },
  {
    title: "Lead Time Tracking",
    icon: Clock,
    color: "bg-teal-500",
    href: "/lead-time",
  },
  {
    title: "Delivery Optimization",
    icon: Truck,
    color: "bg-cyan-500",
    href: "/delivery",
  },
]

export function DashboardModules() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Procurement Modules</CardTitle>
        <CardDescription>Access all procurement management functions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => {
            const Icon = module.icon
            const isClickable = module.title === "Supplier Onboarding" || module.title === "Purchase Requisition"

            if (isClickable) {
              return (
                <Button
                  key={module.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all bg-transparent"
                  asChild
                >
                  <a href={module.href}>
                    <div className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center mb-2`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{module.title}</div>
                    </div>
                  </a>
                </Button>
              )
            }

            return (
              <div
                key={module.title}
                className="h-auto p-4 flex flex-col items-start space-y-2 border border-gray-200 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center mb-2 opacity-70`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-500">{module.title}</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
