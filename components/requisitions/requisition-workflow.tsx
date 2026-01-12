"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, FileText, Send, UserCheck, Package, BarChart3, Plus, Trash2, Mail, Download } from 'lucide-react'

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export function RequisitionWorkflow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [requisitionData, setRequisitionData] = useState({
    requestor: "",
    department: "",
    priority: "",
    justification: "",
    lineItems: [] as LineItem[],
    totalAmount: 0
  })

  const steps = [
    { id: "capture", label: "Requisition Capture", icon: FileText },
    { id: "approval", label: "Approval Routing", icon: UserCheck },
    { id: "po-creation", label: "PO Creation", icon: Package },
    { id: "dispatch", label: "Dispatch to Supplier", icon: Send },
    { id: "acknowledgment", label: "Supplier Acknowledgment", icon: CheckCircle },
    { id: "audit", label: "Audit & Reporting", icon: BarChart3 }
  ]

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return "completed"
    if (stepIndex === currentStep) return "current"
    return "pending"
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setRequisitionData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setRequisitionData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      })
    }))
  }

  const removeLineItem = (id: string) => {
    setRequisitionData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }))
  }

  const calculateTotal = () => {
    return requisitionData.lineItems.reduce((sum, item) => sum + item.total, 0)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Requisition Workflow Progress
          </CardTitle>
          <CardDescription>
            Track your requisition through each stage of the procurement process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const status = getStepStatus(index)
                const Icon = step.icon
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2
                      ${status === 'completed' ? 'bg-green-500/10 dark:bg-green-500/20 border-green-500 text-green-600 dark:text-green-400' : 
                        status === 'current' ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary' : 
                        'bg-muted border-border text-muted-foreground'}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${
                        status === 'current' ? 'text-primary' : 
                        status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                      <Badge variant={
                        status === 'completed' ? 'default' : 
                        status === 'current' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {status === 'completed' ? 'Complete' : 
                         status === 'current' ? 'In Progress' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Tabs value={steps[currentStep].id} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {steps.map((step, index) => (
            <TabsTrigger 
              key={step.id} 
              value={step.id}
              disabled={index > currentStep}
              className="text-xs"
            >
              {step.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Step 1: Requisition Capture */}
        <TabsContent value="capture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requisition Details</CardTitle>
              <CardDescription>Provide basic information about your purchase request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestor">Requestor Name</Label>
                  <Input
                    id="requestor"
                    value={requisitionData.requestor}
                    onChange={(e) => setRequisitionData(prev => ({ ...prev, requestor: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select onValueChange={(value) => setRequisitionData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select onValueChange={(value) => setRequisitionData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Business Justification</Label>
                <Textarea
                  id="justification"
                  value={requisitionData.justification}
                  onChange={(e) => setRequisitionData(prev => ({ ...prev, justification: e.target.value }))}
                  placeholder="Explain why this purchase is necessary..."
                  rows={3}
                />
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button onClick={addLineItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                {requisitionData.lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Unit Price (R)</Label>
                      <Input
                        type="number"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>Total (R)</Label>
                        <Input
                          value={`R${item.total.toFixed(2)}`}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <Button
                        onClick={() => removeLineItem(item.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {requisitionData.lineItems.length > 0 && (
                  <div className="flex justify-end">
                    <div className="text-right">
                      <Label>Total Amount</Label>
                      <p className="text-2xl font-bold text-blue-600">R{calculateTotal().toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Approval Routing */}
        <TabsContent value="approval" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Routing</CardTitle>
              <CardDescription>Your requisition is being routed for approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Pending Manager Approval</p>
                    <p className="text-sm text-yellow-600">Sent to John Smith (Department Manager)</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Approval Hierarchy</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Department Manager</p>
                        <p className="text-sm text-muted-foreground">John Smith</p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                      <div>
                        <p className="font-medium">Finance Manager</p>
                        <p className="text-sm text-muted-foreground">Sarah Johnson</p>
                      </div>
                      <Badge variant="outline">Waiting</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: PO Creation */}
        <TabsContent value="po-creation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Creation</CardTitle>
              <CardDescription>Generate and review the purchase order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">PO Generated</p>
                  <p className="text-sm text-blue-600">Purchase Order #PO-2024-001234</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier1">ABC Office Supplies</SelectItem>
                      <SelectItem value="supplier2">Tech Solutions Ltd</SelectItem>
                      <SelectItem value="supplier3">Global Equipment Co</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expected Delivery Date</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PO
                </Button>
                <Button variant="outline">
                  Preview PO
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Dispatch to Supplier */}
        <TabsContent value="dispatch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispatch to Supplier</CardTitle>
              <CardDescription>Send purchase order to selected supplier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Send className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">PO Dispatched</p>
                  <p className="text-sm text-green-600">Sent to ABC Office Supplies on {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Communication Log</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email sent to supplier</p>
                      <p className="text-xs text-muted-foreground">Purchase order and terms attached</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 5: Supplier Acknowledgment */}
        <TabsContent value="acknowledgment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Acknowledgment</CardTitle>
              <CardDescription>Waiting for supplier confirmation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Awaiting Acknowledgment</p>
                  <p className="text-sm text-yellow-600">Supplier has 48 hours to respond</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expected Response</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Delivery Confirmation</p>
                    <p className="text-sm text-muted-foreground">Expected delivery date confirmation</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Price Confirmation</p>
                    <p className="text-sm text-muted-foreground">Final pricing and terms agreement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 6: Audit & Reporting */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit & Reporting</CardTitle>
              <CardDescription>Complete audit trail and reporting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Process Complete</p>
                  <p className="text-sm text-green-600">All steps completed successfully</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium">Audit Report</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Generate
                  </Button>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">Compliance Check</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    View Results
                  </Button>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Download className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium">Export Data</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          onClick={prevStep} 
          disabled={currentStep === 0}
          variant="outline"
        >
          Previous Step
        </Button>
        <Button 
          onClick={nextStep} 
          disabled={currentStep === steps.length - 1}
        >
          Next Step
        </Button>
      </div>
    </div>
  )
}
