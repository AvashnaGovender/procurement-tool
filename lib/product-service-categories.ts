/**
 * Standardized Product/Service Categories
 * Used across supplier initiation forms, supplier onboarding, and filtering
 */

export const PRODUCT_SERVICE_CATEGORIES = [
  // Mining & Industrial
  "Mining Equipment & Machinery",
  "Conveyors & Material Handling",
  "Safety Equipment & PPE",
  "Industrial Tools & Hardware",
  "Hydraulics & Pneumatics",
  
  // Engineering & Maintenance
  "Engineering Services",
  "Maintenance & Repair Services",
  "Fabrication & Welding",
  "Electrical Equipment & Services",
  "Mechanical Components",
  
  // Construction & Infrastructure
  "Construction Materials",
  "Steel & Metal Products",
  "Concrete & Aggregates",
  "Building Supplies",
  
  // IT & Technology
  "IT Services & Software",
  "Computer Hardware & Equipment",
  "Telecommunications",
  "Automation & Control Systems",
  
  // Office & Administrative
  "Office Supplies & Stationery",
  "Office Furniture & Equipment",
  "Printing & Signage",
  "Catering & Food Services",
  
  // Professional Services
  "Consulting Services",
  "Legal Services",
  "Accounting & Financial Services",
  "HR & Recruitment Services",
  "Training & Development",
  
  // Logistics & Transport
  "Transport & Logistics Services",
  "Fuel & Lubricants",
  "Fleet Management",
  "Warehousing & Storage",
  
  // Health & Safety
  "Health & Safety Services",
  "Medical Supplies & Equipment",
  "Environmental Services",
  "Security Services",
  
  // Utilities & Facilities
  "Cleaning & Janitorial Services",
  "Facilities Management",
  "Waste Management",
  "Energy & Utilities",
  
  // Other
  "Other Products/Services"
] as const

export type ProductServiceCategory = typeof PRODUCT_SERVICE_CATEGORIES[number]

/**
 * Get formatted category name for display
 */
export function formatCategoryName(category: string): string {
  return category
}

/**
 * Validate if a category is valid
 */
export function isValidCategory(category: string): boolean {
  return PRODUCT_SERVICE_CATEGORIES.includes(category as ProductServiceCategory)
}

