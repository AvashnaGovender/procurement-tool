import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

export function ContractFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-2 space-y-2">
            {["Active", "Expiring", "Draft", "Pending", "Expired"].map((status) => (
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
          <Label className="text-sm font-medium">Contract Type</Label>
          <Select>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service">Service Agreement</SelectItem>
              <SelectItem value="supply">Supply Agreement</SelectItem>
              <SelectItem value="maintenance">Maintenance Agreement</SelectItem>
              <SelectItem value="logistics">Logistics Agreement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Value Range</Label>
          <div className="mt-2 space-y-2">
            <Input type="number" placeholder="Min value" />
            <Input type="number" placeholder="Max value" />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Expiry Period</Label>
          <Select>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Next 30 days</SelectItem>
              <SelectItem value="90days">Next 90 days</SelectItem>
              <SelectItem value="6months">Next 6 months</SelectItem>
              <SelectItem value="1year">Next year</SelectItem>
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
