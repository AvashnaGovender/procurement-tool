import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Truck, MapPin, Clock, Package } from "lucide-react"

const activeShipments = [
  {
    id: "SHP-2024-001",
    supplier: "TechCorp Solutions",
    destination: "New York Office",
    status: "in-transit",
    progress: 75,
    estimatedDelivery: "2024-01-18",
    currentLocation: "Philadelphia, PA",
    items: 12,
    value: 45000,
  },
  {
    id: "SHP-2024-002",
    supplier: "Office Plus Ltd",
    destination: "Chicago Warehouse",
    status: "out-for-delivery",
    progress: 95,
    estimatedDelivery: "2024-01-17",
    currentLocation: "Chicago, IL",
    items: 8,
    value: 12000,
  },
  {
    id: "SHP-2024-003",
    supplier: "Industrial Supply Co",
    destination: "Houston Facility",
    status: "delayed",
    progress: 60,
    estimatedDelivery: "2024-01-20",
    currentLocation: "Dallas, TX",
    items: 5,
    value: 28000,
  },
  {
    id: "SHP-2024-004",
    supplier: "Global Services Inc",
    destination: "Los Angeles Office",
    status: "processing",
    progress: 25,
    estimatedDelivery: "2024-01-22",
    currentLocation: "Origin Facility",
    items: 15,
    value: 67000,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "in-transit":
      return "default"
    case "out-for-delivery":
      return "secondary"
    case "delayed":
      return "destructive"
    case "processing":
      return "outline"
    default:
      return "outline"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "in-transit":
      return Truck
    case "out-for-delivery":
      return Package
    case "delayed":
      return Clock
    case "processing":
      return MapPin
    default:
      return Package
  }
}

export function DeliveryTracking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Shipment Tracking</CardTitle>
        <CardDescription>Real-time delivery status and progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeShipments.map((shipment) => {
            const StatusIcon = getStatusIcon(shipment.status)
            return (
              <div key={shipment.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium text-gray-900">{shipment.id}</h4>
                      <p className="text-sm text-gray-600">{shipment.supplier}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(shipment.status)}>{shipment.status.replace("-", " ")}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{shipment.progress}%</span>
                  </div>
                  <Progress value={shipment.progress} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1 text-gray-600 mb-1">
                        <MapPin className="h-3 w-3" />
                        <span>Destination</span>
                      </div>
                      <p className="font-medium">{shipment.destination}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-gray-600 mb-1">
                        <Clock className="h-3 w-3" />
                        <span>ETA</span>
                      </div>
                      <p className="font-medium">{shipment.estimatedDelivery}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-sm">
                    <span className="text-gray-600">Current Location: {shipment.currentLocation}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">{shipment.items} items</span>
                      <span className="font-medium">${shipment.value.toLocaleString()}</span>
                    </div>
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
