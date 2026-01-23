"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Edit, Trash2, FileText, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"

interface Draft {
  id: string
  status: string
  supplierName: string
  supplierEmail: string
  productServiceCategory: string
  requesterName: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

export default function DraftsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/suppliers/initiation/draft')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.initiations) {
          setDrafts(data.initiations)
        }
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/suppliers/initiation/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setDrafts(drafts.filter(d => d.id !== id))
      } else {
        alert('Failed to delete draft')
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Failed to delete draft')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'DRAFT') {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Draft</Badge>
    } else if (status === 'REJECTED') {
      return <Badge variant="destructive">Rejected</Badge>
    }
    return <Badge>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading drafts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button 
            type="button"
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/suppliers')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Suppliers
          </Button>
        </div>
        <div className="text-sm text-slate-600">
          Manage your saved drafts and rejected requests
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Drafts & Rejected Requests</h1>
          <p className="text-gray-600">View and edit your saved drafts or resubmit rejected requests</p>
        </div>
        <Button asChild>
          <Link href="/suppliers/onboard">
            Create New Request
          </Link>
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No drafts found</h3>
              <p className="text-gray-600 mb-4">You don't have any saved drafts or rejected requests.</p>
              <Button asChild>
                <Link href="/suppliers/onboard">
                  Create New Request
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">{draft.supplierName || 'Untitled Draft'}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {draft.supplierEmail && `${draft.supplierEmail} • `}
                        {draft.productServiceCategory}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(draft.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {draft.status === 'DRAFT' 
                        ? `Last saved: ${new Date(draft.updatedAt).toLocaleDateString()}`
                        : `Rejected: ${new Date(draft.updatedAt).toLocaleDateString()}`
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/suppliers/onboard?draftId=${draft.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(draft.id)}
                      disabled={deletingId === draft.id}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === draft.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

