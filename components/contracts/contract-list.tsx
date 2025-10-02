import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  DollarSign,
  Building,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const contracts = [
  {
    id: "CNT-2024-001",
    title: "IT Services Agreement",
    supplier: "TechCorp Solutions",
    type: "Service Agreement",
    status: "active",
    value: 2400000,
    startDate: "2023-01-15",
    endDate: "2025-01-14",
    renewalDate: "2024-10-15",
    daysToExpiry: 45,
    autoRenewal: true,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "CNT-2024-002",
    title: "Office Supplies Contract",
    supplier: "Office Plus Ltd",
    type: "Supply Agreement",
    status: "active",
    value: 850000,
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    renewalDate: "2024-03-01",
    daysToExpiry: -30,
    autoRenewal: false,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "CNT-2024-003",
    title: "Maintenance Services",
    supplier: "Industrial Supply Co",
    type: "Maintenance Agreement",
    status: "expiring",
    value: 1200000,
    startDate: "2022-09-01",
    endDate: "2024-08-31",
    renewalDate: "2024-06-01",
    daysToExpiry: 15,
    autoRenewal: true,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "CNT-2024-004",
    title: "Marketing Services",
    supplier: "Creative Agency",
    type: "Service Agreement",
    status: "draft",
    value: 650000,
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    renewalDate: null,
    daysToExpiry: null,
    autoRenewal: false,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "CNT-2024-005",
    title: "Transportation Services",
    supplier: "Logistics Pro",
    type: "Logistics Agreement",
    status: "pending",
    value: 980000,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    renewalDate: "2026-10-01",
    daysToExpiry: 730,
    autoRenewal: true,
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "default"
    case "expiring":
      return "destructive"
    case "draft":
      return "secondary"
    case "pending":
      return "outline"
    default:
      return "outline"
  }
}

const getExpiryColor = (days: number | null) => {
  if (days === null) return "text-gray-500"
  if (days < 0) return "text-red-600"
  if (days <= 30) return "text-orange-600"
  if (days <= 90) return "text-yellow-600"
  return "text-green-600"
}

export function ContractList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Contracts ({contracts.length})</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Sort by Expiry
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contract.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {contract.supplier
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                      <Badge variant={getStatusColor(contract.status)}>{contract.status}</Badge>
                      {contract.daysToExpiry !== null && contract.daysToExpiry <= 30 && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{contract.type}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-gray-700">{contract.id}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{contract.supplier}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Contract
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Contract
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                    {contract.status === "expiring" && (
                      <DropdownMenuItem className="text-blue-600">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renew Contract
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">${(contract.value / 1000000).toFixed(1)}M</span>
                  </div>
                  <p className="text-xs text-gray-500">Contract Value</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{contract.startDate}</span>
                  </div>
                  <p className="text-xs text-gray-500">Start Date</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{contract.endDate}</span>
                  </div>
                  <p className="text-xs text-gray-500">End Date</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <span className={`text-sm font-medium ${getExpiryColor(contract.daysToExpiry)}`}>
                      {contract.daysToExpiry === null
                        ? "N/A"
                        : contract.daysToExpiry < 0
                          ? "Expired"
                          : `${contract.daysToExpiry} days`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">To Expiry</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
