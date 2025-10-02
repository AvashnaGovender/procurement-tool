import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, User, Building, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const requisitions = [
  {
    id: "REQ-2024-001",
    title: "Office Furniture for New Employees",
    description: "Desks, chairs, and storage units for 5 new hires",
    requestor: "Sarah Johnson",
    department: "Human Resources",
    priority: "medium",
    status: "pending",
    amount: 4500,
    dateCreated: "2024-01-15",
    dateNeeded: "2024-02-01",
    items: 8,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "REQ-2024-002",
    title: "IT Equipment Upgrade",
    description: "Laptops and monitors for development team",
    requestor: "Mike Chen",
    department: "IT",
    priority: "high",
    status: "approved",
    amount: 12800,
    dateCreated: "2024-01-14",
    dateNeeded: "2024-01-25",
    items: 6,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "REQ-2024-003",
    title: "Marketing Materials",
    description: "Brochures, business cards, and promotional items",
    requestor: "Emily Davis",
    department: "Marketing",
    priority: "low",
    status: "ordered",
    amount: 2300,
    dateCreated: "2024-01-12",
    dateNeeded: "2024-02-15",
    items: 12,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "REQ-2024-004",
    title: "Server Maintenance Tools",
    description: "Specialized tools for server room maintenance",
    requestor: "David Wilson",
    department: "IT",
    priority: "urgent",
    status: "pending",
    amount: 8900,
    dateCreated: "2024-01-16",
    dateNeeded: "2024-01-20",
    items: 4,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "REQ-2024-005",
    title: "Office Supplies Restock",
    description: "Paper, pens, folders, and general office supplies",
    requestor: "Lisa Brown",
    department: "Operations",
    priority: "medium",
    status: "rejected",
    amount: 850,
    dateCreated: "2024-01-10",
    dateNeeded: "2024-01-30",
    items: 15,
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "default"
    case "pending":
      return "secondary"
    case "ordered":
      return "outline"
    case "rejected":
      return "destructive"
    case "delivered":
      return "default"
    default:
      return "outline"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "text-red-600 bg-red-50"
    case "high":
      return "text-orange-600 bg-orange-50"
    case "medium":
      return "text-yellow-600 bg-yellow-50"
    case "low":
      return "text-green-600 bg-green-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

export function RequisitionList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Requisitions ({requisitions.length})</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Sort by Date
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {requisitions.map((req) => (
          <Card key={req.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={req.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {req.requestor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{req.title}</h3>
                      <Badge variant={getStatusColor(req.status)}>{req.status}</Badge>
                      <Badge variant="outline" className={`${getPriorityColor(req.priority)} border-0`}>
                        {req.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-gray-700">{req.id}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{req.requestor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{req.department}</span>
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Requisition
                    </DropdownMenuItem>
                    {req.status === "pending" && (
                      <>
                        <DropdownMenuItem className="text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-sm font-medium">R{req.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{req.items} items</p>
                  <p className="text-xs text-gray-500">Line Items</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{req.dateCreated}</span>
                  </div>
                  <p className="text-xs text-gray-500">Date Created</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{req.dateNeeded}</span>
                  </div>
                  <p className="text-xs text-gray-500">Date Needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
