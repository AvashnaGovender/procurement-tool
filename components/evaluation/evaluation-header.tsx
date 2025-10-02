import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Download, Star } from "lucide-react"

export function EvaluationHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Star className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Evaluation</h1>
              <p className="text-sm text-gray-600">Rate and assess supplier performance</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="search" placeholder="Search suppliers..." className="pl-10 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Scores
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Evaluation
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
