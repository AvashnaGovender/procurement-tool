import { RequisitionWorkflow } from "@/components/requisitions/requisition-workflow"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

export default function NewRequisitionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/requisitions">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Requisitions
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Purchase Requisition Workflow</h1>
                <p className="text-gray-600">Complete the requisition process step by step</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RequisitionWorkflow />
      </main>
    </div>
  )
}
