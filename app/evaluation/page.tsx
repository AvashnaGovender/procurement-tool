import { EvaluationHeader } from "@/components/evaluation/evaluation-header"
import { EvaluationOverview } from "@/components/evaluation/evaluation-overview"
import { SupplierScorecard } from "@/components/evaluation/supplier-scorecard"
import { EvaluationCriteria } from "@/components/evaluation/evaluation-criteria"
import { PerformanceMetrics } from "@/components/evaluation/performance-metrics"

export default function EvaluationPage() {
  return (
    <>
      <EvaluationHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <EvaluationOverview />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SupplierScorecard />
            <EvaluationCriteria />
          </div>
          <PerformanceMetrics />
        </div>
      </main>
    </>
  )
}
