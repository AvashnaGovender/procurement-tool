import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Download, FileText, Home } from "lucide-react"
import Link from "next/link"

export function ContractHeader() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Contract Management</h1>
              <p className="text-sm text-muted-foreground">Manage contracts and agreements</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search contracts..." className="pl-10 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
