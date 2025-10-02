import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const evaluationCriteria = [
  {
    name: "Quality",
    weight: 30,
    description: "Product/service quality and defect rates",
    avgScore: 4.2,
    benchmarkScore: 4.0,
    trend: "up",
  },
  {
    name: "Delivery Performance",
    weight: 25,
    description: "On-time delivery and lead time consistency",
    avgScore: 3.8,
    benchmarkScore: 4.0,
    trend: "down",
  },
  {
    name: "Cost Competitiveness",
    weight: 20,
    description: "Pricing and cost optimization",
    avgScore: 4.1,
    benchmarkScore: 3.8,
    trend: "up",
  },
  {
    name: "Customer Service",
    weight: 15,
    description: "Responsiveness and support quality",
    avgScore: 4.3,
    benchmarkScore: 4.1,
    trend: "up",
  },
  {
    name: "Compliance",
    weight: 10,
    description: "Regulatory and contractual compliance",
    avgScore: 4.5,
    benchmarkScore: 4.2,
    trend: "up",
  },
]

export function EvaluationCriteria() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation Criteria</CardTitle>
        <CardDescription>Weighted scoring system for supplier assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {evaluationCriteria.map((criteria) => (
            <div key={criteria.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{criteria.name}</h4>
                  <p className="text-sm text-gray-600">{criteria.description}</p>
                </div>
                <Badge variant="outline">{criteria.weight}%</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Score: {criteria.avgScore}/5.0</span>
                  <span className="text-gray-600">Benchmark: {criteria.benchmarkScore}/5.0</span>
                </div>
                <Progress value={(criteria.avgScore / 5) * 100} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Weight: {criteria.weight}%</span>
                  <Badge variant={criteria.trend === "up" ? "default" : "destructive"} className="text-xs">
                    {criteria.trend === "up" ? "↗ Improving" : "↘ Declining"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
