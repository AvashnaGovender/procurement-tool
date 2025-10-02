import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Phone, Mail, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const suppliers = [
  {
    id: 1,
    name: "TechCorp Solutions",
    category: "IT Equipment",
    rating: 4.8,
    status: "active",
    location: "New York, NY",
    phone: "+1 (555) 123-4567",
    email: "contact@techcorp.com",
    orders: 45,
    totalSpend: "R450,000",
    onTimeDelivery: 95,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Office Plus Ltd",
    category: "Office Supplies",
    rating: 4.6,
    status: "active",
    location: "Chicago, IL",
    phone: "+1 (555) 234-5678",
    email: "orders@officeplus.com",
    orders: 32,
    totalSpend: "R180,000",
    onTimeDelivery: 88,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Industrial Supply Co",
    category: "Maintenance",
    rating: 4.2,
    status: "active",
    location: "Houston, TX",
    phone: "+1 (555) 345-6789",
    email: "sales@industrialsupply.com",
    orders: 28,
    totalSpend: "R320,000",
    onTimeDelivery: 82,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Global Services Inc",
    category: "Services",
    rating: 3.9,
    status: "under-review",
    location: "Los Angeles, CA",
    phone: "+1 (555) 456-7890",
    email: "info@globalservices.com",
    orders: 19,
    totalSpend: "R150,000",
    onTimeDelivery: 75,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Premium Materials",
    category: "Other",
    rating: 4.5,
    status: "pending",
    location: "Miami, FL",
    phone: "+1 (555) 567-8901",
    email: "contact@premiummaterials.com",
    orders: 0,
    totalSpend: "R0",
    onTimeDelivery: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function SupplierList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Suppliers ({suppliers.length})</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Sort by Rating
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={supplier.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {supplier.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                      <Badge
                        variant={
                          supplier.status === "active"
                            ? "default"
                            : supplier.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {supplier.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{supplier.category}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{supplier.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{supplier.email}</span>
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
                      Edit Supplier
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{supplier.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{supplier.orders}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{supplier.totalSpend}</p>
                  <p className="text-xs text-gray-500">Total Spend</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{supplier.onTimeDelivery}%</p>
                  <p className="text-xs text-gray-500">On-time Delivery</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
