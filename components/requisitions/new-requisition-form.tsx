"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, FileText, User, Calendar, DollarSign } from "lucide-react"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export function NewRequisitionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 },
  ])

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const getTotalAmount = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Purchase requisition submitted successfully!")
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Requisition Title *</Label>
            <Input id="title" required className="mt-1" placeholder="Brief description of the request" />
          </div>
          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Select required>
              <SelectTrigger className="mt-1">
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
            <Label htmlFor="department">Department *</Label>
            <Select required>
              <SelectTrigger className="mt-1">
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
            <Label htmlFor="category">Category *</Label>
            <Select required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it-equipment">IT Equipment</SelectItem>
                <SelectItem value="office-supplies">Office Supplies</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" className="mt-1" rows={3} placeholder="Detailed description of the request" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Requestor Information */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Requestor Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="requestorName">Requestor Name *</Label>
            <Input id="requestorName" required className="mt-1" defaultValue="John Doe" />
          </div>
          <div>
            <Label htmlFor="requestorEmail">Email *</Label>
            <Input id="requestorEmail" type="email" required className="mt-1" defaultValue="john.doe@company.com" />
          </div>
          <div>
            <Label htmlFor="costCenter">Cost Center</Label>
            <Input id="costCenter" className="mt-1" placeholder="e.g., CC-001" />
          </div>
          <div>
            <Label htmlFor="budgetCode">Budget Code</Label>
            <Input id="budgetCode" className="mt-1" placeholder="e.g., BUD-2024-IT" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Timeline */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Timeline</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateNeeded">Date Needed *</Label>
            <Input id="dateNeeded" type="date" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="deliveryLocation">Delivery Location</Label>
            <Input id="deliveryLocation" className="mt-1" placeholder="Building, floor, room" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Line Items</h3>
          </div>
          <Button type="button" variant="outline" onClick={addLineItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Item {index + 1}
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor={`description-${item.id}`}>Description *</Label>
                    <Input
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      required
                      className="mt-1"
                      placeholder="Item description"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${item.id}`}>Quantity *</Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unitPrice-${item.id}`}>Unit Price *</Label>
                    <Input
                      id={`unitPrice-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice === 0 ? "" : item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                      required
                      className="mt-1"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Total</Label>
                    <div className="mt-1 p-2 bg-muted rounded-md text-sm font-medium text-foreground">R{item.total.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Total Amount:</span>
            <span className="text-2xl font-bold text-primary">R{getTotalAmount().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="justification">Business Justification</Label>
            <Textarea
              id="justification"
              className="mt-1"
              rows={3}
              placeholder="Explain why this purchase is necessary"
            />
          </div>
          <div>
            <Label htmlFor="preferredSupplier">Preferred Supplier (Optional)</Label>
            <Input id="preferredSupplier" className="mt-1" placeholder="Supplier name or company" />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit for Approval"}
        </Button>
      </div>
    </form>
  )
}
