import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

export function RequisitionFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-2 space-y-2">
            {["Draft", "Pending", "Approved", "Rejected", "Ordered", "Delivered"].map((status) => (
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
          <Label className="text-sm font-medium">Priority</Label>
          <Select>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Department</Label>
          <Select>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="mt-2 space-y-2">
            <Input type="date" placeholder="From date" />
            <Input type="date" placeholder="To date" />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Amount Range</Label>
          <div className="mt-2 space-y-2">
            <Input type="number" placeholder="Min amount" />
            <Input type="number" placeholder="Max amount" />
          </div>
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
