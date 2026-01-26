import { SpendAnalysisHeader } from "@/components/spend-analysis/spend-analysis-header"
import { SpendOverview } from "@/components/spend-analysis/spend-overview"
import { SpendCharts } from "@/components/spend-analysis/spend-charts"
import { CategoryAnalysis } from "@/components/spend-analysis/category-analysis"
import { SupplierSpendAnalysis } from "@/components/spend-analysis/supplier-spend-analysis"
import { SpendTrends } from "@/components/spend-analysis/spend-trends"

export default function SpendAnalysisPage() {
  return (
    <>
      <SpendAnalysisHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <SpendOverview />
          <SpendCharts />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CategoryAnalysis />
            <SupplierSpendAnalysis />
          </div>
          <SpendTrends />
        </div>
      </main>
    </>
  )
}
