import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Download, Settings, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export function ForecastingHeader() {
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
              <h1 className="text-2xl font-bold text-foreground">Demand Forecasting</h1>
              <p className="text-sm text-muted-foreground">Predict future procurement needs</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Select defaultValue="6months">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
                <SelectItem value="24months">24 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Model
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Forecast
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
