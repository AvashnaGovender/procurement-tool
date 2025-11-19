"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { PRODUCT_SERVICE_CATEGORIES } from "@/lib/product-service-categories"

interface SupplierFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
}

interface FilterState {
  status: string[]
  category: string
  rating: string
  location: string
}

export function SupplierFilters({ onFiltersChange }: SupplierFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    category: "all",
    rating: "any",
    location: "all"
  })
  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked 
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status)
    
    const newFilters = { ...filters, status: newStatus }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleRatingChange = (rating: string) => {
    const newFilters = { ...filters, rating }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleLocationChange = (location: string) => {
    const newFilters = { ...filters, location }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilters = () => {
    const newFilters = {
      status: [],
      category: "all",
      rating: "any",
      location: "all"
    }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-2 space-y-2">
            {["approved", "pending", "under_review", "inactive"].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox 
                  id={status} 
                  checked={filters.status.includes(status)}
                  onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                />
                <Label htmlFor={status} className="text-sm">
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium">Products/Services</Label>
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select products/services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products/Services</SelectItem>
              {PRODUCT_SERVICE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Rating</Label>
          <Select value={filters.rating} onValueChange={handleRatingChange}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Minimum rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Rating</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
              <SelectItem value="1">1+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Location</Label>
          <Select value={filters.location} onValueChange={handleLocationChange}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="national">National</SelectItem>
              <SelectItem value="international">International</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button variant="outline" className="w-full bg-transparent" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
