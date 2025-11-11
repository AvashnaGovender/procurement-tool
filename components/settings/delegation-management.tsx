"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  UserCheck,
  UserMinus,
  Calendar,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react"
import { format } from "date-fns"

interface Delegation {
  id: string
  delegatorId: string
  delegateId: string
  delegationType: string
  startDate: string
  endDate: string
  isActive: boolean
  reason?: string
  notes?: string
  createdAt: string
  direction: 'given' | 'received'
  delegate?: {
    id: string
    name: string
    email: string
    role: string
    department?: string
  }
  delegator?: {
    id: string
    name: string
    email: string
    role: string
    department?: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
}

export function DelegationManagement() {
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [delegateId, setDelegateId] = useState("")
  const [delegationType, setDelegationType] = useState("ALL_APPROVALS")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetchDelegations()
    fetchUsers()
  }, [])

  const fetchDelegations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/delegations?type=all')
      const data = await response.json()
      
      if (data.success) {
        setDelegations(data.delegations)
      }
    } catch (error) {
      console.error('Error fetching delegations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleCreateDelegation = async () => {
    if (!delegateId || !startDate || !endDate) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegateId,
          delegationType,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          reason,
          notes
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Delegation created successfully!')
        setCreateDialogOpen(false)
        resetForm()
        fetchDelegations()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to create delegation')
      }
    } catch (error) {
      setError('Failed to create delegation')
      console.error('Error creating delegation:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDelegation = async (delegationId: string) => {
    if (!confirm('Are you sure you want to deactivate this delegation?')) {
      return
    }

    try {
      const response = await fetch(`/api/delegations?id=${delegationId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Delegation deactivated successfully!')
        fetchDelegations()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to deactivate delegation')
      }
    } catch (error) {
      setError('Failed to deactivate delegation')
      console.error('Error deleting delegation:', error)
    }
  }

  const resetForm = () => {
    setDelegateId("")
    setDelegationType("ALL_APPROVALS")
    setStartDate("")
    setEndDate("")
    setReason("")
    setNotes("")
  }

  const isActive = (delegation: Delegation) => {
    const now = new Date()
    const start = new Date(delegation.startDate)
    const end = new Date(delegation.endDate)
    return delegation.isActive && start <= now && end >= now
  }

  const getStatusBadge = (delegation: Delegation) => {
    if (!delegation.isActive) {
      return <Badge variant="secondary" className="bg-gray-500 text-white">Deactivated</Badge>
    }
    
    const now = new Date()
    const start = new Date(delegation.startDate)
    const end = new Date(delegation.endDate)

    if (start > now) {
      return <Badge variant="secondary" className="bg-blue-500 text-white">Scheduled</Badge>
    } else if (end < now) {
      return <Badge variant="secondary" className="bg-gray-500 text-white">Expired</Badge>
    } else {
      return <Badge className="bg-green-500 text-white">Active</Badge>
    }
  }

  const getDelegationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ALL_APPROVALS': 'All Approvals',
      'MANAGER_APPROVALS': 'Manager Approvals',
      'PROCUREMENT_APPROVALS': 'Procurement Approvals',
      'REQUISITION_APPROVALS': 'Requisition Approvals',
      'CONTRACT_APPROVALS': 'Contract Approvals'
    }
    return labels[type] || type
  }

  const givenDelegations = delegations.filter(d => d.direction === 'given')
  const receivedDelegations = delegations.filter(d => d.direction === 'received')

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-300">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Approval Delegations</h3>
          <p className="text-sm text-muted-foreground">
            Delegate your approval authority to others when you're away
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setError(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Delegation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Delegation</DialogTitle>
              <DialogDescription>
                Delegate your approval authority to another user for a specific period
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delegate">Delegate To *</Label>
                <Select value={delegateId} onValueChange={setDelegateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delegationType">Delegation Type *</Label>
                <Select value={delegationType} onValueChange={setDelegationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_APPROVALS">All Approvals</SelectItem>
                    <SelectItem value="MANAGER_APPROVALS">Manager Approvals</SelectItem>
                    <SelectItem value="PROCUREMENT_APPROVALS">Procurement Approvals</SelectItem>
                    <SelectItem value="REQUISITION_APPROVALS">Requisition Approvals</SelectItem>
                    <SelectItem value="CONTRACT_APPROVALS">Contract Approvals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Annual leave, Business trip"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDelegation} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Delegation'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="given" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="given">
            <UserMinus className="h-4 w-4 mr-2" />
            Delegations Given ({givenDelegations.length})
          </TabsTrigger>
          <TabsTrigger value="received">
            <UserCheck className="h-4 w-4 mr-2" />
            Delegations Received ({receivedDelegations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="given" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : givenDelegations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No delegations created yet
              </CardContent>
            </Card>
          ) : (
            givenDelegations.map((delegation) => (
              <Card key={delegation.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{delegation.delegate?.name}</h4>
                        {getStatusBadge(delegation)}
                      </div>
                      <p className="text-sm text-gray-600">{delegation.delegate?.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {delegation.delegate?.role} • {delegation.delegate?.department}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(delegation.startDate), 'PP')} - {format(new Date(delegation.endDate), 'PP')}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline">{getDelegationTypeLabel(delegation.delegationType)}</Badge>
                      </div>
                      {delegation.reason && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Reason:</strong> {delegation.reason}
                        </p>
                      )}
                    </div>
                    {isActive(delegation) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDelegation(delegation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : receivedDelegations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No delegations received yet
              </CardContent>
            </Card>
          ) : (
            receivedDelegations.map((delegation) => (
              <Card key={delegation.id} className={isActive(delegation) ? 'border-blue-500 border-2' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">From: {delegation.delegator?.name}</h4>
                        {getStatusBadge(delegation)}
                      </div>
                      <p className="text-sm text-gray-600">{delegation.delegator?.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {delegation.delegator?.role} • {delegation.delegator?.department}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(delegation.startDate), 'PP')} - {format(new Date(delegation.endDate), 'PP')}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline">{getDelegationTypeLabel(delegation.delegationType)}</Badge>
                      </div>
                      {delegation.reason && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Reason:</strong> {delegation.reason}
                        </p>
                      )}
                      {isActive(delegation) && (
                        <Alert className="mt-3 bg-blue-50 border-blue-300">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800 text-sm">
                            You are currently acting with {delegation.delegator?.name}'s approval authority
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

