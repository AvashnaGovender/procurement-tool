import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function SupplierFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-2 space-y-2">
            {["Active", "Pending", "Under Review", "Inactive"].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox id={status.toLowerCase()} />
                <Label htmlFor={status.toLowerCase()} className="text-sm">
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium">Category</Label>
          <Select>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">IT Equipment</SelectItem>
              <SelectItem value="office">Office Supplies</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Rating</Label>
          <Select>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Minimum rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
              <SelectItem value="1">1+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Location</Label>
          <Select>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="national">National</SelectItem>
              <SelectItem value="international">International</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button variant="outline" className="w-full bg-transparent">
            Clear Filters
          </Button>
          <Button className="w-full">Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}
