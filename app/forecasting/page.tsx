import { ForecastingHeader } from "@/components/forecasting/forecasting-header"
import { ForecastingOverview } from "@/components/forecasting/forecasting-overview"
import { DemandPrediction } from "@/components/forecasting/demand-prediction"
import { SeasonalAnalysis } from "@/components/forecasting/seasonal-analysis"
import { ForecastingInsights } from "@/components/forecasting/forecasting-insights"

export default function ForecastingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ForecastingHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ForecastingOverview />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DemandPrediction />
            </div>
            <div>
              <ForecastingInsights />
            </div>
          </div>
          <SeasonalAnalysis />
        </div>
      </main>
    </div>
  )
}
