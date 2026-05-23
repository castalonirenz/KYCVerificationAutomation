import { ModulePage } from "../../../src/components/ModulePage";
import { riskFallback } from "../../../src/components/fallbacks";

export default function RiskDashboardPage() {
  return (
    <ModulePage
      title="Risk Overview"
      description="Automated risk scores, configured rules, factors, classifications, and high-risk flags."
      endpoint="/risk/assessments"
      fallback={riskFallback}
      searchKeys={["case_id", "category", "factors"]}
      primaryAction="Recalculate scores"
    />
  );
}
