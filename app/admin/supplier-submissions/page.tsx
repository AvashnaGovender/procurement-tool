"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Loader2, 
  Eye, 
  RefreshCw
} from "lucide-react"

interface Supplier {
  id: string
  supplierCode: string
  companyName: string
  contactPerson: string
  contactEmail: string
  contactPhone: string | null
  status: string
  createdAt: string
  natureOfBusiness: string | null
  bbbeeLevel: string | null
  numberOfEmployees: number | null
  airtableData: any
}

export default function SupplierSubmissionsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/suppliers/list')
      const data = await response.json()
      
      if (data.success) {
        setSuppliers(data.suppliers || [])
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplierCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500'
      case 'UNDER_REVIEW': return 'bg-yellow-500'
      case 'REJECTED': return 'bg-red-500'
      case 'PENDING': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  const statusCounts = {
    all: suppliers.length,
    PENDING: suppliers.filter(s => s.status === 'PENDING').length,
    UNDER_REVIEW: suppliers.filter(s => s.status === 'UNDER_REVIEW').length,
    APPROVED: suppliers.filter(s => s.status === 'APPROVED').length,
    REJECTED: suppliers.filter(s => s.status === 'REJECTED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supplier Submissions</h1>
              <p className="text-gray-600 mt-2">Review and manage supplier onboarding applications</p>
            </div>
            <Button onClick={fetchSuppliers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('all')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{statusCounts.all}</div>
                <div className="text-sm text-gray-600">Total Submissions</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('PENDING')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{statusCounts.PENDING}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('UNDER_REVIEW')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.UNDER_REVIEW}</div>
                <div className="text-sm text-gray-600">Under Review</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('APPROVED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.APPROVED}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('REJECTED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statusCounts.REJECTED}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by company name, email, or supplier code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {statusFilter !== 'all' && (
                <Button variant="outline" onClick={() => setStatusFilter('all')}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter !== 'all' ? `${statusFilter.replace('_', ' ')} Suppliers` : 'All Suppliers'}
            </CardTitle>
            <CardDescription>
              Showing {filteredSuppliers.length} of {suppliers.length} submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No suppliers found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Code</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-mono text-sm">{supplier.supplierCode}</TableCell>
                      <TableCell className="font-medium">{supplier.companyName}</TableCell>
                      <TableCell>{supplier.contactPerson}</TableCell>
                      <TableCell>{supplier.contactEmail}</TableCell>
                      <TableCell>{new Date(supplier.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(supplier.status)} text-white`}>
                          {supplier.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/admin/supplier-submissions/${supplier.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

