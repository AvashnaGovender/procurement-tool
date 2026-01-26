/**
 * Standardized Product/Service Categories
 * Used across supplier initiation forms, supplier onboarding, and filtering
 */

export const PRODUCT_SERVICE_CATEGORIES = [
  "Accounting & Financial Services",
  "Automation & Control Systems",
  "Building Supplies",
  "Catering & Food Services",
  "Cleaning & Janitorial Services",
  "Computer Hardware & Equipment",
  "Concrete & Aggregates",
  "Consulting Services",
  "Construction Materials",
  "Conveyors & Material Handling",
  "Electrical Equipment & Services",
  "Energy & Utilities",
  "Engineering Services",
  "Environmental Services",
  "Fabrication & Welding",
  "Facilities Management",
  "Fleet Management",
  "Fuel & Lubricants",
  "Health & Safety Services",
  "HR & Recruitment Services",
  "Hydraulics & Pneumatics",
  "Industrial Tools & Hardware",
  "IT Services & Software",
  "Legal Services",
  "Maintenance & Repair Services",
  "Mechanical Components",
  "Medical Supplies & Equipment",
  "Mining Equipment & Machinery",
  "Office Furniture & Equipment",
  "Office Supplies & Stationery",
  "Printing & Signage",
  "Safety Equipment & PPE",
  "Security Services",
  "Steel & Metal Products",
  "Telecommunications",
  "Training & Development",
  "Transport & Logistics Services",
  "Warehousing & Storage",
  "Waste Management",
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

